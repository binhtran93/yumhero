import { json } from '@sveltejs/kit';
import {Paddle, Environment, type ProrationBillingMode} from '@paddle/paddle-node-sdk';
import { PADDLE_API_KEY, PADDLE_ENV } from '$env/static/private';
import {
    PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL,
    PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL
} from '$env/static/public';
import { adminDb } from '$lib/server/admin';

export const POST = async ({ request }) => {
    try {
        const { userId, targetInterval } = await request.json();

        if (!userId || !targetInterval) {
            return json({ error: 'User ID and target interval are required' }, { status: 400 });
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
        const currentInterval = data?.billingInterval;

        if (!subscriptionId) {
            return json({ error: 'No active subscription found to switch' }, { status: 400 });
        }

        let newPriceId: string;
        let prorationBillingMode: ProrationBillingMode;

        if (targetInterval === 'year') {
            newPriceId = PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL;
            prorationBillingMode = 'prorated_immediately'; // Month -> Year: Charge now
        } else {
            newPriceId = PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL;
            prorationBillingMode = 'prorated_next_billing_period'; // Year -> Month: Wait
        }

        console.log(`Switching user ${userId} to ${targetInterval} plan. Mode: ${prorationBillingMode}`);

        // 4. Update the Subscription
        const result = await paddle.subscriptions.update(subscriptionId, {
            prorationBillingMode,
            items: [
                {
                    priceId: newPriceId,
                    quantity: 1
                }
            ]
        });

        // 5. Update DB
        const actualNewInterval = result.items[0].price.billingCycle?.interval;
        await adminDb.collection('users').doc(userId).set({
            billingInterval: actualNewInterval,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return json({ success: true, interval: actualNewInterval });

    } catch (err: any) {
        console.error('Switch Plan Error:', err);
        return json({ error: err.message || 'Failed to switch subscription plan' }, { status: 500 });
    }
};
