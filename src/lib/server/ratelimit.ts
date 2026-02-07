import { redis } from '$lib/server/redis';

const RATE_LIMIT_WINDOW = 60; // 60 seconds
const MAX_REQUESTS = 10; // Max requests per minute

export async function checkRateLimit(uid: string): Promise<void> {
    const key = `ratelimit:extract-recipe:${uid}`;

    const count = await redis.incr(key);

    // If this is the first request, set the expiration
    if (count === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (count > MAX_REQUESTS) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
    }
}
