<script lang="ts">
  import type { DayPlan, MealType } from "$lib/types";
  import MealSlot from "./MealSlot.svelte";
  import { twMerge } from "tailwind-merge";
  import { X } from "lucide-svelte";

  interface Props {
    dayPlan: DayPlan;
    isToday?: boolean;
    index?: number;
    onMealClick: (day: string, type: MealType) => void;
    onMealClear: (day: string, type: MealType) => void;
    onRemoveRecipe: (type: MealType, index: number) => void;
    isLoading?: boolean;
    isCompact?: boolean;
  }

  let {
    dayPlan,
    isToday = false,
    index = 0,
    onMealClick,
    onMealClear,
    onRemoveRecipe,
    isLoading = false,
    isCompact = false,
  }: Props = $props();

  const mealSections = [
    {
      type: "breakfast" as const,
      label: "Breakfast",
      accentClass: "bg-accent-breakfast",
    },
    { type: "lunch" as const, label: "Lunch", accentClass: "bg-accent-lunch" },
    {
      type: "dinner" as const,
      label: "Dinner",
      accentClass: "bg-accent-dinner",
    },
  ];
</script>

<div
  class={twMerge(
    "flex flex-col h-full overflow-y-auto transition-all duration-300",
    index % 2 !== 0 ? "bg-bg-default/50 md:bg-bg-surface" : "bg-bg-surface",
    isCompact ? "w-50" : "w-[90vw] md:w-[320px]",
  )}
>
  <!-- Sticky Header -->
  <div
    class={twMerge(
      "sticky top-0 z-10 border-b border-border-default bg-bg-surface text-text-primary shadow-sm transition-all duration-300",
      isCompact ? "py-2" : "py-4 md:py-6",
    )}
  >
    {#if isToday}
      <div class="absolute top-0 left-0 right-0 h-1 bg-action-primary"></div>
    {/if}
    <div class="flex items-center justify-center gap-2">
      <span
        class={twMerge(
          "font-display font-bold transition-all duration-300",
          isToday && "text-action-primary",
          isCompact ? "text-sm" : "text-lg",
        )}
      >
        {dayPlan.day}
      </span>
      {#if isToday}
        <span
          class={twMerge(
            "font-bold uppercase tracking-wider text-action-primary/80 bg-action-primary/10 rounded-md transition-all duration-300",
            isCompact ? "text-[8px] px-1 py-0.5" : "text-[10px] px-1.5 py-0.5",
          )}>Today</span
        >
      {/if}
    </div>
  </div>

  <!-- Slots Container -->
  <div
    class={twMerge(
      "flex-1 flex flex-col transition-all duration-300",
      isCompact ? "p-2 gap-3" : "p-4 md:p-6 gap-5 md:gap-8",
    )}
  >
    {#each mealSections as section}
      <div class="flex flex-col gap-3">
        {#if !isCompact}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class={twMerge(
                  "w-3 h-3 rounded-full shadow-sm",
                  section.accentClass,
                )}
              ></div>
              <span
                class="text-xs font-bold text-text-primary uppercase tracking-widest"
                >{section.label}</span
              >
            </div>
            {#if dayPlan.meals[section.type].length > 0}
              <button
                onclick={() => onMealClear(dayPlan.day, section.type)}
                class="text-text-secondary hover:text-red-600 transition-colors"
                title={`Clear ${section.label}`}
              >
                <X size={14} />
              </button>
            {/if}
          </div>
        {/if}
        <MealSlot
          type={section.type}
          recipes={dayPlan.meals[section.type]}
          onClick={() => onMealClick(dayPlan.day, section.type)}
          onClear={() => onMealClear(dayPlan.day, section.type)}
          onRemove={(index) => onRemoveRecipe(section.type, index)}
          {isLoading}
          {isCompact}
        />
      </div>
    {/each}
  </div>
</div>
