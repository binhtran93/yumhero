import { derived, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { collectionStore, type CollectionState } from './firestore';
import type { Tag } from '$lib/types';
import { apiRequest, jsonRequest } from '$lib/api/client';

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

        const store = collectionStore<Tag>(async () => {
            const response = await apiRequest<{ tags: Tag[] }>('/api/tags');
            return response.tags;
        });
        return store.subscribe(set);
    },
    { data: [], loading: true }
);

export const addTag = async (label: string): Promise<string> => {
    const response = await apiRequest<{ id: string }>('/api/tags', {
        method: 'POST',
        ...jsonRequest({ label })
    });

    return response.id;
};

export const deleteTag = async (id: string) => {
    await apiRequest<{ success: true }>(`/api/tags/${id}`, {
        method: 'DELETE'
    });
}

export const updateTag = async (id: string, label: string) => {
    await apiRequest<{ success: true }>(`/api/tags/${id}`, {
        method: 'PATCH',
        ...jsonRequest({ label })
    });
};
