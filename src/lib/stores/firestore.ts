import { writable, type Writable } from 'svelte/store';
import { doc, collection, onSnapshot, type QueryConstraint, query } from 'firebase/firestore';
import { db } from '$lib/firebase';

interface StoreState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export interface CollectionState<T> {
    data: T[];
    loading: boolean;
}

export function collectionStore<T>(
    path: string,
    queryConstraints: QueryConstraint[] = []
) {
    const store = writable<CollectionState<T>>({ data: [], loading: true }, (set) => {
        const q = query(collection(db, path), ...queryConstraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            set({ data, loading: false });
        }, (error) => {
            console.error(`Error fetching collection ${path}:`, error);
            set({ data: [], loading: false });
        });

        return () => unsubscribe();
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
    path: string
) {
    const store = writable<DocumentState<T>>({ data: null, loading: true }, (set) => {
        const docRef = doc(db, path);

        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                set({ data: { id: snapshot.id, ...snapshot.data() } as T, loading: false });
            } else {
                set({ data: null, loading: false });
            }
        }, (error) => {
            console.error(`Error fetching document ${path}:`, error);
            set({ data: null, loading: false });
        });

        return () => unsubscribe();
    });

    return {
        subscribe: store.subscribe
    };
}
