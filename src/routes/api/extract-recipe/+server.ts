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
    servings: z.number().describe('Number of servings'),
    yields: z.string().optional().describe('Yield text, e.g. "4 servings" or "12 cookies"'),
    ingredients: z.array(IngredientSchema),
    instructions: z.array(z.string()).describe('Step-by-step cooking instructions'),
    prepNotes: z.string().optional().describe('Notes about preparation before starting'),
    course: z.string().optional().describe('Course type, e.g. Breakfast, Lunch, Dinner'),
    cuisine: z.string().optional().describe('Cuisine type, e.g. Italian, Mexican'),
    mainIngredient: z.string().optional().describe('The main ingredient of the dish'),
    tags: z.array(z.string()).describe('List of smart tags for the recipe, e.g. "Healthy", "Weeknight Dinner", "Quick", "Vegan", "Gluten-Free", "Kid-Friendly"')
});

import { scrapeText } from '$lib/server/curlScraper';
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

        if (url) {
            // Use the robust scraper to get text content and raw JSON-LD
            const { text, jsonLds, mainImage: scrapedImage } = await scrapeText(url);
            mainImage = scrapedImage;

            contentToProcess = text.length > 500000 ? text.substring(0, 500000) : text;
            if (mainImage) {
                contentToProcess += `\n\n[IMPORTANT] Discovered Main Image URL from metadata: ${mainImage}`;
            }
            contentType = 'web page text content';

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
            contentToProcess = pastedText;
            contentType = 'pasted recipe text';
        }

        const prompt = `
            You are an expert recipe extractor. extracting recipe information from the provided ${contentType}.

            The content might contain ONE or MULTIPLE recipe variants (e.g. "Method 1", "Method 2", or different versions of a dish).
            YOU MUST EXTRACT ALL DISTINCT RECIPES FOUND IN THE CONTENT.
            
            If there are multiple variants, name them distinctively (e.g. "Tofu with Tomato Sauce - Method 1", "Tofu with Tomato Sauce - Fried Version").
            
            FOR EACH VARIANT, try to find a specific image URL that represents that specific version.
            If you cannot find a specific image for a variant, leave the image field empty (null/undefined).

            Generate relevant tags based on the recipe's characteristics such as meal type, main ingredient, dietary restrictions, and cuisine.
            For ingredients, extract the unit exactly as it appears or use standard abbreviations.
            
            CRITICAL: The input text may contain HTML entities (like &amp;, &#039;, &quot;, etc.). You MUST decode these into their plain text characters (e.g. '&', ''', '"') in all fields (title, description, ingredients, instructions, etc). Do not preserve the HTML entities.
            
            Extract the recipe details as accurately as possible.
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

        const recipes = output.recipes;

        // Upload images to R2 if available
        if (recipes && recipes.length > 0) {
            for (const recipe of recipes) {
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
