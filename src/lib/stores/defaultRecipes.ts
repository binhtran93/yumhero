import { collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { DEFAULT_RECIPES } from '$lib/data/defaultRecipes';

const SEED_VERSION = 1;
const inFlightByUser = new Map<string, Promise<void>>();

export const seedDefaultRecipesIfNeeded = async (uid: string): Promise<void> => {
    const existing = inFlightByUser.get(uid);
    if (existing) {
        await existing;
        return;
    }

    const task = (async () => {
        const settingsRef = doc(db, `users/${uid}/settings/general`);
        const recipesCollectionRef = collection(db, `users/${uid}/recipes`);

        await runTransaction(db, async (tx) => {
            const settingsSnap = await tx.get(settingsRef);
            const settings = settingsSnap.data() as { initialized?: boolean } | undefined;
            if (settings?.initialized === true) {
                return;
            }

            const now = new Date();
            for (const recipe of DEFAULT_RECIPES) {
                const recipeRef = doc(recipesCollectionRef);
                tx.set(recipeRef, {
                    ...recipe,
                    id: recipeRef.id,
                    createdAt: now
                });
            }

            tx.set(
                settingsRef,
                {
                    initialized: true,
                    initializedAt: now,
                    defaultRecipesVersion: SEED_VERSION
                },
                { merge: true }
            );
        });
    })();

    inFlightByUser.set(uid, task);
    try {
        await task;
    } finally {
        inFlightByUser.delete(uid);
    }
};
