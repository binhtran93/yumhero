import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import type { ShoppingListItem, FridgeIngredient } from '$lib/types';

// Schema for AI response
const MatchResultSchema = z.object({
    matches: z.array(z.object({
        shoppingItemId: z.string(),
        fridgeIngredientId: z.string(),
        reasoning: z.string().describe('Explanation of why these items match, e.g., "Different brand of the same spice" or "Plural vs singular"'),
        confidence: z.number().min(0).max(1).describe('Confidence score from 0 to 1')
    })).describe('List of fuzzy matches found between remaining shopping list items and fridge ingredients')
});

export async function POST({ request }) {
    const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        const { shoppingList, fridgeIngredients }: { shoppingList: ShoppingListItem[], fridgeIngredients: FridgeIngredient[] } = await request.json();

        if (!shoppingList || !fridgeIngredients) {
            return json({ error: 'Missing shoppingList or fridgeIngredients' }, { status: 400 });
        }

        const exactMatches = [];
        const unmatchedShoppingItems = [...shoppingList];

        const getTotalAmount = (item: ShoppingListItem) => item.sources.reduce((sum, s) => sum + (s.amount || 0), 0);
        const getUnit = (item: ShoppingListItem) => item.sources[0]?.unit || null;

        // 1. Exact Matching
        for (let i = unmatchedShoppingItems.length - 1; i >= 0; i--) {
            const sItem = unmatchedShoppingItems[i];
            const sName = sItem.ingredient_name.toLowerCase().trim();
            const sUnit = getUnit(sItem)?.toLowerCase().trim() || null;

            const fItem = fridgeIngredients.find(f => {
                const fName = f.name.toLowerCase().trim();
                const fUnit = f.unit?.toLowerCase().trim() || null;
                return fName === sName && fUnit === sUnit;
            });

            if (fItem) {
                exactMatches.push({
                    shoppingItemId: sItem.id,
                    fridgeIngredientId: fItem.id,
                    name: sItem.ingredient_name,
                    fridgeName: fItem.name,
                    amount: getTotalAmount(sItem),
                    unit: getUnit(sItem),
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
                You are an expert chef and kitchen assistant. Your task is to match items from a shopping list with ingredients already available in the fridge.
                
                Shopping List items to check:
                ${unmatchedShoppingItems.map(item => `- ID: ${item.id}, Name: ${item.ingredient_name} (${getTotalAmount(item)} ${getUnit(item) || ''})`).join('\n')}

                Fridge Ingredients available:
                ${fridgeIngredients.map(item => `- ID: ${item.id}, Name: ${item.name} (${item.amount} ${item.unit || ''})`).join('\n')}

                Rules:
                1. You are a multilingual culinary expert. Match items based on their identity, regardless of the language used (English, Vietnamese, or any other language).
                2. Explicitly handle polyglot lists: If a shopping list has "tomatoes" and the fridge has "cà chua", these are a match.
                3. High flexibility: if the items are practically the same ingredient in a kitchen context (e.g., "poultry" and "chicken", "scallions" and "hành lá"), they should match.
                4. One fridge ingredient can satisfy multiple shopping list entries.
                5. Provide a clear reasoning for each match.
                6. Give a confidence score from 0 to 1. Only return matches with confidence > 0.7.

                Examples of language-agnostic matches:
                - "tomatoes" (EN) <-> "cà chua" (VN)
                - "garlic" (EN) <-> "tỏi" (VN)
                - "cilantro" (EN) <-> "ngò rí" (VN)
                - "eggs" (EN) <-> "trứng" (VN)
            `;

            const { output } = await generateText({
                model: google('gemini-2.0-flash-lite'),
                experimental_output: Output.object({
                    schema: MatchResultSchema
                }),
                system: 'You are a smart kitchen assistant focusing on ingredient matching.',
                messages: [{ role: 'user', content: prompt }]
            });

            aiMatches = output.matches.map(match => {
                const sItem = shoppingList.find(s => s.id === match.shoppingItemId);
                const fItem = fridgeIngredients.find(f => f.id === match.fridgeIngredientId);

                if (!sItem || !fItem) return null;

                return {
                    ...match,
                    name: sItem.ingredient_name,
                    fridgeName: fItem.name,
                    amount: getTotalAmount(sItem),
                    unit: getUnit(sItem),
                    fridgeAmount: fItem.amount,
                    fridgeUnit: fItem.unit,
                    type: 'ai'
                };
            }).filter((m): m is any => m !== null);
        }

        return json({
            matches: [...exactMatches, ...aiMatches]
        });

    } catch (error: any) {
        console.error('Error matching ingredients:', error);
        return json({ error: 'Failed to match ingredients', details: error?.message || String(error) }, { status: 500 });
    }
}
