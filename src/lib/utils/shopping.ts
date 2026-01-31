import type { WeeklyPlan, Recipe, Ingredient, MealType } from "$lib/types";

export interface ShoppingItem {
    id: string; // unique key (name + unit)
    name: string;
    amount: number;
    unit: string;
    checked: boolean;
    sources: {
        recipeName: string;
        day: string;
        mealType: MealType;
        originalAmount: number; // useful for display "2 (from Pancakes)"
    }[];
}

// Helper to parse amount strings like "1/2", "1-2", "1.5", "1 1/2"
export const parseAmount = (amountStr: string | number | null | undefined): number | null => {
    if (amountStr === null || amountStr === undefined) return null;
    if (typeof amountStr === 'number') return amountStr;

    // Remove non-numeric chars except / . and space and -
    const cleanStr = amountStr.trim();
    if (!cleanStr) return null;

    // Handle range "1-2" -> take average? or max? usually max for shopping. Let's take max.
    if (cleanStr.includes("-")) {
        const parts = cleanStr.split("-");
        const max = parts[parts.length - 1];
        return parseAmount(max);
    }

    try {
        // Handle mixed fractions "1 1/2"
        if (cleanStr.includes(" ")) {
            const parts = cleanStr.split(" ");
            // If strictly "1 1/2" -> 3 parts? No, split by space.
            // Check if parts are valid
            if (parts.length === 2) {
                const whole = parseFloat(parts[0]);
                const frac = parseFraction(parts[1]);
                if (!isNaN(whole) && !isNaN(frac)) {
                    return whole + frac;
                }
            }
        }

        // Handle simple fraction "1/2"
        if (cleanStr.includes("/")) {
            return parseFraction(cleanStr);
        }

        const float = parseFloat(cleanStr);
        return isNaN(float) ? null : float;
    } catch (e) {
        console.warn("Failed to parse amount:", amountStr);
        return null;
    }
};

const parseFraction = (frac: string): number => {
    const parts = frac.split("/");
    if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (den !== 0) return num / den;
    }
    return 0;
};

// Use this to display back to user if needed, or simple toFixed(2)
export const formatAmount = (num: number | null | undefined): string => {
    if (num === null || num === undefined || num === 0) return "";

    // Round to max 2 decimal places and remove trailing zeros
    // e.g. 1.222 -> 1.22, 2.500 -> 2.5, 1.000 -> 1
    const rounded = Math.round(num * 100) / 100;
    return parseFloat(rounded.toFixed(2)).toString();
};


// Normalize units to try to merge "g" and "grams", "cup" and "cups"
const normalizeUnit = (unit: string): string => {
    const u = unit.toLowerCase().trim();
    if (u === "g" || u === "gram" || u === "grams") return "g";
    if (u === "kg" || u === "kilogram" || u === "kilograms") return "kg";
    if (u === "ml" || u === "milliliter" || u === "milliliters") return "ml";
    if (u === "l" || u === "liter" || u === "liters") return "l";
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return "lb";
    if (u === "oz" || u === "ounce" || u === "ounces") return "oz";
    if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") return "tbsp";
    if (u === "tsp" || u === "teaspoon" || u === "teaspoons") return "tsp";
    if (u === "cup" || u === "cups") return "cup";
    if (u === "pc" || u === "pcs" || u === "piece" || u === "pieces") return "pc";
    return u; // Return original if not matched
};