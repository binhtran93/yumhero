import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit } from '$lib/server/ratelimit';
import { createPresignedR2Upload } from '$lib/server/r2';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/heic',
    'image/heif'
]);

function getSafeExtension(fileName: string | undefined, contentType: string): string {
    const fallbackByMime: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/avif': 'avif',
        'image/heic': 'heic',
        'image/heif': 'heif'
    };

    const fromName = fileName?.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '');
    if (fromName && fromName.length <= 10) return fromName;
    return fallbackByMime[contentType] ?? 'jpg';
}

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        await checkRateLimit(user.uid);

        const { fileName, contentType, size } = await request.json();

        if (!contentType || typeof contentType !== 'string') {
            return json({ error: 'contentType is required' }, { status: 400 });
        }

        if (!ALLOWED_IMAGE_MIME_TYPES.has(contentType)) {
            return json({ error: 'Unsupported image type' }, { status: 400 });
        }

        if (typeof size === 'number' && (size <= 0 || size > MAX_IMAGE_SIZE_BYTES)) {
            return json({ error: 'Image size must be between 1 byte and 10MB' }, { status: 400 });
        }

        const extension = getSafeExtension(fileName, contentType);
        const key = `users/${user.uid}/recipes/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const upload = await createPresignedR2Upload(key, contentType, 300);

        return json(upload);
    } catch (error: any) {
        console.error('Error creating R2 presign URL:', error);

        let status = 500;
        if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
            status = 401;
        } else if (error.message?.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: error?.message || 'Failed to create upload URL' }, { status });
    }
};
