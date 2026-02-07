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
    const $user = get(user);
    if (!$user) return;

    const response = await apiRequest<{ plan: { days?: WeeklyPlan } | null }>(`/api/plans/${weekId}`);
    const days = response.plan?.days as WeeklyPlan | undefined;
    if (!days) return;

    let modified = false;
    days.forEach(day => {
        Object.keys(day.meals).forEach(mealType => {
            if (mealType === 'note') return;
            const items = day.meals[mealType as keyof typeof day.meals] as any[];
            const index = items.findIndex(item => item.isLeftover && item.leftoverId === leftoverId);
            if (index !== -1) {
                items.splice(index, 1);
                modified = true;
            }
        });
    });

    if (modified) {
        await saveWeekPlan(weekId, days);
    }
};
