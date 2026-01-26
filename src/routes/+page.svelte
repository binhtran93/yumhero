<script lang="ts">
  import { onMount } from 'svelte';
  import type { MealType, Recipe, WeeklyPlan } from '$lib/types';
  import DayColumn from '$lib/components/DayColumn.svelte';
  import RecipeModal from '$lib/components/RecipeModal.svelte';

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initial State
  let plan: WeeklyPlan = $state(DAYS.map(day => ({
    day,
    meals: {
      breakfast: null,
      lunch: null,
      dinner: null,
    }
  })));

  let modalState = $state<{
    isOpen: boolean;
    day: string | null;
    mealType: MealType | null;
  }>({
    isOpen: false,
    day: null,
    mealType: null,
  });

  const handleMealClick = (day: string, type: MealType) => {
    modalState = {
      isOpen: true,
      day,
      mealType: type,
    };
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (!modalState.day || !modalState.mealType) return;

    // Direct mutation thanks to Svelte 5 Runes
    const dayIndex = plan.findIndex(d => d.day === modalState.day);
    if (dayIndex !== -1) {
        plan[dayIndex].meals[modalState.mealType!] = recipe;
    }

    modalState = { ...modalState, isOpen: false };
  };

  const handleClearMeal = (day: string, type: MealType) => {
    const dayIndex = plan.findIndex(d => d.day === day);
    if (dayIndex !== -1) {
        plan[dayIndex].meals[type] = null;
    }
  };

  const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; 
</script>

<div class="grid grid-cols-7 h-full w-full">
  {#each plan as dayPlan}
    <DayColumn 
      dayPlan={dayPlan}
      isToday={dayPlan.day === currentDayName}
      onMealClick={handleMealClick}
      onMealClear={handleClearMeal}
    />
  {/each}
</div>

<RecipeModal 
  isOpen={modalState.isOpen}
  mealType={modalState.mealType}
  onClose={() => modalState.isOpen = false}
  onSelect={handleRecipeSelect}
/>
