import { createHash } from 'crypto';
import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';
import { redis } from '$lib/server/redis';
import { tryExtractRecipeFromSupportedSite } from '$lib/server/recipe-parser';
import { extractRecipesWithAiFallback } from '$lib/server/recipe-ai-extractor';

const FINAL_EXTRACT_CACHE_TTL_SECONDS = 60 * 60 * 24;

export async function POST({ request }) {
    try {
        const user = await verifyAuth(request);
        await checkRateLimit(user.uid, RATE_LIMITS.extractRecipe);

        const { url, text: pastedText } = await request.json();

        if (!url && !pastedText) {
            return json({ error: 'URL or text is required' }, { status: 400 });
        }

        const cacheInput = url || pastedText;
        const cacheKey = `recipe_extract:${createHash('md5').update(cacheInput).digest('hex')}`;
        const cachedResult = await redis.get(cacheKey);

        if (cachedResult) {
            console.log('Cache Hit for recipe extraction');
            return json(JSON.parse(cachedResult));
        }

        if (url) {
            try {
                const parserResult = await tryExtractRecipeFromSupportedSite(url);
                if (parserResult) {
                    await redis.set(cacheKey, JSON.stringify(parserResult), 'EX', FINAL_EXTRACT_CACHE_TTL_SECONDS);
                    return json(parserResult);
                }
            } catch (parserError) {
                console.error('Recipe parser fast path failed, falling back to AI extraction:', parserError);
            }
        }

        const result = await extractRecipesWithAiFallback({ url, pastedText });
        await redis.set(cacheKey, JSON.stringify(result), 'EX', FINAL_EXTRACT_CACHE_TTL_SECONDS);

        return json(result);
    } catch (error: any) {
        console.error('Error extracting recipe:', error);

        let status = 500;
        if (error.message.includes('authentication') || error.message.includes('Authorization')) {
            status = 401;
        } else if (error.message.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: 'Failed to extract recipe', details: error?.message || String(error) }, { status });
    }
}
