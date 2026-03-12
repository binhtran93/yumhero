import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { apiRequest, apiRequestWithToken } from '$lib/api/client';

type AccessStatus = 'free' | 'trial' | 'active' | 'expired';

interface AccessStateResponse {
    isPaid: boolean;
    hasAccess: boolean;
    status: AccessStatus;
    purchasedAt: string | null;
    trialEndsAt: string | null;
    trialDaysLeft: number;
}

export const isPaid = writable<boolean>(false);
export const hasAccess = writable<boolean>(false);
export const status = writable<AccessStatus>('free');
export const purchasedAt = writable<string | null>(null);
export const trialEndsAt = writable<string | null>(null);
export const trialDaysLeft = writable<number>(0);
export const accessLoading = writable<boolean>(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;
let userDocUnsubscribe: Unsubscribe | null = null;
let hasHydratedFromApi = false;

const DAY_MS = 24 * 60 * 60 * 1000;

const resetAccessState = () => {
    isPaid.set(false);
    hasAccess.set(false);
    status.set('free');
    purchasedAt.set(null);
    trialEndsAt.set(null);
    trialDaysLeft.set(0);
    hasHydratedFromApi = false;
};

const applyAccessState = (nextState: AccessStateResponse) => {
    isPaid.set(nextState.isPaid);
    hasAccess.set(nextState.hasAccess);
    status.set(nextState.status);
    purchasedAt.set(nextState.purchasedAt);
    trialEndsAt.set(nextState.trialEndsAt);
    trialDaysLeft.set(nextState.trialDaysLeft);
    accessLoading.set(false);
};

const cleanupSync = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }

    if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
    }
};

const parseDateValue = (value: unknown): Date | null => {
    if (typeof value === 'string') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
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

const parseUserDocAccessState = (
    data: Record<string, unknown> | undefined,
): AccessStateResponse => {
    const active = data?.status === 'active';
    const trialEndDate = parseDateValue(data?.trialEndsAt);
    const trialEndMillis = trialEndDate?.getTime() ?? null;
    const now = Date.now();
    const inTrial = !active && trialEndMillis !== null && now < trialEndMillis;
    const trialRemainingDays =
        inTrial && trialEndMillis !== null
            ? Math.max(1, Math.ceil((trialEndMillis - now) / DAY_MS))
            : 0;

    const purchasedAtValue =
        typeof data?.purchasedAt === 'string' ? data.purchasedAt : null;

    let nextStatus: AccessStatus = 'free';
    if (active) {
        nextStatus = 'active';
    } else if (inTrial) {
        nextStatus = 'trial';
    } else if (trialEndMillis !== null) {
        nextStatus = 'expired';
    }

    return {
        isPaid: active,
        hasAccess: active || inTrial,
        status: nextStatus,
        purchasedAt: purchasedAtValue,
        trialEndsAt: trialEndDate?.toISOString() ?? null,
        trialDaysLeft: trialRemainingDays,
    };
};

const loadAccessState = async () => {
    try {
        const data = await apiRequest<AccessStateResponse>(
            '/api/pay/status',
            { cache: 'no-store' },
        );
        hasHydratedFromApi = true;
        applyAccessState(data);
    } catch (error) {
        console.error('Access state sync error:', error);
    } finally {
        accessLoading.set(false);
    }
};

const initializeTrialWindow = async (currentUser: User) => {
    try {
        const token = await currentUser.getIdToken();
        await apiRequestWithToken<{ initialized: boolean; trialEndsAt: string }>(
            token,
            '/api/pay/initialize-trial',
            {
                method: 'POST',
                cache: 'no-store',
            },
        );
    } catch (error) {
        console.error('Trial initialization error:', error);
    }
};

export const syncAccess = (currentUser: User | null) => {
    cleanupSync();

    if (!currentUser) {
        resetAccessState();
        accessLoading.set(false);
        return;
    }

    accessLoading.set(true);
    hasHydratedFromApi = false;

    if (typeof window !== 'undefined') {
        const userDocRef = doc(db, `users/${currentUser.uid}`);
        userDocUnsubscribe = onSnapshot(
            userDocRef,
            (snapshot) => {
                const data = snapshot.exists()
                    ? (snapshot.data() as Record<string, unknown>)
                    : undefined;
                const nextState = parseUserDocAccessState(data);
                const hasTrialInfo = nextState.trialEndsAt !== null;

                if (!hasHydratedFromApi && !nextState.isPaid && !hasTrialInfo) {
                    return;
                }

                applyAccessState(nextState);
            },
            (error) => {
                console.error('Realtime access state listener error:', error);
                void loadAccessState();
            },
        );
    }

    void initializeTrialWindow(currentUser).finally(() => {
        void loadAccessState();
    });

    if (typeof window !== 'undefined') {
        pollInterval = setInterval(() => {
            void loadAccessState();
        }, 15000);
    }
};

export const markUserPaid = () => {
    isPaid.set(true);
    hasAccess.set(true);
    status.set('active');
};
