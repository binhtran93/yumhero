import { get } from 'svelte/store';
import { user } from '$lib/stores/auth';

function createAuthHeaders(token: string, extraHeaders?: HeadersInit): Headers {
    const headers = new Headers(extraHeaders);
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
    const isJson = (response.headers.get('content-type') || '').includes('application/json');

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        try {
            if (isJson) {
                const body = await response.json();
                if (body?.error) {
                    message = body.error;
                }
            }
        } catch {
            // Ignore JSON parse errors, keep fallback message.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    if (!isJson) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

/**
 * Generic authenticated request that accepts an explicit Firebase ID token.
 * Useful for non-web clients (e.g. mobile) that manage auth separately.
 */
export async function apiRequestWithToken<T>(
    token: string,
    input: string,
    init: RequestInit = {}
): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: createAuthHeaders(token, init.headers)
    });

    return parseApiResponse<T>(response);
}

export async function apiRequest<T>(input: string, init: RequestInit = {}): Promise<T> {
    const currentUser = get(user);
    if (!currentUser) {
        throw new Error('User not authenticated');
    }

    const token = await currentUser.getIdToken();
    return apiRequestWithToken<T>(token, input, init);
}

export function jsonRequest(body: unknown): RequestInit {
    return {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(body)
    };
}
