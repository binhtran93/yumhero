import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { errorResponse } from '$lib/server/api';
import { toNonEmptyString } from '$lib/server/validators';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const tagId = params.id;
        if (!tagId) {
            return json({ error: 'Tag ID is required' }, { status: 400 });
        }

        const { label } = (await request.json()) as { label?: unknown };
        const normalizedLabel = toNonEmptyString(label, 'label');

        await adminDb.doc(`users/${user.uid}/tags/${tagId}`).update({ label: normalizedLabel });
        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating tag:', error);
        return errorResponse(error, 'Failed to update tag');
    }
};

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const tagId = params.id;
        if (!tagId) {
            return json({ error: 'Tag ID is required' }, { status: 400 });
        }

        await adminDb.doc(`users/${user.uid}/tags/${tagId}`).delete();
        return json({ success: true });
    } catch (error: any) {
        console.error('Error deleting tag:', error);
        return errorResponse(error, 'Failed to delete tag');
    }
};
