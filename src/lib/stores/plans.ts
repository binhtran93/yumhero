import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { WeeklyPlan, ShoppingListItem } from '$lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { getShoppingList } from './shoppingList';
import { parseAmount } from '$lib/utils/shopping';

export const getWeekPlan = (weekId: string) => {
    return derived<[Readable<any>, Readable<boolean>], { data: WeeklyPlan | null, loading: boolean }>(
        [user, authLoading],
        ([$user, $authLoading], set) => {
            if ($authLoading) {
                set({ data: null, loading: true });
                return;
            }
            if (!$user) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<{ days: WeeklyPlan }>(`users/${$user.uid}/plans/${weekId}`);
            return store.subscribe((state) => {
                set({
                    data: state.data ? state.data.days : null,
                    loading: state.loading
                });
            });
        },
        { data: null, loading: true }
    );
};

/**
 * Build shopping list from recipes in the plan
 * Preserves manual items and user edits
 */
const syncShoppingListFromPlan = async (weekId: string, plan: WeeklyPlan): Promise<ShoppingListItem[]> => {
    const currentList = await getShoppingList(weekId);
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    // Build ingredient map from recipes
    const recipeIngredientsMap = new Map<string, {
        sources: Array<{ recipe_id: string; amount: number; unit: string | null }>;
    }>();

    plan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as any[]).forEach(planRecipe => {
                if (!planRecipe.ingredients || !planRecipe.id) return;

                const quantity = planRecipe.quantity || 1;
                const recipeId = planRecipe.id;

                planRecipe.ingredients.forEach((ing: any) => {
                    if (!ing.name) return;

                    const amountVal = parseAmount(ing.amount);
                    const amount = amountVal === null ? 0 : amountVal;
                    const scaledAmount = amount * quantity;
                    const unit = ing.unit || null;
                    const name = ing.name.trim().toLowerCase();

                    if (!recipeIngredientsMap.has(name)) {
                        recipeIngredientsMap.set(name, { sources: [] });
                    }

                    recipeIngredientsMap.get(name)!.sources.push({
                        recipe_id: recipeId,
                        amount: scaledAmount,
                        unit: unit
                    });
                });
            });
        });
    });

    // Get all recipe IDs from new plan
    const planRecipeIds = new Set<string>();
    plan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;
            (meals as any[]).forEach(planRecipe => {
                if (planRecipe.id) planRecipeIds.add(planRecipe.id);
            });
        });
    });

    // Merge with existing list, preserving manual items and user edits
    const newList: ShoppingListItem[] = [];
    const processedIngredients = new Set<string>();

    // First, update existing items
    for (const existingItem of currentList) {
        const ingredientName = existingItem.ingredient_name;
        const recipeData = recipeIngredientsMap.get(ingredientName);

        // Filter out sources for recipes no longer in plan, keep manual items
        const updatedSources = existingItem.sources.filter(source => {
            if (source.recipe_id === null) return true; // Keep manual items
            return planRecipeIds.has(source.recipe_id);
        });

        // If item was manually edited, keep it as is but remove old recipe sources
        if (existingItem.original_sources) {
            if (updatedSources.length > 0) {
                newList.push({
                    ...existingItem,
                    sources: updatedSources,
                    updated_at: new Date()
                });
            }
        } else if (recipeData) {
            // Item from recipes - update with new amounts
            const recipeSources = recipeData.sources.map(s => ({
                ...s,
                is_checked: false
            }));
            const manualSources = updatedSources.filter(s => s.recipe_id === null);

            newList.push({
                ...existingItem,
                sources: [...recipeSources, ...manualSources],
                updated_at: new Date()
            });
            processedIngredients.add(ingredientName);
        } else if (updatedSources.length > 0) {
            // No recipe data but has manual items - keep manual items
            newList.push({
                ...existingItem,
                sources: updatedSources,
                updated_at: new Date()
            });
        }
        // If no sources left, item is removed (not added to newList)
    }

    // Add new ingredients from recipes that weren't in the existing list
    for (const [ingredientName, data] of recipeIngredientsMap.entries()) {
        if (!processedIngredients.has(ingredientName)) {
            newList.push({
                id: crypto.randomUUID(),
                ingredient_name: ingredientName,
                sources: data.sources.map(s => ({ ...s, is_checked: false })),
                user_id: $user.uid,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    return newList;
};

export const saveWeekPlan = async (weekId: string, plan: WeeklyPlan) => {
    const $user = get(user);
    if (!$user) throw new Error("User not authenticated");

    // Build shopping list from plan (syncs with recipes, preserves manual items)
    const shoppingList = await syncShoppingListFromPlan(weekId, plan);

    // Save plan and shopping list atomically
    const planRef = doc(db, `users/${$user.uid}/plans`, weekId);
    await setDoc(planRef, {
        id: weekId,
        days: plan,
        shopping_list: shoppingList,
        updatedAt: new Date()
    }, { merge: true });
};
