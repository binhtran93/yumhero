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
        breakfast: Recipe[];
        lunch: Recipe[];
        dinner: Recipe[];
    };
}

export type WeeklyPlan = DayPlan[];
