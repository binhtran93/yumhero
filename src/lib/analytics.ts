import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { getAnalytics, isSupported, logEvent, setUserId, type Analytics } from 'firebase/analytics';
import { app } from '$lib/firebase';

const analyticsStore = writable<Analytics | null>(null);
let analyticsInitPromise: Promise<Analytics | null> | null = null;

export const initAnalytics = async (): Promise<Analytics | null> => {
    if (!browser) return null;

    const current = get(analyticsStore);
    if (current) return current;
    if (analyticsInitPromise) return analyticsInitPromise;

    analyticsInitPromise = (async () => {
        const supported = await isSupported().catch(() => false);
        if (!supported) return null;

        const analytics = getAnalytics(app);
        analyticsStore.set(analytics);
        return analytics;
    })();

    return analyticsInitPromise;
};

export const trackPageView = async (path: string) => {
    const analytics = await initAnalytics();
    if (!analytics) return;

    logEvent(analytics, 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title
    });
};

export const setAnalyticsUid = async (uid: string | null) => {
    const analytics = await initAnalytics();
    if (!analytics) return;

    setUserId(analytics, uid ?? null);
};
