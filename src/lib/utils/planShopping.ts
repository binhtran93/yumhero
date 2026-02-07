import type { MealType, ShoppingListItem, ShoppingListSource, WeeklyPlan } from '$lib/types';
import { isPlannedLeftover } from '$lib/types';
import { parseAmount } from '$lib/utils/shopping';

function toDate(value: unknown): Date {
    if (value instanceof Date) {
        return value;
    }

    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }

    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    return new Date();
}

function normalizeShoppingItem(item: ShoppingListItem): ShoppingListItem {
    return {
        ...item,
        created_at: toDate(item.created_at),
        updated_at: toDate(item.updated_at)
    };
}

export function syncShoppingListFromPlan(
    currentList: ShoppingListItem[],
    plan: WeeklyPlan,
    userId: string
): ShoppingListItem[] {
    const normalizedCurrentList = currentList.map(normalizeShoppingItem);
    const recipeIngredientsMap = new Map<string, { sources: Array<Omit<ShoppingListSource, 'is_checked' | 'checked_from'>> }>();

    plan.forEach((dayPlan) => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as any[]).forEach((planRecipe) => {
                if (isPlannedLeftover(planRecipe)) return;
                if (!planRecipe.recipe?.ingredients || !planRecipe.recipe.id) return;

                const quantity = planRecipe.quantity || 1;
                const recipeId = planRecipe.recipe.id;

                planRecipe.recipe.ingredients.forEach((ing: any) => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * quantity;
                    const unit = ing.unit || null;
                    const name = ing.name.trim().toLowerCase();

                    if (!recipeIngredientsMap.has(name)) {
                        recipeIngredientsMap.set(name, { sources: [] });
                    }

                    const sources = recipeIngredientsMap.get(name)!.sources;
                    const existingSourceIndex = sources.findIndex((s) =>
                        s.recipe_id === recipeId &&
                        s.day === dayPlan.day &&
                        s.meal_type === type
                    );

                    let merged = false;
                    if (existingSourceIndex !== -1) {
                        const existingSource = sources[existingSourceIndex];
                        const u1 = existingSource.unit ? existingSource.unit.toLowerCase().trim() : '';
                        const u2 = unit ? unit.toLowerCase().trim() : '';

                        if (u1 === u2 || !u1 || !u2) {
                            existingSource.amount += scaledAmount;
                            if (!u1 && u2) {
                                existingSource.unit = unit;
                            }
                            merged = true;
                        }
                    }

                    if (!merged) {
                        sources.push({
                            recipe_id: recipeId,
                            amount: scaledAmount,
                            unit,
                            day: dayPlan.day,
                            meal_type: type as MealType
                        });
                    }
                });
            });
        });
    });

    const planRecipeIds = new Set<string>();
    plan.forEach((dayPlan) => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;
            (meals as any[]).forEach((planRecipe) => {
                if (isPlannedLeftover(planRecipe)) return;
                if (planRecipe.recipe?.id) planRecipeIds.add(planRecipe.recipe.id);
            });
        });
    });

    const newList: ShoppingListItem[] = [];
    const processedIngredients = new Set<string>();

    for (const existingItem of normalizedCurrentList) {
        const ingredientName = existingItem.ingredient_name;
        const recipeData = recipeIngredientsMap.get(ingredientName);

        const updatedSources = existingItem.sources.filter((source) => {
            if (source.recipe_id === null) return true;
            return planRecipeIds.has(source.recipe_id);
        });

        if (recipeData) {
            const recipeSources = recipeData.sources.map((source) => {
                let existingSource = existingItem.sources.find(
                    (entry) => entry.recipe_id === source.recipe_id && entry.day === source.day && entry.meal_type === source.meal_type
                );
                if (!existingSource) {
                    existingSource = existingItem.sources.find(
                        (entry) => entry.recipe_id === source.recipe_id
                    );
                }
                return {
                    ...source,
                    is_checked: existingSource?.is_checked ?? false,
                    checked_from: existingSource?.checked_from ?? null
                };
            });
            const manualSources = updatedSources.filter((entry) => entry.recipe_id === null);

            newList.push({
                ...existingItem,
                sources: [...recipeSources, ...manualSources],
                updated_at: new Date()
            });
            processedIngredients.add(ingredientName);
        } else if (updatedSources.length > 0) {
            newList.push({
                ...existingItem,
                sources: updatedSources,
                updated_at: new Date()
            });
        }
    }

    for (const [ingredientName, data] of recipeIngredientsMap.entries()) {
        if (!processedIngredients.has(ingredientName)) {
            newList.push({
                id: crypto.randomUUID(),
                ingredient_name: ingredientName,
                sources: data.sources.map((source) => ({ ...source, is_checked: false, checked_from: null })),
                user_id: userId,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    return newList;
}
