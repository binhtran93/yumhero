import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';

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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to fetch subscription status' }, { status });
    }
};
