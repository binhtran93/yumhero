import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { errorResponse, fail } from '$lib/server/api';
import { toNonEmptyString, toNumber } from '$lib/server/validators';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const ingredientId = params.id;
        if (!ingredientId) {
            return json({ error: 'Ingredient ID is required' }, { status: 400 });
        }

        const updates = (await request.json()) as Partial<{ name: unknown; amount: unknown; unit: unknown }>;
        const firestoreUpdates: Record<string, unknown> = {};

        if (updates.name !== undefined) {
            firestoreUpdates.name = toNonEmptyString(updates.name, 'name').toLowerCase();
        }
        if (updates.amount !== undefined) {
            firestoreUpdates.amount = toNumber(updates.amount, 'amount');
        }
        if (updates.unit !== undefined) {
            firestoreUpdates.unit = updates.unit === null
                ? null
                : toNonEmptyString(updates.unit, 'unit');
        }

        if (Object.keys(firestoreUpdates).length === 0) {
            fail('No valid fields to update');
        }

        await adminDb.doc(`users/${user.uid}/fridgeIngredients/${ingredientId}`).update(firestoreUpdates);
        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating fridge ingredient:', error);
        return errorResponse(error, 'Failed to update fridge ingredient');
    }
};

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const ingredientId = params.id;
        if (!ingredientId) {
            return json({ error: 'Ingredient ID is required' }, { status: 400 });
        }

        await adminDb.doc(`users/${user.uid}/fridgeIngredients/${ingredientId}`).delete();
        return json({ success: true });
    } catch (error: any) {
        console.error('Error deleting fridge ingredient:', error);
        return errorResponse(error, 'Failed to delete fridge ingredient');
    }
};
