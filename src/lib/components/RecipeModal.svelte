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
    currentLeftovers?: LeftoverItem[];
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
    onSelectLeftovers?: (leftovers: LeftoverItem[]) => void;
    availableRecipes?: Recipe[];
  }

  let {
    isOpen,
    mealType,
    currentRecipes = [],
    currentLeftovers = [],
    onClose,
    onSelect,
    onSelectLeftovers,
    availableRecipes = [],
  }: Props = $props();

  let searchQuery = $state("");

  // Track selection: Recipe ID -> Recipe
  let selection = $state<Map<string, Recipe>>(new Map());
  let leftoverSelection = $state<Map<string, LeftoverItem>>(new Map());

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
      const newLeftoverSelection = new Map<string, LeftoverItem>();
      currentLeftovers.forEach((leftover) => {
        if (!newLeftoverSelection.has(leftover.id)) {
          newLeftoverSelection.set(leftover.id, leftover);
        }
      });
      leftoverSelection = newLeftoverSelection;
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

  const isLeftoverSelected = (leftoverId: string) => {
    return leftoverSelection.has(leftoverId);
  };

  const toggleLeftoverSelection = (leftover: LeftoverItem) => {
    const newMap = new Map(leftoverSelection);
    if (newMap.has(leftover.id)) {
      newMap.delete(leftover.id);
    } else {
      newMap.set(leftover.id, leftover);
    }
    leftoverSelection = newMap;
  };

  const removeLeftoverSelection = (leftoverId: string) => {
    const newMap = new Map(leftoverSelection);
    newMap.delete(leftoverId);
    leftoverSelection = newMap;
  };

  const handleDone = () => {
    if (selection.size >= 0) {
      // Return the current list of selected recipes
      onSelect(Array.from(selection.values()));
    }
    if (onSelectLeftovers) {
      onSelectLeftovers(Array.from(leftoverSelection.values()));
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
    [...currentLeftovers, ...$availableLeftovers]
      .filter(
        (l, index, self) => self.findIndex((t) => t.id === l.id) === index,
      ) // Unique by ID
      .filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Handle leftover selection
  const handleLeftoverSelect = (leftover: LeftoverItem) => {
    toggleLeftoverSelection(leftover);
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

  interface Section {
    id: string;
    title: string;
    items: (Recipe | LeftoverItem)[];
    kind: "recipe" | "leftover";
  }

  let sections = $derived<Section[]>(
    (() => {
      const list: Section[] = [];

      if (matchingLeftovers.length > 0 && onSelectLeftovers) {
        list.push({
          id: "leftovers",
          title: "From Your Fridge",
          items: matchingLeftovers,
          kind: "leftover",
        });
      }

      if (suggestedRecipes.length > 0) {
        list.push({
          id: "suggested",
          title: `Suggested for <span class="${colors.text} capitalize">${mealType}</span>`,
          items: suggestedRecipes,
          kind: "recipe",
        });
      }

      if (otherRecipes.length > 0) {
        list.push({
          id: "other",
          title: suggestedRecipes.length > 0 ? "Other Recipes" : "All Recipes",
          items: otherRecipes,
          kind: "recipe",
        });
      }

      return list;
    })(),
  );
</script>

{#snippet recipeItem(recipe: Recipe)}
  {@const selected = isSelected(recipe.id)}
  <div
    class={twMerge(
      "flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer gap-4 transition-all duration-200 shrink-0 mx-2",
      selected ? colors.bgFaint : "bg-transparent hover:bg-app-surface-hover",
    )}
    onclick={() => toggleSelection(recipe)}
    onkeydown={(e) => e.key === "Enter" && toggleSelection(recipe)}
    role="button"
    tabindex="0"
  >
    <!-- Thumbnail -->
    <div
      class="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm border border-app-border"
    >
      {#if recipe.image}
        <img
          src={recipe.image}
          alt={recipe.title}
          class="w-full h-full object-cover"
        />
      {:else}
        <div
          class="w-full h-full bg-app-surface-deep flex items-center justify-center text-app-text-muted"
        >
          <UtensilsCrossed size={20} />
        </div>
      {/if}
    </div>

    <!-- Info area -->
    <div class="flex-1 flex flex-col justify-center min-w-0">
      <h3
        class={twMerge(
          "font-display font-bold transition-colors text-sm truncate",
          selected ? colors.text : "text-app-text",
        )}
      >
        {recipe.title}
      </h3>
      <p class="text-[11px] text-app-text-muted font-medium tracking-tight">
        {#if recipe.totalTime}{recipe.totalTime} mins{/if}
        {#each recipe.tags?.slice(0, 1) || [] as tag}
          {#if recipe.totalTime}
            •
          {/if}{tag}
        {/each}
        {#if !recipe.totalTime && (!recipe.tags || recipe.tags.length === 0)}
          Shared by user
        {/if}
      </p>
    </div>

    <!-- Selection Indicator -->
    <div class="flex items-center shrink-0">
      {#if selected}
        <div
          class={twMerge(
            "p-1.5 rounded-full text-white shadow-md border transition-all transform scale-110",
            colors.bg,
            colors.border,
          )}
        >
          <Plus
            size={14}
            strokeWidth={4}
            class="rotate-45"
            aria-hidden="true"
          />
        </div>
      {:else}
        <div
          class={twMerge(
            "p-1.5 rounded-full bg-app-surface text-app-text-muted transition-all shadow-sm border border-app-border",
            colors.hoverBorder,
            colors.hoverText,
          )}
        >
          <Plus size={14} strokeWidth={4} />
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet leftoverItem(leftover: LeftoverItem)}
  {@const selected = isLeftoverSelected(leftover.id)}
  <div
    class={twMerge(
      "flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer gap-4 transition-all duration-200 shrink-0 mx-2",
      selected ? colors.bgFaint : "bg-transparent hover:bg-app-surface-hover",
    )}
    onclick={() => handleLeftoverSelect(leftover)}
    onkeydown={(e) => e.key === "Enter" && handleLeftoverSelect(leftover)}
    role="button"
    tabindex="0"
  >
    <!-- Thumbnail -->
    <div
      class="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm border border-app-border"
    >
      {#if leftover.imageUrl}
        <img
          src={leftover.imageUrl}
          alt={leftover.title}
          class="w-full h-full object-cover"
        />
      {:else}
        <div
          class="w-full h-full bg-app-surface-deep flex items-center justify-center text-app-text-muted"
        >
          <UtensilsCrossed size={20} />
        </div>
      {/if}
    </div>

    <!-- Info area -->
    <div class="flex-1 flex flex-col justify-center min-w-0">
      <h3
        class={twMerge(
          "font-display font-bold transition-colors text-sm truncate",
          selected ? colors.text : "text-app-text",
        )}
      >
        {leftover.title}
      </h3>
      <p class="text-[11px] text-app-text-muted font-medium tracking-tight">
        Leftover from {leftover.sourceMealType}
      </p>
    </div>

    <!-- Selection Indicator -->
    <div class="flex items-center shrink-0">
      {#if selected}
        <div
          class={twMerge(
            "p-1.5 rounded-full text-white shadow-md border transition-all transform scale-110",
            colors.bg,
            colors.border,
          )}
        >
          <Plus
            size={14}
            strokeWidth={4}
            class="rotate-45"
            aria-hidden="true"
          />
        </div>
      {:else}
        <div
          class={twMerge(
            "p-1.5 rounded-full bg-app-surface text-app-text-muted transition-all shadow-sm border border-app-border",
            colors.hoverBorder,
            colors.hoverText,
          )}
        >
          <Plus size={14} strokeWidth={4} />
        </div>
      {/if}
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
      <div class="relative group">
        <Search
          class={twMerge(
            "absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted transition-colors",
            colors.hoverText,
          )}
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

    <!-- Selected Recipes & Leftovers Display -->
    {#if selection.size > 0 || leftoverSelection.size > 0}
      <div class="px-6 pb-4 overflow-x-auto no-scrollbar">
        <div class="flex flex-wrap gap-2">
          {#each selection.values() as recipe (recipe.id)}
            <button
              onclick={() => removeSelection(recipe.id)}
              class={twMerge(
                "flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-[11px] font-bold animate-in fade-in zoom-in duration-200 transition-all cursor-pointer group border",
                colors.text,
                colors.border,
                colors.bgFaint,
              )}
            >
              <span>{recipe.title}</span>
              <X
                size={14}
                class="p-0.5 bg-white rounded-full border border-app-border"
                strokeWidth={3}
              />
            </button>
          {/each}
          {#each leftoverSelection.values() as leftover (leftover.id)}
            <button
              onclick={() => removeLeftoverSelection(leftover.id)}
              class={twMerge(
                "flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-[11px] font-bold animate-in fade-in zoom-in duration-200 transition-all cursor-pointer group border",
                colors.text,
                colors.border,
                colors.bgFaint,
              )}
            >
              <span class="flex items-center gap-1">
                {leftover.title}
                <span
                  class="text-[9px] px-1.5 py-0.5 rounded-full bg-app-primary text-white font-black"
                  >Leftover</span
                >
              </span>
              <X
                size={14}
                class="p-0.5 bg-white rounded-full border border-app-border"
                strokeWidth={3}
              />
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- List -->
  <div
    class="flex-1 overflow-y-auto bg-app-surface p-2 pb-6 flex flex-col gap-1 no-scrollbar"
  >
    {#each sections as section, i (section.id)}
      {#if section.title}
        <div class="flex items-center gap-4 px-6 pt-6 pb-2">
          <div
            class="text-[11px] uppercase font-extrabold text-app-text-muted tracking-[0.2em] whitespace-nowrap"
          >
            {@html section.title}
          </div>
          <div class="h-px bg-app-border flex-1"></div>
        </div>
      {/if}

      {#each section.items as item (item.id)}
        {#if section.kind === "leftover"}
          {@render leftoverItem(item as LeftoverItem)}
        {:else}
          {@render recipeItem(item as Recipe)}
        {/if}
      {/each}
    {/each}

    {#if sections.length === 0}
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
