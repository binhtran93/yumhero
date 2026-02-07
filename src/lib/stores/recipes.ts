import { derived, get, type Readable } from 'svelte/store';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { user, loading as authLoading } from './auth';
import { type CollectionState } from './firestore';
import type { Recipe } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';
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
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const recipeRef = doc(db, `users/${$user.uid}/recipes/${id}`);
    const recipeSnapshot = await getDoc(recipeRef);
    if (!recipeSnapshot.exists()) {
        throw new Error('Recipe not found');
    }

    const recipe = recipeSnapshot.data() as Partial<Recipe> | undefined;
    const imageUrl = recipe?.image;
    if (typeof imageUrl === 'string' && imageUrl.trim()) {
        await apiRequest<{ success: true }>(
            '/api/r2/delete-image',
            {
                method: 'POST',
                ...jsonRequest({ imageUrl: imageUrl.trim() })
            }
        );
    }

    await deleteDoc(recipeRef);
};
