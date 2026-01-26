<script lang="ts">
  import type { DayPlan, MealType } from "$lib/types";
  import MealSlot from "./MealSlot.svelte";
  import { twMerge } from "tailwind-merge";

  interface Props {
    dayPlan: DayPlan;
    isToday?: boolean;
    onMealClick: (day: string, type: MealType) => void;
    onMealClear: (day: string, type: MealType) => void;
    onRemoveRecipe: (type: MealType, index: number) => void;
  }

  let {
    dayPlan,
    isToday = false,
    onMealClick,
    onMealClear,
    onRemoveRecipe,
  }: Props = $props();
</script>

<div
  class="flex flex-col h-full w-[85vw] md:w-[320px] bg-bg-surface overflow-y-auto"
>
  <!-- Sticky Header -->
  <div
    class="sticky top-0 z-10 py-6 border-b border-border-default bg-bg-surface text-text-primary"
  >
    {#if isToday}
      <div class="absolute top-0 left-0 right-0 h-1 bg-action-primary"></div>
    {/if}
    <div class="flex items-center justify-center gap-2">
      <span
        class={twMerge(
          "text-lg font-display font-bold",
          isToday && "text-action-primary",
        )}
      >
        {dayPlan.day}
      </span>
      {#if isToday}
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-action-primary/80 bg-action-primary/10 px-1.5 py-0.5 rounded-md"
          >Today</span
        >
      {/if}
    </div>
  </div>

  <!-- Slots Container -->
  <div class="flex-1 flex flex-col p-6 gap-8">
    <!-- Breakfast Section -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 pb-1.5 border-b border-border-strong">
        <div class="w-3 h-3 rounded-full bg-accent-breakfast shadow-sm"></div>
        <span
          class="text-xs font-bold text-text-primary uppercase tracking-widest"
          >Breakfast</span
        >
      </div>
      <MealSlot
        type="breakfast"
        recipes={dayPlan.meals.breakfast}
        onClick={() => onMealClick(dayPlan.day, "breakfast")}
        onClear={() => onMealClear(dayPlan.day, "breakfast")}
        onRemove={(index) => onRemoveRecipe("breakfast", index)}
      />
    </div>

    <!-- Lunch Section -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 pb-1.5 border-b border-border-strong">
        <div class="w-3 h-3 rounded-full bg-accent-lunch shadow-sm"></div>
        <span
          class="text-xs font-bold text-text-primary uppercase tracking-widest"
          >Lunch</span
        >
      </div>
      <MealSlot
        type="lunch"
        recipes={dayPlan.meals.lunch}
        onClick={() => onMealClick(dayPlan.day, "lunch")}
        onClear={() => onMealClear(dayPlan.day, "lunch")}
        onRemove={(index) => onRemoveRecipe("lunch", index)}
      />
    </div>

    <!-- Dinner Section -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 pb-1.5 border-b border-border-strong">
        <div class="w-3 h-3 rounded-full bg-accent-dinner shadow-sm"></div>
        <span
          class="text-xs font-bold text-text-primary uppercase tracking-widest"
          >Dinner</span
        >
      </div>
      <MealSlot
        type="dinner"
        recipes={dayPlan.meals.dinner}
        onClick={() => onMealClick(dayPlan.day, "dinner")}
        onClear={() => onMealClear(dayPlan.day, "dinner")}
        onRemove={(index) => onRemoveRecipe("dinner", index)}
      />
    </div>
  </div>
</div>
