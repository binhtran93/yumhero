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
                You are a multilingual culinary expert. Match shopping list items with fridge ingredients.
                
                Shopping List:
                ${unmatchedShoppingItems.map(item => `- ID: ${item.id}, Name: ${item.name} (${item.amount} ${item.unit || ''})`).join('\n')}

                Fridge:
                ${fridgeIngredients.map(item => `- ID: ${item.id}, Name: ${item.name} (${item.amount} ${item.unit || ''})`).join('\n')}

                Rules:
                1. Match items based on identity regardless of language (EN, VN, etc.).
                2. "tomatoes" (EN) matches "cà chua" (VN), "garlic" matches "tỏi", etc.
                3. High flexibility: "poultry" matches "chicken", "scallions" matches "hành lá".
                4. One fridge ingredient can satisfy multiple shopping entries.
                5. Provide clear reasoning and confidence > 0.7.
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
                    name: sItem.name,
                    fridgeName: fItem.name,
                    amount: sItem.amount,
                    unit: sItem.unit,
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
