import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { WeeklyPlan, ShoppingListItem } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';
import { syncShoppingListFromPlan } from '$lib/server/plan-shopping';

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            return json({ error: 'Week ID is required' }, { status: 400 });
        }

        const docRef = adminDb.doc(`users/${user.uid}/plans/${weekId}`);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return json({ plan: null });
        }

        return json({
            plan: serializeFirestoreData({ id: snapshot.id, ...snapshot.data() })
        });
    } catch (error: any) {
        console.error('Error fetching plan:', error);
        return errorResponse(error, 'Failed to fetch plan');
    }
};

export const PUT = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            return json({ error: 'Week ID is required' }, { status: 400 });
        }

        const body = (await request.json()) as { plan: WeeklyPlan };
        if (!Array.isArray(body.plan)) {
            fail('plan must be an array');
        }

        const planDocRef = adminDb.doc(`users/${user.uid}/plans/${weekId}`);
        const currentSnapshot = await planDocRef.get();
        const currentData = currentSnapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const currentList = Array.isArray(currentData?.shopping_list) ? currentData.shopping_list : [];
        const shoppingList = syncShoppingListFromPlan(currentList, body.plan, user.uid);

        await planDocRef.set(
            {
                id: weekId,
                days: body.plan,
                shopping_list: shoppingList,
                updatedAt: new Date()
            },
            { merge: true }
        );

        return json({ success: true, shopping_list: serializeFirestoreData(shoppingList) });
    } catch (error: any) {
        console.error('Error saving plan:', error);
        return errorResponse(error, 'Failed to save plan');
    }
};

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            return json({ error: 'Week ID is required' }, { status: 400 });
        }

        const body = (await request.json()) as { shopping_list?: ShoppingListItem[] };
        if (!Array.isArray(body.shopping_list)) {
            return json({ error: 'shopping_list is required' }, { status: 400 });
        }

        await adminDb.doc(`users/${user.uid}/plans/${weekId}`).set(
            {
                shopping_list: body.shopping_list,
                updatedAt: new Date()
            },
            { merge: true }
        );

        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating plan shopping list:', error);
        return errorResponse(error, 'Failed to update shopping list');
    }
};
