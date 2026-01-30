import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import { userShoppingList } from './shoppingList';
import type { WeeklyPlan } from '$lib/types';
import { doc, collection, writeBatch } from 'firebase/firestore';
import { db } from '$lib/firebase';

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

    const { syncShoppingListWithPlan, buildShoppingListFromPlan } = await import('$lib/utils/shopping');

    const currentList = get(userShoppingList).data;
    const planItems = buildShoppingListFromPlan(plan, []);
    const { toUpdate, toDelete } = syncShoppingListWithPlan(currentList, plan);

    const toAdd: Array<{
        ingredient_name: string;
        sources: Array<{ recipe_id: string; amount: number; unit: string | null }>;
    }> = [];

    planItems.forEach((planItem: any) => {
        const existing = currentList.find(item => item.ingredient_name === planItem.ingredient_name);

        if (!existing) {
            toAdd.push(planItem);
        } else {
            const newSources = planItem.sources.filter((planSource: any) =>
                !existing.sources.some(existingSource => existingSource.recipe_id === planSource.recipe_id)
            );

            if (newSources.length > 0) {
                toUpdate.push({
                    id: existing.id,
                    sources: [...existing.sources, ...newSources.map((s: any) => ({ ...s, is_checked: false }))]
                });
            }
        }
    });

    const batch = writeBatch(db);

    const planRef = doc(db, `users/${$user.uid}/plans`, weekId);
    batch.set(planRef, {
        id: weekId,
        days: plan,
        updatedAt: new Date()
    }, { merge: true });

    toDelete.forEach(itemId => {
        const docRef = doc(db, `users/${$user.uid}/shopping_lists`, itemId);
        batch.delete(docRef);
    });

    toUpdate.forEach(update => {
        const docRef = doc(db, `users/${$user.uid}/shopping_lists`, update.id);
        batch.update(docRef, {
            sources: update.sources,
            updated_at: new Date()
        });
    });

    toAdd.forEach(item => {
        const docRef = doc(collection(db, `users/${$user.uid}/shopping_lists`));
        batch.set(docRef, {
            id: docRef.id,
            ingredient_name: item.ingredient_name,
            sources: item.sources.map(s => ({ ...s, is_checked: false })),
            user_id: $user.uid,
            created_at: new Date(),
            updated_at: new Date()
        });
    });

    await batch.commit();
};
