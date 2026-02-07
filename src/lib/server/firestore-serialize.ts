import { Timestamp } from 'firebase-admin/firestore';

export function serializeFirestoreData<T>(value: T): T {
    if (value instanceof Timestamp) {
        return value.toDate().toISOString() as T;
    }

    if (value instanceof Date) {
        return value.toISOString() as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeFirestoreData(item)) as T;
    }

    if (value && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
            result[key] = serializeFirestoreData(item);
        }
        return result as T;
    }

    return value;
}
