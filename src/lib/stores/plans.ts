import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
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

            let active = true;

            const load = async () => {
                try {
                    const response = await apiRequest<{ plan: { days?: WeeklyPlan } | null }>(`/api/plans/${weekId}`);
                    if (active) {
                        set({
                            data: response.plan?.days ?? null,
                            loading: false
                        });
                    }
                } catch (error) {
                    console.error('Error fetching week plan:', error);
                    if (active) {
                        set({ data: null, loading: false });
                    }
                }
            };

            load();

            return () => {
                active = false;
            };
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
