<script lang="ts">
  import { Plus, X } from "lucide-svelte";
  import type { Recipe, MealType } from "$lib/types";
  import { twMerge } from "tailwind-merge";

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
  onkeydown={(e) => e.key === "Enter" && onClick()}
  role="button"
  tabindex="0"
  class={twMerge(
    "group relative flex flex-col w-full h-[120px] transition-all duration-200 cursor-pointer border-b border-border-subtle last:border-b-0",
    "hover:bg-white hover:border-l-4 hover:border-l-text-primary hover:pl-0.5", // Border-l interaction instead of padding shift
    recipe
      ? "bg-white"
      : "bg-transparent text-text-secondary/40 hover:text-text-primary",
  )}
>
  <div class="flex-1 p-3 flex flex-col justify-start">
    <span
      class="text-[11px] uppercase font-bold text-text-primary/70 tracking-widest mb-1.5"
      >{type}</span
    >

    {#if recipe}
      <div class="animate-in fade-in duration-200">
        <h4 class="text-sm font-bold text-text-primary leading-tight">
          {recipe.title}
        </h4>
        <div class="flex gap-2 mt-2">
          {#each recipe.tags.slice(0, 2) as tag}
            <span
              class="text-[10px] bg-canvas border border-border-strong px-1.5 py-0.5 rounded-none font-medium text-text-primary uppercase tracking-wide"
            >
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
            <X size={14} />
          </button>
        {/if}
      </div>
    {:else}
      <div
        class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div
          class="flex items-center gap-2 px-3 py-1.5 border border-border-strong rounded-full bg-white shadow-sm"
        >
          <Plus size={14} class="text-text-primary" />
          <span class="text-xs font-medium text-text-primary">Add</span>
        </div>
      </div>
    {/if}
  </div>
</div>
