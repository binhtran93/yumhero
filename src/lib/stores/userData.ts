import { derived, get, type Readable } from 'svelte/store';
import { user } from './auth';
import { collectionStore, documentStore, type CollectionState, type DocumentState } from './firestore';
import type { Recipe, WeeklyPlan } from '$lib/types';
import { doc, setDoc, deleteDoc, collection, addDoc, updateDoc, writeBatch, getDoc, getDocs } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { DEFAULT_UNITS, DEFAULT_CATEGORIES } from '$lib/constants';

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
export const userUnits = derived<Readable<any>, CollectionState<Unit>>(
    user,
    ($user, set) => {
        if (!$user) {
            set({ data: [], loading: false });
            return;
        }

        const store = collectionStore<Unit>(`users/${$user.uid}/units`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

// 2. Food Tags (Categories)
export const userTags = derived<Readable<any>, CollectionState<FoodTag>>(
    user,
    ($user, set) => {
        if (!$user) {
            set({ data: [], loading: false });
            return;
        }

        const store = collectionStore<FoodTag>(`users/${$user.uid}/food-categories`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

// 3. Recipes
export const userRecipes = derived<Readable<any>, CollectionState<Recipe>>(
    user,
    ($user, set) => {
        if (!$user) {
            set({ data: [], loading: false });
            return;
        }

        const store = collectionStore<Recipe>(`users/${$user.uid}/recipes`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
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
    return derived<Readable<any>, { data: WeeklyPlan | null, loading: boolean }>(
        user,
        ($user, set) => {
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

    await setDoc(doc(db, `users/${$user.uid}/plans`, weekId), {
        id: weekId,
        days: plan,
        updatedAt: new Date()
    }, { merge: true });
};

// Initialization & Resets
export const initializeDefaults = async () => {
    const $user = get(user);
    if (!$user) return;

    const settingsRef = doc(db, `users/${$user.uid}/settings/general`);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        const batch = writeBatch(db);

        // Add Units
        for (const u of DEFAULT_UNITS) {
            const ref = doc(db, `users/${$user.uid}/units`, u);
            batch.set(ref, { id: u, label: u });
        }

        // Add Categories
        for (const c of DEFAULT_CATEGORIES) {
            const ref = doc(db, `users/${$user.uid}/food-categories`, c);
            batch.set(ref, { id: c, label: c });
        }

        // Mark initialized
        batch.set(settingsRef, { initialized: true });

        await batch.commit();
        console.log("Initialized default data for user");
    }
};

export const resetUnitsToDefaults = async () => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const batch = writeBatch(db);

    // 1. Delete existing
    const snapshot = await getDocs(collection(db, `users/${$user.uid}/units`));
    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 2. Add defaults
    for (const u of DEFAULT_UNITS) {
        const ref = doc(db, `users/${$user.uid}/units`, u);
        batch.set(ref, { id: u, label: u });
    }

    await batch.commit();
};

export const resetCategoriesToDefaults = async () => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const batch = writeBatch(db);

    // 1. Delete existing
    const snapshot = await getDocs(collection(db, `users/${$user.uid}/food-categories`));
    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    // 2. Add defaults
    for (const c of DEFAULT_CATEGORIES) {
        const ref = doc(db, `users/${$user.uid}/food-categories`, c);
        batch.set(ref, { id: c, label: c });
    }

    await batch.commit();
};
