import { derived, get, type Readable } from 'svelte/store';
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { user, loading as authLoading } from './auth';
import { type CollectionState } from './firestore';
import type { Recipe } from '$lib/types';
import { apiRequest } from '$lib/api/client';
import { db } from '$lib/firebase';

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

        const recipesRef = collection(db, `users/${$user.uid}/recipes`);
        return onSnapshot(
            recipesRef,
            (snapshot) => {
                const recipes = snapshot.docs.map((entry) => {
                    const data = entry.data() as Recipe;
                    return { ...data, id: entry.id };
                });
                set({ data: recipes, loading: false });
            },
            (error) => {
                console.error('Error listening to recipes:', error);
                set({ data: [], loading: false });
            }
        );
    },
    { data: [], loading: true }
);

export const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const docRef = await addDoc(collection(db, `users/${$user.uid}/recipes`), {
        ...recipe,
        createdAt: new Date()
    });
    await updateDoc(doc(db, `users/${$user.uid}/recipes/${docRef.id}`), { id: docRef.id });
    return docRef.id;
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const { id: _ignoredId, createdAt: _ignoredCreatedAt, ...safeUpdates } = updates as Partial<Recipe> & {
        createdAt?: unknown;
    };
    const normalizedUpdates = Object.fromEntries(
        Object.entries(safeUpdates).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(normalizedUpdates).length === 0) return;

    await updateDoc(doc(db, `users/${$user.uid}/recipes/${id}`), normalizedUpdates);
};

export const deleteRecipe = async (id: string) => {
    // Keep API delete for R2 image cleanup + backend checks.
    await apiRequest<{ success: true }>(`/api/recipes/${id}`, {
        method: "DELETE",
    });
};
