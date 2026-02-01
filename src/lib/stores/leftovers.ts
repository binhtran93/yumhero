import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { db } from '$lib/firebase';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import type { LeftoverItem, LeftoverStatus, MealType } from '$lib/types';
import { removeLeftoverFromWeekPlan } from './plans';

/**
 * Leftovers Store
 * 
 * Manages all leftover items stored in the user's Fridge.
 * Leftovers are single, indivisible units that transition between:
 * - 'not_planned': Available in the Fridge
 * - 'planned': Assigned to a meal slot
 */

// Helper to convert Firestore data to LeftoverItem
const fromFirestore = (doc: any): LeftoverItem => {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title,
        sourceRecipeId: data.sourceRecipeId || undefined,
        imageUrl: data.imageUrl ?? null,
        status: data.status as LeftoverStatus,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        plannedFor: data.plannedFor || undefined,
    };
};

// Helper to convert LeftoverItem to Firestore data
const toFirestore = (item: Omit<LeftoverItem, 'id'>) => {
    return {
        title: item.title,
        sourceRecipeId: item.sourceRecipeId || null,
        imageUrl: item.imageUrl ?? null,
        status: item.status,
        createdAt: Timestamp.fromDate(item.createdAt),
        plannedFor: item.plannedFor || null,
    };
};

/**
 * Reactive store that returns all leftover items for the current user.
 */
export const leftovers = derived<[Readable<any>, Readable<boolean>], { data: LeftoverItem[], loading: boolean }>(
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

        const leftoversRef = collection(db, `users/${$user.uid}/leftovers`);

        // Subscribe to realtime updates
        const unsubscribe = onSnapshot(leftoversRef, (snapshot) => {
            const items = snapshot.docs.map(fromFirestore);
            // Sort by createdAt descending (newest first)
            items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            set({ data: items, loading: false });
        }, (error) => {
            console.error('Error fetching leftovers:', error);
            set({ data: [], loading: false });
        });

        return unsubscribe;
    },
    { data: [], loading: true }
);

/**
 * Derived store: Count of items with status='not_planned' (for sidebar badge)
 */
export const notPlannedCount = derived(leftovers, ($leftovers) => {
    return $leftovers.data.filter(item => item.status === 'not_planned').length;
});

/**
 * Derived store: Total count of items in the leftovers store (for sidebar badge)
 */
export const totalLeftoversCount = derived(leftovers, ($leftovers) => {
    return $leftovers.data.length;
});

/**
 * Derived store: Available leftovers that can be added to meal plan
 */
export const availableLeftovers = derived(leftovers, ($leftovers) => {
    return $leftovers.data.filter(item => item.status === 'not_planned');
});

/**
 * Add a new leftover to the Fridge.
 * Can be created from a recipe or as a manual entry.
 */
export const addLeftoverToFridge = async (
    title: string,
    sourceRecipeId?: string,
    imageUrl?: string | null
): Promise<string> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const leftoverId = crypto.randomUUID();
    const leftoverRef = doc(db, `users/${$user.uid}/leftovers`, leftoverId);

    const newLeftover: Omit<LeftoverItem, 'id'> = {
        title,
        sourceRecipeId,
        imageUrl: imageUrl ?? null,
        status: 'not_planned',
        createdAt: new Date(),
    };

    await setDoc(leftoverRef, toFirestore(newLeftover));
    return leftoverId;
};

/**
 * Set a leftover's status to 'planned' and record where it's planned for.
 */
export const setLeftoverPlanned = async (
    leftoverId: string,
    weekId: string,
    day: string,
    mealType: MealType
): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const leftoverRef = doc(db, `users/${$user.uid}/leftovers`, leftoverId);

    await updateDoc(leftoverRef, {
        status: 'planned',
        plannedFor: {
            weekId,
            day,
            mealType,
        },
    });
};

/**
 * Set a leftover's status back to 'not_planned' (remove from plan).
 * Clears the plannedFor field.
 */
export const setLeftoverNotPlanned = async (leftoverId: string): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const leftoverRef = doc(db, `users/${$user.uid}/leftovers`, leftoverId);

    await updateDoc(leftoverRef, {
        status: 'not_planned',
        plannedFor: null,
    });
};

/**
 * Permanently delete a leftover.
 * @param leftoverId ID of the leftover to delete
 * @param cleanPlan Whether to also remove the leftover from any associated meal plans (default: true)
 */
export const deleteLeftover = async (leftoverId: string, cleanPlan: boolean = true): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    // Check if it's planned and we should clean up the plan document
    if (cleanPlan) {
        const item = getLeftoverById(leftoverId);
        if (item?.status === 'planned' && item.plannedFor?.weekId) {
            await removeLeftoverFromWeekPlan(item.plannedFor.weekId, leftoverId);
        }
    }

    const leftoverRef = doc(db, `users/${$user.uid}/leftovers`, leftoverId);
    await deleteDoc(leftoverRef);
};

/**
 * Get a single leftover by ID.
 * Returns undefined if not found.
 */
export const getLeftoverById = (leftoverId: string): LeftoverItem | undefined => {
    const $leftovers = get(leftovers);
    return $leftovers.data.find(item => item.id === leftoverId);
};
