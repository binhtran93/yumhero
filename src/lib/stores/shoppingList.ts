import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { ShoppingListItem } from '$lib/types';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';

/**
 * Week-scoped shopping list store.
 * Returns a derived store for the shopping list of a specific week.
 */
export const getWeekShoppingList = (weekId: string) => {
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

            const store = documentStore<{ shopping_list?: ShoppingListItem[] }>(`users/${$user.uid}/plans/${weekId}`);
            return store.subscribe((state) => {
                set({
                    data: state.data?.shopping_list || [],
                    loading: state.loading
                });
            });
        },
        { data: [], loading: true }
    );
};

/**
 * Helper to get the current shopping list for a week
 */
export const getShoppingList = async (weekId: string): Promise<ShoppingListItem[]> => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = doc(db, `users/${$user.uid}/plans`, weekId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return [];
    }

    return docSnap.data()?.shopping_list || [];
};

/**
 * Helper to save the shopping list to a week
 */
const saveShoppingList = async (weekId: string, shoppingList: ShoppingListItem[]) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const docRef = doc(db, `users/${$user.uid}/plans`, weekId);
    await updateDoc(docRef, {
        shopping_list: shoppingList,
        updatedAt: new Date()
    });
};

/**
 * Add a manual shopping item to a week's shopping list
 */
export const addManualShoppingItem = async (weekId: string, ingredientName: string, amount: number, unit: string | null) => {
    const shoppingList = await getShoppingList(weekId);
    const normalizedName = ingredientName.trim().toLowerCase();
    const existing = shoppingList.find(item => item.ingredient_name === normalizedName);

    if (existing) {
        const updatedSources = [...existing.sources, {
            recipe_id: null,
            amount,
            unit,
            is_checked: false,
            checked_from: null,
            day: null,
            meal_type: null
        }];
        existing.sources = updatedSources;
        existing.updated_at = new Date();
    } else {
        const newItem: ShoppingListItem = {
            id: crypto.randomUUID(),
            ingredient_name: normalizedName,
            sources: [{
                recipe_id: null,
                amount,
                unit,
                is_checked: false,
                checked_from: null,
                day: null,
                meal_type: null
            }],
            user_id: get(user)!.uid,
            created_at: new Date(),
            updated_at: new Date()
        };
        shoppingList.push(newItem);
    }

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Delete a shopping item from a week's shopping list
 */
export const deleteShoppingItem = async (weekId: string, itemId: string) => {
    const shoppingList = await getShoppingList(weekId);
    const filtered = shoppingList.filter(item => item.id !== itemId);
    await saveShoppingList(weekId, filtered);
};

/**
 * Toggle check state for a specific source
 */
export const toggleShoppingItemCheck = async (weekId: string, itemId: string, sourceIndex: number, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item || !item.sources[sourceIndex]) {
        throw new Error("Shopping item or source not found");
    }

    item.sources[sourceIndex] = {
        ...item.sources[sourceIndex],
        is_checked: checked,
        checked_from: checked ? checked_from : null
    };
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

/**
 * Toggle all sources for an item
 */
export const toggleAllShoppingItemChecks = async (weekId: string, itemId: string, checked: boolean, checked_from: 'user' | 'fridge' | null = 'user') => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    item.sources = item.sources.map(source => ({
        ...source,
        is_checked: checked,
        checked_from: checked ? checked_from : null
    }));
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
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
    const shoppingList = await getShoppingList(weekId);
    let updatedCount = 0;

    for (const itemId of itemIds) {
        const item = shoppingList.find(i => i.id === itemId);
        if (item) {
            item.sources = item.sources.map(source => ({
                ...source,
                is_checked: checked,
                checked_from: checked ? checked_from : null
            }));
            item.updated_at = new Date();
            updatedCount++;
        }
    }

    if (updatedCount > 0) {
        await saveShoppingList(weekId, shoppingList);
    }
};

export const updateShoppingItem = async (weekId: string, itemId: string, newAmount: number, newUnit: string | null) => {
    const shoppingList = await getShoppingList(weekId);
    const item = shoppingList.find(i => i.id === itemId);

    if (!item) {
        throw new Error("Shopping item not found");
    }

    const newSource = {
        recipe_id: null,
        amount: newAmount,
        unit: newUnit,
        is_checked: item.sources.every(s => s.is_checked),
        day: item.sources[0]?.day || null,
        meal_type: item.sources[0]?.meal_type || null
    };

    item.sources = [newSource];
    item.updated_at = new Date();

    await saveShoppingList(weekId, shoppingList);
};

export const resetAllShoppingItems = async (weekId: string) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    const planRef = doc(db, `users/${$user.uid}/plans`, weekId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
        await saveShoppingList(weekId, []);
        return;
    }

    const planData = planSnap.data();
    const days = planData.days;

    if (!days) {
        await saveShoppingList(weekId, []);
        return;
    }

    await saveShoppingList(weekId, []);

    const { saveWeekPlan } = await import('./plans');
    await saveWeekPlan(weekId, days);
};

/**
 * Get bought ingredients for a specific recipe.
 * Used when removing a recipe to check if any ingredients were already bought.
 * Returns a list of ingredients that have is_checked=true for the given recipe.
 */
export const getBoughtIngredientsForRecipe = async (
    weekId: string,
    recipeId: string,
    day?: string,
    mealType?: string
): Promise<Array<{
    ingredientName: string;
    amount: number;
    unit: string | null;
}>> => {
    const shoppingList = await getShoppingList(weekId);
    const boughtIngredients: Array<{
        ingredientName: string;
        amount: number;
        unit: string | null;
    }> = [];

    for (const item of shoppingList) {
        for (const source of item.sources) {
            // Check if this source matches the recipe being removed
            const matchesRecipe = source.recipe_id === recipeId;
            const matchesDay = !day || source.day === day;
            const matchesMeal = !mealType || source.meal_type === mealType;

            if (matchesRecipe && matchesDay && matchesMeal && source.is_checked) {
                boughtIngredients.push({
                    ingredientName: item.ingredient_name,
                    amount: source.amount,
                    unit: source.unit,
                });
            }
        }
    }

    return boughtIngredients;
};
