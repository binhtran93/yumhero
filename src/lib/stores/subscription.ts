import { writable } from 'svelte/store';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

export const isSubscribed = writable<boolean>(false);
export const hasUsedTrial = writable<boolean>(false);
export const subscriptionLoading = writable<boolean>(true);

let unsubscribeSnapshot: (() => void) | null = null;

export const syncSubscription = (user: User | null) => {
    // Unsubscribe from previous listener if exists
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }

    if (!user) {
        isSubscribed.set(false);
        subscriptionLoading.set(false);
        return;
    }

    // Set loading to true when starting a new sync
    subscriptionLoading.set(true);

    // Listen to the user's document in Firestore
    unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            // Check for 'isSubscribed' field or 'status' field being active
            // Adjust logic based on what webhook sets
            const active = data?.isSubscribed === true || data?.status === 'active' || data?.status === 'trialing';
            const trialUsed = data?.hasUsedTrial === true;

            isSubscribed.set(active);
            hasUsedTrial.set(trialUsed);
        } else {
            isSubscribed.set(false);
            hasUsedTrial.set(false);
        }
        subscriptionLoading.set(false);
    }, (error) => {
        console.error("Subscription Sync Error:", error);
        subscriptionLoading.set(false);
    });
};

// Helper for dev/demo if needed (only updates local store, does NOT persist to secure DB)
export const upgradeUser = () => {
    isSubscribed.set(true);
};
