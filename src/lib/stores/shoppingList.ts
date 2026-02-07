import { derived, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { ShoppingListItem } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';

/**
 * Week-scoped shopping list store.
 * Returns a derived store for the shopping list of a specific week.
 */
export const getWeekShoppingList = (weekId: string) => {
    return derived<[Readable<any>, Readable<boolean>], { data: ShoppingListItem[], loading: boolean }>(
        [user, authLoading],
        ([$user, $authLoading], set) => {
            if ($authLoading) {
                set({ data: [], loading: true });
                return;
            }
            if (!$user) {
                set({ data: [], loading: false });
                return;
            }

            const store = documentStore<{ shopping_list?: ShoppingListItem[] }>(async () => {
                const response = await apiRequest<{ shopping_list: ShoppingListItem[] }>(`/api/shopping-lists/${weekId}`);
                return { shopping_list: response.shopping_list };
            });
            return store.subscribe((state) => {
                set({
                    data: state.data?.shopping_list || [],
                    loading: state.loading
                });
            });
        },
        { data: [], loading: true }
    );
};

/**
 * Helper to get the current shopping list for a week
 */
export const getShoppingList = async (weekId: string): Promise<ShoppingListItem[]> => {
    const response = await apiRequest<{ shopping_list: ShoppingListItem[] }>(`/api/shopping-lists/${weekId}`);
    return response.shopping_list || [];
};

/**
 * Add a manual shopping item to a week's shopping list
 */
export const addManualShoppingItem = async (weekId: string, ingredientName: string, amount: number, unit: string | null) => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/items`, {
        method: 'POST',
        ...jsonRequest({
            ingredientName,
            amount,
            unit
        })
    });
};

/**
 * Delete a shopping item from a week's shopping list
 */
export const deleteShoppingItem = async (weekId: string, itemId: string) => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/items/${itemId}`, {
        method: 'DELETE'
    });
};

/**
 * Toggle check state for a specific source
 */
export const toggleShoppingItemCheck = async (weekId: string, itemId: string, sourceIndex: number, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/items/${itemId}`, {
        method: 'PATCH',
        ...jsonRequest({
            op: 'set_source_checked',
            sourceIndex,
            checked,
            checkedFrom: checked_from
        })
    });
};

/**
 * Toggle all sources for an item
 */
export const toggleAllShoppingItemChecks = async (weekId: string, itemId: string, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/items/${itemId}`, {
        method: 'PATCH',
        ...jsonRequest({
            op: 'set_all_checked',
            checked,
            checkedFrom: checked_from
        })
    });
};

/**
 * Batch toggle check state for multiple shopping items
 */
export const batchToggleShoppingItemChecks = async (
    weekId: string,
    itemIds: string[],
    checked: boolean,
    checked_from: 'user' | 'fridge' | null = 'user'
) => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}`, {
        method: 'PATCH',
        ...jsonRequest({
            op: 'batch_set_all_checked',
            itemIds,
            checked,
            checkedFrom: checked_from
        })
    });
};

export const updateShoppingItem = async (weekId: string, itemId: string, newAmount: number, newUnit: string | null) => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/items/${itemId}`, {
        method: 'PATCH',
        ...jsonRequest({
            op: 'replace_manual_source',
            amount: newAmount,
            unit: newUnit
        })
    });
};

export const resetAllShoppingItems = async (weekId: string) => {
    await apiRequest<{ success: true }>(`/api/shopping-lists/${weekId}/rebuild`, {
        method: 'POST'
    });
};

/**
 * Get bought ingredients for a specific recipe.
 * Used when removing a recipe to check if any ingredients were already bought.
 * Returns a list of ingredients that have is_checked=true for the given recipe.
 */
export const getBoughtIngredientsForRecipe = async (
    weekId: string,
    recipeId: string,
    day?: string,
    mealType?: string
): Promise<Array<{
    ingredientName: string;
    amount: number;
    unit: string | null;
}>> => {
    const shoppingList = await getShoppingList(weekId);
    const boughtIngredients: Array<{
        ingredientName: string;
        amount: number;
        unit: string | null;
    }> = [];

    for (const item of shoppingList) {
        for (const source of item.sources) {
            // Check if this source matches the recipe being removed
            const matchesRecipe = source.recipe_id === recipeId;
            const matchesDay = !day || source.day === day;
            const matchesMeal = !mealType || source.meal_type === mealType;

            if (matchesRecipe && matchesDay && matchesMeal && source.is_checked) {
                boughtIngredients.push({
                    ingredientName: item.ingredient_name,
                    amount: source.amount,
                    unit: source.unit,
                });
            }
        }
    }

    return boughtIngredients;
};
