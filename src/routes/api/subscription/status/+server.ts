import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { errorResponse } from '$lib/server/api';

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.doc(`users/${user.uid}`).get();

        if (!snapshot.exists) {
            return json({
                isSubscribed: false,
                status: 'free',
                purchasedAt: null
            });
        }

        const data = snapshot.data() || {};
        const active = data.status === 'active';

        return json({
            isSubscribed: active,
            status: active ? 'active' : 'free',
            purchasedAt: data.purchasedAt || null
        });
    } catch (error: any) {
        console.error('Error fetching purchase status:', error);
        return errorResponse(error, 'Failed to fetch purchase status');
    }
};
