import { json } from '@sveltejs/kit';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

export function fail(message: string, status = 400): never {
    throw new ApiError(message, status);
}

export function errorResponse(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
        return json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : fallbackMessage;
    const status = message.includes('authentication') || message.includes('Authorization')
        ? 401
        : message.includes('Rate limit')
            ? 429
            : 500;

    return json({ error: message || fallbackMessage }, { status });
}
