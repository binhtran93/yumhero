import { writable } from 'svelte/store';

// In a real app, this would be synced with your backend/database
// For now, we'll default to false so we can test the "Hard Paywall"
export const isSubscribed = writable<boolean>(false);

// Helper to simulate a successful subscription
export const upgradeUser = () => {
    isSubscribed.set(true);
};
