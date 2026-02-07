import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { errorResponse, fail } from '$lib/server/api';
import type { MealType } from '$lib/types';

const VALID_MEAL_TYPES = new Set<MealType>(['breakfast', 'lunch', 'dinner', 'snack', 'note']);

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const leftoverId = params.id;
        if (!leftoverId) {
            return json({ error: 'Leftover ID is required' }, { status: 400 });
        }

        const payload = (await request.json()) as Record<string, unknown>;
        const updates: Record<string, unknown> = {};

        if (payload.status !== undefined) {
            if (payload.status !== 'planned' && payload.status !== 'not_planned') {
                fail('Invalid status');
            }
            updates.status = payload.status;
        }

        if (payload.plannedFor !== undefined) {
            if (payload.plannedFor === null) {
                updates.plannedFor = null;
            } else if (typeof payload.plannedFor === 'object') {
                const plannedFor = payload.plannedFor as Record<string, unknown>;
                const weekId = typeof plannedFor.weekId === 'string' ? plannedFor.weekId.trim() : '';
                const day = typeof plannedFor.day === 'string' ? plannedFor.day.trim() : '';
                const mealType = plannedFor.mealType as MealType;

                if (!weekId || !day || !VALID_MEAL_TYPES.has(mealType)) {
                    fail('Invalid plannedFor payload');
                }

                updates.plannedFor = { weekId, day, mealType };
            } else {
                fail('Invalid plannedFor payload');
            }
        }

        if (Object.keys(updates).length === 0) {
            fail('No valid fields to update');
        }

        await adminDb.doc(`users/${user.uid}/leftovers/${leftoverId}`).set(updates, { merge: true });

        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating leftover:', error);
        return errorResponse(error, 'Failed to update leftover');
    }
};

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const leftoverId = params.id;
        if (!leftoverId) {
            return json({ error: 'Leftover ID is required' }, { status: 400 });
        }

        await adminDb.doc(`users/${user.uid}/leftovers/${leftoverId}`).delete();
        return json({ success: true });
    } catch (error: any) {
        console.error('Error deleting leftover:', error);
        return errorResponse(error, 'Failed to delete leftover');
    }
};
