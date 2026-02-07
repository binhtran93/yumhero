import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { MealType } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';
import { toNonEmptyString } from '$lib/server/validators';

interface LeftoverInput {
    title?: unknown;
    sourceRecipeId?: unknown;
    imageUrl?: unknown;
    sourceDate?: unknown;
    sourceMealType?: unknown;
}

const VALID_MEAL_TYPES = new Set<MealType>(['breakfast', 'lunch', 'dinner', 'snack', 'note']);

function getUtcDateKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/leftovers`).get();
        const leftovers = snapshot.docs.map((doc) => serializeFirestoreData({ id: doc.id, ...doc.data() }));
        return json({ leftovers });
    } catch (error: any) {
        console.error('Error fetching leftovers:', error);
        return errorResponse(error, 'Failed to fetch leftovers');
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const payload = (await request.json()) as LeftoverInput;

        const title = toNonEmptyString(payload.title, 'title');
        const sourceDate = new Date(String(payload.sourceDate || ''));
        if (Number.isNaN(sourceDate.getTime())) {
            fail('sourceDate must be a valid date');
        }

        if (!VALID_MEAL_TYPES.has(payload.sourceMealType as MealType)) {
            fail('sourceMealType is invalid');
        }

        const sourceRecipeId = payload.sourceRecipeId && typeof payload.sourceRecipeId === 'string'
            ? payload.sourceRecipeId.trim() || null
            : null;

        const imageUrl = payload.imageUrl && typeof payload.imageUrl === 'string'
            ? payload.imageUrl.trim() || null
            : null;

        const existingSnapshot = await adminDb.collection(`users/${user.uid}/leftovers`).get();
        const sourceDateKey = getUtcDateKey(sourceDate);

        const duplicate = existingSnapshot.docs.find((doc) => {
            const data = doc.data() as { sourceDate?: { toDate?: () => Date }; sourceMealType?: string; sourceRecipeId?: string | null; title?: string };
            const existingDate = data.sourceDate?.toDate?.();
            if (!existingDate) {
                return false;
            }

            const sameDate = getUtcDateKey(existingDate) === sourceDateKey;
            const sameMeal = data.sourceMealType === payload.sourceMealType;
            const sameContent = sourceRecipeId
                ? data.sourceRecipeId === sourceRecipeId
                : data.title === title;

            return sameDate && sameMeal && sameContent;
        });

        if (duplicate) {
            fail('This leftover has already been added to the fridge.', 409);
        }

        const docRef = adminDb.collection(`users/${user.uid}/leftovers`).doc();
        await docRef.set({
            id: docRef.id,
            title,
            sourceRecipeId,
            imageUrl,
            status: 'not_planned',
            createdAt: new Date(),
            sourceDate,
            sourceMealType: payload.sourceMealType,
            plannedFor: null
        });

        return json({ id: docRef.id });
    } catch (error: any) {
        console.error('Error creating leftover:', error);
        return errorResponse(error, 'Failed to create leftover');
    }
};
