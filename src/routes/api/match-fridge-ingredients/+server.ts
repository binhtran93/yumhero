import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { createHash } from 'crypto';
import { redis } from '$lib/server/redis';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';
import { adminDb } from '$lib/server/admin';
import { getShoppingListForWeek } from '$lib/server/shopping-list';

interface MinimalIngredient {
    id: string;
    name: string;
    amount: number;
    unit: string | null;
}

export async function POST({ request }) {
    const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        // 1. Authenticate User
        const user = await verifyAuth(request);

        // 2. Check Rate Limit
        await checkRateLimit(user.uid, RATE_LIMITS.matchFridgeIngredients);

        const { weekId } = (await request.json()) as { weekId?: unknown };
        if (typeof weekId !== 'string' || weekId.trim().length === 0) {
            return json({ error: 'Missing or invalid weekId' }, { status: 400 });
        }

        const shoppingListForWeek = await getShoppingListForWeek(user.uid, weekId.trim());
        const shoppingList: MinimalIngredient[] = shoppingListForWeek
            .filter((item) => item.sources.some((source) => !source.is_checked))
            .map((item) => ({
                id: item.id,
                name: item.ingredient_name,
                amount: item.sources.reduce((sum, source) => sum + (source.amount || 0), 0),
                unit: item.sources[0]?.unit || null
            }));

        const fridgeSnapshot = await adminDb.collection(`users/${user.uid}/fridgeIngredients`).get();
        const fridgeIngredients: MinimalIngredient[] = fridgeSnapshot.docs.map((doc) => {
            const data = doc.data() as Partial<MinimalIngredient>;
            return {
                id: doc.id,
                name: typeof data.name === 'string' ? data.name : '',
                amount: typeof data.amount === 'number' ? data.amount : 0,
                unit: typeof data.unit === 'string' ? data.unit : null
            };
        });

        if (shoppingList.length === 0 || fridgeIngredients.length === 0) {
            return json({ matches: [] });
        }

        // Generate a fast hash for caching
        // Sorting items to ensure the same list always produces the same hash
        const sortedShoppingList = [...shoppingList].sort((a, b) => a.id.localeCompare(b.id));
        const sortedFridgeIngredients = [...fridgeIngredients].sort((a, b) => a.id.localeCompare(b.id));

        const hashInput = JSON.stringify({
            s: sortedShoppingList,
            f: sortedFridgeIngredients
        });
        const cacheKey = `fridge_match:${createHash('md5').update(hashInput).digest('hex')}`;

        // Check cache
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            return json(JSON.parse(cachedResult));
        }

        const exactMatches = [];
        const unmatchedShoppingItems = [...shoppingList];

        // 1. Exact Name + Unit Matching
        for (let i = unmatchedShoppingItems.length - 1; i >= 0; i--) {
            const sItem = unmatchedShoppingItems[i];
            const sName = sItem.name.toLowerCase().trim();
            const sUnit = sItem.unit?.toLowerCase().trim() || null;

            const fItem = fridgeIngredients.find(f => {
                const fName = f.name.toLowerCase().trim();
                const fUnit = f.unit?.toLowerCase().trim() || null;
                return fName === sName && fUnit === sUnit;
            });

            if (fItem) {
                exactMatches.push({
                    shoppingItemId: sItem.id,
                    fridgeIngredientId: fItem.id,
                    name: sItem.name,
                    fridgeName: fItem.name,
                    amount: sItem.amount,
                    unit: sItem.unit,
                    fridgeAmount: fItem.amount,
                    fridgeUnit: fItem.unit,
                    type: 'exact'
                });
                unmatchedShoppingItems.splice(i, 1);
            }
        }

        // 2. AI Fuzzy Matching (only if there are items left)
        let aiMatches: any[] = [];
        if (unmatchedShoppingItems.length > 0 && fridgeIngredients.length > 0) {
            // Map to short IDs to reduce cognitive load/token noise for the model
            const sMap = unmatchedShoppingItems.map((item, i) => ({ ...item, shortId: `S${i}` }));
            const fMap = fridgeIngredients.map((item, i) => ({ ...item, shortId: `F${i}` }));

            const prompt = `
                ACT AS A STRICT, EXHAUSTIVE KITCHEN INVENTORY MANAGER. 
                Your goal is to find EVERY shopping item that is already in the fridge.

                Shopping List:
                ${sMap.map(item => `- ${item.shortId}: ${item.name}`).join('\n')}

                Fridge:
                ${fMap.map(item => `- ${item.shortId}: ${item.name}`).join('\n')}

                EXECUTION INSTRUCTIONS (Chain of Thought):
                1. Go through the shopping list item-by-item.
                2. For each item, check if its identity, translation, or synonym exists in the fridge list.
                3. EXHAUSTIVE MODE: Do not stop until every single item has been checked. I expect a complete list of matches.
                4. One fridge item can satisfy multiple shopping list entries (e.g., "tomatoes" and "cà chua" both match "cà chua").

                CRITICAL RULES:
                - IDENTITY MATCH ONLY: Match if they are the SAME ingredient (regardless of language, prep, or form).
                - NO SUBSTITUTIONS: Onion is NOT tomato. Garlic is NOT shallots.
                - FORMAT: Return groups of Short IDs. [[FridgeShortID, ShoppingShortID1, ShoppingShortID2, ...], ...]
            `;

            const { output } = await generateText({
                model: google('gemini-2.0-flash-lite'),
                experimental_output: Output.object({
                    schema: z.object({
                        matches: z.array(z.array(z.string())).describe('Groups of Short IDs')
                    })
                }),
                system: 'You are a precise kitchen assistant. You perform a complete, exhaustive check of every item to find all identical ingredients across languages.',
                messages: [{ role: 'user', content: prompt }]
            });

            aiMatches = (output.matches || []).flatMap((group: string[]) => {
                if (group.length < 2) return [];
                const fShortId = group[0];
                const sShortIds = group.slice(1);

                const fItem = fMap.find(f => f.shortId === fShortId);
                if (!fItem) return [];

                return sShortIds.map(sId => {
                    const sItem = sMap.find(s => s.shortId === sId);
                    if (!sItem) return null;

                    return {
                        shoppingItemId: sItem.id,
                        fridgeIngredientId: fItem.id,
                        name: sItem.name,
                        fridgeName: fItem.name,
                        amount: sItem.amount,
                        unit: sItem.unit,
                        fridgeAmount: fItem.amount,
                        fridgeUnit: fItem.unit,
                        type: 'ai'
                    };
                }).filter(m => m !== null);
            });
        }

        // Deduplicate matches to prevent client-side key errors
        const allMatches = [...exactMatches, ...aiMatches];
        const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.shoppingItemId, m])).values());

        const result = {
            matches: uniqueMatches
        };

        // Store in cache for 24 hours
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400);

        return json(result);

    } catch (error: any) {
        console.error('Error matching ingredients:', error);

        let status = 500;
        if (error.message.includes('authentication') || error.message.includes('Authorization')) {
            status = 401;
        } else if (error.message.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: 'Failed to match ingredients', details: error?.message || String(error) }, { status });
    }
}
