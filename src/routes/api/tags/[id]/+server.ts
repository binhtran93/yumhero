import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const tagId = params.id;
        if (!tagId) {
            return json({ error: 'Tag ID is required' }, { status: 400 });
        }

        const { label } = (await request.json()) as { label: string };
        if (!label || typeof label !== 'string') {
            return json({ error: 'Label is required' }, { status: 400 });
        }

        await adminDb.doc(`users/${user.uid}/tags/${tagId}`).update({ label });
        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating tag:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to update tag' }, { status });
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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to delete tag' }, { status });
    }
};
