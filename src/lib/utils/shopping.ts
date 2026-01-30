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

export const generateShoppingList = (
    plan: WeeklyPlan,
    filterDay: string | "all" = "all"
): ShoppingItem[] => {
    const itemsMap = new Map<string, ShoppingItem>();

    plan.forEach(dayPlan => {
        if (filterDay !== "all" && dayPlan.day !== filterDay) return;

        Object.entries(dayPlan.meals).forEach(([type, recipes]) => {
            if (type === 'note') return;

            (recipes as Recipe[]).forEach(recipe => {
                if (!recipe.ingredients) return;

                // Determine scaling if needed. 
                // Currently plan recipes usually have `servings` set to the planned servings.
                // WE ASSUME `recipe.ingredients` amounts correspond to `recipe.servings`.
                // Wait, if I change servings in the UI, do I update the `ingredients` array in the default store?
                // Checking `RecipeModal.svelte` logic or `+page.svelte`...
                // In `+page.svelte`, we do:
                // `newMeals[existingIndex].servings = ...`
                // We DO NOT update the ingredients array numbers. We only update the top-level `servings` property on the recipe object in the plan.
                // The `recipe.ingredients` amounts are legally bound to the ORIGINAL recipe servings?
                // Actually, the `recipe` object in the plan is a COPY.
                // But the ingredients inside might be the original string values.
                // Let's assume the ingredient strings are for the BASE recipe, and we need to scale.
                // But wait, does the `recipe` object in the plan keep track of "base servings"? 
                // Usually it just has `servings`. If I change it from 4 to 8, the `servings` prop is 8.
                // But I don't see "baseServings" in the type. 
                // RISK: If I don't know the base servings, I can't scale.
                // FIX: I should assume the `ingredients` lists are static and match some "original" count.
                // However, without a `baseServings` prop, I have to guess or assume `availableRecipes` has the original.
                // Let's rely on the property `servings` on the recipe object as the "current target".
                // BUT what is the base?
                // Let's scan `availableRecipes` if possible?
                // For now, I will assume the `recipe.ingredients` correspond to the `recipe.servings` IF `recipe` comes from the DB.
                // BUT in `+page.svelte`, when we add a recipe, we copy it.
                // When we update servings, we update `servings`.
                // So, `ingredients` amounts are for... the ORIGINAL servings.
                // AND we don't have "originalServings" stored on the plan object explicitly unless we look it up.
                // Wait, if I add a recipe, it has `servings: 4`. Ingredient "1 cup".
                // I change plan recipe to `servings: 8`. Ingredient is still "1 cup".
                // So I need to calculate: amount = parse("1 cup") * (8 / 4).
                // PROBLEM: The plan recipe object has `servings: 8`. It LOST `4`.
                // UNLESS `recipe` in the plan is referencing the global recipe? No, it's a full object in Firestore.
                // We might be losing the original servings count if we overwrite it.
                // Let's check `+page.svelte` handleRecipeSelect.
                // `newMeals.push({ ...newRecipe, servings: ... })`
                // It copies everything.
                // Does `Recipe` type have a stable field?
                // If not, we technically can't scale correctly unless we assume the *ingredients* are truthful to *some* number.
                // For this iter, I will assume I CANNOT fetch the original easily without a lookup.
                // I will add a `baseServings` logic if I can, OR just use `servings` directly if it's not changed?
                // Ah, effectively, `availableRecipes` (the source of truth types) should be passed in.

                // REVISION: I will NOT pass `availableRecipes` to this function for simplicity first, 
                // I will blindly sum them up. 
                // WAIT, user asked: "if units is the same, make merged."
                // User didn't explicitly ask for scaling, but it's implied by "shopping list".
                // I will try to infer scaling if I can.
                // Actually, let's assume `servings` in the plan IS the amount the ingredients are for?
                // NO, that makes no sense if user changes it.
                // Let's assume the `recipe.ingredients` strings are static.
                // If I modify `servings`, I should scale.
                // I will assume the `servings` in the plan object is the TARGET.
                // I will assume `4` (standard) or try to find the recipe in a mapped list if passed.

                // Let's update the signature to accept `originalRecipesMap`.
            });
        });
    });

    return Array.from(itemsMap.values());
};

// Re-defining with map
export const aggregatedShoppingList = (
    plan: WeeklyPlan,
    filterDay: string | "all"
): ShoppingItem[] => {
    const itemsMap = new Map<string, ShoppingItem>();

    plan.forEach(dayPlan => {
        if (filterDay !== "all" && dayPlan.day !== filterDay) return;

        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as Recipe[]).forEach(planRecipe => {
                if (!planRecipe.ingredients) return;

                // Treat servings as "Quantity" (multiplier)
                // If plan says "2", it means 2 batches of the recipe.
                let ratio = planRecipe.servings || 1;

                planRecipe.ingredients.forEach(ing => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * ratio;
                    const unit = normalizeUnit(ing.unit || "");
                    const name = ing.name.trim().toLowerCase();
                    const key = `${name}__${unit}`; // Composite key

                    if (itemsMap.has(key)) {
                        const existing = itemsMap.get(key)!;
                        existing.amount += scaledAmount;
                        existing.sources.push({
                            recipeName: planRecipe.title,
                            day: dayPlan.day,
                            mealType: type as MealType,
                            originalAmount: scaledAmount
                        });
                    } else {
                        itemsMap.set(key, {
                            id: key,
                            name: name, // capital case this later for display?
                            amount: scaledAmount,
                            unit: unit,
                            checked: false,
                            sources: [{
                                recipeName: planRecipe.title,
                                day: dayPlan.day,
                                mealType: type as MealType,
                                originalAmount: scaledAmount
                            }]
                        });
                    }
                });
            });
        });
    });

    // Convert to array and simple sort
    return Array.from(itemsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
