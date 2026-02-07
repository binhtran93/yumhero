import { redis } from '$lib/server/redis';

export type RateLimitConfig = {
    scope: string;
    windowSec: number;
    maxRequests: number;
};

export const RATE_LIMITS = {
    extractRecipe: { scope: 'extract-recipe', windowSec: 60, maxRequests: 10 },
    matchFridgeIngredients: { scope: 'match-fridge-ingredients', windowSec: 60, maxRequests: 20 },
    r2PresignUpload: { scope: 'r2-presign-upload', windowSec: 60, maxRequests: 30 },
    recipeDelete: { scope: 'recipe-delete', windowSec: 60, maxRequests: 30 },
    subscriptionCancel: { scope: 'subscription-cancel', windowSec: 60, maxRequests: 10 },
    subscriptionConfirm: { scope: 'subscription-confirm', windowSec: 60, maxRequests: 10 },
    subscriptionSwitch: { scope: 'subscription-switch', windowSec: 60, maxRequests: 10 },
    subscriptionSwitchPreview: { scope: 'subscription-switch-preview', windowSec: 60, maxRequests: 20 },
} as const satisfies Record<string, RateLimitConfig>;

function sanitizeScope(scope: string): string {
    return scope.replace(/[^a-zA-Z0-9:_-]/g, '-');
}

export async function checkRateLimit(uid: string, config: RateLimitConfig): Promise<void> {
    const scope = sanitizeScope(config.scope);
    const key = `ratelimit:${scope}:${uid}`;

    const count = await redis.incr(key);

    // If this is the first request, set the expiration
    if (count === 1) {
        await redis.expire(key, config.windowSec);
    }

    if (count > config.maxRequests) {
        throw new Error(`Rate limit exceeded for ${scope}. Please try again later.`);
    }
}
