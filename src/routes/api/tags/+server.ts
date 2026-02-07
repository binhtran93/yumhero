import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import { errorResponse, fail } from '$lib/server/api';
import { toNonEmptyString } from '$lib/server/validators';

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/tags`).get();
        const tags = snapshot.docs.map((doc) => serializeFirestoreData({ id: doc.id, ...doc.data() }));

        return json({ tags });
    } catch (error: any) {
        console.error('Error fetching tags:', error);
        return errorResponse(error, 'Failed to fetch tags');
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const body = (await request.json()) as { label?: unknown };
        const label = toNonEmptyString(body.label, 'label');

        const existing = await adminDb
            .collection(`users/${user.uid}/tags`)
            .where('label', '==', label)
            .limit(1)
            .get();

        if (!existing.empty) {
            fail('Tag already exists', 409);
        }

        const docRef = adminDb.collection(`users/${user.uid}/tags`).doc();
        await docRef.set({
            id: docRef.id,
            label,
            createdAt: new Date()
        });

        return json({ id: docRef.id });
    } catch (error: any) {
        console.error('Error creating tag:', error);
        return errorResponse(error, 'Failed to create tag');
    }
};
