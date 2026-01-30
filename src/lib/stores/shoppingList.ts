import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, type CollectionState } from './firestore';
import type { ShoppingListItem } from '$lib/types';
import { doc, deleteDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
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
