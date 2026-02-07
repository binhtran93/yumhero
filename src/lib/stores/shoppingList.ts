import { derived, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { MealType, ShoppingListItem } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';

/**
 * Create a reactive week-scoped shopping list store.
 * This is for UI subscriptions that should auto-refresh.
 */
export const getWeekShoppingListStore = (weekId: string) => {
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
export const fetchBoughtIngredientsForRecipe = async (
    weekId: string,
    recipeId: string,
    day?: string,
    mealType?: MealType
): Promise<Array<{
    ingredientName: string;
    amount: number;
    unit: string | null;
}>> => {
    const searchParams = new URLSearchParams();
    if (day) {
        searchParams.set('day', day);
    }
    if (mealType) {
        searchParams.set('mealType', mealType);
    }

    const query = searchParams.toString();
    const response = await apiRequest<{ ingredients: Array<{ ingredientName: string; amount: number; unit: string | null }> }>(
        `/api/shopping-lists/${weekId}/recipes/${recipeId}/bought-ingredients${query ? `?${query}` : ''}`
    );
    return response.ingredients || [];
};

export const fetchWeekShoppingListCount = async (weekId: string): Promise<number> => {
    const response = await apiRequest<{ count: number }>(`/api/shopping-lists/${weekId}/count`);
    return typeof response.count === 'number' ? response.count : 0;
};
