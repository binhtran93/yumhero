import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { serializeFirestoreData } from '$lib/server/firestore-serialize';
import type { ShoppingListItem } from '$lib/types';
import { errorResponse, fail } from '$lib/server/api';
import { getShoppingListForWeek, saveShoppingListForWeek, findShoppingItemOrFail } from '$lib/server/shopping-list';

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        return json({ shopping_list: serializeFirestoreData(shoppingList) });
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        return errorResponse(error, 'Failed to fetch shopping list');
    }
};

export const PUT = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const body = (await request.json()) as { shopping_list?: ShoppingListItem[] };
        if (!Array.isArray(body.shopping_list)) {
            fail('shopping_list must be an array');
        }

        await saveShoppingListForWeek(user.uid, weekId, body.shopping_list);
        return json({ success: true });
    } catch (error) {
        console.error('Error replacing shopping list:', error);
        return errorResponse(error, 'Failed to replace shopping list');
    }
};

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const payload = (await request.json()) as {
            op?: unknown;
            itemIds?: unknown;
            checked?: unknown;
            checkedFrom?: unknown;
        };

        if (payload.op !== 'batch_set_all_checked') {
            fail('Unsupported operation');
        }
        if (!Array.isArray(payload.itemIds)) {
            fail('itemIds must be an array');
        }
        if (typeof payload.checked !== 'boolean') {
            fail('checked must be a boolean');
        }
        if (
            payload.checkedFrom !== undefined &&
            payload.checkedFrom !== null &&
            payload.checkedFrom !== 'user' &&
            payload.checkedFrom !== 'fridge'
        ) {
            fail('checkedFrom is invalid');
        }

        const checked = payload.checked;
        const checkedFrom = payload.checkedFrom ?? 'user';
        const itemIds = new Set(payload.itemIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0));

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        let updated = false;

        itemIds.forEach((id) => {
            const item = findShoppingItemOrFail(shoppingList, id);
            item.sources = item.sources.map((source) => ({
                ...source,
                is_checked: checked,
                checked_from: checked ? checkedFrom : null
            }));
            item.updated_at = new Date();
            updated = true;
        });

        if (updated) {
            await saveShoppingListForWeek(user.uid, weekId, shoppingList);
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error applying shopping list batch operation:', error);
        return errorResponse(error, 'Failed to apply shopping list operation');
    }
};
