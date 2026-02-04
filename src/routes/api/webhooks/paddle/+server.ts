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

        if (
            eventType === EventName.TransactionCompleted ||
            eventType === EventName.SubscriptionCreated ||
            eventType === EventName.SubscriptionUpdated
        ) {
            // Extract custom data (userId)
            const customData = eventData.data.customData;
            const userId = customData?.userId;

            if (userId) {
                console.log(`Processing subscription update for User ID: ${userId}`);

                const isTrialing = eventData.data.status === 'trialing';
                const updateData: any = {
                    isSubscribed: eventData.data.status === 'active' || eventData.data.status === 'trialing',
                    subscriptionId: eventData.data.id,
                    updatedAt: new Date().toISOString(),
                    paddleCustomerId: eventData.data.customerId,
                    status: eventData.data.status
                };

                if (isTrialing) {
                    updateData.hasUsedTrial = true;
                }

                await adminDb.collection('users').doc(userId).set(updateData, { merge: true });
                console.log(`Successfully updated user ${userId} state.`);
            } else {
                console.warn('No userId found in custom_data');
            }
        }

        // Handle Subscription Cancelled/Past Due?
        if (eventType === EventName.SubscriptionCanceled || eventType === EventName.SubscriptionPastDue) {
            const customData = eventData.data.customData;
            const userId = customData?.userId;

            if (userId) {
                await adminDb.collection('users').doc(userId).set({
                    isSubscribed: false,
                    status: eventData.data.status,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        }

        return json({ received: true });

    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return json({ error: err.message }, { status: 400 });
    }
};
