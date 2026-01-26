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

<div class="flex flex-col min-w-0 h-auto">
  <!-- Compact Header -->
  <!-- Compact Header (Warm & Friendly) -->
  <div
    class={`mb-3 text-center py-2 rounded-2xl mx-1 shadow-sm transition-all ${
      isToday
        ? "bg-rose-500 text-white transform -translate-y-1 shadow-md"
        : "bg-white text-stone-600"
    }`}
  >
    <span class="text-xs uppercase tracking-wider font-bold">
      {dayPlan.day.substring(0, 3)}
    </span>
  </div>

  <!-- Slots Container -->
  <div class="flex-1 flex flex-col gap-3 px-1 pb-4">
    <MealSlot
      type="breakfast"
      recipes={dayPlan.meals.breakfast}
      onClick={() => onMealClick(dayPlan.day, "breakfast")}
      onClear={() => onMealClear(dayPlan.day, "breakfast")}
    />

    <MealSlot
      type="lunch"
      recipes={dayPlan.meals.lunch}
      onClick={() => onMealClick(dayPlan.day, "lunch")}
      onClear={() => onMealClear(dayPlan.day, "lunch")}
    />

    <MealSlot
      type="dinner"
      recipes={dayPlan.meals.dinner}
      onClick={() => onMealClick(dayPlan.day, "dinner")}
      onClear={() => onMealClear(dayPlan.day, "dinner")}
    />
  </div>
</div>
