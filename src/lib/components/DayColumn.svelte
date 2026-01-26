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
  class="flex flex-col h-full w-[85vw] md:w-[320px] bg-gray-50 border-r border-gray-100 last:border-r-0 overflow-y-auto"
>
  <!-- Sticky Header -->
  <div
    class={`sticky top-0 z-10 text-center py-3 border-b border-gray-200 backdrop-blur-sm ${isToday ? "bg-black/5" : "bg-gray-50/90"}`}
  >
    <span
      class={`text-xs uppercase tracking-widest font-black ${isToday ? "text-black" : "text-gray-500"}`}
    >
      {dayPlan.day}
    </span>
    {#if isToday}
      <span
        class="ml-2 px-1.5 py-0.5 rounded-full bg-black text-white text-[9px] font-bold uppercase"
        >Today</span
      >
    {/if}
  </div>

  <!-- Slots Container -->
  <div class="flex-1 flex flex-col p-4 gap-6">
    <!-- Breakfast Section -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
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
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <div class="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
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
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 pb-1 border-b border-gray-200">
        <div class="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
        <span
          class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
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
