import { adminAuth } from '$lib/server/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyAuth(request: Request): Promise<DecodedIdToken> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Auth verification failed:', error);
        throw new Error('Invalid authentication token');
    }
}
