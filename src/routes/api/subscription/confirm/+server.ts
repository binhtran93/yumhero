import { json } from '@sveltejs/kit';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { PADDLE_API_KEY, PADDLE_ENV } from '$env/static/private';
import { adminDb } from '$lib/server/admin';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const userId = user.uid;
        await checkRateLimit(userId, RATE_LIMITS.subscriptionConfirm);

        console.log(PADDLE_API_KEY);
        const paddle = new Paddle(PADDLE_API_KEY || '', {
            environment: PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox
        });

        // 1. Get the subscription ID from your Database
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        const data = userDoc.data();
        const subscriptionId = data?.subscriptionId;

        if (!subscriptionId) {
            console.error(`No subscription ID found for user ${userId}`);
            return json({ error: 'No active subscription found to confirm' }, { status: 400 });
        }

        console.log(`Activating subscription ${subscriptionId} for user ${userId}`);

        // 2. Call Paddle Activate
        const result = await paddle.subscriptions.activate(subscriptionId);

        // 3. Update DB immediately to make UI feel snappier
        // The webhook will also handle this eventually
        await adminDb.collection('users').doc(userId).set({
            status: result.status,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return json({
            success: true,
            status: result.status
        });

    } catch (err: any) {
        console.error('Activation Error:', err);
        let status = 500;
        if (err.message.includes('authentication') || err.message.includes('Authorization')) {
            status = 401;
        } else if (err.message.includes('Rate limit')) {
            status = 429;
        }
        return json({ error: err.message || 'Failed to activate subscription' }, { status });
    }
};
