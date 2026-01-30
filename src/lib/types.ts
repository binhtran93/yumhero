export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'note';

export interface Tag {
    id: string;
    label: string;
}

export interface Ingredient {
    amount: number | null;
    unit: string | null;
    name: string;
    notes?: string;
}

export interface Recipe {
    id: string;
    title: string;
    image: string;
    calories?: number;
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    totalTime: number; // in minutes
    tags: string[];
    servings: number | null;
    yields?: string;
    description?: string;
    sourceUrl?: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepNotes?: string;
    course?: string;
    cuisine?: string;
    mainIngredient?: string;
}

export interface Note {
    id: string;
    text: string;
}

/**
 * PlannedRecipe represents a recipe added to the meal plan.
 * 
 * Concepts:
 * - servings: The base number of people the recipe serves (from Recipe)
 * - quantity: How many batches/times to make the recipe (plan-specific)
 * 
 * Example: 
 * - Recipe serves 3 people, quantity is 2 → serves 6 people total
 * - Recipe serves 3-4 people, quantity is 3 → serves 9-12 people total
 */
export interface PlannedRecipe extends Recipe {
    quantity: number; // Number of batches to make (default: 1)
}

export interface DayPlan {
    day: string; // e.g., "Monday"
    meals: {
        breakfast: PlannedRecipe[];
        lunch: PlannedRecipe[];
        dinner: PlannedRecipe[];
        snack: PlannedRecipe[];
        note: Note[];
    };
}

export type WeeklyPlan = DayPlan[];
