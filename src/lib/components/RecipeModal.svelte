<script lang="ts">
  import { X, Search, Check } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { mockRecipes } from "$lib/data/mockRecipes";
  import { twMerge } from "tailwind-merge";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
  }

  let { isOpen, mealType, onClose, onSelect }: Props = $props();

  // Helper for tag colors
  const getTagColor = (tag: string) => {
    const char = tag.charCodeAt(0);
    if (char % 4 === 0) return "bg-rose-100 text-rose-700";
    if (char % 4 === 1) return "bg-sky-100 text-sky-700";
    if (char % 4 === 2) return "bg-violet-100 text-violet-700";
    return "bg-lime-100 text-lime-700";
  };
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Dimmed Backdrop -->
    <div
      class="absolute inset-0 bg-bg-default/90 backdrop-blur-md transition-opacity"
      onclick={onClose}
      onkeydown={(e) => e.key === "Escape" && onClose()}
      role="button"
      tabindex="0"
    ></div>

    <!-- Modal Content -->
    <div
      class="relative z-10 w-full max-w-lg bg-bg-surface border border-border-strong shadow-2xl flex flex-col max-h-[60vh] rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div
        class="p-4 border-b border-border-default flex items-center justify-between bg-bg-surface"
      >
        <span
          class="text-xs uppercase font-bold tracking-widest text-text-secondary"
        >
          Select <span class="text-text-primary">{mealType}</span> Recipe
        </span>
        <button
          onclick={onClose}
          class="text-text-primary hover:opacity-50 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 py-3 border-b border-border-default bg-bg-surface">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={16}
          />
          <input
            autofocus
            type="text"
            placeholder={`Search for a ${mealType} recipe...`}
            class="w-full pl-10 pr-4 py-2 text-sm bg-bg-accent-subtle border border-border-default rounded-lg focus:outline-none focus:border-text-primary text-text-primary transition-colors placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto bg-bg-surface">
        {#each mockRecipes as recipe (recipe.id)}
          <div
            onclick={() => onSelect(recipe)}
            onkeydown={(e) => e.key === "Enter" && onSelect(recipe)}
            role="button"
            tabindex="0"
            class="cursor-pointer group flex items-center justify-between p-4 border-b border-border-default hover:bg-bg-accent-subtle last:border-b-0 transition-colors"
          >
            <div>
              <h3
                class="font-bold text-text-primary group-hover:text-action-primary transition-colors"
              >
                {recipe.title}
              </h3>
              <div class="flex gap-2 mt-1.5">
                {#each recipe.tags as tag}
                  <span
                    class="text-[10px] px-2 py-0.5 rounded bg-bg-accent-subtle text-text-secondary border border-border-default font-bold uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                {/each}
              </div>
            </div>
            <div
              class="opacity-0 group-hover:opacity-100 text-action-primary transition-opacity"
            >
              <Check size={18} strokeWidth={3} />
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
