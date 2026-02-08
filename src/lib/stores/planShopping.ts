import type { MealType, ShoppingListItem, ShoppingListSource, WeeklyPlan } from '$lib/types';
import { isPlannedLeftover } from '$lib/types';
import { Fraction } from '$lib/utils/fraction';
import { parseAmountValue } from '$lib/utils/amount';
import { areMergeableUnits } from '$lib/utils/unit';

type RecipeSourceDraft = Omit<ShoppingListSource, 'is_checked' | 'checked_from'>;

const PLAN_MEAL_TYPES: Exclude<MealType, 'note'>[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function toDate(value: unknown): Date {
    if (value instanceof Date) return value;

    if (
        value &&
        typeof value === 'object' &&
        'toDate' in value &&
        typeof (value as { toDate?: unknown }).toDate === 'function'
    ) {
        return (value as { toDate: () => Date }).toDate();
    }

    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
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

function pushOrMergeSource(sources: RecipeSourceDraft[], nextSource: RecipeSourceDraft) {
    const existingIndex = sources.findIndex((source) =>
        source.recipe_id === nextSource.recipe_id &&
        source.day === nextSource.day &&
        source.meal_type === nextSource.meal_type
    );

    if (existingIndex === -1) {
        sources.push(nextSource);
        return;
    }

    const existing = sources[existingIndex];
    if (!areMergeableUnits(existing.unit, nextSource.unit)) {
        sources.push(nextSource);
        return;
    }

    const merged = Fraction.add(
        Fraction.fromNumber(existing.amount) ?? { n: 0, d: 1 },
        Fraction.fromNumber(nextSource.amount) ?? { n: 0, d: 1 }
    );
    existing.amount = Fraction.toNumber(merged) ?? (existing.amount + nextSource.amount);
    if (!existing.unit && nextSource.unit) {
        existing.unit = nextSource.unit;
    }
}

function collectPlanSources(plan: WeeklyPlan): {
    ingredientSources: Map<string, RecipeSourceDraft[]>;
    recipeIds: Set<string>;
} {
    const ingredientSources = new Map<string, RecipeSourceDraft[]>();
    const recipeIds = new Set<string>();

    for (const dayPlan of plan) {
        for (const mealType of PLAN_MEAL_TYPES) {
            const meals = dayPlan.meals[mealType];

            for (const mealEntry of meals) {
                if (isPlannedLeftover(mealEntry)) continue;
                if (!mealEntry.recipe?.id || !Array.isArray(mealEntry.recipe.ingredients)) continue;

                const recipeId = mealEntry.recipe.id;
                recipeIds.add(recipeId);

                const quantity = mealEntry.quantity || 1;
                for (const ingredient of mealEntry.recipe.ingredients) {
                    if (!ingredient?.name) continue;

                    const ingredientName = ingredient.name.trim().toLowerCase();
                    if (!ingredientName) continue;

                    const parsedAmount = Fraction.toNumber(parseAmountValue(ingredient.amount));
                    const amount = (parsedAmount ?? 0) * quantity;
                    const source: RecipeSourceDraft = {
                        recipe_id: recipeId,
                        amount,
                        unit: ingredient.unit || null,
                        day: dayPlan.day,
                        meal_type: mealType
                    };

                    if (!ingredientSources.has(ingredientName)) {
                        ingredientSources.set(ingredientName, []);
                    }
                    pushOrMergeSource(ingredientSources.get(ingredientName)!, source);
                }
            }
        }
    }

    return { ingredientSources, recipeIds };
}

function findExistingSource(
    existingSources: ShoppingListSource[],
    source: RecipeSourceDraft
): ShoppingListSource | undefined {
    const exact = existingSources.find((entry) =>
        entry.recipe_id === source.recipe_id &&
        entry.day === source.day &&
        entry.meal_type === source.meal_type
    );
    if (exact) return exact;

    return existingSources.find((entry) => entry.recipe_id === source.recipe_id);
}

export function syncShoppingListFromPlan(
    currentList: ShoppingListItem[],
    plan: WeeklyPlan,
    userId: string
): ShoppingListItem[] {
    const normalizedCurrentList = currentList.map(normalizeShoppingItem);
    const { ingredientSources, recipeIds } = collectPlanSources(plan);

    const nextList: ShoppingListItem[] = [];
    const now = new Date();
    const processedIngredients = new Set<string>();

    for (const existingItem of normalizedCurrentList) {
        const ingredientName = existingItem.ingredient_name;
        const planSources = ingredientSources.get(ingredientName);
        const survivingSources = existingItem.sources.filter((source) => {
            if (source.recipe_id === null) return true;
            return recipeIds.has(source.recipe_id);
        });

        if (!planSources) {
            if (survivingSources.length > 0) {
                nextList.push({
                    ...existingItem,
                    sources: survivingSources,
                    updated_at: now
                });
            }
            continue;
        }

        const recipeSources: ShoppingListSource[] = planSources.map((source) => {
            const existingSource = findExistingSource(existingItem.sources, source);
            return {
                ...source,
                is_checked: existingSource?.is_checked ?? false,
                checked_from: existingSource?.checked_from ?? null
            };
        });
        const manualSources = survivingSources.filter((source) => source.recipe_id === null);

        nextList.push({
            ...existingItem,
            sources: [...recipeSources, ...manualSources],
            updated_at: now
        });
        processedIngredients.add(ingredientName);
    }

    for (const [ingredientName, sources] of ingredientSources.entries()) {
        if (processedIngredients.has(ingredientName)) continue;
        nextList.push({
            id: crypto.randomUUID(),
            ingredient_name: ingredientName,
            sources: sources.map((source) => ({
                ...source,
                is_checked: false,
                checked_from: null
            })),
            user_id: userId,
            created_at: now,
            updated_at: now
        });
    }

    return nextList;
}
