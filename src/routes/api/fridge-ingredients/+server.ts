import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';

interface IngredientInput {
    name: string;
    amount: number;
    unit: string | null;
}

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/fridgeIngredients`).get();
        const ingredients = snapshot.docs.map((doc) => serializeFirestoreData({ id: doc.id, ...doc.data() }));

        return json({ ingredients });
    } catch (error: any) {
        console.error('Error fetching fridge ingredients:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to fetch fridge ingredients' }, { status });
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const body = (await request.json()) as { ingredients: IngredientInput[] };

        if (!Array.isArray(body.ingredients)) {
            return json({ error: 'ingredients must be an array' }, { status: 400 });
        }

        const batch = adminDb.batch();
        const ids: string[] = [];

        for (const ingredient of body.ingredients) {
            const docRef = adminDb.collection(`users/${user.uid}/fridgeIngredients`).doc();
            ids.push(docRef.id);

            batch.set(docRef, {
                id: docRef.id,
                name: ingredient.name,
                amount: ingredient.amount,
                unit: ingredient.unit,
                addedAt: new Date()
            });
        }

        await batch.commit();
        return json({ ids });
    } catch (error: any) {
        console.error('Error creating fridge ingredients:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to add fridge ingredients' }, { status });
    }
};
