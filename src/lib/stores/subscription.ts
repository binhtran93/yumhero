import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { apiRequest } from '$lib/api/client';

export const isSubscribed = writable<boolean>(false);
export const status = writable<'free' | 'active'>('free');
export const purchasedAt = writable<string | null>(null);
export const subscriptionLoading = writable<boolean>(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;

const resetPurchaseState = () => {
    isSubscribed.set(false);
    status.set('free');
    purchasedAt.set(null);
};

const loadPurchaseStatus = async () => {
    try {
        const data = await apiRequest<{
            isSubscribed: boolean;
            status: 'free' | 'active';
            purchasedAt: string | null;
        }>('/api/subscription/status');

        isSubscribed.set(data.isSubscribed);
        status.set(data.status);
        purchasedAt.set(data.purchasedAt);
    } catch (error) {
        console.error('Purchase status sync error:', error);
    } finally {
        subscriptionLoading.set(false);
    }
};

export const syncSubscription = (currentUser: User | null) => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }

    if (!currentUser) {
        resetPurchaseState();
        subscriptionLoading.set(false);
        return;
    }

    subscriptionLoading.set(true);
    loadPurchaseStatus();

    if (typeof window !== 'undefined') {
        pollInterval = setInterval(loadPurchaseStatus, 15000);
    }
};

export const upgradeUser = () => {
    isSubscribed.set(true);
    status.set('active');
};
