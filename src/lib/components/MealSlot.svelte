<script lang="ts">
  import { Plus, X } from 'lucide-svelte';
  import type { Recipe, MealType } from '$lib/types';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    type: MealType;
    recipe: Recipe | null;
    onClick: () => void;
    onClear?: (e: MouseEvent) => void;
  }

  let { type, recipe, onClick, onClear }: Props = $props();
</script>

<div
  onclick={onClick}
  onkeydown={(e) => e.key === 'Enter' && onClick()}
  role="button"
  tabindex="0"
  class={twMerge(
    "group relative flex flex-col w-full h-[120px] transition-all duration-200 cursor-pointer border-b border-dashed border-border-subtle last:border-b-0",
    "hover:bg-surface hover:pl-1", // Subtle interaction
    recipe ? "bg-white" : ""
  )}
>
  <div class="flex-1 p-3 flex flex-col justify-start">
    <span class="text-[10px] uppercase font-semibold text-text-secondary tracking-widest mb-1 opacity-50">{type}</span>
    
    {#if recipe}
      <div class="animate-in fade-in duration-200">
         <h4 class="text-sm font-medium text-text-primary leading-tight">{recipe.title}</h4>
         <div class="flex gap-2 mt-2">
            {#each recipe.tags.slice(0, 2) as tag}
                <span class="text-[9px] border border-border-strong px-1 lg:px-2 rounded-sm text-text-secondary uppercase">
                    {tag}
                </span>
            {/each}
         </div>
         
         {#if onClear}
            <button 
              onclick={(e) => {
                e.stopPropagation();
                onClear(e);
              }}
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-600 transition-colors"
            >
              <X size={12} />
            </button>
         {/if}
      </div>
    {:else}
      <div class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus size={16} class="text-text-secondary" />
      </div>
    {/if}
  </div>
</div>
