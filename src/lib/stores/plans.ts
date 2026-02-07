import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { WeeklyPlan } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';

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
            const store = documentStore<{ days: WeeklyPlan }>(async () => {
                const response = await apiRequest<{ plan: { days?: WeeklyPlan } | null }>(`/api/plans/${weekId}`);
                return response.plan as { days: WeeklyPlan } | null;
            });
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

    await apiRequest<{ success: true }>(`/api/plans/${weekId}`, {
        method: 'PUT',
        ...jsonRequest({
            plan
        })
    });
};

/**
 * Remove a specific leftover from a week plan.
 * Used when a leftover is deleted from the fridge.
 */
export const removeLeftoverFromWeekPlan = async (weekId: string, leftoverId: string) => {
    await apiRequest<{ success: true; modified: boolean }>(
        `/api/plans/${weekId}/leftovers/${leftoverId}`,
        { method: 'DELETE' }
    );
};

export const removePlannedRecipeFromWeekPlan = async (
    weekId: string,
    plannedItemId: string
) => {
    await apiRequest<{ success: true; modified: boolean }>(
        `/api/plans/${weekId}/planned-recipes/${plannedItemId}`,
        {
            method: 'DELETE'
        }
    );
};
