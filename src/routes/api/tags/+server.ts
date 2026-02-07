import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { adminDb } from '$lib/server/admin';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';

export const GET = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const snapshot = await adminDb.collection(`users/${user.uid}/tags`).get();
        const tags = snapshot.docs.map((doc) => serializeFirestoreData({ id: doc.id, ...doc.data() }));

        return json({ tags });
    } catch (error: any) {
        console.error('Error fetching tags:', error);
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to fetch tags' }, { status });
    }
};

export const POST = async ({ request }) => {
    try {
        const user = await verifyAuth(request);
        const { label } = (await request.json()) as { label: string };

        if (!label || typeof label !== 'string') {
            return json({ error: 'Label is required' }, { status: 400 });
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
        const status = error.message?.includes('authentication') || error.message?.includes('Authorization') ? 401 : 500;
        return json({ error: error?.message || 'Failed to create tag' }, { status });
    }
};
