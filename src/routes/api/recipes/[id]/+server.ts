import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { checkRateLimit, RATE_LIMITS } from '$lib/server/ratelimit';
import { adminDb } from '$lib/server/admin';
import { deleteImageFromR2ByPublicUrl } from '$lib/server/r2';
import type { Recipe } from '$lib/types';

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const recipeId = params.id;
        if (!recipeId) {
            return json({ error: 'Recipe ID is required' }, { status: 400 });
        }

        const snapshot = await adminDb.doc(`users/${user.uid}/recipes/${recipeId}`).get();
        if (!snapshot.exists) {
            return json({ recipe: null });
        }

        return json({ recipe: { id: snapshot.id, ...snapshot.data() } });
    } catch (error: any) {
        console.error('Error fetching recipe:', error);
        let status = 500;
        if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
            status = 401;
        }

        return json({ error: error?.message || 'Failed to fetch recipe' }, { status });
    }
};

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);

        const recipeId = params.id;
        if (!recipeId) {
            return json({ error: 'Recipe ID is required' }, { status: 400 });
        }

        const updates = (await request.json()) as Partial<Recipe>;
        await adminDb.doc(`users/${user.uid}/recipes/${recipeId}`).update(updates);

        return json({ success: true });
    } catch (error: any) {
        console.error('Error updating recipe:', error);

        let status = 500;
        if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
            status = 401;
        } else if (error.message?.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: error?.message || 'Failed to update recipe' }, { status });
    }
};

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        await checkRateLimit(user.uid, RATE_LIMITS.recipeDelete);

        const recipeId = params.id;
        if (!recipeId) {
            return json({ error: 'Recipe ID is required' }, { status: 400 });
        }

        const recipeRef = adminDb.doc(`users/${user.uid}/recipes/${recipeId}`);
        const snapshot = await recipeRef.get();
        if (!snapshot.exists) {
            return json({ error: 'Recipe not found' }, { status: 404 });
        }

        const recipe = snapshot.data() as Partial<Recipe> | undefined;
        const imageUrl = recipe?.image;

        if (typeof imageUrl === 'string' && imageUrl.trim()) {
            await deleteImageFromR2ByPublicUrl(imageUrl.trim());
        }

        await recipeRef.delete();
        return json({ success: true });
    } catch (error: any) {
        console.error('Error deleting recipe:', error);

        let status = 500;
        if (error.message?.includes('authentication') || error.message?.includes('Authorization')) {
            status = 401;
        } else if (error.message?.includes('Rate limit')) {
            status = 429;
        }

        return json({ error: error?.message || 'Failed to delete recipe' }, { status });
    }
};
