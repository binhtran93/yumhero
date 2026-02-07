import { collection, deleteDoc, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import type { FridgeIngredient } from '$lib/types';
import { db } from '$lib/firebase';

/**
 * Fridge Ingredients Store
 *
 * Manages ingredients that were bought (checked off in shopping list)
 * and then saved to the fridge when a recipe was removed from the plan.
 */

const toDate = (value: unknown): Date => {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return ((value as { toDate: () => Date }).toDate());
    }
    return new Date();
};

const fromDoc = (id: string, item: any): FridgeIngredient => {
    return {
        id,
        name: item.name,
        amount: item.amount || 0,
        unit: item.unit || null,
        addedAt: toDate(item.addedAt)
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

        const ingredientsRef = collection(db, `users/${$user.uid}/fridgeIngredients`);
        return onSnapshot(
            ingredientsRef,
            (snapshot) => {
                const items = snapshot.docs.map((entry) => fromDoc(entry.id, entry.data()));
                items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
                set({ data: items, loading: false });
            },
            (error) => {
                console.error('Error listening to fridge ingredients:', error);
                set({ data: [], loading: false });
            }
        );
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
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('ingredients must be a non-empty array');
    }

    const batch = writeBatch(db);
    for (const ingredient of ingredients) {
        const name = ingredient.name.trim().toLowerCase();
        if (!name) continue;
        const ingredientRef = doc(collection(db, `users/${$user.uid}/fridgeIngredients`));
        batch.set(ingredientRef, {
            id: ingredientRef.id,
            name,
            amount: Number(ingredient.amount) || 0,
            unit: ingredient.unit ?? null,
            addedAt: new Date()
        });
    }

    await batch.commit();
};

/**
 * Delete an ingredient from the fridge.
 */
export const deleteIngredient = async (ingredientId: string): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    await deleteDoc(doc(db, `users/${$user.uid}/fridgeIngredients/${ingredientId}`));
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
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const nextUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) {
        const name = updates.name.trim().toLowerCase();
        if (!name) throw new Error('name is required');
        nextUpdates.name = name;
    }
    if (updates.amount !== undefined) {
        nextUpdates.amount = Number(updates.amount) || 0;
    }
    if (updates.unit !== undefined) {
        nextUpdates.unit = updates.unit === null ? null : updates.unit;
    }
    if (Object.keys(nextUpdates).length === 0) return;

    await updateDoc(doc(db, `users/${$user.uid}/fridgeIngredients/${ingredientId}`), nextUpdates);
};
