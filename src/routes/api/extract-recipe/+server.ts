import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { parseAmount } from '$lib/utils/shopping';
import { z } from 'zod';

// Define the schema for the recipe using Zod
const IngredientSchema = z.object({
    amount: z.union([z.string(), z.number()]).transform(val => typeof val === 'number' ? val : parseAmount(val)).describe('The quantity of the ingredient, e.g. "1", "1/2", "200"'),
    unit: z.string().nullable().optional().describe('The unit of measurement. Use standard abbreviations (e.g. tbsp, tsp, g, oz) or the full unit name.'),
    name: z.string().describe('The name of the ingredient'),
    notes: z.string().optional().describe('Processing notes, e.g. "chopped", "diced", "to taste"')
});

const RecipeSchema = z.object({
    title: z.string().describe('The title of the recipe'),
    image: z.string().optional().describe('The URL of the recipe image'),
    description: z.string().describe('A brief description of the recipe'),
    prepTime: z.number().describe('Preparation time in minutes'),
    cookTime: z.number().describe('Cooking time in minutes'),
    totalTime: z.number().describe('Total time in minutes'),
    servings: z.number().nullable().describe('Number of servings'),
    yields: z.string().optional().describe('Yield text, e.g. "4 servings" or "12 cookies"'),
    ingredients: z.array(IngredientSchema),
    instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
    prepNotes: z.string().optional().describe('Notes about preparation before starting'),
    course: z.string().optional().describe('Course type, e.g. Breakfast, Lunch, Dinner'),
    mealTypes: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snack'])).describe('The categorical meal types this recipe is suitable for. Pick ONE OR MANY from: breakfast, lunch, dinner, snack.'),
    cuisine: z.string().optional().describe('Cuisine type, e.g. Italian, Mexican'),
    mainIngredient: z.string().optional().describe('The main ingredient of the dish'),

});

import { scraperManager } from '$lib/server/scrapers/ScraperManager';
import { uploadImageToR2 } from '$lib/server/r2';

