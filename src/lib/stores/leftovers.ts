import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import type { LeftoverItem, MealType } from '$lib/types';
import { removeLeftoverFromWeekPlan } from './plans';
import { apiRequest, jsonRequest } from '$lib/api/client';

/**
 * Leftovers Store
 *
 * Manages all leftover items stored in the user's Fridge.
 */

const fromApi = (item: any): LeftoverItem => {
    return {
        id: item.id,
        title: item.title,
        sourceRecipeId: item.sourceRecipeId || undefined,
        imageUrl: item.imageUrl ?? null,
        status: item.status,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        sourceDate: item.sourceDate ? new Date(item.sourceDate) : new Date(),
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

        let active = true;

        const load = async () => {
            try {
                const response = await apiRequest<{ leftovers: any[] }>('/api/leftovers');
                const items = response.leftovers.map(fromApi);
                items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                if (active) {
                    set({ data: items, loading: false });
                }
            } catch (error) {
                console.error('Error fetching leftovers:', error);
                if (active) {
                    set({ data: [], loading: false });
                }
            }
        };

        load();

        return () => {
            active = false;
        };
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
    const response = await apiRequest<{ id: string }>('/api/leftovers', {
        method: 'POST',
        ...jsonRequest({
            title,
            sourceRecipeId,
            imageUrl,
            sourceDate: sourceDate.toISOString(),
            sourceMealType
        })
    });

    return response.id;
};

export const setLeftoverPlanned = async (
    leftoverId: string,
    weekId: string,
    day: string,
    mealType: MealType
): Promise<void> => {
    await apiRequest<{ success: true }>(`/api/leftovers/${leftoverId}`, {
        method: 'PATCH',
        ...jsonRequest({
            status: 'planned',
            plannedFor: {
                weekId,
                day,
                mealType
            }
        })
    });
};

export const setLeftoverNotPlanned = async (leftoverId: string): Promise<void> => {
    await apiRequest<{ success: true }>(`/api/leftovers/${leftoverId}`, {
        method: 'PATCH',
        ...jsonRequest({
            status: 'not_planned',
            plannedFor: null
        })
    });
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

    await apiRequest<{ success: true }>(`/api/leftovers/${leftoverId}`, {
        method: 'DELETE'
    });
};

export const getLeftoverById = (leftoverId: string): LeftoverItem | undefined => {
    const $leftovers = get(leftovers);
    return $leftovers.data.find(item => item.id === leftoverId);
};
