import { writable } from 'svelte/store';

export interface CollectionState<T> {
    data: T[];
    loading: boolean;
}

export function collectionStore<T>(
    fetchCollection: () => Promise<T[]>,
    pollIntervalMs = 5000
) {
    const store = writable<CollectionState<T>>({ data: [], loading: true }, (set) => {
        let active = true;

        const load = async () => {
            try {
                const data = await fetchCollection();
                if (active) {
                    set({ data, loading: false });
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
                if (active) {
                    set({ data: [], loading: false });
                }
            }
        };

        load();
        const interval = typeof window !== 'undefined'
            ? window.setInterval(load, pollIntervalMs)
            : null;

        return () => {
            active = false;
            if (interval !== null) {
                window.clearInterval(interval);
            }
        };
    });

    return {
        subscribe: store.subscribe
    };
}

export interface DocumentState<T> {
    data: T | null;
    loading: boolean;
}

export function documentStore<T>(
    fetchDocument: () => Promise<T | null>,
    pollIntervalMs = 5000
) {
    const store = writable<DocumentState<T>>({ data: null, loading: true }, (set) => {
        let active = true;

        const load = async () => {
            try {
                const data = await fetchDocument();
                if (active) {
                    set({ data, loading: false });
                }
            } catch (error) {
                console.error('Error fetching document:', error);
                if (active) {
                    set({ data: null, loading: false });
                }
            }
        };

        load();
        const interval = typeof window !== 'undefined'
            ? window.setInterval(load, pollIntervalMs)
            : null;

        return () => {
            active = false;
            if (interval !== null) {
                window.clearInterval(interval);
            }
        };
    });

    return {
        subscribe: store.subscribe
    };
}
