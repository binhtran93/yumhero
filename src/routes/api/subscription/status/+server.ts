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
                hasUsedTrial: false,
                status: 'free',
                nextBilledAt: null,
                billingInterval: null,
                scheduledCancellation: null
            });
        }

        const data = snapshot.data() || {};
        const active = data.status === 'active' || data.status === 'trialing';

        return json({
            isSubscribed: active,
            hasUsedTrial: data.hasUsedTrial === true,
            status: data.status || 'free',
            nextBilledAt: data.nextBilledAt || null,
            billingInterval: data.billingInterval || null,
            scheduledCancellation: data.scheduledCancellation || null
        });
    } catch (error: any) {
        console.error('Error fetching subscription status:', error);
        return errorResponse(error, 'Failed to fetch subscription status');
    }
};
