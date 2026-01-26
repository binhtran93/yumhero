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
  class="flex flex-col h-full w-[85vw] md:w-[320px] bg-white overflow-y-auto"
>
  <!-- Sticky Header -->
  <div
    class={`sticky top-0 z-10 text-center py-4 border-b border-gray-300 ${isToday ? "bg-black text-white" : "bg-white text-black"}`}
  >
    <span class="text-sm uppercase tracking-widest font-black">
      {dayPlan.day}
    </span>
    {#if isToday}
      <span
        class="ml-2 px-2 py-0.5 rounded-sm bg-white text-black text-[10px] font-bold uppercase border border-black"
        >Today</span
      >
    {/if}
  </div>

  <!-- Slots Container -->
  <div class="flex-1 flex flex-col p-4 gap-6">
    <!-- Breakfast Section -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2 pb-1 border-b-2 border-black">
        <div class="w-2 h-2 bg-orange-600"></div>
        <span class="text-xs font-black text-black uppercase tracking-wider"
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
      <div class="flex items-center gap-2 pb-1 border-b-2 border-black">
        <div class="w-2 h-2 bg-teal-700"></div>
        <span class="text-xs font-black text-black uppercase tracking-wider"
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
      <div class="flex items-center gap-2 pb-1 border-b-2 border-black">
        <div class="w-2 h-2 bg-indigo-700"></div>
        <span class="text-xs font-black text-black uppercase tracking-wider"
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
