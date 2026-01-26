<script lang="ts">
  import { Search, Check, Plus, X } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { mockRecipes } from "$lib/data/mockRecipes";
  import { twMerge } from "tailwind-merge";
  import Modal from "$lib/components/Modal.svelte";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
  }

  let { isOpen, mealType, onClose, onSelect }: Props = $props();

  let selectedRecipes = $state<Recipe[]>([]);
  let servings = $state<Map<string, number>>(new Map());

  // Reset selection when modal opens
  $effect(() => {
    if (isOpen) {
      selectedRecipes = [];
      servings = new Map();
    }
  });

  const getServings = (recipeId: string) => {
    return servings.get(recipeId) || 1;
  };

  const updateServings = (recipeId: string, delta: number) => {
    const current = getServings(recipeId);
    const newValue = Math.max(1, current + delta);
    servings = new Map(servings.set(recipeId, newValue));
  };

  const isSelected = (recipe: Recipe) => {
    return selectedRecipes.some((r) => r.id === recipe.id);
  };

  const handleSelect = (recipe: Recipe) => {
    if (isSelected(recipe)) {
      // Remove
      selectedRecipes = selectedRecipes.filter((r) => r.id !== recipe.id);
    } else {
      // Add
      selectedRecipes.push(recipe);
    }
  };

  const handleDone = () => {
    if (selectedRecipes.length > 0) {
      // Add servings to each recipe
      const recipesWithServings = selectedRecipes.map((recipe) => ({
        ...recipe,
        servings: getServings(recipe.id),
      }));
      onSelect(recipesWithServings);
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

<Modal
  {isOpen}
  {onClose}
  class="max-w-lg"
  showCloseButton={false}
  headerClass="border-b border-border-default bg-bg-surface"
>
  <!-- Custom Header Content to match design (with title passed differently if needed, but here we construct it manually to match "Add to MealType") -->
  {#snippet titleOverride()}
    <!-- Just in case, but we can reuse header logic or replace it. I'll pass title=null and build custom header for strict parity? Or just use slot? My Modal has limited header. Lets bypass standard header to keep custom "Add to {mealType}" -->
  {/snippet}

  <!-- Header (Replacing standard one to keep "Add to {mealType} styling) -->
  <div
    class="p-6 border-b border-border-default flex items-center justify-between bg-bg-surface shrink-0"
  >
    <span class="text-sm font-display font-bold text-text-primary">
      Add to <span class="capitalize text-action-primary">{mealType}</span>
    </span>
    <button
      onclick={onClose}
      class="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-full transition-colors"
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
            <button
              onclick={() => handleSelect(recipe)}
              class="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-action-primary/10 border border-action-primary/20 text-action-primary text-[11px] font-bold animate-in fade-in zoom-in duration-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer group"
            >
              <span>{recipe.title}</span>
              <X size={12} strokeWidth={3} />
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
    <!-- Fixed height or relative? Modal handles flex-1 overflow, but we need to ensure parent flex works. Modal body is flex-1 overflow-auto. -->
    {#each mockRecipes as recipe (recipe.id)}
      <div
        onclick={() => handleSelect(recipe)}
        onkeydown={(e) => e.key === "Enter" && handleSelect(recipe)}
        role="button"
        tabindex="0"
        class={twMerge(
          "cursor-pointer group flex items-center justify-between px-4 py-2 rounded-2xl transition-all border",
          isSelected(recipe)
            ? "bg-action-primary/5 border-action-primary/20"
            : "bg-transparent border-transparent hover:bg-bg-surface-hover",
        )}
      >
        <div>
          <h3
            class={twMerge(
              "font-display font-bold transition-colors",
              isSelected(recipe)
                ? "text-action-primary"
                : "text-text-primary group-hover:text-action-primary",
            )}
          >
            {recipe.title}
          </h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-text-secondary font-medium"
              >Servings:</span
            >
            <div
              class="flex items-center gap-1 bg-bg-accent-subtle border border-border-default rounded-lg overflow-hidden"
            >
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  updateServings(recipe.id, -1);
                }}
                class="px-2 py-1 text-text-secondary hover:bg-bg-surface-hover hover:text-action-primary transition-colors"
              >
                <span class="text-sm font-bold">−</span>
              </button>
              <span
                class="px-2 py-1 text-xs font-bold text-text-primary min-w-6 text-center"
                >{getServings(recipe.id)}</span
              >
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  updateServings(recipe.id, 1);
                }}
                class="px-2 py-1 text-text-secondary hover:bg-bg-surface-hover hover:text-action-primary transition-colors"
              >
                <span class="text-sm font-bold">+</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Selection Icon -->
        <div
          class={twMerge(
            "p-2 rounded-full shadow-sm transition-all",
            isSelected(recipe)
              ? "bg-action-primary text-white scale-100 opacity-100"
              : "bg-bg-surface text-text-secondary opacity-100 group-hover:text-action-primary group-hover:bg-white",
          )}
        >
          {#if isSelected(recipe)}
            <Check size={18} strokeWidth={3} />
          {:else}
            <Plus size={18} strokeWidth={3} />
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
      Done {selectedRecipes.length > 0 ? `(${selectedRecipes.length})` : ""}
    </button>
  </div>
</Modal>
