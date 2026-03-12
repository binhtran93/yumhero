import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { apiRequest } from '$lib/api/client';

type PurchaseStatus = 'free' | 'active';

interface PurchaseStatusResponse {
    isSubscribed: boolean;
    status: PurchaseStatus;
    purchasedAt: string | null;
}

export const isSubscribed = writable<boolean>(false);
export const status = writable<PurchaseStatus>('free');
export const purchasedAt = writable<string | null>(null);
export const subscriptionLoading = writable<boolean>(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;
let userDocUnsubscribe: Unsubscribe | null = null;

const resetPurchaseState = () => {
    isSubscribed.set(false);
    status.set('free');
    purchasedAt.set(null);
};

const applyPurchaseState = (nextState: PurchaseStatusResponse) => {
    isSubscribed.set(nextState.isSubscribed);
    status.set(nextState.status);
    purchasedAt.set(nextState.purchasedAt);
    subscriptionLoading.set(false);
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

const parseUserDocPurchaseState = (
    data: Record<string, unknown> | undefined,
): PurchaseStatusResponse => {
    const active = data?.status === 'active';
    const purchasedAtValue =
        typeof data?.purchasedAt === 'string' ? data.purchasedAt : null;

    return {
        isSubscribed: active,
        status: active ? 'active' : 'free',
        purchasedAt: purchasedAtValue,
    };
};

const loadPurchaseStatus = async () => {
    try {
        const data = await apiRequest<PurchaseStatusResponse>(
            '/api/subscription/status',
            { cache: 'no-store' },
        );
        applyPurchaseState(data);
    } catch (error) {
        console.error('Purchase status sync error:', error);
    } finally {
        subscriptionLoading.set(false);
    }
};

export const syncSubscription = (currentUser: User | null) => {
    cleanupSync();

    if (!currentUser) {
        resetPurchaseState();
        subscriptionLoading.set(false);
        return;
    }

    subscriptionLoading.set(true);

    if (typeof window !== 'undefined') {
        const userDocRef = doc(db, `users/${currentUser.uid}`);
        userDocUnsubscribe = onSnapshot(
            userDocRef,
            (snapshot) => {
                const data = snapshot.exists()
                    ? (snapshot.data() as Record<string, unknown>)
                    : undefined;
                applyPurchaseState(parseUserDocPurchaseState(data));
            },
            (error) => {
                console.error('Realtime purchase status listener error:', error);
                void loadPurchaseStatus();
            },
        );
    }

    void loadPurchaseStatus();

    if (typeof window !== 'undefined') {
        pollInterval = setInterval(() => {
            void loadPurchaseStatus();
        }, 15000);
    }
};

export const upgradeUser = () => {
    isSubscribed.set(true);
    status.set('active');
};
