import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import type { FridgeIngredient } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';
import { collectionStore } from './firestore';

/**
 * Fridge Ingredients Store
 *
 * Manages ingredients that were bought (checked off in shopping list)
 * and then saved to the fridge when a recipe was removed from the plan.
 */

const fromApi = (item: any): FridgeIngredient => {
    return {
        id: item.id,
        name: item.name,
        amount: item.amount || 0,
        unit: item.unit || null,
        addedAt: item.addedAt ? new Date(item.addedAt) : new Date()
    };
};

/**
 * Reactive store that returns all fridge ingredients for the current user.
 */
export const fridgeIngredients = derived<[Readable<any>, Readable<boolean>], { data: FridgeIngredient[], loading: boolean }>(
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

        const store = collectionStore<FridgeIngredient>(async () => {
            const response = await apiRequest<{ ingredients: any[] }>('/api/fridge-ingredients');
            const items = response.ingredients.map(fromApi);
            items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
            return items;
        });

        return store.subscribe(set);
    },
    { data: [], loading: true }
);

/**
 * Derived store: Total count of ingredients in the fridge
 */
export const fridgeIngredientsCount = derived(fridgeIngredients, ($fridgeIngredients) => {
    return $fridgeIngredients.data.length;
});

/**
 * Add ingredients to the fridge.
 * Used when user confirms saving bought ingredients after removing a recipe.
 */
export const addIngredientsToFridge = async (
    ingredients: Array<{
        name: string;
        amount: number;
        unit: string | null;
    }>
): Promise<void> => {
    await apiRequest<{ ids: string[] }>('/api/fridge-ingredients', {
        method: 'POST',
        ...jsonRequest({ ingredients })
    });
};

/**
 * Delete an ingredient from the fridge.
 */
export const deleteIngredient = async (ingredientId: string): Promise<void> => {
    await apiRequest<{ success: true }>(`/api/fridge-ingredients/${ingredientId}`, {
        method: 'DELETE'
    });
};

/**
 * Update an existing ingredient in the fridge.
 */
export const updateIngredient = async (
    ingredientId: string,
    updates: Partial<{
        name: string;
        amount: number;
        unit: string | null;
    }>
): Promise<void> => {
    await apiRequest<{ success: true }>(`/api/fridge-ingredients/${ingredientId}`, {
        method: 'PATCH',
        ...jsonRequest(updates)
    });
};
