import { get } from 'svelte/store';
import { user } from '$lib/stores/auth';

async function getAuthHeaders(extraHeaders?: HeadersInit): Promise<Headers> {
    const currentUser = get(user);
    if (!currentUser) {
        throw new Error('User not authenticated');
    }

    const token = await currentUser.getIdToken();
    const headers = new Headers(extraHeaders);
    headers.set('Authorization', `Bearer ${token}`);

    return headers;
}

export async function apiRequest<T>(input: string, init: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeaders(init.headers);

    const response = await fetch(input, {
        ...init,
        headers
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            const body = await response.json();
            if (body?.error) {
                message = body.error;
            }
        } catch {
            // Ignore JSON parse errors, keep fallback message.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export function jsonRequest(body: unknown): RequestInit {
    return {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
