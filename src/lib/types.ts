import type { Fraction } from '$lib/utils/fraction';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'note';

/**
 * Leftover status representing the two states of a leftover item.
 * - 'not_planned': Available in the Fridge, ready to be added to a meal plan
 * - 'planned': Assigned to a specific meal slot
 */
export type LeftoverStatus = 'not_planned' | 'planned';

/**
 * LeftoverItem represents a single leftover stored in the Fridge.
 * Leftovers are treated as single, indivisible units.
 */
export interface LeftoverItem {
    id: string;
    title: string;                      // Recipe title or custom name
    sourceRecipeId?: string;            // Optional reference to source recipe
    imageUrl?: string | null;           // Optional recipe thumbnail
    status: LeftoverStatus;             // Current planning state
    createdAt: Date;                    // When added to fridge
    sourceDate: Date;                   // The date of the meal this leftover came from
    sourceMealType: MealType;           // The meal type (Lunch/Dinner) this came from
    plannedFor?: {                      // Set when status = 'planned'
        weekId: string;
        day: string;
        mealType: MealType;
    };
}

/**
 * FridgeIngredient represents a bought ingredient stored in the Fridge.
 * Created when user removes a planned recipe but has already bought ingredients.
 */
export interface FridgeIngredient {
    id: string;
    name: string;                        // Ingredient name (normalized lowercase)
    amount: number;
    unit: string | null;
    addedAt: Date;                       // When added to fridge
}

/**
 * PlannedLeftover represents a leftover placed in the meal plan.
 * Uses type discriminator pattern with 'isLeftover: true' to distinguish from PlannedRecipe.
 */
export interface PlannedLeftover {
    id: string;                         // Unique ID for this planned item
    leftoverId: string;                 // Reference to LeftoverItem.id in Fridge
    title: string;                      // Display title
    imageUrl?: string | null;           // Store image URL in plan for disconnected states
    sourceRecipeId?: string;            // Store source recipe ID in plan
    isLeftover: true;                   // Type discriminator - always true
}

/**
 * Type guard to check if a meal plan item is a leftover
 */
export function isPlannedLeftover(item: PlannedRecipe | PlannedLeftover): item is PlannedLeftover {
    return 'isLeftover' in item && item.isLeftover;
}

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
    checked_from?: 'user' | 'fridge' | null;
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
 * - Recipe serves 3 people, quantity is 2 → serves 6 people total
 * - Recipe serves 3-4 people, quantity is 3 → serves 9-12 people total
 */
export interface PlannedRecipe {
    id: string; // Stable plan item id
    recipe: Recipe;
    quantity: number; // Number of batches to make (default: 1)
}

/**
 * Union type for items that can be placed in a meal slot.
 * Use isPlannedLeftover() type guard to distinguish between them.
 */
export type MealSlotItem = PlannedRecipe | PlannedLeftover;

export interface DayPlan {
    day: string; // e.g., "Monday"
    meals: {
        breakfast: MealSlotItem[];
        lunch: MealSlotItem[];
        dinner: MealSlotItem[];
        snack: MealSlotItem[];
        note: Note[];
    };
}

export type WeeklyPlan = DayPlan[];
