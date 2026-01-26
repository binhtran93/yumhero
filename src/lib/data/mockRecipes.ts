import type { Recipe } from '../types';

export const mockRecipes: Recipe[] = [
    {
        id: '1',
        title: 'Avocado Toast with Egg',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&w=300&q=80',
        calories: 350,
        tags: ['Breakfast', 'Healthy'],
    },
    {
        id: '2',
        title: 'Oatmeal with Berries',
        image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=300&q=80',
        calories: 300,
        tags: ['Breakfast', 'Vegan'],
    },
    {
        id: '3',
        title: 'Grilled Chicken Salad',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        calories: 450,
        tags: ['Lunch', 'Low Carb'],
    },
    {
        id: '4',
        title: 'Quinoa Bowl',
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=300&q=80',
        calories: 400,
        tags: ['Lunch', 'Vegetarian'],
    },
    {
        id: '5',
        title: 'Salmon with Asparagus',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=300&q=80',
        calories: 550,
        tags: ['Dinner', 'Keto'],
    },
    {
        id: '6',
        title: 'Pasta Primavera',
        image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=80',
        calories: 600,
        tags: ['Dinner', 'Comfort Food'],
    },
    {
        id: '7',
        title: 'Greek Yogurt Parfait',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&w=300&q=80',
        calories: 250,
        tags: ['Breakfast', 'Snack'],
    },
    {
        id: '8',
        title: 'Turkey Wrap',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80',
        calories: 400,
        tags: ['Lunch', 'Easy'],
    },
];
