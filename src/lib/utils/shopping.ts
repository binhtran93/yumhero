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

            (meals as any[]).forEach(planRecipe => {
                if (!planRecipe.ingredients) return;

                // Use quantity property to scale ingredients
                // quantity represents how many batches of the recipe to make
                const quantity = planRecipe.quantity || 1;

                planRecipe.ingredients.forEach((ing: any) => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * quantity;
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

/**
 * Build shopping list items from a meal plan.
 * Groups ingredients by name and creates sources array with recipe_id.
 */
export const buildShoppingListFromPlan = (
    plan: WeeklyPlan,
    recipes: Recipe[]
): { ingredient_name: string; sources: { recipe_id: string; amount: number; unit: string | null }[] }[] => {
    const itemsMap = new Map<string, {
        ingredient_name: string;
        sources: { recipe_id: string; amount: number; unit: string | null }[];
    }>();

    plan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as any[]).forEach(planRecipe => {
                if (!planRecipe.ingredients) return;

                const quantity = planRecipe.quantity || 1;
                const recipeId = planRecipe.id;

                planRecipe.ingredients.forEach((ing: any) => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * quantity;
                    const unit = ing.unit || null;
                    const name = ing.name.trim().toLowerCase();

                    if (itemsMap.has(name)) {
                        const existing = itemsMap.get(name)!;
                        existing.sources.push({
                            recipe_id: recipeId,
                            amount: scaledAmount,
                            unit: unit
                        });
                    } else {
                        itemsMap.set(name, {
                            ingredient_name: name,
                            sources: [{
                                recipe_id: recipeId,
                                amount: scaledAmount,
                                unit: unit
                            }]
                        });
                    }
                });
            });
        });
    });

    return Array.from(itemsMap.values());
};

const getRecipeIdsFromPlan = (plan: WeeklyPlan): Set<string> => {
    const recipeIds = new Set<string>();

    plan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;
            (meals as any[]).forEach(planRecipe => {
                if (planRecipe.id) {
                    recipeIds.add(planRecipe.id);
                }
            });
        });
    });

    return recipeIds;
};

/**
 * Sync shopping list with meal plan changes.
 * Updates amounts when recipe quantities change.
 * Removes sources for recipes no longer in the plan.
 * Preserves manual items (sources with recipe_id === null).
 */
export const syncShoppingListWithPlan = (
    currentShoppingList: Array<{
        id: string;
        ingredient_name: string;
        sources: Array<{
            recipe_id: string | null;
            amount: number;
            unit: string | null;
            is_checked: boolean;
        }>;
    }>,
    newPlan: WeeklyPlan
): {
    toUpdate: Array<{ id: string; sources: any[] }>;
    toDelete: string[];
} => {
    const planRecipeIds = getRecipeIdsFromPlan(newPlan);

    const planIngredients = new Map<string, Map<string, number>>();

    newPlan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as any[]).forEach(planRecipe => {
                if (!planRecipe.ingredients || !planRecipe.id) return;

                const quantity = planRecipe.quantity || 1;
                const recipeId = planRecipe.id;

                planRecipe.ingredients.forEach((ing: any) => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * quantity;
                    const name = ing.name.trim().toLowerCase();

                    if (!planIngredients.has(name)) {
                        planIngredients.set(name, new Map());
                    }

                    const ingredientSources = planIngredients.get(name)!;
                    ingredientSources.set(recipeId, scaledAmount);
                });
            });
        });
    });

    const toUpdate: Array<{ id: string; sources: any[] }> = [];
    const toDelete: string[] = [];

    currentShoppingList.forEach(item => {
        const remainingSources = item.sources.filter(source => {
            if (source.recipe_id === null) {
                return true;
            }
            return planRecipeIds.has(source.recipe_id);
        });

        let needsUpdate = remainingSources.length !== item.sources.length;

        const planIngredient = planIngredients.get(item.ingredient_name);
        if (planIngredient) {
            remainingSources.forEach(source => {
                if (source.recipe_id && planIngredient.has(source.recipe_id)) {
                    const newAmount = planIngredient.get(source.recipe_id)!;
                    if (source.amount !== newAmount) {
                        source.amount = newAmount;
                        needsUpdate = true;
                    }
                }
            });
        }

        if (remainingSources.length === 0) {
            toDelete.push(item.id);
        } else if (needsUpdate) {
            toUpdate.push({
                id: item.id,
                sources: remainingSources
            });
        }
    });

    return { toUpdate, toDelete };
};

