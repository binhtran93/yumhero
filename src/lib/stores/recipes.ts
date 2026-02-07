import { derived, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, type CollectionState } from './firestore';
import type { Recipe } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';

export const userRecipes = derived<[Readable<any>, Readable<boolean>], CollectionState<Recipe>>(
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

        const store = collectionStore<Recipe>(async () => {
            const response = await apiRequest<{ recipes: Recipe[] }>('/api/recipes');
            return response.recipes;
        });
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

export const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const response = await apiRequest<{ id: string }>('/api/recipes', {
        method: 'POST',
        ...jsonRequest(recipe)
    });

    return response.id;
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    await apiRequest<{ success: true }>(`/api/recipes/${id}`, {
        method: 'PATCH',
        ...jsonRequest(updates)
    });
};

export const deleteRecipe = async (id: string) => {
    await apiRequest<{ success: true }>(`/api/recipes/${id}`, {
        method: "DELETE",
    });
};
