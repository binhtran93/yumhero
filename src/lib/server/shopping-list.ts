import { adminDb } from '$lib/server/admin';
import type { ShoppingListItem } from '$lib/types';
import { fail } from '$lib/server/api';

export async function getShoppingListForWeek(userId: string, weekId: string): Promise<ShoppingListItem[]> {
    const snapshot = await adminDb.doc(`users/${userId}/plans/${weekId}`).get();
    if (!snapshot.exists) {
        return [];
    }

    const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
    return Array.isArray(data?.shopping_list) ? data.shopping_list : [];
}

export async function saveShoppingListForWeek(
    userId: string,
    weekId: string,
    shoppingList: ShoppingListItem[]
): Promise<void> {
    await adminDb.doc(`users/${userId}/plans/${weekId}`).set(
        {
            shopping_list: shoppingList,
            updatedAt: new Date()
        },
        { merge: true }
    );
}

export function findShoppingItemOrFail(shoppingList: ShoppingListItem[], itemId: string): ShoppingListItem {
    const item = shoppingList.find((entry) => entry.id === itemId);
    if (!item) {
        fail('Shopping item not found', 404);
    }

    return item;
}
