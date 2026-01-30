import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, type CollectionState } from './firestore';
import type { Tag } from '$lib/types';
import { doc, deleteDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

export const userTags = derived<[Readable<any>, Readable<boolean>], CollectionState<Tag>>(
    [user, authLoading],
    ([$user, $authLoading], set) => {
        if ($authLoading) {
            set({ data: [], loading: true });
            return;
        }
        if (!$user) {
            set({ data: [], loading: false });
            return;
        }

        const store = collectionStore<Tag>(`users/${$user.uid}/tags`);
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

export const addTag = async (label: string): Promise<string> => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, `users/${$user.uid}/tags`), {
        label,
        createdAt: new Date()
    });

    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const deleteTag = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, `users/${$user.uid}/tags`, id));
}

export const updateTag = async (id: string, label: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    await updateDoc(doc(db, `users/${$user.uid}/tags`, id), { label });
};
