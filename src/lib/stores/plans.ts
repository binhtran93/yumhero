import { derived, get, type Readable } from 'svelte/store';
import { user, loading as authLoading } from './auth';
import { documentStore } from './firestore';
import type { WeeklyPlan, ShoppingListItem, ShoppingListSource, MealType } from '$lib/types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
        sources: Array<Omit<ShoppingListSource, 'is_checked'>>;
    }>();

    plan.forEach(dayPlan => {
        Object.entries(dayPlan.meals).forEach(([type, meals]) => {
            if (type === 'note') return;

            (meals as any[]).forEach(planRecipe => {
                // Skip leftovers entirely - they don't contribute to shopping list
                if ('isLeftover' in planRecipe && planRecipe.isLeftover) return;

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

                    const sources = recipeIngredientsMap.get(name)!.sources;
                    const existingSourceIndex = sources.findIndex(s =>
                        s.recipe_id === recipeId &&
                        s.day === dayPlan.day &&
                        s.meal_type === type
                    );

                    let merged = false;
                    if (existingSourceIndex !== -1) {
                        const existingSource = sources[existingSourceIndex];
                        // Check if units are compatible for merging
                        const u1 = existingSource.unit ? existingSource.unit.toLowerCase().trim() : '';
                        const u2 = unit ? unit.toLowerCase().trim() : '';

                        if (u1 === u2 || !u1 || !u2) {
                            existingSource.amount += scaledAmount;
                            // Update unit if the existing one was empty and new one is present
                            if (!u1 && u2) {
                                existingSource.unit = unit;
                            }
                            merged = true;
                        }
                    }

                    if (!merged) {
                        sources.push({
                            recipe_id: recipeId,
                            amount: scaledAmount,
                            unit: unit,
                            day: dayPlan.day,
                            meal_type: type as MealType
                        });
                    }
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
                // Skip leftovers - they don't have recipe IDs for shopping purposes
                if ('isLeftover' in planRecipe && planRecipe.isLeftover) return;
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

        const updatedSources = existingItem.sources.filter(source => {
            if (source.recipe_id === null) return true;
            return planRecipeIds.has(source.recipe_id);
        });

        if (recipeData) {
            const recipeSources = recipeData.sources.map(s => {
                const existingSource = existingItem.sources.find(
                    es => es.recipe_id === s.recipe_id && es.day === s.day
                );
                return {
                    ...s,
                    is_checked: existingSource?.is_checked ?? false,
                    checked_from: existingSource?.checked_from ?? null
                };
            });
            const manualSources = updatedSources.filter(s => s.recipe_id === null);

            newList.push({
                ...existingItem,
                sources: [...recipeSources, ...manualSources],
                updated_at: new Date()
            });
            processedIngredients.add(ingredientName);
        } else if (updatedSources.length > 0) {
            newList.push({
                ...existingItem,
                sources: updatedSources,
                updated_at: new Date()
            });
        }
    }

    // Add new ingredients from recipes that weren't in the existing list
    for (const [ingredientName, data] of recipeIngredientsMap.entries()) {
        if (!processedIngredients.has(ingredientName)) {
            newList.push({
                id: crypto.randomUUID(),
                ingredient_name: ingredientName,
                sources: data.sources.map(s => ({ ...s, is_checked: false, checked_from: null })),
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

/**
 * Remove a specific leftover from a week plan.
 * Used when a leftover is deleted from the fridge.
 */
export const removeLeftoverFromWeekPlan = async (weekId: string, leftoverId: string) => {
    const $user = get(user);
    if (!$user) return;

    const planRef = doc(db, `users/${$user.uid}/plans`, weekId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) return;

    const planData = planSnap.data();
    const days = planData.days as WeeklyPlan;

    let modified = false;
    days.forEach(day => {
        Object.keys(day.meals).forEach(mealType => {
            if (mealType === 'note') return;
            const items = day.meals[mealType as keyof typeof day.meals] as any[];
            const index = items.findIndex(item => item.isLeftover && item.leftoverId === leftoverId);
            if (index !== -1) {
                items.splice(index, 1);
                modified = true;
            }
        });
    });

    if (modified) {
        await saveWeekPlan(weekId, days);
    }
};
