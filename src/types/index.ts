export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Recipe {
    id: string;
    title: string;
    image: string;
    calories?: number;
    tags: string[];
}

export interface DayPlan {
    day: string; // e.g., "Monday"
    meals: {
        breakfast: Recipe | null;
        lunch: Recipe | null;
        dinner: Recipe | null;
    };
}

export type WeeklyPlan = DayPlan[];
