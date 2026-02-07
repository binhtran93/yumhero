import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { apiRequest } from '$lib/api/client';

export const isSubscribed = writable<boolean>(false);
export const hasUsedTrial = writable<boolean>(false);
export const status = writable<string | null>(null);
export const nextBilledAt = writable<string | null>(null);
export const scheduledCancellation = writable<string | null>(null);
export const billingInterval = writable<'month' | 'year' | null>(null);
export const subscriptionLoading = writable<boolean>(true);

let pollInterval: ReturnType<typeof setInterval> | null = null;

const resetToFree = () => {
    isSubscribed.set(false);
    hasUsedTrial.set(false);
    status.set('free');
    nextBilledAt.set(null);
    billingInterval.set(null);
    scheduledCancellation.set(null);
};

const loadSubscription = async () => {
    try {
        const data = await apiRequest<{
            isSubscribed: boolean;
            hasUsedTrial: boolean;
            status: string;
            nextBilledAt: string | null;
            billingInterval: 'month' | 'year' | null;
            scheduledCancellation: string | null;
        }>('/api/subscription/status');

        isSubscribed.set(data.isSubscribed);
        hasUsedTrial.set(data.hasUsedTrial);
        status.set(data.status);
        nextBilledAt.set(data.nextBilledAt);
        billingInterval.set(data.billingInterval);
        scheduledCancellation.set(data.scheduledCancellation);
    } catch (error) {
        console.error('Subscription Sync Error:', error);
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
        resetToFree();
        subscriptionLoading.set(false);
        return;
    }

    subscriptionLoading.set(true);
    loadSubscription();

    if (typeof window !== 'undefined') {
        pollInterval = setInterval(loadSubscription, 15000);
    }
};

export const upgradeUser = () => {
    isSubscribed.set(true);
};
