import { writable, type Writable } from 'svelte/store';
import { doc, collection, onSnapshot, type QueryConstraint, query } from 'firebase/firestore';
import { db } from '$lib/firebase';

interface StoreState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function collectionStore<T>(
    path: string,
    queryConstraints: QueryConstraint[] = []
) {
    const store = writable<T[]>([], (set) => {
        const q = query(collection(db, path), ...queryConstraints);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            set(data);
        }, (error) => {
            console.error(`Error fetching collection ${path}:`, error);
        });

        return () => unsubscribe();
    });

    return {
        subscribe: store.subscribe
    };
}

export function documentStore<T>(
    path: string
) {
    const store = writable<T | null>(null, (set) => {
        const docRef = doc(db, path);

        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                set({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
                set(null);
            }
        }, (error) => {
            console.error(`Error fetching document ${path}:`, error);
        });

        return () => unsubscribe();
    });

    return {
        subscribe: store.subscribe
    };
}
