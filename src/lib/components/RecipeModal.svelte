<script lang="ts">
  import { X, Search, Check } from 'lucide-svelte';
  import type { Recipe, MealType } from '$lib/types';
  import { mockRecipes } from '$lib/data/mockRecipes';

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
  }

  let { isOpen, mealType, onClose, onSelect }: Props = $props();
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Dimmed Backdrop -->
      <div 
        class="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
        onclick={onClose}
        onkeydown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabindex="0"
      ></div>
      
      <!-- Modal Content - Minimalist -->
      <div class="relative z-10 w-full max-w-lg bg-surface border border-border-strong shadow-2xl flex flex-col max-h-[60vh]">
        
        <!-- Header -->
        <div class="p-4 border-b border-border-subtle flex items-center justify-between">
            <span class="text-xs uppercase font-bold tracking-widest text-text-secondary">Select Recipe</span>
            <button onclick={onClose} class="text-text-primary hover:opacity-50">
                <X size={16} />
            </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-border-subtle bg-canvas">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input 
              autofocus
              type="text" 
              placeholder={`Search for a ${mealType} recipe...`}
              class="w-full pl-8 pr-4 py-1.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-text-secondary/50"
            />
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          {#each mockRecipes as recipe (recipe.id)}
            <div 
              onclick={() => onSelect(recipe)}
              onkeydown={(e) => e.key === 'Enter' && onSelect(recipe)}
              role="button"
              tabindex="0"
              class="cursor-pointer group flex items-center justify-between p-4 border-b border-border-subtle hover:bg-canvas last:border-b-0 transition-colors"
            >
              <div>
                <h3 class="font-medium text-text-primary group-hover:underline decoration-1 underline-offset-2">{recipe.title}</h3>
                <div class="flex gap-2 mt-1"> 
                    {#each recipe.tags as tag}
                        <span class="text-[10px] text-text-secondary uppercase">{tag}</span>
                    {/each}
                </div>
              </div>
              <div class="opacity-0 group-hover:opacity-100 text-text-primary">
                  <Check size={16} />
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
{/if}
