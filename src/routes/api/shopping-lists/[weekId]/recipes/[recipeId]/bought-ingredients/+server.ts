import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/auth';
import { errorResponse, fail } from '$lib/server/api';
import { getShoppingListForWeek, getBoughtIngredientsForRecipe } from '$lib/server/shopping-list';
import type { MealType } from '$lib/types';

function parseMealType(value: string | null): MealType | undefined {
    if (value === null || value === '') {
        return undefined;
    }

    if (value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack' || value === 'note') {
        return value;
    }

    fail('Invalid mealType');
}

export const GET = async ({ request, params }) => {
    try {
        const user = await verifyAuth(request);
        const weekId = params.weekId;
        const recipeId = params.recipeId;
        if (!weekId) {
            fail('Week ID is required');
        }
        if (!recipeId) {
            fail('Recipe ID is required');
        }

        const url = new URL(request.url);
        const day = url.searchParams.get('day') || undefined;
        const mealType = parseMealType(url.searchParams.get('mealType'));

        const shoppingList = await getShoppingListForWeek(user.uid, weekId);
        const ingredients = getBoughtIngredientsForRecipe(shoppingList, recipeId, day, mealType);

        return json({ ingredients });
    } catch (error) {
        console.error('Error fetching bought ingredients for recipe:', error);
        return errorResponse(error, 'Failed to fetch bought ingredients');
    }
};
