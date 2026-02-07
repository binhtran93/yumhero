import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { Recipe } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/recipes`).get();

        const recipes = snapshot.docs.map((doc) => {
            const data = doc.data();
            return serializeFirestoreData({ id: doc.id, ...data });
        });

        return json({ recipes });
    } catch (error: any) {
        console.error('Error fetching recipes:', error);
        return errorResponse(error, 'Failed to fetch recipes');
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const recipe = (await request.json()) as Partial<Omit<Recipe, 'id'>>;

        if (!recipe || typeof recipe !== 'object') {
            fail('Invalid recipe payload');
        }

        if (!recipe.title || typeof recipe.title !== 'string') {
            fail('Recipe title is required');
        }
        if (!Array.isArray(recipe.ingredients)) {
            fail('Recipe ingredients must be an array');
        }
        if (!Array.isArray(recipe.instructions)) {
            fail('Recipe instructions must be an array');
        }

        const docRef = adminDb.collection(`users/${user.uid}/recipes`).doc();
        await docRef.set({
            ...recipe,
            id: docRef.id,
            createdAt: new Date()
        });

        return json({ id: docRef.id });
    } catch (error: any) {
        console.error('Error creating recipe:', error);
        return errorResponse(error, 'Failed to create recipe');
    }
};
