import {adminDb} from '$lib/server/admin';
import type {ShoppingListItem} from '$lib/types';

export async function getShoppingListForWeek(userId: string, weekId: string): Promise<ShoppingListItem[]> {
    const snapshot = await adminDb.doc(`users/${userId}/plans/${weekId}`).get();
    if (!snapshot.exists) {
        return [];
    }

    const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
    return Array.isArray(data?.shopping_list) ? data.shopping_list : [];
}
