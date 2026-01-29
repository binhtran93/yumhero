export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'note';

export interface Tag {
    id: string;
    label: string;
}

export interface Ingredient {
    amount: string;
    unit: string;
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
    servings: number;
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

export interface DayPlan {
    day: string; // e.g., "Monday"
    meals: {
        breakfast: Recipe[];
        lunch: Recipe[];
        dinner: Recipe[];
        snack: Recipe[];
        note: Note[];
    };
}

export type WeeklyPlan = DayPlan[];
