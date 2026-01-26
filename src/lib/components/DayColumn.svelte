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

<div class="flex flex-col h-full min-w-0">
  <!-- Compact Header -->
  <div
    class={`mb-2 text-center py-1 rounded-t-lg mx-1 ${isToday ? "bg-black text-white" : "text-text-secondary"}`}
  >
    <span class="text-[10px] uppercase tracking-widest font-bold">
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
