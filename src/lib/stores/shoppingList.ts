import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { ShoppingListItem } from '$lib/types';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

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

            const store = documentStore<{ shopping_list?: ShoppingListItem[] }>(`users/${$user.uid}/plans/${weekId}`);
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
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = doc(db, `users/${$user.uid}/plans`, weekId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return [];
    }

    return docSnap.data()?.shopping_list || [];
};

/**
 * Helper to save the shopping list to a week
 */
const saveShoppingList = async (weekId: string, shoppingList: ShoppingListItem[]) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = doc(db, `users/${$user.uid}/plans`, weekId);
    await updateDoc(docRef, {
        shopping_list: shoppingList,
        updatedAt: new Date()
    });
};

/**
 * Add a manual shopping item to a week's shopping list
 */
export const addManualShoppingItem = async (weekId: string, ingredientName: string, amount: number, unit: string | null) => {
    const shoppingList = await getShoppingList(weekId);
    const normalizedName = ingredientName.trim().toLowerCase();
    const existing = shoppingList.find(item => item.ingredient_name === normalizedName);

    if (existing) {
        const updatedSources = [...existing.sources, {
            recipe_id: null,
            amount,
            unit,
            is_checked: false
        }];
        existing.sources = updatedSources;
        existing.updated_at = new Date();
    } else {
        const newItem: ShoppingListItem = {
            id: crypto.randomUUID(),
            ingredient_name: normalizedName,
            sources: [{
                recipe_id: null,
                amount,
                unit,
                is_checked: false
            }],
            user_id: get(user)!.uid,
            created_at: new Date(),
            updated_at: new Date()
        };
        shoppingList.push(newItem);
    }

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Delete a shopping item from a week's shopping list
 */
export const deleteShoppingItem = async (weekId: string, itemId: string) => {
    const shoppingList = await getShoppingList(weekId);
    const filtered = shoppingList.filter(item => item.id !== itemId);
    await saveShoppingList(weekId, filtered);
};

/**
 * Toggle check state for a specific source
 */
export const toggleShoppingItemCheck = async (weekId: string, itemId: string, sourceIndex: number, checked: boolean) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item || !item.sources[sourceIndex]) {
        throw new Error("Shopping item or source not found");
    }

    item.sources[sourceIndex] = { ...item.sources[sourceIndex], is_checked: checked };
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Toggle all sources for an item
 */
export const toggleAllShoppingItemChecks = async (weekId: string, itemId: string, checked: boolean) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    item.sources = item.sources.map(source => ({ ...source, is_checked: checked }));
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Soft delete a shopping item (marks as deleted)
 */
export const softDeleteShoppingItem = async (weekId: string, itemId: string) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    // Save original sources on first delete if not already saved
    if (!item.original_sources) {
        item.original_sources = JSON.parse(JSON.stringify(item.sources));
    }

    item.is_deleted = true;
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Restore a soft-deleted shopping item
 */
export const restoreShoppingItem = async (weekId: string, itemId: string) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    item.is_deleted = false;
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Update a shopping item's amount and unit
 */
export const updateShoppingItem = async (weekId: string, itemId: string, newAmount: number, newUnit: string | null) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    // Save original sources on first edit if not already saved
    if (!item.original_sources) {
        item.original_sources = JSON.parse(JSON.stringify(item.sources));
    }

    // Calculate total current amount for history
    const totalAmount = item.sources.reduce((sum, s) => sum + s.amount, 0);
    const currentUnit = item.sources[0]?.unit || null;

    // Create a single source that replaces all existing sources with history tracking
    const newSource = {
        recipe_id: null,
        amount: newAmount,
        unit: newUnit,
        is_checked: item.sources.every(s => s.is_checked),
        histories: [
            ...(item.sources[0]?.histories || []),
            { amount: totalAmount, unit: currentUnit }
        ]
    };

    item.sources = [newSource];
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Reset a shopping item to its previous state
 */
export const resetShoppingItem = async (weekId: string, itemId: string) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    const hasHistory = item.sources[0]?.histories && item.sources[0].histories.length > 0;

    if (hasHistory) {
        // Pop from history
        const histories = [...item.sources[0].histories!];
        const previousState = histories.pop()!;

        const baseSource = {
            recipe_id: item.sources[0].recipe_id,
            amount: previousState.amount,
            unit: previousState.unit,
            is_checked: item.sources[0].is_checked,
        };

        const updatedSource = histories.length > 0
            ? { ...baseSource, histories }
            : baseSource;

        item.sources = [updatedSource];
        item.updated_at = new Date();
    } else if (item.original_sources) {
        // Restore to original
        item.sources = item.original_sources.map(s => {
            const { histories, ...rest } = s as any;
            return rest;
        });
        delete item.original_sources;
        item.updated_at = new Date();
    } else {
        throw new Error("Shopping item has no history to reset");
    }

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Reset all shopping items in a week
 */
export const resetAllShoppingItems = async (weekId: string) => {
    const shoppingList = await getShoppingList(weekId);

    // Filter out pure manual items and reset modified items
    const resetList = shoppingList.filter(item => {
        // Remove pure manual items (no original sources, all sources have null recipe_id)
        const isPureManualItem = !item.original_sources &&
            item.sources.every(s => s.recipe_id === null);
        return !isPureManualItem;
    }).map(item => {
        // Reset modified items
        if (item.original_sources) {
            item.sources = item.original_sources.map(s => {
                const { histories, ...rest } = s as any;
                return rest;
            });
            delete item.original_sources;
        } else {
            // Clear histories
            item.sources = item.sources.map(s => {
                const { histories, ...rest } = s as any;
                return rest;
            });
        }

        // Remove deleted flag
        delete item.is_deleted;
        item.updated_at = new Date();

        return item;
    });

    await saveShoppingList(weekId, resetList);
};

/**
 * Check if a shopping item can be reset
 */
export const hasItemHistory = (item: ShoppingListItem): boolean => {
    const hasSourceHistory = item.sources.some(s => s.histories && s.histories.length > 0);
    const hasOriginalSources = !!item.original_sources;
    return hasSourceHistory || hasOriginalSources;
};
