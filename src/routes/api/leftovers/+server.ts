import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { MealType } from '$lib/types';

interface LeftoverInput {
    title: string;
    sourceRecipeId?: string;
    imageUrl?: string | null;
    sourceDate: string;
    sourceMealType: MealType;
}

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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to fetch leftovers' }, { status });
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const payload = (await request.json()) as LeftoverInput;

        const sourceDate = new Date(payload.sourceDate);
        if (!payload.title || Number.isNaN(sourceDate.getTime())) {
            return json({ error: 'Invalid leftover payload' }, { status: 400 });
        }

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
            const sameContent = payload.sourceRecipeId
                ? data.sourceRecipeId === payload.sourceRecipeId
                : data.title === payload.title;

            return sameDate && sameMeal && sameContent;
        });

        if (duplicate) {
            return json({ error: 'This leftover has already been added to the fridge.' }, { status: 409 });
        }

        const docRef = adminDb.collection(`users/${user.uid}/leftovers`).doc();
        await docRef.set({
            id: docRef.id,
            title: payload.title,
            sourceRecipeId: payload.sourceRecipeId || null,
            imageUrl: payload.imageUrl ?? null,
            status: 'not_planned',
            createdAt: new Date(),
            sourceDate,
            sourceMealType: payload.sourceMealType,
            plannedFor: null
        });

        return json({ id: docRef.id });
    } catch (error: any) {
        console.error('Error creating leftover:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to create leftover' }, { status });
    }
};
