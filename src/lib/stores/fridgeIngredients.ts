import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { db } from '$lib/firebase';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import type { FridgeIngredient } from '$lib/types';

/**
 * Fridge Ingredients Store
 * 
 * Manages ingredients that were bought (checked off in shopping list)
 * and then saved to the fridge when a recipe was removed from the plan.
 */

// Helper to convert Firestore data to FridgeIngredient
const fromFirestore = (doc: any): FridgeIngredient => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        amount: data.amount || 0,
        unit: data.unit || null,
        addedAt: data.addedAt?.toDate?.() || new Date(),
        sourceRecipeId: data.sourceRecipeId || null,
        sourceRecipeTitle: data.sourceRecipeTitle || null,
    };
};

// Helper to convert FridgeIngredient to Firestore data
const toFirestore = (item: Omit<FridgeIngredient, 'id'>) => {
    return {
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        addedAt: Timestamp.fromDate(item.addedAt),
        sourceRecipeId: item.sourceRecipeId,
        sourceRecipeTitle: item.sourceRecipeTitle,
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

        // Subscribe to realtime updates
        const unsubscribe = onSnapshot(ingredientsRef, (snapshot) => {
            const items = snapshot.docs.map(fromFirestore);
            // Sort by addedAt descending (newest first)
            items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
            set({ data: items, loading: false });
        }, (error) => {
            console.error('Error fetching fridge ingredients:', error);
            set({ data: [], loading: false });
        });

        return unsubscribe;
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
        sourceRecipeId: string | null;
        sourceRecipeTitle: string | null;
    }>
): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    // Add each ingredient to Firestore
    for (const ingredient of ingredients) {
        const ingredientId = crypto.randomUUID();
        const ingredientRef = doc(db, `users/${$user.uid}/fridgeIngredients`, ingredientId);

        const newIngredient: Omit<FridgeIngredient, 'id'> = {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            addedAt: new Date(),
            sourceRecipeId: ingredient.sourceRecipeId,
            sourceRecipeTitle: ingredient.sourceRecipeTitle,
        };

        await setDoc(ingredientRef, toFirestore(newIngredient));
    }
};

/**
 * Delete an ingredient from the fridge.
 */
export const deleteIngredient = async (ingredientId: string): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const ingredientRef = doc(db, `users/${$user.uid}/fridgeIngredients`, ingredientId);
    await deleteDoc(ingredientRef);
};

/**
 * Get a single ingredient by ID.
 */
export const getIngredientById = (ingredientId: string): FridgeIngredient | undefined => {
    const $fridgeIngredients = get(fridgeIngredients);
    return $fridgeIngredients.data.find(item => item.id === ingredientId);
};
