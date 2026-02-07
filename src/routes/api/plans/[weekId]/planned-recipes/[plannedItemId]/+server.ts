import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import type { ShoppingListItem, WeeklyPlan } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';
import { syncShoppingListFromPlan } from '$lib/server/plan-shopping';
import { isPlannedLeftover } from '$lib/types';

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        const plannedItemId = params.plannedItemId;
        if (!weekId) {
            fail('Week ID is required');
        }
        if (!plannedItemId) {
            fail('Planned item ID is required');
        }

        const planDocRef = adminDb.doc(`users/${user.uid}/plans/${weekId}`);
        const result = await adminDb.runTransaction(async (tx) => {
            const snapshot = await tx.get(planDocRef);
            if (!snapshot.exists) {
                fail('Plan not found', 404);
            }

            const data = snapshot.data() as { days?: WeeklyPlan; shopping_list?: ShoppingListItem[] } | undefined;
            if (!Array.isArray(data?.days)) {
                fail('Plan is invalid');
            }

            const nextPlan = data.days.map((d) => ({
                ...d,
                meals: {
                    ...d.meals,
                    breakfast: [...(d.meals.breakfast || [])],
                    lunch: [...(d.meals.lunch || [])],
                    dinner: [...(d.meals.dinner || [])],
                    snack: [...(d.meals.snack || [])],
                    note: [...(d.meals.note || [])]
                }
            })) as WeeklyPlan;

            let removed = false;
            for (const dayEntry of nextPlan) {
                for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack'] as const) {
                    const items = dayEntry.meals[mealType];
                    const index = items.findIndex((entry) => !isPlannedLeftover(entry) && entry.id === plannedItemId);
                    if (index === -1) {
                        continue;
                    }

                    items.splice(index, 1);
                    removed = true;
                    break;
                }
                if (removed) break;
            }

            if (!removed) {
                fail('Planned recipe not found', 404);
            }

            const currentList = Array.isArray(data.shopping_list) ? data.shopping_list : [];
            const shoppingList = syncShoppingListFromPlan(currentList, nextPlan, user.uid);

            tx.set(
                planDocRef,
                {
                    days: nextPlan,
                    shopping_list: shoppingList,
                    updatedAt: new Date()
                },
                { merge: true }
            );
            return true;
        });

        return json({ success: result, modified: true });
    } catch (error: any) {
        console.error('Error removing recipe from plan:', error);
        return errorResponse(error, 'Failed to remove recipe from plan');
    }
};
