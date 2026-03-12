import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminAuth, adminDb } from '$lib/server/admin';
import { errorResponse } from '$lib/server/api';

const TRIAL_DURATION_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateValue = (value: unknown): Date | null => {
    if (typeof value === 'string') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (
        value &&
        typeof value === 'object' &&
        'toDate' in value &&
        typeof (value as { toDate?: unknown }).toDate === 'function'
    ) {
        const parsed = (value as { toDate: () => Date }).toDate();
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const userRef = adminDb.doc(`users/${user.uid}`);
        const snapshot = await userRef.get();
        const data = snapshot.exists ? snapshot.data() || {} : {};

        const existingTrialEnd = parseDateValue(data.trialEndsAt);
        if (existingTrialEnd) {
            return json(
                {
                    initialized: false,
                    trialEndsAt: existingTrialEnd.toISOString(),
                },
                {
                    headers: {
                        'Cache-Control': 'no-store',
                    },
                },
            );
        }

        const authUser = await adminAuth.getUser(user.uid);
        const createdAt = new Date(authUser.metadata.creationTime);
        if (Number.isNaN(createdAt.getTime())) {
            throw new Error('Invalid user creation time');
        }

        const trialEnd = new Date(createdAt.getTime() + TRIAL_DURATION_DAYS * DAY_MS);

        await userRef.set(
            {
                trialStartedAt: createdAt.toISOString(),
                trialEndsAt: trialEnd.toISOString(),
                updatedAt: new Date().toISOString(),
            },
            { merge: true },
        );

        return json(
            {
                initialized: true,
                trialEndsAt: trialEnd.toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error: any) {
        console.error('Error initializing trial:', error);
        return errorResponse(error, 'Failed to initialize trial');
    }
};
