import { adminDb } from '$lib/server/admin';
import type { MealType, ShoppingListItem } from '$lib/types';
import { fail } from '$lib/server/api';

export interface BoughtIngredient {
    ingredientName: string;
    amount: number;
    unit: string | null;
}

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

export function getBoughtIngredientsForRecipe(
    shoppingList: ShoppingListItem[],
    recipeId: string,
    day?: string,
    mealType?: MealType
): BoughtIngredient[] {
    const boughtIngredients: BoughtIngredient[] = [];

    for (const item of shoppingList) {
        for (const source of item.sources) {
            const matchesRecipe = source.recipe_id === recipeId;
            const matchesDay = !day || source.day === day;
            const matchesMeal = !mealType || source.meal_type === mealType;

            if (matchesRecipe && matchesDay && matchesMeal && source.is_checked) {
                boughtIngredients.push({
                    ingredientName: item.ingredient_name,
                    amount: source.amount,
                    unit: source.unit
                });
            }
        }
    }

    return boughtIngredients;
}
