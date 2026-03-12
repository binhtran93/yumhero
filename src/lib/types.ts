import type { Fraction } from '$lib/utils/fraction';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'note';

export interface Tag {
    id: string;
    label: string;
}

export interface Ingredient {
    amount: Fraction | null;
    unit: string | null;
    name: string;
    note?: string;
}

export interface ShoppingListSource {
    recipe_id: string | null;
    amount: number;
    unit: string | null;
    is_checked: boolean;
    checked_from?: 'user' | null;
    day: string | null;
    meal_type: MealType | null;
}

export interface ShoppingListItem {
    id: string;
    ingredient_name: string;
    sources: ShoppingListSource[];
    user_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface Recipe {
    id: string;
    title: string;
    image: string;
    calories?: number;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    tags: string[];
    servings: number | null;
    yields?: string;
    description?: string;
    sourceUrl?: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepNotes?: string;
    mealTypes?: MealType[];
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
 * - Recipe serves 3 people, quantity is 2 -> serves 6 people total
 * - Recipe serves 3-4 people, quantity is 3 -> serves 9-12 people total
 */
export interface PlannedRecipe {
    id: string;
    recipe: Recipe;
    quantity: number;
}

export type MealSlotItem = PlannedRecipe;

export interface DayPlan {
    day: string;
    meals: {
        breakfast: MealSlotItem[];
        lunch: MealSlotItem[];
        dinner: MealSlotItem[];
        snack: MealSlotItem[];
        note: Note[];
    };
}

export type WeeklyPlan = DayPlan[];
