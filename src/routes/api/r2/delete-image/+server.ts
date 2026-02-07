import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';
import { deleteImageFromR2ByPublicUrl } from '$lib/server/r2';

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        await checkRateLimit(user.uid, RATE_LIMITS.r2DeleteImage);

        const { imageUrl } = await request.json();
        if (!imageUrl || typeof imageUrl !== 'string') {
            return json({ error: 'imageUrl is required' }, { status: 400 });
        }

        await deleteImageFromR2ByPublicUrl(imageUrl.trim());
        return json({ success: true });
    } catch (error: any) {
        console.error('Error deleting R2 image:', error);

        let status = 500;
        if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
            status = 401;
        } else if (error.message?.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: error?.message || 'Failed to delete image' }, { status });
    }
};
