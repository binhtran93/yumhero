import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { errorResponse, fail } from '$lib/server/api';
import { getShoppingListForWeek } from '$lib/server/shopping-list';

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        if (!weekId) {
            fail('Week ID is required');
        }

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        return json({ count: shoppingList.length });
    } catch (error) {
        console.error('Error fetching shopping list count:', error);
        return errorResponse(error, 'Failed to fetch shopping list count');
    }
};
