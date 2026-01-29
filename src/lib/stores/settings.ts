import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Helper to create a persisted store
export function createPersistedStore<T>(key: string, initialValue: T) {
    // If we're on the server, just return a regular writable
    if (!browser) {
        return writable(initialValue);
    }

    // Check local storage
    const storedValue = localStorage.getItem(key);
    const data = storedValue ? JSON.parse(storedValue) : initialValue;

    const store = writable<T>(data);

    // Subscribe to changes and update local storage
    store.subscribe((value) => {
        localStorage.setItem(key, JSON.stringify(value));
    });

    return store;
}

const defaultUnits = [
    'Pieces', 'Packet', 'Slices', 'Grams', 'Kilograms', 'Litres', 'Bottles',
    'Teaspoon', 'Tablespoon', 'Fluid ounce', 'Cups', 'Pints', 'Quarts', 'Gallons',
    'Pounds', 'Ounces', 'Handful', 'Bunch', 'Cans', 'Stems', 'Cloves'
];

const defaultCategories = [
    'Fruits & Vegetables', 'Meat & Seafood', 'Frozen', 'Dairy & Eggs',
    'Bakery & Deli', 'Baking Goods', 'Drinks', 'Pantry', 'Household',
    'Breakfast & Cereal', 'Mexican & Texmex', 'Other'
];

export const units = createPersistedStore<string[]>('yumhero_units', defaultUnits);
export const categories = createPersistedStore<string[]>('yumhero_categories', defaultCategories);
