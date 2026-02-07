import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { verifyAuth } from '$lib/server/auth';
import { errorResponse, fail } from '$lib/server/api';
import { toNonEmptyString, toNumber } from '$lib/server/validators';
import { getShoppingListForWeek, saveShoppingListForWeek } from '$lib/server/shopping-list';
import type { ShoppingListItem } from '$lib/types';

export const POST = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const payload = (await request.json()) as {
            ingredientName?: unknown;
            amount?: unknown;
            unit?: unknown;
        };

        const normalizedName = toNonEmptyString(payload.ingredientName, 'ingredientName').toLowerCase();
        const amount = toNumber(payload.amount, 'amount');
        const unit = payload.unit === null || payload.unit === undefined
            ? null
            : toNonEmptyString(payload.unit, 'unit');

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        const existing = shoppingList.find((item) => item.ingredient_name === normalizedName);

        if (existing) {
            existing.sources = [
                ...existing.sources,
                {
                    recipe_id: null,
                    amount,
                    unit,
                    is_checked: false,
                    checked_from: null,
                    day: null,
                    meal_type: null
                }
            ];
            existing.updated_at = new Date();
        } else {
            const newItem: ShoppingListItem = {
                id: randomUUID(),
                ingredient_name: normalizedName,
                sources: [
                    {
                        recipe_id: null,
                        amount,
                        unit,
                        is_checked: false,
                        checked_from: null,
                        day: null,
                        meal_type: null
                    }
                ],
                user_id: user.uid,
                created_at: new Date(),
                updated_at: new Date()
            };
            shoppingList.push(newItem);
        }

        await saveShoppingListForWeek(user.uid, weekId, shoppingList);
        return json({ success: true });
    } catch (error) {
        console.error('Error adding shopping item:', error);
        return errorResponse(error, 'Failed to add shopping item');
    }
};
