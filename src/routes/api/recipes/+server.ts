import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { Recipe } from '$lib/types';

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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to fetch recipes' }, { status });
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const recipe = (await request.json()) as Omit<Recipe, 'id'>;

        const docRef = adminDb.collection(`users/${user.uid}/recipes`).doc();
        await docRef.set({
            ...recipe,
            id: docRef.id,
            createdAt: new Date()
        });

        return json({ id: docRef.id });
    } catch (error: any) {
        console.error('Error creating recipe:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to create recipe' }, { status });
    }
};
