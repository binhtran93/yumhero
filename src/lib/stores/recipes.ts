import { derived, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { type CollectionState } from './firestore';
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

        let active = true;

        const load = async () => {
            try {
                const response = await apiRequest<{ recipes: Recipe[] }>('/api/recipes');
                if (active) {
                    set({ data: response.recipes, loading: false });
                }
            } catch (error) {
                console.error('Error fetching recipes:', error);
                if (active) {
                    set({ data: [], loading: false });
                }
            }
        };

        load();

        return () => {
            active = false;
        };
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
