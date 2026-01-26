<script lang="ts">
  import type { DayPlan, MealType } from '$lib/types';
  import MealSlot from './MealSlot.svelte';

  interface Props {
    dayPlan: DayPlan;
    isToday?: boolean;
    onMealClick: (day: string, type: MealType) => void;
    onMealClear: (day: string, type: MealType) => void;
  }

  let { dayPlan, isToday = false, onMealClick, onMealClear }: Props = $props();
</script>

<div class="flex flex-col h-full border-r border-border-subtle last:border-r-0 min-w-0 bg-canvas">
  <!-- Header -->
  <div class={`p-4 border-b border-border-strong flex flex-col justify-between h-32 ${isToday ? 'bg-surface' : ''}`}>
    <span class={`text-xs uppercase tracking-widest font-bold ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
        {dayPlan.day}
    </span>
    {#if isToday}
        <div class="w-1.5 h-1.5 bg-accent rounded-full mb-1"></div>
    {/if}
  </div>
  
  <!-- Slots -->
  <div class="flex-1 flex flex-col">
    <MealSlot 
      type="breakfast" 
      recipe={dayPlan.meals.breakfast} 
      onClick={() => onMealClick(dayPlan.day, 'breakfast')}
      onClear={() => onMealClear(dayPlan.day, 'breakfast')}
    />
    
    <MealSlot 
      type="lunch" 
      recipe={dayPlan.meals.lunch} 
      onClick={() => onMealClick(dayPlan.day, 'lunch')}
       onClear={() => onMealClear(dayPlan.day, 'lunch')}
    />
    
    <MealSlot 
      type="dinner" 
      recipe={dayPlan.meals.dinner} 
      onClick={() => onMealClick(dayPlan.day, 'dinner')}
       onClear={() => onMealClear(dayPlan.day, 'dinner')}
    />
  </div>
</div>
