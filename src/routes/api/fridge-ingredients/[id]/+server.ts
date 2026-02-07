import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const ingredientId = params.id;
        if (!ingredientId) {
            return json({ error: 'Ingredient ID is required' }, { status: 400 });
        }

        const updates = (await request.json()) as Partial<{ name: string; amount: number; unit: string | null }>;
        const firestoreUpdates: Record<string, unknown> = {};

        if (updates.name !== undefined) {
            firestoreUpdates.name = updates.name.toLowerCase().trim();
        }
        if (updates.amount !== undefined) {
            firestoreUpdates.amount = updates.amount;
        }
        if (updates.unit !== undefined) {
            firestoreUpdates.unit = updates.unit ? updates.unit.trim() : null;
        }

        await adminDb.doc(`users/${user.uid}/fridgeIngredients/${ingredientId}`).update(firestoreUpdates);
        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating fridge ingredient:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to update fridge ingredient' }, { status });
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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to delete fridge ingredient' }, { status });
    }
};
