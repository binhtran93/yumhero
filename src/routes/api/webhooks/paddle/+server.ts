import { json } from '@sveltejs/kit';
import { Paddle, EventName } from '@paddle/paddle-node-sdk';
import { PADDLE_WEBHOOK_SECRET, PADDLE_API_KEY } from '$env/static/private';
import { adminDb } from '$lib/server/admin';

const paddle = new Paddle(PADDLE_API_KEY || 'fake-key-if-just-verifying-signature');

const extractUserId = (payload: any): string | null => {
    const userId = payload?.customData?.userId;
    return typeof userId === 'string' && userId.length > 0 ? userId : null;
};

const markUserPurchased = async (userId: string, details: Record<string, unknown> = {}) => {
    await adminDb.collection('users').doc(userId).set(
        {
            status: 'active',
            purchasedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...details,
        },
        { merge: true },
    );
};

export const POST = async ({ request }) => {
    try {
        const signature = request.headers.get('paddle-signature');
        const body = await request.text();

        if (!signature || !PADDLE_WEBHOOK_SECRET) {
            return json({ error: 'Missing signature or secret' }, { status: 401 });
        }

        const eventData = await paddle.webhooks.unmarshal(
            body,
            PADDLE_WEBHOOK_SECRET,
            signature,
        );

        if (!eventData) {
            return json({ error: 'Invalid signature' }, { status: 401 });
        }

        const eventType = eventData.eventType;
        console.log(`Received Paddle Webhook: ${eventType}`);

        if (eventType === EventName.TransactionCompleted) {
            const userId = extractUserId(eventData.data);
            if (userId) {
                await markUserPurchased(userId, {
                    paddleTransactionId: eventData.data.id,
                    paddleCustomerId: eventData.data.customerId || null,
                });
            }
        }

        return json({ received: true });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return json({ error: err.message }, { status: 400 });
    }
};
