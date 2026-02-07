import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import { errorResponse, fail } from '$lib/server/api';
import { toNonEmptyString, toNumber } from '$lib/server/validators';

interface IngredientInput {
    name: unknown;
    amount: unknown;
    unit: unknown;
}

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/fridgeIngredients`).get();
        const ingredients = snapshot.docs.map((doc) => serializeFirestoreData({ id: doc.id, ...doc.data() }));

        return json({ ingredients });
    } catch (error: any) {
        console.error('Error fetching fridge ingredients:', error);
        return errorResponse(error, 'Failed to fetch fridge ingredients');
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const body = (await request.json()) as { ingredients?: IngredientInput[] };

        if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
            fail('ingredients must be a non-empty array');
        }

        const batch = adminDb.batch();
        const ids: string[] = [];

        for (const ingredient of body.ingredients) {
            const normalizedName = toNonEmptyString(ingredient.name, 'name').toLowerCase();
            const amount = toNumber(ingredient.amount, 'amount');
            const unit = ingredient.unit === null || ingredient.unit === undefined
                ? null
                : toNonEmptyString(ingredient.unit, 'unit');

            const docRef = adminDb.collection(`users/${user.uid}/fridgeIngredients`).doc();
            ids.push(docRef.id);

            batch.set(docRef, {
                id: docRef.id,
                name: normalizedName,
                amount,
                unit,
                addedAt: new Date()
            });
        }

        await batch.commit();
        return json({ ids });
    } catch (error: any) {
        console.error('Error creating fridge ingredients:', error);
        return errorResponse(error, 'Failed to add fridge ingredients');
    }
};
