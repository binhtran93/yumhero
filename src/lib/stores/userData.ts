import { derived, get, type Readable } from 'svelte/store';
import { user } from './auth';
import { collectionStore, documentStore } from './firestore';
import type { Recipe, WeeklyPlan } from '$lib/types';
import { doc, setDoc, deleteDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

// Interfaces
export interface Unit {
    id: string;
    label: string;
}

export interface FoodTag {
    id: string;
    label: string;
}

// Stores

// 1. Units
export const userUnits = derived<Readable<any>, Unit[]>(
    user,
    ($user, set) => {
        if (!$user) {
            set([]);
            return;
        }

        const store = collectionStore<Unit>(`users/${$user.uid}/units`);
        return store.subscribe(set);
    },
    []
);

// 2. Food Tags (Categories)
export const userTags = derived<Readable<any>, FoodTag[]>(
    user,
    ($user, set) => {
        if (!$user) {
            set([]);
            return;
        }

        const store = collectionStore<FoodTag>(`users/${$user.uid}/food-categories`);
        return store.subscribe(set);
    },
    []
);

// 3. Recipes
export const userRecipes = derived<Readable<any>, Recipe[]>(
    user,
    ($user, set) => {
        if (!$user) {
            set([]);
            return;
        }

        const store = collectionStore<Recipe>(`users/${$user.uid}/recipes`);
        return store.subscribe(set);
    },
    []
);

// Actions - Units
export const addUnit = async (label: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await setDoc(doc(db, `users/${$user.uid}/units`, label), {
        id: label,
        label
    });
};

export const deleteUnit = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/units`, id));
}

// Actions - Categories
export const addCategory = async (label: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await setDoc(doc(db, `users/${$user.uid}/food-categories`, label), {
        id: label,
        label
    });
};

export const deleteCategory = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/food-categories`, id));
}

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
    return derived<Readable<any>, WeeklyPlan | null>(
        user,
        ($user, set) => {
            if (!$user) {
                set(null);
                return;
            }
            const store = documentStore<{ days: WeeklyPlan }>(`users/${$user.uid}/plans/${weekId}`);
            return store.subscribe((doc) => {
                if (doc) {
                    set(doc.days);
                } else {
                    set(null);
                }
            });
        },
        null
    );
};

export const saveWeekPlan = async (weekId: string, plan: WeeklyPlan) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await setDoc(doc(db, `users/${$user.uid}/plans`, weekId), {
        id: weekId,
        days: plan,
        updatedAt: new Date()
    }, { merge: true });
};
