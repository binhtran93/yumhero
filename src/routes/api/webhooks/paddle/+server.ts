import { json } from '@sveltejs/kit';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import { PADDLE_WEBHOOK_SECRET, PADDLE_API_KEY } from '$env/static/private';
import { adminDb } from '$lib/server/admin';

// Initialize Paddle Node SDK
// If you need to make API calls to Paddle, pass the API key.
// For signature verification only, we mainly need the process to happen.
const paddle = new Paddle(PADDLE_API_KEY || 'fake-key-if-just-verifying-signature');

export const POST = async ({ request }) => {
    try {
        const signature = request.headers.get('paddle-signature');
        const body = await request.text(); // Get raw body for verification

        if (!signature || !PADDLE_WEBHOOK_SECRET) {
            return json({ error: 'Missing signature or secret' }, { status: 401 });
        }

        // Verify the webhook signature
        // Note: verifyWebhookSignature returns the parsed event object if valid, else throws
        const eventData = await paddle.webhooks.unmarshal(body, PADDLE_WEBHOOK_SECRET, signature);

        if (!eventData) {
            return json({ error: 'Invalid signature' }, { status: 401 });
        }

        const eventType = eventData.eventType;

        console.log(`Received Paddle Webhook: ${eventType}`);

        if (eventType === EventName.SubscriptionCreated || eventType === EventName.SubscriptionTrialing) {
            // Extract custom data (userId)
            const customData = eventData.data.customData;

            // NOTE: In Paddle, custom_data comes as an object. verify structure.
            // Depending on how we passed it in Checkout.
            const userId = customData?.userId;

            if (userId) {
                console.log(`Processing subscription for User ID: ${userId}`);

                // Update Firestore
                await adminDb.collection('users').doc(userId).set({
                    hasUsedTrial: true,
                    subscriptionId: eventData.data.id,
                    nextBilledAt: eventData.data.nextBilledAt,
                    billingInterval: eventData.data.items[0].price?.billingCycle?.interval,
                    updatedAt: new Date().toISOString(),
                    paddleCustomerId: eventData.data.customerId,
                    status: eventData.data.status,
                }, { merge: true });

                console.log(`Successfully updated user ${userId} subscription status.`);
            } else {
                console.warn('No userId found in custom_data');
            }
        }

        if (eventType === EventName.SubscriptionActivated || eventType === EventName.SubscriptionUpdated) {
            const customData = eventData.data.customData;
            const userId = customData?.userId;

            if (userId && ['active', 'trialing'].includes(eventData.data.status)) {
                await adminDb.collection('users').doc(userId).set({
                    status: eventData.data.status,
                    nextBilledAt: eventData.data.nextBilledAt,
                    billingInterval: eventData.data.items[0].price?.billingCycle?.interval,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
            }
        }

        // Handle Subscription Cancelled/Past Due?
        if (eventType === EventName.SubscriptionCanceled || eventType === EventName.SubscriptionPastDue) {
            const customData = eventData.data.customData;
            const userId = customData?.userId;

            if (userId) {
                await adminDb.collection('users').doc(userId).set({
                    status: eventData.data.status,
                    updatedAt: new Date().toISOString(),
                    scheduledCancellation: null
                }, { merge: true });
            }
        }

        return json({ received: true });

    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return json({ error: err.message }, { status: 400 });
    }
};
