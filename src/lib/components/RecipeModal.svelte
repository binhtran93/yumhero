<script lang="ts">
  import { Search, Plus, Minus, X, Check } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { mockRecipes } from "$lib/data/mockRecipes";
  import { twMerge } from "tailwind-merge";
  import { fade, scale } from "svelte/transition";
  import Modal from "$lib/components/Modal.svelte";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    currentRecipes?: Recipe[];
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
  }

  let {
    isOpen,
    mealType,
    currentRecipes = [],
    onClose,
    onSelect,
  }: Props = $props();

  let searchQuery = $state("");

  // Track quantity: Recipe ID -> { recipe, count }
  let selection = $state<Map<string, { recipe: Recipe; count: number }>>(
    new Map(),
  );

  // Reset selection when modal opens
  $effect(() => {
    if (isOpen) {
      const newSelection = new Map<string, { recipe: Recipe; count: number }>();
      currentRecipes.forEach((recipe) => {
        // If the recipe is already in the map (duplicate entries in array), add to count
        // But typically currentRecipes comes from the plan which merges them.
        // We act as if currentRecipes is the source of truth.
        // However, plan structure is array of recipes.
        // Let's assume unique IDs in the passed currentRecipes for now, or handle duplicates.
        const existing = newSelection.get(recipe.id);
        const count = recipe.servings || 1;
        if (existing) {
          existing.count += count;
        } else {
          newSelection.set(recipe.id, { recipe, count });
        }
      });
      selection = newSelection;
      searchQuery = "";
    }
  });

  const getCount = (recipeId: string) => {
    return selection.get(recipeId)?.count || 0;
  };

  const increment = (recipe: Recipe) => {
    const current = selection.get(recipe.id);
    if (current) {
      selection = new Map(
        selection.set(recipe.id, { recipe, count: current.count + 1 }),
      );
    } else {
      selection = new Map(selection.set(recipe.id, { recipe, count: 1 }));
    }
  };

  const decrement = (recipe: Recipe) => {
    const current = selection.get(recipe.id);
    if (current) {
      if (current.count > 1) {
        selection = new Map(
          selection.set(recipe.id, { recipe, count: current.count - 1 }),
        );
      } else {
        // Remove if count becomes 0
        const newMap = new Map(selection);
        newMap.delete(recipe.id);
        selection = newMap;
      }
    }
  };

  // Directly remove via "x" on tag
  const removeSelection = (recipeId: string) => {
    const newMap = new Map(selection);
    newMap.delete(recipeId);
    selection = newMap;
  };

  const handleDone = () => {
    if (selection.size > 0) {
      // Flatten the map into a list of recipes based on count
      const result: Recipe[] = [];
      for (const { recipe, count } of selection.values()) {
        for (let i = 0; i < count; i++) {
          result.push(recipe);
        }
      }
      onSelect(result);
    }
    onClose();
  };

  let filteredRecipes = $derived(
    mockRecipes.filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );
</script>

{#snippet customHeader()}
  <div
    class="p-6 pb-2 flex items-start justify-between shrink-0 border-b border-border-default bg-bg-surface"
  >
    <div>
      <h2 class="text-2xl font-display font-bold text-text-primary">
        Add to <span class="capitalize text-action-primary">{mealType}</span>
      </h2>
    </div>
    <button
      onclick={onClose}
      class="p-2 -mr-2 -mt-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-full transition-colors"
      aria-label="Close"
    >
      <X size={20} />
    </button>
  </div>
{/snippet}

<Modal {isOpen} {onClose} class="max-w-lg" header={customHeader}>
  <!-- Search & Selected -->
  <div
    class="flex flex-col border-b border-border-default bg-bg-surface shrink-0"
  >
    <div class="p-4">
      <div class="relative">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          size={18}
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder={`Search recipes...`}
          class="w-full pl-11 pr-4 py-3 text-sm bg-bg-accent-subtle border border-border-default rounded-2xl focus:outline-none focus:border-action-primary text-text-primary transition-colors placeholder:text-text-secondary/50"
        />
      </div>
    </div>

    <!-- Selected Recipes Display -->
    {#if selection.size > 0}
      <div class="px-4 pb-4 overflow-x-auto">
        <div class="flex flex-wrap gap-2">
          {#each selection.values() as { recipe, count } (recipe.id)}
            <button
              onclick={() => removeSelection(recipe.id)}
              class="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-action-primary/10 border border-action-primary/20 text-action-primary text-[11px] font-bold animate-in fade-in zoom-in duration-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer group"
            >
              <span>{recipe.title} {count > 1 ? `(${count})` : ""}</span>
              <X size={14} class="p-0.5" strokeWidth={3} />
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- List -->
  <div
    class="flex-1 overflow-y-auto bg-bg-surface p-2 flex flex-col gap-2 h-96"
  >
    {#each filteredRecipes as recipe (recipe.id)}
      {@const count = getCount(recipe.id)}
      <div
        class={twMerge(
          "flex items-center justify-between px-4 py-3 rounded-2xl transition-all border cursor-pointer",
          count > 0
            ? "bg-action-primary/5 border-action-primary/20"
            : "bg-transparent border-transparent hover:bg-bg-surface-hover",
        )}
        onclick={() => increment(recipe)}
        onkeydown={(e) => e.key === "Enter" && increment(recipe)}
        role="button"
        tabindex="0"
      >
        <!-- Info area -->
        <div class="flex-1 flex items-center gap-2">
          {#if count > 0}
            <div
              class="flex items-center justify-center w-5 h-5 rounded-full bg-action-primary text-white shrink-0"
              transition:scale
            >
              <Check size={12} strokeWidth={3} />
            </div>
          {/if}
          <h3
            class={twMerge(
              "font-display font-bold transition-colors text-sm",
              count > 0 ? "text-action-primary" : "text-text-primary",
            )}
          >
            {recipe.title}
          </h3>
        </div>

        <!-- Quantity Controls -->
        <div class="flex items-center gap-1">
          {#if count > 0}
            <div
              class="flex items-center bg-white border border-border-default rounded-lg shadow-sm overflow-hidden h-8"
            >
              <!-- Decrement -->
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  decrement(recipe);
                }}
                class="w-8 h-full flex items-center justify-center text-text-secondary hover:bg-bg-surface-hover hover:text-action-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={count === 0}
              >
                <Minus size={14} strokeWidth={3} />
              </button>

              <!-- Count -->
              <div
                class="w-6 h-full flex items-center justify-center text-sm font-bold text-text-primary border-x border-border-default/50 bg-bg-accent-subtle"
              >
                {count}
              </div>

              <!-- Increment -->
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  increment(recipe);
                }}
                class="w-8 h-full flex items-center justify-center text-text-secondary hover:bg-bg-surface-hover hover:text-action-primary transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          {:else}
            <!-- Initial Add Button -->
            <button
              onclick={() => increment(recipe)}
              class="p-2 rounded-full bg-bg-surface text-text-secondary hover:bg-action-primary hover:text-white transition-all shadow-sm border border-border-default hover:border-action-primary"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          {/if}
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
      Done
    </button>
  </div>
</Modal>
