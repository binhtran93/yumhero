import type { MealType } from '$lib/types';

/**
 * Mealtime Utilities
 * 
 * Provides helper functions for determining meal times and detecting
 * whether a scheduled meal time has passed.
 */

// Default meal times (24-hour format)
const DEFAULT_MEAL_TIMES: Record<Exclude<MealType, 'note'>, { hour: number; minute: number }> = {
    breakfast: { hour: 8, minute: 0 },
    lunch: { hour: 12, minute: 0 },
    dinner: { hour: 18, minute: 0 },
    snack: { hour: 15, minute: 0 },
};

// Day name to day-of-week index mapping (0 = Sunday, 1 = Monday, etc.)
const DAY_TO_INDEX: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
};

/**
 * Get the default time for a meal type.
 */
export function getMealTime(mealType: MealType): { hour: number; minute: number } | null {
    if (mealType === 'note') return null;
    return DEFAULT_MEAL_TIMES[mealType];
}

/**
 * Calculate the actual Date for a specific meal slot in a week.
 * 
 * @param weekStart - The start date of the week (Monday)
 * @param day - Day name (e.g., "Monday", "Tuesday")
 * @param mealType - Type of meal
 * @returns Date object representing when this meal is scheduled
 */
export function getMealDateTime(
    weekStart: Date,
    day: string,
    mealType: MealType
): Date | null {
    const mealTime = getMealTime(mealType);
    if (!mealTime) return null;

    // Calculate day offset from week start (Monday = 0)
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayOffset = dayNames.indexOf(day);
    if (dayOffset === -1) return null;

    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(mealTime.hour, mealTime.minute, 0, 0);

    return date;
}

/**
 * Check if a meal's scheduled time has passed.
 * 
 * @param weekStart - The start date of the week (Monday)
 * @param day - Day name (e.g., "Monday", "Tuesday")
 * @param mealType - Type of meal
 * @param currentTime - Current time to compare against (defaults to now)
 * @returns true if the meal time has passed
 */
export function isMealTimePast(
    weekStart: Date,
    day: string,
    mealType: MealType,
    currentTime: Date = new Date()
): boolean {
    const mealDateTime = getMealDateTime(weekStart, day, mealType);
    if (!mealDateTime) return false;

    return currentTime > mealDateTime;
}

/**
 * Get human-readable time string for a meal type.
 * E.g., "8:00 AM", "12:00 PM", "6:00 PM"
 */
export function getMealTimeString(mealType: MealType): string | null {
    const mealTime = getMealTime(mealType);
    if (!mealTime) return null;

    const date = new Date();
    date.setHours(mealTime.hour, mealTime.minute, 0, 0);

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Parse a week ID string to get the week start date.
 * Week ID format: "YYYY-MM-DD" (Monday of the week)
 */
export function parseWeekId(weekId: string): Date {
    const [year, month, day] = weekId.split('-').map(Number);
    return new Date(year, month - 1, day);
}
