import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, type CollectionState } from './firestore';
import type { ShoppingListItem } from '$lib/types';
import { doc, deleteDoc, collection, addDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const userShoppingList = derived<[Readable<any>, Readable<boolean>], CollectionState<ShoppingListItem>>(
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

        const store = collectionStore<ShoppingListItem>(`users/${$user.uid}/shopping_lists`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

const addShoppingItem = async (ingredientName: string, source: Omit<ShoppingListItem['sources'][0], 'is_checked'>) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const normalizedName = ingredientName.trim().toLowerCase();
    const existingItems = get(userShoppingList).data;
    const existing = existingItems.find(item => item.ingredient_name === normalizedName);

    if (existing) {
        const updatedSources = [...existing.sources, { ...source, is_checked: false }];
        await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, existing.id), {
            sources: updatedSources,
            updated_at: new Date()
        });
    } else {
        const docRef = await addDoc(collection(db, `users/${$user.uid}/shopping_lists`), {
            ingredient_name: normalizedName,
            sources: [{ ...source, is_checked: false }],
            user_id: $user.uid,
            created_at: new Date(),
            updated_at: new Date()
        });
        await updateDoc(docRef, { id: docRef.id });
    }
};

const updateShoppingItemSources = async (itemId: string, sources: ShoppingListItem['sources']) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), {
        sources,
        updated_at: new Date()
    });
};

export const deleteShoppingItem = async (itemId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId));
};

export const toggleShoppingItemCheck = async (itemId: string, sourceIndex: number, checked: boolean) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const item = items.find(i => i.id === itemId);

    if (!item || !item.sources[sourceIndex]) {
        throw new Error("Shopping item or source not found");
    }

    const updatedSources = [...item.sources];
    updatedSources[sourceIndex] = { ...updatedSources[sourceIndex], is_checked: checked };

    await updateShoppingItemSources(itemId, updatedSources);
};

export const toggleAllShoppingItemChecks = async (itemId: string, checked: boolean) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const item = items.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    const updatedSources = item.sources.map(source => ({ ...source, is_checked: checked }));
    await updateShoppingItemSources(itemId, updatedSources);
};

export const addManualShoppingItem = async (ingredientName: string, amount: number, unit: string | null) => {
    await addShoppingItem(ingredientName, {
        recipe_id: null,
        amount,
        unit
    });
};

/**
 * Soft delete a shopping item (marks as deleted, doesn't actually remove)
 */
export const softDeleteShoppingItem = async (itemId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const item = items.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    // Save original sources on first delete if not already saved
    const updateData: Record<string, any> = {
        is_deleted: true,
        updated_at: new Date()
    };

    if (!item.original_sources) {
        updateData.original_sources = JSON.parse(JSON.stringify(item.sources));
    }

    await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), updateData);
};

/**
 * Restore a soft-deleted shopping item
 */
export const restoreShoppingItem = async (itemId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), {
        is_deleted: false,
        updated_at: new Date()
    });
};

/**
 * Update a shopping item's amount and unit
 * Records the previous state in histories for undo capability
 */
export const updateShoppingItem = async (itemId: string, newAmount: number, newUnit: string | null) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const item = items.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    // Save original sources on first edit if not already saved
    const updateData: Record<string, any> = {
        updated_at: new Date()
    };

    if (!item.original_sources) {
        updateData.original_sources = JSON.parse(JSON.stringify(item.sources));
    }

    // Calculate total current amount and unit for history
    const totalAmount = item.sources.reduce((sum, s) => sum + s.amount, 0);
    const currentUnit = item.sources[0]?.unit || null;

    // Create a single source that replaces all existing sources
    // with history tracking
    const newSource = {
        recipe_id: null, // Manual edit, source is null
        amount: newAmount,
        unit: newUnit,
        is_checked: item.sources.every(s => s.is_checked), // Preserve checked state
        histories: [
            ...(item.sources[0]?.histories || []),
            { amount: totalAmount, unit: currentUnit }
        ]
    };

    updateData.sources = [newSource];

    await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), updateData);
};

/**
 * Reset a shopping item to its previous state (pop from history)
 * If no history left, restore from original_sources if available
 */
export const resetShoppingItem = async (itemId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const item = items.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    const hasHistory = item.sources[0]?.histories && item.sources[0].histories.length > 0;

    if (hasHistory) {
        // Pop from history
        const histories = [...item.sources[0].histories!];
        const previousState = histories.pop()!;

        // Restore the previous amount and unit
        // Build source without histories if empty, otherwise include it
        const baseSource = {
            recipe_id: item.sources[0].recipe_id,
            amount: previousState.amount,
            unit: previousState.unit,
            is_checked: item.sources[0].is_checked,
        };

        const updatedSource = histories.length > 0
            ? { ...baseSource, histories }
            : baseSource;

        await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), {
            sources: [updatedSource],
            updated_at: new Date()
        });
    } else if (item.original_sources) {
        // No history but has original sources - restore to original
        await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, itemId), {
            sources: item.original_sources.map(s => {
                const { histories, ...rest } = s as any;
                return rest;
            }),
            original_sources: deleteField(),
            updated_at: new Date()
        });
    } else {
        throw new Error("Shopping item has no history to reset");
    }
};

/**
 * Reset all shopping items to their original state
 * - Restores soft-deleted items
 * - Removes custom/manual items (recipe_id === null without original_sources)
 * - Reverts edited items to original_sources
 * - Clears any edit histories
 */
export const resetAllShoppingItems = async () => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const items = get(userShoppingList).data;
    const promises: Promise<void>[] = [];

    for (const item of items) {
        // Check if item is a pure manual item (no original sources, all sources have null recipe_id)
        const isPureManualItem = !item.original_sources &&
            item.sources.every(s => s.recipe_id === null);

        // Check if item has any modifications
        const hasOriginalSources = !!item.original_sources;
        const hasHistories = item.sources.some(s => s.histories && s.histories.length > 0);
        const isDeleted = item.is_deleted;

        if (isPureManualItem) {
            // Delete pure manual items completely
            promises.push(deleteDoc(doc(db, `users/${$user.uid}/shopping_lists`, item.id)));
        } else if (hasOriginalSources) {
            // Restore to original sources - remove histories from original sources
            const cleanSources = item.original_sources!.map(s => {
                const { histories, ...rest } = s as any;
                return rest;
            });
            promises.push(updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, item.id), {
                sources: cleanSources,
                is_deleted: deleteField(),
                original_sources: deleteField(),
                updated_at: new Date()
            }));
        } else if (hasHistories || isDeleted) {
            // Clear histories from sources and restore is_deleted
            const cleanSources = item.sources.map(s => {
                const { histories, ...rest } = s as any;
                return rest;
            });
            const updateData: Record<string, any> = {
                sources: cleanSources,
                updated_at: new Date()
            };
            if (isDeleted) {
                updateData.is_deleted = deleteField();
            }
            promises.push(updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, item.id), updateData));
        }
    }

    await Promise.all(promises);
};

/**
 * Check if a shopping item can be reset (has edit history or original_sources)
 */
export const hasItemHistory = (item: ShoppingListItem): boolean => {
    const hasSourceHistory = item.sources.some(s => s.histories && s.histories.length > 0);
    const hasOriginalSources = !!item.original_sources;
    return hasSourceHistory || hasOriginalSources;
};
