import { derived, get, type Readable } from 'svelte/store';
import { doc, getDoc, onSnapshot, runTransaction, setDoc } from 'firebase/firestore';
import { user, loading as authLoading } from './auth';
import type { MealType, ShoppingListItem, WeeklyPlan } from '$lib/types';
import { db } from '$lib/firebase';
import { syncShoppingListFromPlan } from '$lib/stores/planShopping';

/**
 * Create a reactive week-scoped shopping list store.
 */
export const getWeekShoppingListStore = (weekId: string) => {
    return derived<[Readable<any>, Readable<boolean>], { data: ShoppingListItem[], loading: boolean }>(
        [user, authLoading],
        ([$user, $authLoading], set) => {
            if ($authLoading) {
                set({ data: [], loading: true });
                return;
            }
            if (!$user) {
                set({ data: [], loading: false });
                return;
            }

            const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
            return onSnapshot(
                planRef,
                (snapshot) => {
                    if (!snapshot.exists()) {
                        set({ data: [], loading: false });
                        return;
                    }

                    const data = snapshot.data() as { shopping_list?: ShoppingListItem[] };
                    set({
                        data: Array.isArray(data.shopping_list) ? data.shopping_list : [],
                        loading: false
                    });
                },
                (error) => {
                    console.error('Error listening to shopping list:', error);
                    set({ data: [], loading: false });
                }
            );
        },
        { data: [], loading: true }
    );
};

const getShoppingListForWeek = async (uid: string, weekId: string): Promise<ShoppingListItem[]> => {
    const snapshot = await getDoc(doc(db, `users/${uid}/plans/${weekId}`));
    if (!snapshot.exists()) return [];
    const data = snapshot.data() as { shopping_list?: ShoppingListItem[] };
    return Array.isArray(data.shopping_list) ? data.shopping_list : [];
};

/**
 * Add a manual shopping item to a week's shopping list
 */
export const addManualShoppingItem = async (weekId: string, ingredientName: string, amount: number, unit: string | null) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const normalizedName = ingredientName.trim().toLowerCase();
    if (!normalizedName) throw new Error('ingredientName is required');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? [...data.shopping_list] : [];
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
            shoppingList.push({
                id: crypto.randomUUID(),
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
                user_id: $user.uid,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        tx.set(planRef, { shopping_list: shoppingList, updatedAt: new Date() }, { merge: true });
    });
};

/**
 * Delete a shopping item from a week's shopping list
 */
export const deleteShoppingItem = async (weekId: string, itemId: string) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? data.shopping_list : [];
        const filtered = shoppingList.filter((item) => item.id !== itemId);
        tx.set(planRef, { shopping_list: filtered, updatedAt: new Date() }, { merge: true });
    });
};

/**
 * Toggle check state for a specific source
 */
export const toggleShoppingItemCheck = async (weekId: string, itemId: string, sourceIndex: number, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? [...data.shopping_list] : [];
        const item = shoppingList.find((entry) => entry.id === itemId);
        if (!item || !item.sources[sourceIndex]) {
            throw new Error('Shopping item source not found');
        }

        item.sources[sourceIndex] = {
            ...item.sources[sourceIndex],
            is_checked: checked,
            checked_from: checked ? checked_from : null
        };
        item.updated_at = new Date();
        tx.set(planRef, { shopping_list: shoppingList, updatedAt: new Date() }, { merge: true });
    });
};

/**
 * Toggle all sources for an item
 */
export const toggleAllShoppingItemChecks = async (weekId: string, itemId: string, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? [...data.shopping_list] : [];
        const item = shoppingList.find((entry) => entry.id === itemId);
        if (!item) throw new Error('Shopping item not found');

        item.sources = item.sources.map((source) => ({
            ...source,
            is_checked: checked,
            checked_from: checked ? checked_from : null
        }));
        item.updated_at = new Date();
        tx.set(planRef, { shopping_list: shoppingList, updatedAt: new Date() }, { merge: true });
    });
};

/**
 * Batch toggle check state for multiple shopping items
 */
export const batchToggleShoppingItemChecks = async (
    weekId: string,
    itemIds: string[],
    checked: boolean,
    checked_from: 'user' | 'fridge' | null = 'user'
) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    const ids = new Set(itemIds.filter((id) => typeof id === 'string' && id.trim().length > 0));

    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? [...data.shopping_list] : [];

        shoppingList.forEach((item) => {
            if (!ids.has(item.id)) return;
            item.sources = item.sources.map((source) => ({
                ...source,
                is_checked: checked,
                checked_from: checked ? checked_from : null
            }));
            item.updated_at = new Date();
        });

        tx.set(planRef, { shopping_list: shoppingList, updatedAt: new Date() }, { merge: true });
    });
};

export const updateShoppingItem = async (weekId: string, itemId: string, newAmount: number, newUnit: string | null) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    await runTransaction(db, async (tx) => {
        const snapshot = await tx.get(planRef);
        const data = snapshot.data() as { shopping_list?: ShoppingListItem[] } | undefined;
        const shoppingList = Array.isArray(data?.shopping_list) ? [...data.shopping_list] : [];
        const item = shoppingList.find((entry) => entry.id === itemId);
        if (!item) throw new Error('Shopping item not found');

        const allChecked = item.sources.every((source) => source.is_checked);
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

        tx.set(planRef, { shopping_list: shoppingList, updatedAt: new Date() }, { merge: true });
    });
};

export const resetAllShoppingItems = async (weekId: string) => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const planRef = doc(db, `users/${$user.uid}/plans/${weekId}`);
    const snapshot = await getDoc(planRef);
    const data = snapshot.data() as { days?: WeeklyPlan } | undefined;
    const days = Array.isArray(data?.days) ? data.days : [];
    const rebuilt = syncShoppingListFromPlan([], days, $user.uid);

    await setDoc(planRef, {
        id: weekId,
        shopping_list: rebuilt,
        updatedAt: new Date()
    }, { merge: true });
};

const getBoughtIngredientsForRecipe = (
    shoppingList: ShoppingListItem[],
    recipeId: string,
    day?: string,
    mealType?: MealType
): Array<{ ingredientName: string; amount: number; unit: string | null }> => {
    const boughtIngredients: Array<{ ingredientName: string; amount: number; unit: string | null }> = [];

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
};

/**
 * Get bought ingredients for a specific recipe.
 */
export const fetchBoughtIngredientsForRecipe = async (
    weekId: string,
    recipeId: string,
    day?: string,
    mealType?: MealType
): Promise<Array<{
    ingredientName: string;
    amount: number;
    unit: string | null;
}>> => {
    const $user = get(user);
    if (!$user) throw new Error('User not authenticated');

    const shoppingList = await getShoppingListForWeek($user.uid, weekId);
    return getBoughtIngredientsForRecipe(shoppingList, recipeId, day, mealType);
};
