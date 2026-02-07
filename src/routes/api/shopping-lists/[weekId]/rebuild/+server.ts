import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import type { ShoppingListItem, WeeklyPlan } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';
import { syncShoppingListFromPlan } from '$lib/server/plan-shopping';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';

export const POST = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const planRef = adminDb.doc(`users/${user.uid}/plans/${weekId}`);
        const snapshot = await planRef.get();

        if (!snapshot.exists) {
            await planRef.set({
                id: weekId,
                shopping_list: [],
                updatedAt: new Date()
            }, { merge: true });

            return json({ success: true, shopping_list: [] });
        }

        const data = snapshot.data() as { days?: WeeklyPlan; shopping_list?: ShoppingListItem[] } | undefined;
        const days = data?.days;

        if (!Array.isArray(days)) {
            await planRef.set({
                shopping_list: [],
                updatedAt: new Date()
            }, { merge: true });

            return json({ success: true, shopping_list: [] });
        }

        const rebuilt = syncShoppingListFromPlan([], days, user.uid);

        await planRef.set({
            shopping_list: rebuilt,
            updatedAt: new Date()
        }, { merge: true });

        return json({ success: true, shopping_list: serializeFirestoreData(rebuilt) });
    } catch (error) {
        console.error('Error rebuilding shopping list:', error);
        return errorResponse(error, 'Failed to rebuild shopping list');
    }
};
