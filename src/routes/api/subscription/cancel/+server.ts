import { json } from '@sveltejs/kit';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { PADDLE_API_KEY, PADDLE_ENV } from '$env/static/private';
import { adminDb } from '$lib/server/admin';

export const POST = async ({ request }) => {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        const paddle = new Paddle(PADDLE_API_KEY || '', {
            environment: PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox
        });

        // 1. Get Subscription ID from DB
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        const data = userDoc.data();
        const subscriptionId = data?.subscriptionId;

        if (!subscriptionId) {
            return json({ error: 'No active subscription found to cancel' }, { status: 400 });
        }

        console.log(`Cancelling subscription ${subscriptionId} for user ${userId}`);

        // 2. Call Paddle Cancel
        // By default, Paddle cancels at the end of the billing period (next_billing_period)
        const result = await paddle.subscriptions.cancel(subscriptionId, {
            effectiveFrom: 'next_billing_period'
        });

        // 3. Update DB immediately to make UI feel snappier
        // Note: The status might become 'canceled' or stay 'active' depending on Paddle's response
        // for 'next_billing_period'. Usually, status becomes 'canceled' or has a scheduled cancellation.
        // We'll trust the SDK's returned status or set it to 'canceled' if it's immediate.
        await adminDb.collection('users').doc(userId).set({
            status: result.status,
            scheduledCancellation: result.scheduledChange?.effectiveAt,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return json({
            success: true,
            status: result.status
        });

    } catch (err: any) {
        console.error('Cancellation Error:', err);
        return json({ error: err.message || 'Failed to cancel subscription' }, { status: 500 });
    }
};
