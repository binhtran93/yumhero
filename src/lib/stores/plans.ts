import { derived, get, type Readable } from 'svelte/store';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { user, loading as authLoading } from './auth';
import type { ShoppingListItem, WeeklyPlan } from '$lib/types';
import { db } from '$lib/firebase';
import { isPlannedLeftover } from '$lib/types';
import { syncShoppingListFromPlan } from '$lib/stores/planShopping';

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
            const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
            return onSnapshot(
                planRef,
                (snapshot) => {
                    if (!snapshot.exists()) {
                        set({ data: null, loading: false });
                        return;
                    }

                    const data = snapshot.data() as { days?: WeeklyPlan };
                    set({
                        data: Array.isArray(data.days) ? data.days : null,
                        loading: false
                    });
                },
                (error) => {
                    console.error('Error listening to week plan:', error);
                    set({ data: null, loading: false });
                }
            );
        },
        { data: null, loading: true }
    );
};

export const saveWeekPlan = async (weekId: string, plan: WeeklyPlan) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");
    const planDocRef = doc(db, `users/${$user.uid}/plans/${weekId}`);

    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planDocRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const currentList = Array.isArray(data?.shopping_list) ? data.shopping_list : [];
        const shoppingList = syncShoppingListFromPlan(currentList, plan, $user.uid);

        tx.set(planDocRef, {
            id: weekId,
            days: plan,
            shopping_list: shoppingList,
            updatedAt: new Date()
        }, { merge: true });
    });
};

/**
 * Remove a specific leftover from a week plan.
 * Used when a leftover is deleted from the fridge.
 */
export const removeLeftoverFromWeekPlan = async (weekId: string, leftoverId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");
    const planDocRef = doc(db, `users/${$user.uid}/plans/${weekId}`);

    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planDocRef);
        if (!snapshot.exists()) return;

        const data = snapshot.data() as { days?: WeeklyPlan; shopping_list?: ShoppingListItem[] } | undefined;
        if (!Array.isArray(data?.days)) return;

        const days = data.days.map((day) => ({
            ...day,
            meals: {
                ...day.meals,
                breakfast: [...(day.meals.breakfast || [])],
                lunch: [...(day.meals.lunch || [])],
                dinner: [...(day.meals.dinner || [])],
                snack: [...(day.meals.snack || [])],
                note: [...(day.meals.note || [])]
            }
        })) as WeeklyPlan;

        let modified = false;
        days.forEach((day) => {
            (['breakfast', 'lunch', 'dinner', 'snack'] as const).forEach((mealType) => {
                const items = day.meals[mealType] as any[];
                const index = items.findIndex((item) => item.isLeftover && item.leftoverId === leftoverId);
                if (index !== -1) {
                    items.splice(index, 1);
                    modified = true;
                }
            });
        });
        if (!modified) return;

        const currentList = Array.isArray(data.shopping_list) ? data.shopping_list : [];
        const shoppingList = syncShoppingListFromPlan(currentList, days, $user.uid);

        tx.set(planDocRef, {
            days,
            shopping_list: shoppingList,
            updatedAt: new Date()
        }, { merge: true });
    });
};

export const removePlannedRecipeFromWeekPlan = async (
    weekId: string,
    plannedItemId: string
) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");
    const planDocRef = doc(db, `users/${$user.uid}/plans/${weekId}`);

    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planDocRef);
        if (!snapshot.exists()) throw new Error('Plan not found');

        const data = snapshot.data() as { days?: WeeklyPlan; shopping_list?: ShoppingListItem[] } | undefined;
        if (!Array.isArray(data?.days)) throw new Error('Plan is invalid');

        const nextPlan = data.days.map((day) => ({
            ...day,
            meals: {
                ...day.meals,
                breakfast: [...(day.meals.breakfast || [])],
                lunch: [...(day.meals.lunch || [])],
                dinner: [...(day.meals.dinner || [])],
                snack: [...(day.meals.snack || [])],
                note: [...(day.meals.note || [])]
            }
        })) as WeeklyPlan;

        let removed = false;
        for (const dayEntry of nextPlan) {
            for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack'] as const) {
                const items = dayEntry.meals[mealType];
                const index = items.findIndex((entry) => !isPlannedLeftover(entry) && entry.id === plannedItemId);
                if (index === -1) continue;

                items.splice(index, 1);
                removed = true;
                break;
            }
            if (removed) break;
        }

        if (!removed) throw new Error('Planned recipe not found');

        const currentList = Array.isArray(data.shopping_list) ? data.shopping_list : [];
        const shoppingList = syncShoppingListFromPlan(currentList, nextPlan, $user.uid);

        tx.set(planDocRef, {
            days: nextPlan,
            shopping_list: shoppingList,
            updatedAt: new Date()
        }, { merge: true });
    });
};
