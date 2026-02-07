import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { type CollectionState } from './firestore';
import type { Tag } from '$lib/types';
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

        const tagsRef = collection(db, `users/${$user.uid}/tags`);
        return onSnapshot(
            tagsRef,
            (snapshot) => {
                const tags = snapshot.docs.map((entry) => {
                    const data = entry.data() as Tag;
                    return { ...data, id: entry.id };
                });
                set({ data: tags, loading: false });
            },
            (error) => {
                console.error('Error listening to tags:', error);
                set({ data: [], loading: false });
            }
        );
    },
    { data: [], loading: true }
);

export const addTag = async (label: string): Promise<string> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const normalizedLabel = label.trim();
    if (!normalizedLabel) throw new Error('label is required');

    const tagsRef = collection(db, `users/${$user.uid}/tags`);
    const existing = await getDocs(query(tagsRef, where('label', '==', normalizedLabel)));
    if (!existing.empty) {
        throw new Error('Tag already exists');
    }

    const docRef = await addDoc(tagsRef, {
        id: '',
        label: normalizedLabel,
        createdAt: new Date()
    });
    await updateDoc(doc(db, `users/${$user.uid}/tags/${docRef.id}`), { id: docRef.id });
    return docRef.id;
};

export const deleteTag = async (id: string) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    await deleteDoc(doc(db, `users/${$user.uid}/tags/${id}`));
}

export const updateTag = async (id: string, label: string) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');
    const normalizedLabel = label.trim();
    if (!normalizedLabel) throw new Error('label is required');

    await updateDoc(doc(db, `users/${$user.uid}/tags/${id}`), { label: normalizedLabel });
};
