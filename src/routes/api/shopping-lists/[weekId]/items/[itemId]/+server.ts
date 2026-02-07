import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { errorResponse, fail } from '$lib/server/api';
import { toNumber } from '$lib/server/validators';
import { getShoppingListForWeek, saveShoppingListForWeek, findShoppingItemOrFail } from '$lib/server/shopping-list';

export const PATCH = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        const itemId = params.itemId;
        if (!weekId) {
            fail('Week ID is required');
        }
        if (!itemId) {
            fail('Item ID is required');
        }

        const payload = (await request.json()) as {
            op?: unknown;
            sourceIndex?: unknown;
            checked?: unknown;
            checkedFrom?: unknown;
            amount?: unknown;
            unit?: unknown;
        };

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        const item = findShoppingItemOrFail(shoppingList, itemId);

        if (payload.op === 'set_source_checked') {
            const sourceIndex = Number(payload.sourceIndex);
            if (Number.isNaN(sourceIndex) || sourceIndex < 0) {
                fail('sourceIndex is invalid');
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

            if (!item.sources[sourceIndex]) {
                fail('Shopping item source not found', 404);
            }

            item.sources[sourceIndex] = {
                ...item.sources[sourceIndex],
                is_checked: payload.checked,
                checked_from: payload.checked ? (payload.checkedFrom ?? 'user') : null
            };
            item.updated_at = new Date();
        } else if (payload.op === 'set_all_checked') {
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
            item.sources = item.sources.map((source) => ({
                ...source,
                is_checked: checked,
                checked_from: checked ? checkedFrom : null
            }));
            item.updated_at = new Date();
        } else if (payload.op === 'replace_manual_source') {
            const newAmount = toNumber(payload.amount, 'amount');
            const newUnit = payload.unit === null || payload.unit === undefined
                ? null
                : String(payload.unit).trim();

            const allChecked = item.sources.every((s) => s.is_checked);
            item.sources = [{
                recipe_id: null,
                amount: newAmount,
                unit: newUnit,
                is_checked: allChecked,
                checked_from: allChecked ? (item.sources[0]?.checked_from ?? 'user') : null,
                day: item.sources[0]?.day || null,
                meal_type: item.sources[0]?.meal_type || null
            }];
            item.updated_at = new Date();
        } else {
            fail('Unsupported operation');
        }

        await saveShoppingListForWeek(user.uid, weekId, shoppingList);
        return json({ success: true });
    } catch (error) {
        console.error('Error applying shopping item mutation:', error);
        return errorResponse(error, 'Failed to update shopping item');
    }
};

export const DELETE = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        const itemId = params.itemId;
        if (!weekId) {
            fail('Week ID is required');
        }
        if (!itemId) {
            fail('Item ID is required');
        }

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        const filtered = shoppingList.filter((item) => item.id !== itemId);

        await saveShoppingListForWeek(user.uid, weekId, filtered);
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting shopping item:', error);
        return errorResponse(error, 'Failed to delete shopping item');
    }
};
