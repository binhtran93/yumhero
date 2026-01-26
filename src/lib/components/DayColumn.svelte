<script lang="ts">
  import type { DayPlan, MealType } from "$lib/types";
  import MealSlot from "./MealSlot.svelte";

  interface Props {
    dayPlan: DayPlan;
    isToday?: boolean;
    onMealClick: (day: string, type: MealType) => void;
    onMealClear: (day: string, type: MealType) => void;
  }

  let { dayPlan, isToday = false, onMealClick, onMealClear }: Props = $props();
</script>

<div
  class="flex flex-col h-full w-[85vw] md:w-[320px] bg-bg-surface overflow-y-auto"
>
  <!-- Sticky Header -->
  <div
    class={`sticky top-0 z-10 text-center py-6 border-b border-border-default ${isToday ? "bg-action-primary text-white" : "bg-bg-surface text-text-primary"}`}
  >
    <span class="text-lg font-display font-bold">
      {dayPlan.day}
    </span>
    {#if isToday}
      <div
        class="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-80"
        >Today</div
      >
    {/if}
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
      />
    </div>
  </div>
</div>
