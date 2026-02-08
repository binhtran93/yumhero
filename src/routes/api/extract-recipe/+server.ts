import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { parseAmountValue } from '$lib/utils/shopping';
import { z } from 'zod';
import { createHash } from 'crypto';

// Define the schema for the recipe using Zod
const IngredientSchema = z.object({
    amount: z.union([z.string(), z.number(), z.null()]).transform(val => val === null ? null : parseAmountValue(val)).describe('The quantity of the ingredient as a number or fraction string when present, e.g. "1", "1/2", "200". Use null if no measurable quantity is specified.'),
    unit: z.string().nullable().optional().describe('The unit of measurement when present. Preserve explicit units from text (e.g. cup, tablespoon, teaspoons, oz, g). Use null only when no unit is given.'),
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
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';
import { redis } from '$lib/server/redis';

export async function POST({ request }) {
    // Configure Google provider with explicit API key
    const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        // 1. Authenticate User
        const user = await verifyAuth(request);

        // 2. Check Rate Limit
        await checkRateLimit(user.uid, RATE_LIMITS.extractRecipe);

        const { url, text: pastedText } = await request.json();

        if (!url && !pastedText) {
            return json({ error: 'URL or text is required' }, { status: 400 });
        }

        // 3. Check Cache
        const cacheInput = url || pastedText;
        const cacheKey = `recipe_extract:${createHash('md5').update(cacheInput).digest('hex')}`;
        const cachedResult = await redis.get(cacheKey);

        if (cachedResult) {
            console.log('Cache Hit for recipe extraction');
            return json(JSON.parse(cachedResult));
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
            const { text, mainImage: scrapedImage } = result;
            mainImage = scrapedImage;

            // Optimize text BEFORE truncation to ensure we keep meaningful content
            const optimizedText = optimizeTextContent(text);
            contentToProcess = optimizedText.length > 50000 ? optimizedText.substring(0, 50000) : optimizedText;
            contentType = 'web page content';

            if (mainImage) {
                contentToProcess += `\n\n[IMPORTANT] Discovered Main Image URL from metadata: ${mainImage}`;
            }
        } else {
            const optimizedPasted = optimizeTextContent(pastedText);
            contentToProcess = optimizedPasted.length > 50000 ? optimizedPasted.substring(0, 50000) : optimizedPasted;
            contentType = 'pasted recipe text';

            // If the text is very short, it's definitely not a recipe
            if (contentToProcess.length < 20) {
                return json({ recipes: [] });
            }
        }

        const prompt = `
            You are an expert recipe extractor. Your task is to extract recipe information from the provided ${contentType}.

            STRICT MISSION RULES:
            1. ONLY extract recipes that are SPECIFICALLY and BOLDLY present in the provided text.
            2. DO NOT FABRICATE, INVENT, OR "FILL IN THE GAPS" for recipes. If a recipe is not clearly there, it does not exist.
            3. If the provided text does not contain a clear recipe (listing both ingredients and instructions), YOU MUST RETURN AN EMPTY ARRAY [] for the "recipes" field.
            4. If the text is unrelated, gibberish, or just generic web content (like a login page, search results, or a generic article about food but without a specific recipe), RETURN AN EMPTY ARRAY.
            5. If you are unsure if the content is a recipe, err on the side of caution and return an empty array.
            
            The content might contain ONE or MULTIPLE recipe variants (e.g. "Method 1", "Method 2", or different versions of a dish).
            EXTRACT ALL DISTINCT RECIPES FOUND IN THE CONTENT, provided they are actually there.
            
            If there are multiple variants, name them distinctively (e.g. "Tofu with Tomato Sauce - Method 1", "Tofu with Tomato Sauce - Fried Version").
            
            FOR EACH VARIANT, try to find a specific image URL that represents that specific version.
            If you cannot find a specific image for a variant, leave the image field empty (null/undefined).

            For ingredients, extract the unit exactly as it appears or use standard abbreviations.
            INGREDIENT PARSING RULES (VERY IMPORTANT):
            - Always parse each ingredient into: amount, unit, name, notes.
            - If a line has an explicit unit (cup, cups, tablespoon(s), teaspoon(s), oz, g, kg, ml, l, lb, cloves, slices, etc.), you MUST put that in "unit".
            - Do not drop units. Example: "1 cup Ranchero Sauce" => amount: 1, unit: "cup", name: "Ranchero Sauce".
            - Example: "2 tablespoons Cotija cheese" => amount: 2, unit: "tablespoons", name: "Cotija cheese".
            - Example: "4 corn tortillas" => amount: 4, unit: null, name: "corn tortillas".
            - Example: "Avocado oil, for brushing" => amount: null, unit: null, name: "avocado oil", notes: "for brushing".
            - Keep preparation words (warmed, sliced, optional, for brushing, to taste) in "notes", not in unit.
            - Parse unicode fractions (½, ¼, ¾, etc.) as fractional amounts.
            
            CRITICAL: The input text may contain HTML entities (like &amp;, &#039;, &quot;, etc.). You MUST decode these into their plain text characters (e.g. '&', ''', '"') in all fields (title, description, ingredients, instructions, etc). Do not preserve the HTML entities.
            
            Extract the recipe details as accurately as possible.

            IMPORTANT FOR SERVINGS:
            If the servings amount is provided as a range (e.g. "4-6"), you MUST calculate the average and return a SINGLE NUMBER (e.g. 5).
            Do not return a string or a range. Servings must always be a number.

            For 'mealTypes', categorize the recipe into ALL suitable categories from: breakfast, lunch, dinner, snack. If a recipe is versatile (e.g. a granola that works for breakfast or a snack, or a dish suitable for both lunch and dinner), YOU MUST include all relevant types in the array.

            If you cannot find any cooking instructions or steps in the provided content, it is likely not a complete recipe. Return an EMPTY ARRAY if instructions are missing.
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
            const instructions = recipe.instructions && recipe.instructions.length > 0
                ? recipe.instructions
                : ['No instructions'];

            return {
                ...recipe,
                mealTypes,
                instructions,
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

        const result = { recipes };
        await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400); // Cache for 24 hours

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
