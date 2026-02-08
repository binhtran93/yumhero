import rawDefaultRecipes from '$lib/data/defaultRecipes.review.json';
import type { Recipe } from '$lib/types';

export const DEFAULT_RECIPES: Array<Omit<Recipe, 'id'>> =
    rawDefaultRecipes as Array<Omit<Recipe, 'id'>>;

