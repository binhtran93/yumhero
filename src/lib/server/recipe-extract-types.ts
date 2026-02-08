import type { Fraction } from '$lib/utils/fraction';

export type ExtractedMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ExtractedIngredient = {
    amount: Fraction | null;
    unit: string | null;
    name: string;
    notes?: string;
};

export type ExtractedRecipe = {
    title: string;
    image?: string;
    description: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number | null;
    yields?: string;
    ingredients: ExtractedIngredient[];
    instructions: string[];
    prepNotes?: string;
    course?: string;
    mealTypes: ExtractedMealType[];
    cuisine?: string;
    mainIngredient?: string;
    tags: string[];
    sourceUrl?: string;
};

export type ExtractRecipeResponse = {
    recipes: ExtractedRecipe[];
};
