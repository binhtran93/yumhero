import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { errorResponse } from '$lib/server/api';
import { syncShoppingListFromPlan } from '$lib/server/plan-shopping';
import type { ShoppingListItem, WeeklyPlan } from '$lib/types';

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        const leftoverId = params.leftoverId;

        if (!weekId) {
            return json({ error: 'Week ID is required' }, { status: 400 });
        }
        if (!leftoverId) {
            return json({ error: 'Leftover ID is required' }, { status: 400 });
        }

        const planRef = adminDb.doc(`users/${user.uid}/plans/${weekId}`);
        const snapshot = await planRef.get();

        if (!snapshot.exists) {
            return json({ success: true, modified: false });
        }

        const data = snapshot.data() as { days?: WeeklyPlan; shopping_list?: ShoppingListItem[] } | undefined;
        const days = data?.days;
        if (!Array.isArray(days)) {
            return json({ success: true, modified: false });
        }

        let modified = false;
        days.forEach((day) => {
            Object.keys(day.meals).forEach((mealType) => {
                if (mealType === 'note') return;
                const items = day.meals[mealType as keyof typeof day.meals] as any[];
                const index = items.findIndex((item) => item.isLeftover && item.leftoverId === leftoverId);
                if (index !== -1) {
                    items.splice(index, 1);
                    modified = true;
                }
            });
        });

        if (!modified) {
            return json({ success: true, modified: false });
        }

        const currentList = Array.isArray(data?.shopping_list) ? data.shopping_list : [];
        const shoppingList = syncShoppingListFromPlan(currentList, days, user.uid);

        await planRef.set(
            {
                days,
                shopping_list: shoppingList,
                updatedAt: new Date()
            },
            { merge: true }
        );

        return json({ success: true, modified: true });
    } catch (error) {
        console.error('Error removing leftover from week plan:', error);
        return errorResponse(error, 'Failed to remove leftover from week plan');
    }
};
