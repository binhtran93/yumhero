import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import type { ShoppingListItem, FridgeIngredient } from '$lib/types';

// Schema for AI response - Optimized for token savings
const MatchResultSchema = z.object({
    matches: z.array(z.array(z.string())).describe('Groups of IDs. Format: [fridgeIngredientId, shoppingItemId1, shoppingItemId2, ...]')
});

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
        const { shoppingList, fridgeIngredients }: { shoppingList: MinimalIngredient[], fridgeIngredients: MinimalIngredient[] } = await request.json();

        if (!shoppingList || !fridgeIngredients) {
            return json({ error: 'Missing shoppingList or fridgeIngredients' }, { status: 400 });
        }

        const exactMatches = [];
        const unmatchedShoppingItems = [...shoppingList];

        // 1. Exact Matching
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
            const prompt = `
                ACT AS A STRICT KITCHEN INVENTORY MANAGER. Match shopping items to fridge ingredients.
                
                Shopping List (to find):
                ${unmatchedShoppingItems.map(item => `- ${item.id}: ${item.name}`).join('\n')}

                Fridge (available):
                ${fridgeIngredients.map(item => `- ${item.id}: ${item.name}`).join('\n')}

                CRITICAL RULES:
                1. IDENTITY MATCH ONLY: Only match if the items are the SAME ingredient, regardless of the language used (e.g., matching "tomato", "cà chua", "pomodoro", "tomat", etc.). 
                   IDENTICAL identity from a global culinary perspective is required.
                2. UNIVERSAL LANGUAGE AGNOSTICISM: Recognize synonyms and translations across ALL languages. The recipe and fridge items can be in any language; match them by their biological or culinary essence.
                3. DO NOT MATCH SUBSTITUTIONS: Onion is NOT tomato. Garlic is NOT shallots. Even if they are "similar fresh produce", they ARE NOT THE SAME.
                4. CONFIDENCE > 0.95: If you are not 100% sure they are the exact same thing in reality, DO NOT match.
                5. FORMAT: Return groups where first ID is Fridge ID, and remaining IDs are Shopping Item IDs.
            `;

            const { output } = await generateText({
                model: google('gemini-2.0-flash-lite'),
                experimental_output: Output.object({
                    schema: MatchResultSchema
                }),
                system: 'You are a strict, precise kitchen assistant. You only match identical ingredients across languages. You never match substitutions or vaguely related items.',
                messages: [{ role: 'user', content: prompt }]
            });

            aiMatches = (output.matches || []).flatMap((group: string[]) => {
                if (group.length < 2) return [];
                const fId = group[0];
                const sIds = group.slice(1);

                const fItem = fridgeIngredients.find(f => f.id === fId);
                if (!fItem) return [];

                return sIds.map(sId => {
                    const sItem = shoppingList.find(s => s.id === sId);
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

        return json({
            matches: [...exactMatches, ...aiMatches]
        });

    } catch (error: any) {
        console.error('Error matching ingredients:', error);
        return json({ error: 'Failed to match ingredients', details: error?.message || String(error) }, { status: 500 });
    }
}
