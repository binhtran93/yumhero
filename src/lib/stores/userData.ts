import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, documentStore, type CollectionState, type DocumentState } from './firestore';
import type { Recipe, WeeklyPlan, Tag, ShoppingListItem } from '$lib/types';
import { doc, setDoc, deleteDoc, collection, addDoc, updateDoc, writeBatch, getDoc, getDocs } from 'firebase/firestore';
import { db } from '$lib/firebase';

// Stores

// 1. Tags
export const userTags = derived<[Readable<any>, Readable<boolean>], CollectionState<Tag>>(
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

        const store = collectionStore<Tag>(`users/${$user.uid}/tags`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

// 2. Recipes
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

        const store = collectionStore<Recipe>(`users/${$user.uid}/recipes`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

// Actions - Tags
export const addTag = async (label: string): Promise<string> => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    // Check if tag already exists (case-insensitive check handled by caller usually, but good practice here too if we could)
    // For now, we rely on the caller or just create a new ID.
    // However, clean ID creation is better.

    const docRef = await addDoc(collection(db, `users/${$user.uid}/tags`), {
        label,
        createdAt: new Date()
    });

    // Store the ID in the document itself as well if needed, but the doc.id is usually enough.
    // Our collectionStore maps doc.id to the 'id' field, so we just need to ensure consistency if we want it stored explicitly.
    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
};

export const deleteTag = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/tags`, id));
}

export const updateTag = async (id: string, label: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await updateDoc(doc(db, `users/${$user.uid}/tags`, id), { label });
};


// Actions - Recipes
export const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, `users/${$user.uid}/recipes`), {
        ...recipe,
        createdAt: new Date()
    });

    await updateDoc(docRef, { id: docRef.id });

    return docRef.id;
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await updateDoc(doc(db, `users/${$user.uid}/recipes`, id), updates);
};

export const deleteRecipe = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/recipes`, id));
};

// Actions - Plans
export const getWeekPlan = (weekId: string) => {
    return derived<[Readable<any>, Readable<boolean>], { data: WeeklyPlan | null, loading: boolean }>(
        [user, authLoading],
        ([$user, $authLoading], set) => {
            if ($authLoading) {
                set({ data: null, loading: true });
                return;
            }
            if (!$user) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<{ days: WeeklyPlan }>(`users/${$user.uid}/plans/${weekId}`);
            return store.subscribe((state) => {
                set({
                    data: state.data ? state.data.days : null,
                    loading: state.loading
                });
            });
        },
        { data: null, loading: true }
    );
};

export const saveWeekPlan = async (weekId: string, plan: WeeklyPlan) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    // Save the plan to Firestore
    await setDoc(doc(db, `users/${$user.uid}/plans`, weekId), {
        id: weekId,
        days: plan,
        updatedAt: new Date()
    }, { merge: true });

    // Sync shopping list with the updated plan
    await syncShoppingList($user.uid, plan);
};

// Sync shopping list with meal plan
const syncShoppingList = async (userId: string, plan: WeeklyPlan) => {
    const { syncShoppingListWithPlan } = await import('$lib/utils/shopping');

    // Get current shopping list
    const currentList = get(userShoppingList).data;

    // Calculate what needs to be updated/deleted
    const { toUpdate, toDelete } = syncShoppingListWithPlan(currentList, plan);

    // If no changes needed, skip
    if (toUpdate.length === 0 && toDelete.length === 0) {
        return;
    }

    // Use batch writes for optimal performance (max 500 operations per batch)
    const batch = writeBatch(db);

    // Add deletions to batch
    toDelete.forEach(itemId => {
        const docRef = doc(db, `users/${userId}/shopping_lists`, itemId);
        batch.delete(docRef);
    });

    // Add updates to batch
    toUpdate.forEach(update => {
        const docRef = doc(db, `users/${userId}/shopping_lists`, update.id);
        batch.update(docRef, {
            sources: update.sources,
            updated_at: new Date()
        });
    });

    // Commit all operations atomically
    await batch.commit();
};

// 3. Shopping List
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

// Actions - Shopping List
export const addShoppingItem = async (ingredientName: string, source: Omit<ShoppingListItem['sources'][0], 'is_checked'>) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const normalizedName = ingredientName.trim().toLowerCase();

    // Check if item already exists
    const existingItems = get(userShoppingList).data;
    const existing = existingItems.find(item => item.ingredient_name === normalizedName);

    if (existing) {
        // Add source to existing item
        const updatedSources = [...existing.sources, { ...source, is_checked: false }];
        await updateDoc(doc(db, `users/${$user.uid}/shopping_lists`, existing.id), {
            sources: updatedSources,
            updated_at: new Date()
        });
    } else {
        // Create new item
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

export const updateShoppingItemSources = async (itemId: string, sources: ShoppingListItem['sources']) => {
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

// Initialization & Resets
export const initializeDefaults = async () => {
    const $user = get(user);
    if (!$user) return;

    const settingsRef = doc(db, `users/${$user.uid}/settings/general`);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        await setDoc(settingsRef, { initialized: true });
        console.log("Initialized default settings for user");
    }
};

