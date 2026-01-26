<script lang="ts">
    import { Plus, X } from "lucide-svelte";
    import type { Recipe, MealType } from "$lib/types";
    import { twMerge } from "tailwind-merge";

    interface Props {
        type: MealType;
        recipes: Recipe[];
        onClick: () => void;
        onClear?: (e: MouseEvent) => void;
    }

    let { type, recipes, onClick, onClear }: Props = $props();

    // "Warm Family" Theme Colors
    // Friendly, soft, natural tones.
    const colorMap = {
        breakfast: {
            label: "text-amber-800",
            card: "bg-amber-50 hover:bg-amber-100",
            border: "border-amber-200",
            accent: "bg-amber-600",
            emptyBg: "bg-amber-50/50 hover:bg-amber-100",
            emptyIcon: "text-amber-600",
        },
        lunch: {
            label: "text-lime-800",
            card: "bg-lime-50 hover:bg-lime-100",
            border: "border-lime-200",
            accent: "bg-lime-600",
            emptyBg: "bg-lime-50/50 hover:bg-lime-100",
            emptyIcon: "text-lime-600",
        },
        dinner: {
            label: "text-orange-800",
            card: "bg-orange-50 hover:bg-orange-100",
            border: "border-orange-200",
            accent: "bg-orange-600",
            emptyBg: "bg-orange-50/50 hover:bg-orange-100",
            emptyIcon: "text-orange-600",
        },
    };

    const colors = colorMap[type];
</script>

<!-- The Slot Container -->
<!-- The Slot Container -->
<div class="flex flex-col gap-2 w-full">
    {#if recipes.length > 0}
        <!-- Header is now handled by DayColumn for better structure -->

        <div class="flex items-center justify-end px-1 -mt-8 mb-2">
            {#if onClear}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onClear(e);
                    }}
                    class="text-text-secondary hover:text-red-600 transition-colors"
                    title="Clear"
                >
                    <X size={14} />
                </button>
            {/if}
        </div>

        <div
            class="flex flex-col gap-3"
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
        >
            {#each recipes as recipe}
                <!-- Friendly Card -->
                <div
                    class="bg-bg-surface rounded-xl border border-border-default shadow-sm p-4 relative group cursor-pointer hover:border-action-primary transition-all hover:-translate-y-0.5"
                >
                    <!-- Type Accent Bar -->
                    <div
                        class={twMerge(
                            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
                            type === "breakfast"
                                ? "bg-accent-breakfast"
                                : type === "lunch"
                                  ? "bg-accent-lunch"
                                  : "bg-accent-dinner",
                        )}
                    ></div>

                    <h4
                        class="text-sm font-bold text-text-primary mb-2 pl-2 leading-snug font-display"
                    >
                        {recipe.title}
                    </h4>

                    <div class="flex flex-wrap gap-1.5 pl-2">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[10px] text-text-secondary bg-bg-accent-subtle px-2 py-0.5 rounded-full border border-border-strong font-medium"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Friendly Add Button -->
            <button
                class="w-full py-3 rounded-xl border border-dashed border-border-strong text-text-secondary hover:border-action-primary hover:bg-bg-surface-hover hover:text-action-primary text-xs font-bold transition-all flex items-center justify-center gap-2"
                onclick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <Plus size={14} /> Add Item
            </button>
        </div>
    {:else}
        <!-- Empty State: Friendly -->
        <div
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
            class="w-full py-12 rounded-xl border border-dashed border-border-strong hover:border-action-primary hover:bg-bg-surface-hover transition-all cursor-pointer flex items-center justify-center group bg-bg-surface"
        >
            <div
                class="text-text-secondary group-hover:text-action-primary group-hover:scale-110 transition-all"
            >
                <Plus size={20} />
            </div>
        </div>
    {/if}
</div>
