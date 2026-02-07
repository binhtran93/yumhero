import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const leftoverId = params.id;
        if (!leftoverId) {
            return json({ error: 'Leftover ID is required' }, { status: 400 });
        }

        const updates = (await request.json()) as Record<string, unknown>;
        await adminDb.doc(`users/${user.uid}/leftovers/${leftoverId}`).set(updates, { merge: true });

        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating leftover:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to update leftover' }, { status });
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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to delete leftover' }, { status });
    }
};
