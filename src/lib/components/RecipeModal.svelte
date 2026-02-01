<script lang="ts">
  import { Search, Plus, Minus, X, UtensilsCrossed } from "lucide-svelte";
  import type {
    Recipe,
    MealType,
    LeftoverItem,
    PlannedLeftover,
  } from "$lib/types";
  import { availableLeftovers } from "$lib/stores/leftovers";

  import { twMerge } from "tailwind-merge";
  import { fade } from "svelte/transition";
  import Modal from "$lib/components/Modal.svelte";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    currentRecipes?: Recipe[];
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
    onSelectLeftover?: (leftover: LeftoverItem) => void;
    availableRecipes?: Recipe[];
  }

  let {
    isOpen,
    mealType,
    currentRecipes = [],
    onClose,
    onSelect,
    onSelectLeftover,
    availableRecipes = [],
  }: Props = $props();

  let searchQuery = $state("");

  // Track selection: Recipe ID -> Recipe
  let selection = $state<Map<string, Recipe>>(new Map());

  // Reset selection when modal opens
  $effect(() => {
    if (isOpen) {
      const newSelection = new Map<string, Recipe>();
      // Initialize with existing recipes - selection in modal is now just a set
      currentRecipes.forEach((recipe: any) => {
        if (!newSelection.has(recipe.id)) {
          newSelection.set(recipe.id, recipe);
        }
      });
      selection = newSelection;
      searchQuery = "";
    }
  });

  const isSelected = (recipeId: string) => {
    return selection.has(recipeId);
  };

  const toggleSelection = (recipe: Recipe) => {
    const newMap = new Map(selection);
    if (newMap.has(recipe.id)) {
      newMap.delete(recipe.id);
    } else {
      newMap.set(recipe.id, recipe);
    }
    selection = newMap;
  };

  // Directly remove via "x" on tag
  const removeSelection = (recipeId: string) => {
    const newMap = new Map(selection);
    newMap.delete(recipeId);
    selection = newMap;
  };

  const handleDone = () => {
    if (selection.size >= 0) {
      // Return the current list of selected recipes
      onSelect(Array.from(selection.values()));
    }
    onClose();
  };

  let matchingRecipes = $derived(
    availableRecipes.filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  let suggestedRecipes = $derived(
    matchingRecipes.filter(
      (r) =>
        mealType &&
        mealType !== "note" &&
        r.mealTypes?.includes(mealType as MealType),
    ),
  );

  let otherRecipes = $derived(
    matchingRecipes.filter(
      (r) =>
        !mealType ||
        mealType === "note" ||
        !r.mealTypes?.includes(mealType as MealType),
    ),
  );

  // Filter available leftovers by search query
  let matchingLeftovers = $derived(
    $availableLeftovers.filter((l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // Handle leftover selection
  const handleLeftoverSelect = (leftover: LeftoverItem) => {
    if (onSelectLeftover) {
      onSelectLeftover(leftover);
      onClose();
    }
  };

  const colors = $derived(
    mealType && mealType !== "note"
      ? {
          text: `text-accent-${mealType}`,
          bg: `bg-accent-${mealType}`,
          border: `border-accent-${mealType}`,
          hoverBg: `hover:bg-accent-${mealType}`,
          focusBorder: `focus:border-accent-${mealType}`,
          hoverText: `hover:text-accent-${mealType}`,
          hoverBorder: `hover:border-accent-${mealType}`,
          bgFaint: `bg-accent-${mealType}-bg`,
        }
      : {
          text: "text-app-primary",
          bg: "bg-app-primary",
          border: "border-app-primary",
          hoverBg: "hover:bg-app-primary",
          focusBorder: "focus:border-app-primary",
          hoverText: "hover:text-app-primary",
          hoverBorder: "hover:border-app-primary",
          bgFaint: "bg-app-primary/5",
        },
  );
</script>

{#snippet recipeItem(recipe: Recipe)}
  {@const selected = isSelected(recipe.id)}
  <div
    class={twMerge(
      "flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer gap-2 transition-colors shrink-0",
      selected
        ? `${colors.bgFaint}`
        : twMerge(
            "bg-transparent border-transparent hover:bg-app-surface-hover",
          ),
    )}
    onclick={() => toggleSelection(recipe)}
    onkeydown={(e) => e.key === "Enter" && toggleSelection(recipe)}
    role="button"
    tabindex="0"
  >
    <!-- Info area -->
    <div class="flex-1 flex items-center gap-2">
      <h3
        class={twMerge(
          "font-display font-bold transition-colors text-sm",
          selected ? colors.text : "text-app-text",
        )}
      >
        {recipe.title}
      </h3>
    </div>

    <!-- Selection Indicator -->
    <div class="flex items-center">
      {#if selected}
        <div
          class={twMerge(
            "p-1.5 rounded-full text-white shadow-sm border",
            colors.bg,
            colors.border,
          )}
        >
          <Plus
            size={16}
            strokeWidth={3}
            class="rotate-45"
            aria-hidden="true"
          />
        </div>
      {:else}
        <div
          class="p-1.5 rounded-full bg-app-surface text-app-text-muted transition-all shadow-sm border border-app-border"
        >
          <Plus size={16} strokeWidth={3} />
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet leftoverItem(leftover: LeftoverItem)}
  <div
    class="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer gap-2 transition-colors shrink-0 border-2 border-dashed border-app-border hover:border-app-primary/50 hover:bg-app-surface-hover"
    onclick={() => handleLeftoverSelect(leftover)}
    onkeydown={(e) => e.key === "Enter" && handleLeftoverSelect(leftover)}
    role="button"
    tabindex="0"
  >
    <!-- Info area -->
    <div class="flex-1 flex items-center gap-2">
      <UtensilsCrossed size={14} class="text-app-text-muted shrink-0" />
      <h3
        class="font-display font-bold transition-colors text-sm text-app-text"
      >
        {leftover.title}
      </h3>
      <span class="text-[10px] text-app-text-muted/70 uppercase font-medium"
        >leftover</span
      >
    </div>

    <!-- Add Indicator -->
    <div class="flex items-center">
      <div
        class="p-1.5 rounded-full bg-app-surface text-app-text-muted transition-all shadow-sm border border-app-border"
      >
        <Plus size={16} strokeWidth={3} />
      </div>
    </div>
  </div>
{/snippet}

{#snippet customHeader()}
  <div
    class="p-6 pb-2 flex items-start justify-between shrink-0 border-b border-app-border bg-app-surface"
  >
    <div>
      <h2 class="text-2xl font-display font-bold text-app-text">
        Add to <span class={twMerge("capitalize", colors.text)}>{mealType}</span
        >
      </h2>
    </div>
    <button
      onclick={onClose}
      class="p-2 -mr-2 -mt-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors"
      aria-label="Close"
    >
      <X size={20} />
    </button>
  </div>
{/snippet}

{#snippet footerContent()}
  <div class="p-4 border-t border-app-border bg-app-surface shrink-0">
    <button
      onclick={handleDone}
      class={twMerge(
        "w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm transition-colors",
        colors.bg,
      )}
    >
      Done
    </button>
  </div>
{/snippet}

<Modal
  {isOpen}
  {onClose}
  class="max-w-lg"
  header={customHeader}
  footer={footerContent}
>
  <!-- Search & Selected -->
  <div class="flex flex-col border-b border-app-border bg-app-surface shrink-0">
    <div class="p-4">
      <div class="relative">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted"
          size={18}
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder={`Search recipes...`}
          class={twMerge(
            "w-full pl-11 pr-4 py-3 text-sm bg-app-surface-deep border border-app-border rounded-2xl focus:outline-none text-app-text transition-colors placeholder:text-app-text-muted/50",
            colors.focusBorder,
          )}
        />
      </div>
    </div>

    <!-- Selected Recipes Display -->
    {#if selection.size > 0}
      <div class="px-4 pb-4 overflow-x-auto">
        <div class="flex flex-wrap gap-2">
          {#each selection.values() as recipe (recipe.id)}
            <button
              onclick={() => removeSelection(recipe.id)}
              class={twMerge(
                "flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-[11px] font-bold animate-in fade-in zoom-in duration-200 transition-colors cursor-pointer group border",
                colors.text,
              )}
            >
              <span>{recipe.title}</span>
              <X size={14} class="p-0.5" strokeWidth={3} />
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- List -->
  <div class="flex-1 overflow-y-auto bg-app-surface p-2 flex flex-col gap-1">
    <!-- Leftovers Section (Always at top when available) -->
    {#if matchingLeftovers.length > 0 && onSelectLeftover}
      <div
        class="px-3 pt-3 pb-1 text-[10px] uppercase font-bold text-app-text-muted tracking-wider flex items-center gap-2"
      >
        <UtensilsCrossed size={12} />
        From Your Fridge
      </div>
      {#each matchingLeftovers as leftover (leftover.id)}
        {@render leftoverItem(leftover)}
      {/each}

      {#if suggestedRecipes.length > 0 || otherRecipes.length > 0}
        <div class="mt-4 mb-2 border-t border-app-border mx-3"></div>
      {/if}
    {/if}

    {#if suggestedRecipes.length > 0}
      <div
        class="px-3 pt-3 pb-1 text-[10px] uppercase font-bold text-app-text-muted tracking-wider"
      >
        Suggested for <span class={colors.text}>{mealType}</span>
      </div>
      {#each suggestedRecipes as recipe (recipe.id)}
        {@render recipeItem(recipe)}
      {/each}

      {#if otherRecipes.length > 0}
        <div class="mt-4 mb-2 border-t border-app-border mx-3"></div>
        <div
          class="px-3 pb-1 text-[10px] uppercase font-bold text-app-text-muted tracking-wider"
        >
          Other Recipes
        </div>
      {/if}
    {/if}

    {#each otherRecipes as recipe (recipe.id)}
      {@render recipeItem(recipe)}
    {/each}

    {#if matchingRecipes.length === 0 && matchingLeftovers.length === 0}
      <div class="flex flex-col items-center justify-center p-8 text-center">
        <div class="p-3 bg-app-surface-deep rounded-full mb-3">
          <Search size={24} class="text-app-text-muted/50" />
        </div>
        <p class="text-sm font-bold text-app-text">No recipes found</p>
        <p class="text-xs text-app-text-muted mt-1">
          Try a different search term or add a new recipe.
        </p>
      </div>
    {/if}
  </div>
</Modal>
