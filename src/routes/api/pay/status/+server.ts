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

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const userRef = adminDb.doc(`users/${user.uid}`);
        const snapshot = await userRef.get();
        const data = snapshot.exists ? snapshot.data() || {} : {};

        const active = data.status === 'active';
        const purchasedAt =
            typeof data.purchasedAt === 'string' ? data.purchasedAt : null;

        let trialEndDate = parseDateValue(data.trialEndsAt);

        if (!trialEndDate) {
            const authUser = await adminAuth.getUser(user.uid);
            const createdAt = new Date(authUser.metadata.creationTime);
            if (!Number.isNaN(createdAt.getTime())) {
                trialEndDate = new Date(
                    createdAt.getTime() + TRIAL_DURATION_DAYS * DAY_MS,
                );
            }
        }

        const trialEndMillis = trialEndDate?.getTime() ?? null;
        const now = Date.now();
        const inTrial = !active && trialEndMillis !== null && now < trialEndMillis;
        const trialDaysLeft =
            inTrial && trialEndMillis !== null
                ? Math.max(1, Math.ceil((trialEndMillis - now) / DAY_MS))
                : 0;
        const hasAccess = active || inTrial;
        const status = active
            ? 'active'
            : inTrial
              ? 'trial'
              : trialEndMillis !== null
                ? 'expired'
                : 'free';

        return json(
            {
                isPaid: active,
                hasAccess,
                status,
                purchasedAt,
                trialEndsAt: trialEndDate?.toISOString() ?? null,
                trialDaysLeft
            },
            {
                headers: {
                    'Cache-Control': 'no-store'
                }
            }
        );
    } catch (error: any) {
        console.error('Error fetching purchase status:', error);
        return errorResponse(error, 'Failed to fetch purchase status');
    }
};
