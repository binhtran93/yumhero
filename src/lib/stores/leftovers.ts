import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import type { LeftoverItem, MealType } from '$lib/types';
import { removeLeftoverFromWeekPlan } from './plans';
import { db } from '$lib/firebase';

/**
 * Leftovers Store
 *
 * Manages all leftover items stored in the user's Fridge.
 */

const toDate = (value: unknown): Date => {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return ((value as { toDate: () => Date }).toDate());
    }
    const parsed = new Date(String(value ?? ''));
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const getUtcDateKey = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fromDoc = (id: string, item: any): LeftoverItem => {
    return {
        id,
        title: item.title,
        sourceRecipeId: item.sourceRecipeId || undefined,
        imageUrl: item.imageUrl ?? null,
        status: item.status,
        createdAt: toDate(item.createdAt),
        sourceDate: toDate(item.sourceDate),
        sourceMealType: item.sourceMealType || 'dinner',
        plannedFor: item.plannedFor || undefined
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
        return onSnapshot(
            leftoversRef,
            (snapshot) => {
                const items = snapshot.docs.map((entry) => fromDoc(entry.id, entry.data()));
                items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                set({ data: items, loading: false });
            },
            (error) => {
                console.error('Error listening to leftovers:', error);
                set({ data: [], loading: false });
            }
        );
    },
    { data: [], loading: true }
);

export const totalLeftoversCount = derived(leftovers, ($leftovers) => {
    return $leftovers.data.length;
});

export const availableLeftovers = derived(leftovers, ($leftovers) => {
    return $leftovers.data.filter(item => item.status === 'not_planned');
});

export const addLeftoverToFridge = async (
    title: string,
    sourceRecipeId: string | undefined,
    imageUrl: string | null = null,
    sourceDate: Date,
    sourceMealType: MealType
): Promise<string> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const normalizedTitle = title.trim();
    if (!normalizedTitle) throw new Error('title is required');

    const leftoversRef = collection(db, `users/${$user.uid}/leftovers`);
    const sourceDateKey = getUtcDateKey(sourceDate);
    const existingSnapshot = await getDocs(leftoversRef);

    const duplicate = existingSnapshot.docs.find((entry) => {
        const data = entry.data() as {
            sourceDate?: unknown;
            sourceMealType?: string;
            sourceRecipeId?: string | null;
            title?: string;
        };

        const existingDate = toDate(data.sourceDate);
        const sameDate = getUtcDateKey(existingDate) === sourceDateKey;
        const sameMeal = data.sourceMealType === sourceMealType;
        const sameContent = sourceRecipeId
            ? data.sourceRecipeId === sourceRecipeId
            : data.title === normalizedTitle;

        return sameDate && sameMeal && sameContent;
    });

    if (duplicate) {
        throw new Error('This leftover has already been added to the fridge.');
    }

    const docRef = await addDoc(leftoversRef, {
        id: '',
        title: normalizedTitle,
        sourceRecipeId: sourceRecipeId || null,
        imageUrl: imageUrl ?? null,
        status: 'not_planned',
        createdAt: new Date(),
        sourceDate,
        sourceMealType,
        plannedFor: null
    });
    await setDoc(doc(db, `users/${$user.uid}/leftovers/${docRef.id}`), { id: docRef.id }, { merge: true });
    return docRef.id;
};

export const setLeftoverPlanned = async (
    leftoverId: string,
    weekId: string,
    day: string,
    mealType: MealType
): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    await setDoc(doc(db, `users/${$user.uid}/leftovers/${leftoverId}`), {
        status: 'planned',
        plannedFor: {
            weekId,
            day,
            mealType
        }
    }, { merge: true });
};

export const setLeftoverNotPlanned = async (leftoverId: string): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    await setDoc(doc(db, `users/${$user.uid}/leftovers/${leftoverId}`), {
        status: 'not_planned',
        plannedFor: null
    }, { merge: true });
};

export const deleteLeftover = async (leftoverId: string, cleanPlan: boolean = true): Promise<void> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    if (cleanPlan) {
        const item = getLeftoverById(leftoverId);
        if (item?.status === 'planned' && item.plannedFor?.weekId) {
            await removeLeftoverFromWeekPlan(item.plannedFor.weekId, leftoverId);
        }
    }

    await deleteDoc(doc(db, `users/${$user.uid}/leftovers/${leftoverId}`));
};

export const getLeftoverById = (leftoverId: string): LeftoverItem | undefined => {
    const $leftovers = get(leftovers);
    return $leftovers.data.find(item => item.id === leftoverId);
};
