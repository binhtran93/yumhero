import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { ShoppingListItem } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const snapshot = await adminDb.doc(`users/${user.uid}/plans/${weekId}`).get();
        if (!snapshot.exists) {
            return json({ shopping_list: [] });
        }

        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? data.shopping_list : [];

        return json({ shopping_list: serializeFirestoreData(shoppingList) });
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        return errorResponse(error, 'Failed to fetch shopping list');
    }
};

export const PUT = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const body = (await request.json()) as { shopping_list?: ShoppingListItem[] };
        if (!Array.isArray(body.shopping_list)) {
            fail('shopping_list must be an array');
        }

        await adminDb.doc(`users/${user.uid}/plans/${weekId}`).set(
            {
                shopping_list: body.shopping_list,
                updatedAt: new Date()
            },
            { merge: true }
        );

        return json({ success: true });
    } catch (error) {
        console.error('Error updating shopping list:', error);
        return errorResponse(error, 'Failed to update shopping list');
    }
};