export async function POST({ request }) {
    // Configure Google provider with explicit API key
    const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        const { url, text: pastedText } = await request.json();

        if (!url && !pastedText) {
            return json({ error: 'URL or text is required' }, { status: 400 });
        }

        let contentToProcess = '';
        let contentType = '';
        let mainImage: string | null = null;

        const optimizeTextContent = (text: string): string => {
            return text
                // Normalize newlines
                .replace(/\r\n|\r/g, '\n')
                // Remove excessive horizontal whitespace (tabs, multiple spaces)
                .replace(/[ \t]+/g, ' ')
                // Collapse 3+ newlines into 2 to preserve paragraph structure but safe space
                .replace(/\n\s*\n\s*\n+/g, '\n\n')
                // Remove leading/trailing whitespace
                .trim();
        };

        if (url) {
            // Use the scraper manager to get content via the appropriate strategy
            const result = await scraperManager.scrape(url);
            const { text, jsonLds, mainImage: scrapedImage } = result;
            mainImage = scrapedImage;

            // Optimize text BEFORE truncation to ensure we keep meaningful content
            const optimizedText = optimizeTextContent(text);
            contentToProcess = optimizedText.length > 50000 ? optimizedText.substring(0, 50000) : optimizedText;
            contentType = 'web page content';

            if (mainImage) {
                contentToProcess += `\n\n[IMPORTANT] Discovered Main Image URL from metadata: ${mainImage}`;
            }

            // CLIENT-SIDE CHECK (API level): Check if we have a valid Recipe JSON-LD
            if (jsonLds && jsonLds.length > 0) {
                for (const rawJson of jsonLds) {
                    try {
                        const json = JSON.parse(rawJson);

                        // Helper to check object type
                        const isRecipe = (obj: any): boolean => {
                            if (!obj || typeof obj !== 'object') return false;
                            const type = obj['@type'];
                            if (Array.isArray(type)) {
                                return type.includes('Recipe');
                            }
                            return type === 'Recipe';
                        };

                        let recipeData = null;

                        if (Array.isArray(json)) {
                            recipeData = json.find(isRecipe);
                        } else if (isRecipe(json)) {
                            recipeData = json;
                        } else if (json['@graph'] && Array.isArray(json['@graph'])) {
                            recipeData = json['@graph'].find(isRecipe);
                        }

                        if (recipeData) {
                            console.log('Found valid JSON-LD Recipe, optimizing context.');
                            // Inject the main image if one wasn't found in the JSON-LD or to reinforce it
                            if (mainImage && !recipeData.image) {
                                recipeData.image = mainImage;
                            }
                            contentToProcess = JSON.stringify(recipeData);
                            contentType = 'structured JSON-LD data';
                            break; // Found one, stop searching
                        }
                    } catch (e) {
                        // Start parsing next script
                    }
                }
            }
        } else {
            const optimizedPasted = optimizeTextContent(pastedText);
            contentToProcess = optimizedPasted.length > 50000 ? optimizedPasted.substring(0, 50000) : optimizedPasted;
            contentType = 'pasted recipe text';
        }

        const prompt = `
            You are an expert recipe extractor. extracting recipe information from the provided ${contentType}.

            The content might contain ONE or MULTIPLE recipe variants (e.g. "Method 1", "Method 2", or different versions of a dish).
            YOU MUST EXTRACT ALL DISTINCT RECIPES FOUND IN THE CONTENT.
            
            If there are multiple variants, name them distinctively (e.g. "Tofu with Tomato Sauce - Method 1", "Tofu with Tomato Sauce - Fried Version").
            
            FOR EACH VARIANT, try to find a specific image URL that represents that specific version.
            If you cannot find a specific image for a variant, leave the image field empty (null/undefined).


            For ingredients, extract the unit exactly as it appears or use standard abbreviations.
            
            CRITICAL: The input text may contain HTML entities (like &amp;, &#039;, &quot;, etc.). You MUST decode these into their plain text characters (e.g. '&', ''', '"') in all fields (title, description, ingredients, instructions, etc). Do not preserve the HTML entities.
            
            Extract the recipe details as accurately as possible.

            IMPORTANT FOR SERVINGS:
            If the servings amount is provided as a range (e.g. "4-6"), you MUST calculate the average and return a SINGLE NUMBER (e.g. 5).
            Do not return a string or a range. Servings must always be a number.



            8. For 'mealTypes', categorize the recipe into ALL suitable categories from: breakfast, lunch, dinner, snack. If a recipe is versatile (e.g. a granola that works for breakfast or a snack, or a dish suitable for both lunch and dinner), YOU MUST include all relevant types in the array.

        `;

        const { output } = await generateText({
            model: google('gemini-2.0-flash-lite'),
            experimental_output: Output.object({
                schema: z.object({
                    recipes: z.array(RecipeSchema).describe('List of extracted recipes')
                })
            }),
            system: prompt,
            messages: [
                {
                    role: 'user',
                    content: contentToProcess
                }
            ]
        });

        // Post-process recipes to deduplicate and clean
        const recipes = output.recipes.map(recipe => {
            const mealTypes = Array.from(new Set(recipe.mealTypes || []));
            return {
                ...recipe,
                mealTypes,
                tags: []
            };
        });

        // Upload images to R2 if available
        if (recipes && recipes.length > 0) {
            for (const recipe of recipes) {
                // Sanitize image field (handle literal "null" string from AI)
                if (recipe.image && (recipe.image === 'null' || recipe.image === 'undefined' || recipe.image.trim() === '')) {
                    recipe.image = undefined;
                }

                // Fallback to main image if variant image is missing
                if (!recipe.image && mainImage) {
                    console.log(`Variant "${recipe.title}" missing image, using main page image.`);
                    recipe.image = mainImage;
                }

                if (recipe.image) {
                    try {
                        const uniqueKey = `recipes/${crypto.randomUUID()}.jpg`; // Simple key generation
                        console.log(`Uploading image to R2: ${recipe.image} -> ${uniqueKey}`);
                        const r2Url = await uploadImageToR2(recipe.image, uniqueKey);
                        recipe.image = r2Url;
                        console.log('Image uploaded successfully:', r2Url);
                    } catch (uploadError) {
                        console.error('Failed to upload image to R2, keeping original URL:', uploadError);
                        // Keep the original URL if upload fails
                    }
                }
            }
        }

        return json({ recipes });

    } catch (error: any) {
        console.error('Error extracting recipe:', error);
        return json({ error: 'Failed to extract recipe', details: error?.message || String(error) }, { status: 500 });
    }
}
