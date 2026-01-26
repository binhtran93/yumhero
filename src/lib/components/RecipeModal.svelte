<script lang="ts">
  import { X, Search, Check } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { mockRecipes } from "$lib/data/mockRecipes";
  import { twMerge } from "tailwind-merge";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
  }

  let { isOpen, mealType, onClose, onSelect }: Props = $props();

  let selectedRecipes = $state<Recipe[]>([]);

  // Reset selection when modal opens
  $effect(() => {
    if (isOpen) {
      selectedRecipes = [];
    }
  });

  const handleSelect = (recipe: Recipe) => {
    // Prevent duplicates in current selection if desired, or allow.
    // Assuming simple push for now, or check existence.
    if (!selectedRecipes.find((r) => r.id === recipe.id)) {
      selectedRecipes.push(recipe);
    }
  };

  const handleDone = () => {
    if (selectedRecipes.length > 0) {
      onSelect(selectedRecipes);
    }
    onClose();
  };

  // Helper for tag colors
  const getTagColor = (tag: string) => {
    const char = tag.charCodeAt(0);
    if (char % 4 === 0)
      return "bg-orange-100 text-orange-800 border-orange-200";
    if (char % 4 === 1) return "bg-lime-100 text-lime-800 border-lime-200";
    if (char % 4 === 2) return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Soft Backdrop -->
    <div
      class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      onclick={onClose}
      onkeydown={(e) => e.key === "Escape" && onClose()}
      role="button"
      tabindex="0"
    ></div>

    <!-- Modal Content -->
    <div
      class="relative z-10 w-full max-w-lg bg-bg-surface border border-border-strong shadow-2xl flex flex-col max-h-[85vh] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-border-default flex items-center justify-between bg-bg-surface shrink-0"
      >
        <span class="text-sm font-display font-bold text-text-primary">
          Add to <span class="capitalize text-action-primary">{mealType}</span>
        </span>
        <button
          onclick={onClose}
          class="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Search & Selected -->
      <div
        class="flex flex-col border-b border-border-default bg-bg-surface shrink-0"
      >
        <div class="px-6 py-4">
          <div class="relative">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              size={18}
            />
            <input
              autofocus
              type="text"
              placeholder={`Search recipes...`}
              class="w-full pl-11 pr-4 py-3 text-sm bg-bg-accent-subtle border border-border-default rounded-2xl focus:outline-none focus:border-action-primary text-text-primary transition-colors placeholder:text-text-secondary/50"
            />
          </div>
        </div>

        <!-- Selected Recipes Display -->
        {#if selectedRecipes.length > 0}
          <div class="px-6 pb-4 overflow-x-auto">
            <div class="flex flex-wrap gap-2">
              {#each selectedRecipes as recipe}
                <div
                  class="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-action-primary/10 border border-action-primary/20 text-action-primary text-[11px] font-bold animate-in fade-in zoom-in duration-200"
                >
                  <span>{recipe.title}</span>
                  <Check size={12} strokeWidth={3} />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto bg-bg-surface p-2">
        {#each mockRecipes as recipe (recipe.id)}
          <div
            onclick={() => handleSelect(recipe)}
            onkeydown={(e) => e.key === "Enter" && handleSelect(recipe)}
            role="button"
            tabindex="0"
            class="cursor-pointer group flex items-center justify-between p-4 rounded-2xl hover:bg-bg-surface-hover transition-colors"
          >
            <div>
              <h3
                class="font-bold text-text-primary group-hover:text-action-primary transition-colors font-display"
              >
                {recipe.title}
              </h3>
              <div class="flex gap-2 mt-2">
                {#each recipe.tags as tag}
                  <span
                    class={twMerge(
                      "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                      getTagColor(tag),
                    )}
                  >
                    {tag}
                  </span>
                {/each}
              </div>
            </div>
            <div
              class="opacity-0 group-hover:opacity-100 text-action-primary transition-opacity bg-bg-surface p-2 rounded-full shadow-sm"
            >
              <Check size={18} strokeWidth={3} />
            </div>
          </div>
        {/each}
      </div>

      <!-- Done Button Footer -->
      <div class="p-4 border-t border-border-default bg-bg-surface shrink-0">
        <button
          onclick={handleDone}
          class="w-full py-3 rounded-xl bg-action-primary text-white font-bold text-sm shadow-sm hover:bg-action-primary/90 transition-colors"
        >
          Done {selectedRecipes.length > 0 ? `(${selectedRecipes.length})` : ""}
        </button>
      </div>
    </div>
  </div>
{/if}
