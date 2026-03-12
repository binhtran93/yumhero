<script lang="ts">
  import {
    Search,
    Plus,
    X,
    UtensilsCrossed,
    Clock,
    Users,
    Check,
  } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { twMerge } from "tailwind-merge";
  import Modal from "$lib/components/Modal.svelte";
  import { formatServings } from "$lib/utils/recipe";

  interface Props {
    isOpen: boolean;
    mealType: MealType | null;
    currentRecipes?: Recipe[];
    onClose: () => void;
    onSelect: (recipes: Recipe[]) => void;
    availableRecipes?: Recipe[];
    adaptive?: boolean;
  }

  let {
    isOpen,
    mealType,
    currentRecipes = [],
    onClose,
    onSelect,
    availableRecipes = [],
    adaptive = true,
  }: Props = $props();

  let searchQuery = $state("");
  let selection = $state<Map<string, Recipe>>(new Map());

  $effect(() => {
    if (!isOpen) return;

    const newSelection = new Map<string, Recipe>();
    currentRecipes.forEach((recipe) => {
      if (!newSelection.has(recipe.id)) {
        newSelection.set(recipe.id, recipe);
      }
    });

    selection = newSelection;
    searchQuery = "";
  });

  const isSelected = (recipeId: string) => selection.has(recipeId);

  const toggleSelection = (recipe: Recipe) => {
    const next = new Map(selection);
    if (next.has(recipe.id)) {
      next.delete(recipe.id);
    } else {
      next.set(recipe.id, recipe);
    }
    selection = next;
  };

  const removeSelection = (recipeId: string) => {
    const next = new Map(selection);
    next.delete(recipeId);
    selection = next;
  };

  const handleDone = () => {
    onSelect(Array.from(selection.values()));
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

  const colors = $derived(
    mealType && mealType !== "note"
      ? {
          text: `text-accent-${mealType}`,
          bg: `bg-accent-${mealType}`,
          border: `border-accent-${mealType}`,
          focusBorder: `focus:border-accent-${mealType}`,
          hoverText: `hover:text-accent-${mealType}`,
          hoverBorder: `hover:border-accent-${mealType}`,
          bgFaint: `bg-accent-${mealType}-bg`,
        }
      : {
          text: "text-app-primary",
          bg: "bg-app-primary",
          border: "border-app-primary",
          focusBorder: "focus:border-app-primary",
          hoverText: "hover:text-app-primary",
          hoverBorder: "hover:border-app-primary",
          bgFaint: "bg-app-primary/5",
        },
  );

  interface Section {
    id: string;
    title: string;
    items: Recipe[];
  }

  let sections = $derived<Section[]>(
    (() => {
      const list: Section[] = [];

      if (suggestedRecipes.length > 0) {
        list.push({
          id: "suggested",
          title: `Suggested for <span class=\"${colors.text} capitalize\">${mealType}</span>`,
          items: suggestedRecipes,
        });
      }

      if (otherRecipes.length > 0) {
        list.push({
          id: "other",
          title: suggestedRecipes.length > 0 ? "Other Recipes" : "All Recipes",
          items: otherRecipes,
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
      "flex items-center justify-between px-3 py-2 rounded-2xl cursor-pointer gap-4 transition-all duration-200 shrink-0 mx-2 mb-1",
      selected
        ? colors.bgFaint + " shadow-sm"
        : "bg-transparent hover:bg-app-surface-hover",
    )}
    onclick={() => toggleSelection(recipe)}
    onkeydown={(e) => e.key === "Enter" && toggleSelection(recipe)}
    role="button"
    tabindex="0"
  >
    <div
      class="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm border border-app-border"
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

    <div class="flex-1 flex flex-col justify-center min-w-0">
      <h3
        class={twMerge(
          "font-display font-bold transition-colors text-sm truncate",
          selected ? colors.text : "text-app-text",
        )}
      >
        {recipe.title}
      </h3>
      <div class="flex items-center gap-3 mt-1">
        {#if recipe.totalTime}
          <div
            class="flex items-center gap-1 text-[11px] text-app-text-muted font-semibold leading-none"
          >
            <Clock size={12} strokeWidth={2.5} class="shrink-0 opacity-40" />
            <span>{recipe.totalTime}m</span>
          </div>
        {/if}
        {#if recipe.servings}
          <div
            class="flex items-center gap-1 text-[11px] text-app-text-muted font-semibold leading-none"
          >
            <Users size={12} strokeWidth={2.5} class="shrink-0 opacity-40" />
            <span>{formatServings(recipe.servings)}</span>
          </div>
        {/if}
        {#if !recipe.totalTime && !recipe.servings}
          <span
            class="text-[10px] text-app-text-muted/60 font-bold uppercase tracking-wider"
          >
            User Recipe
          </span>
        {/if}
      </div>
    </div>

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
        "w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2",
        colors.bg,
      )}
    >
      <Check size={18} />
      Done
    </button>
  </div>
{/snippet}

<Modal
  {isOpen}
  {onClose}
  {adaptive}
  class="w-full max-w-2xl h-[95vh] flex flex-col overflow-hidden"
  header={customHeader}
  footer={footerContent}
>
  <div class="flex flex-col border-b border-app-border bg-app-surface shrink-0">
    <div class="px-6 py-4">
      <div class="relative group">
        <Search
          class={twMerge(
            "absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted/50 group-focus-within:text-app-primary transition-colors",
            colors.hoverText,
          )}
          size={18}
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search recipes..."
          class={twMerge(
            "w-full pl-11 pr-4 py-2 md:py-3 text-sm bg-app-surface-deep/50 border border-app-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-app-primary/10 text-app-text transition-all placeholder:text-app-text-muted/40 font-medium",
            colors.focusBorder,
          )}
        />
      </div>
    </div>

    {#if selection.size > 0}
      <div class="px-6 pb-4 overflow-x-auto no-scrollbar">
        <div class="flex flex-wrap gap-2">
          {#each selection.values() as recipe (recipe.id)}
            <button
              onclick={() => removeSelection(recipe.id)}
              class={twMerge(
                "flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-[11px] font-bold animate-in fade-in zoom-in duration-200 transition-all cursor-pointer group border max-w-[240px]",
                colors.text,
                colors.border,
                colors.bgFaint,
              )}
            >
              <span class="truncate">{recipe.title}</span>
              <div
                class="shrink-0 p-0.5 bg-white/80 rounded-full border border-app-border group-hover:bg-white transition-colors"
              >
                <X size={12} class="text-app-text" strokeWidth={3} />
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div
    class="flex-1 overflow-y-auto bg-app-surface p-2 pb-6 flex flex-col gap-1 no-scrollbar"
  >
    {#each sections as section (section.id)}
      {#if section.title}
        <div class="flex items-center gap-4 px-4 pt-4 pb-2">
          <div
            class="text-xs uppercase font-extrabold text-app-text-muted tracking-[0.2em] whitespace-nowrap"
          >
            {@html section.title}
          </div>
          <div class="h-px bg-app-border flex-1"></div>
        </div>
      {/if}

      {#each section.items as item (item.id)}
        {@render recipeItem(item)}
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
