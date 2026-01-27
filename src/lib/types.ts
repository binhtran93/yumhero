export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Recipe {
    id: string;
    title: string;
    image: string;
    calories?: number;
    time: number;
    tags: string[];
    servings?: number;
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
