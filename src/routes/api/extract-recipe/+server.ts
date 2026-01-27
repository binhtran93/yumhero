import { GOOGLE_GENERATIVE_AI_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { DEFAULT_UNITS, DEFAULT_CATEGORIES } from '$lib/constants';

// Define the schema for the recipe using Zod
const IngredientSchema = z.object({
    amount: z.string().describe('The quantity of the ingredient, e.g. "1", "1/2", "200"'),
    unit: z.string().describe('The unit of measurement. Map to one of the provided units if possible, otherwise use the original unit.'),
    name: z.string().describe('The name of the ingredient'),
    notes: z.string().optional().describe('Processing notes, e.g. "chopped", "diced", "to taste"'),
    category: z.string().optional().describe('The category of the ingredient. Map to one of the provided categories if possible.')
});

const RecipeSchema = z.object({
    title: z.string().describe('The title of the recipe'),
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
    tags: z.array(z.string()).describe('List of tags describing the recipe, including course, cuisine, or dietary info')
});

import { scrapeText } from '$lib/server/scraper';

export async function POST({ request }) {
    // Configure Google provider with explicit API key
    const google = createGoogleGenerativeAI({
        apiKey: GOOGLE_GENERATIVE_AI_API_KEY
    });

    try {
        const { url } = await request.json();

        if (!url) {
            return json({ error: 'URL is required' }, { status: 400 });
        }

        // Use the robust scraper to get text content (handles proxies, fingerprinting, etc.)
        const { text } = await scrapeText(url);

        // Limit text size to avoid token limits if necessary
        const truncatedText = text.length > 500000 ? text.substring(0, 500000) : text;

        const prompt = `
            You are an expert recipe extractor. extracting recipe information from the provided web page text content.
            
            Here is the list of existing UNITS in our system:
            ${DEFAULT_UNITS.join(', ')}
            
            Here is the list of existing CATEGORIES in our system:
            ${DEFAULT_CATEGORIES.join(', ')}
            
            For the 'unit' field, try to normalize to one of our existing units if it's a direct match or common abbreviation (e.g. 'tbsp' -> 'Tablespoon'). If it doesn't match effectively, keep the original unit.
            
            For the 'category' field in ingredients, try to assign one of our existing categories based on the ingredient name.
            
            Extract the recipe details as accurately as possible.
        `;

        const { output: recipe } = await generateText({
            model: google('gemini-2.5-flash'),
            experimental_output: Output.object({ schema: RecipeSchema }),
            system: prompt,
            messages: [
                {
                    role: 'user',
                    content: truncatedText
                }
            ]
        });

        return json({ recipe });

    } catch (error: any) {
        console.error('Error extracting recipe:', error);
        return json({ error: 'Failed to extract recipe', details: error?.message || String(error) }, { status: 500 });
    }
}
