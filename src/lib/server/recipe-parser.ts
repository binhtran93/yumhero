import { createHash } from 'crypto';
import { RECIPE_PARSER_API_KEY } from '$env/static/private';
import { parseAmountValue } from '$lib/utils/amount';
import { isKnownUnitToken, normalizeNullableUnit } from '$lib/utils/unit';
import { redis } from '$lib/server/redis';
import type { ExtractRecipeResponse } from '$lib/server/recipe-extract-types';

const RECIPE_PARSER_API_BASE = 'https://recipe-parser-production.up.railway.app/api';
const SUPPORTED_SITES_CACHE_KEY = 'recipe_parser:supported_sites:v1';
const SUPPORTED_SITES_CACHE_TTL_SECONDS = 60 * 60 * 24;
const PARSED_RECIPE_CACHE_TTL_SECONDS = 60 * 60 * 24;
const RECIPE_PARSER_HEADERS = {
    'X-API-Token': RECIPE_PARSER_API_KEY
} as const;

type SupportedSitesResponse = {
    count?: number;
    sites?: string[];
};

type ParsedRecipeApiResponse = {
    canonical_url?: string;
    description?: string;
    image?: string;
    ingredients?: string[];
    instructions?: string;
    instructions_list?: string[];
    site_name?: string;
    title?: string;
    total_time?: number;
    url?: string;
    yields?: string;
};

const normalizeHost = (host: string): string => {
    return host.trim().toLowerCase().replace(/^www\./, '');
};

const getHostFromUrl = (url: string): string | null => {
    try {
        return normalizeHost(new URL(url).hostname);
    } catch {
        return null;
    }
};

const hostMatchesSupportedSite = (host: string, supportedSites: Set<string>): boolean => {
    for (const site of supportedSites) {
        if (host === site || host.endsWith(`.${site}`)) {
            return true;
        }
    }
    return false;
};

const parseServingsFromYields = (yields: string | undefined): number | null => {
    if (!yields) return null;

    const numericMatches = [...yields.matchAll(/\d+(?:\.\d+)?/g)]
        .map((match) => Number(match[0]))
        .filter((value) => Number.isFinite(value));

    if (numericMatches.length === 0) return null;
    if (numericMatches.length === 1) return Math.round(numericMatches[0]);

    const looksLikeRange = /-|to/i.test(yields);
    if (looksLikeRange) {
        return Math.round((numericMatches[0] + numericMatches[1]) / 2);
    }

    return Math.round(numericMatches[0]);
};

const parseIngredientLine = (line: string) => {
    const trimmed = line.trim().replace(/^[\u2022\-*]\s*/, '');
    if (!trimmed) {
        return { amount: null, unit: null, name: '', notes: undefined as string | undefined };
    }

    const amountMatch = trimmed.match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚⅐⅑⅒])\s+(.+)$/);
    let amountRaw: string | null = null;
    let rest = trimmed;

    if (amountMatch) {
        amountRaw = amountMatch[1];
        rest = amountMatch[2];
    }

    const [namePartRaw, notesPartRaw] = rest.split(/,\s+/, 2);
    const words = namePartRaw.trim().split(/\s+/).filter(Boolean);

    let unit: string | null = null;
    let nameStartIndex = 0;
    if (words.length > 0 && isKnownUnitToken(words[0])) {
        unit = words[0];
        nameStartIndex = 1;
    }

    const name = words.slice(nameStartIndex).join(' ') || namePartRaw.trim();
    const amount = parseAmountValue(amountRaw);

    return {
        amount,
        unit: normalizeNullableUnit(unit),
        name,
        notes: notesPartRaw?.trim() || undefined
    };
};

const mapParsedApiRecipeToInternalRecipe = (recipe: ParsedRecipeApiResponse, sourceUrl: string) => {
    const title = recipe.title?.trim() || 'Imported Recipe';
    const instructionList = Array.isArray(recipe.instructions_list) && recipe.instructions_list.length > 0
        ? recipe.instructions_list.map((step) => step.trim()).filter(Boolean)
        : (recipe.instructions || '').split(/\n+/).map((step) => step.trim()).filter(Boolean);
    const totalTime = typeof recipe.total_time === 'number' && Number.isFinite(recipe.total_time)
        ? Math.max(0, Math.round(recipe.total_time))
        : 0;

    return {
        title,
        image: recipe.image?.trim() || '',
        description: recipe.description?.trim() || (recipe.site_name ? `Imported from ${recipe.site_name}` : 'Imported recipe'),
        prepTime: totalTime,
        cookTime: 0,
        totalTime,
        servings: parseServingsFromYields(recipe.yields),
        yields: recipe.yields || undefined,
        ingredients: (recipe.ingredients || []).map(parseIngredientLine).filter((ingredient) => ingredient.name.length > 0),
        instructions: instructionList.length > 0 ? instructionList : ['No instructions'],
        mealTypes: [],
        tags: [],
        sourceUrl: recipe.url || recipe.canonical_url || sourceUrl
    };
};

const getSupportedSites = async (): Promise<Set<string>> => {
    const cachedSites = await redis.get(SUPPORTED_SITES_CACHE_KEY);
    if (cachedSites) {
        try {
            const parsed = JSON.parse(cachedSites) as string[];
            return new Set(parsed);
        } catch {
            // If cache becomes malformed, fall through to refresh.
        }
    }

    const response = await fetch(`${RECIPE_PARSER_API_BASE}/supported-sites`, {
        headers: RECIPE_PARSER_HEADERS
    });
    if (!response.ok) {
        throw new Error(`Supported sites API failed with status ${response.status}`);
    }

    const data = await response.json() as SupportedSitesResponse;
    const sites = (data.sites || []).map(normalizeHost).filter(Boolean);
    await redis.set(SUPPORTED_SITES_CACHE_KEY, JSON.stringify(sites), 'EX', SUPPORTED_SITES_CACHE_TTL_SECONDS);
    return new Set(sites);
};

const fetchParsedRecipeForUrl = async (url: string): Promise<ParsedRecipeApiResponse | null> => {
    const cacheKey = `recipe_parser:recipe:${createHash('md5').update(url).digest('hex')}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached) as ParsedRecipeApiResponse;
        } catch {
            // If cache is malformed, continue with network call.
        }
    }

    const response = await fetch(`${RECIPE_PARSER_API_BASE}/recipe?url=${encodeURIComponent(url)}`, {
        headers: RECIPE_PARSER_HEADERS
    });
    if (!response.ok) {
        throw new Error(`Recipe parser API failed with status ${response.status}`);
    }

    const parsedRecipe = await response.json() as ParsedRecipeApiResponse;
    await redis.set(cacheKey, JSON.stringify(parsedRecipe), 'EX', PARSED_RECIPE_CACHE_TTL_SECONDS);
    return parsedRecipe;
};

export const tryExtractRecipeFromSupportedSite = async (url: string): Promise<ExtractRecipeResponse | null> => {
    const host = getHostFromUrl(url);
    if (!host) return null;

    const supportedSites = await getSupportedSites();
    if (!hostMatchesSupportedSite(host, supportedSites)) return null;

    const parsedRecipe = await fetchParsedRecipeForUrl(url);
    if (!parsedRecipe) return null;

    return {
        recipes: [mapParsedApiRecipeToInternalRecipe(parsedRecipe, url)]
    };
};
