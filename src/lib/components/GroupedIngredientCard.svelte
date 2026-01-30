<script lang="ts">
    import {
        CheckSquare,
        Square,
        ChevronDown,
        ChevronRight,
    } from "lucide-svelte";
    import { formatAmount } from "$lib/utils/shopping";
    import type { Recipe, ShoppingListSource } from "$lib/types";

    interface Props {
        ingredientName: string;
        sources: ShoppingListSource[];
        recipes: Recipe[];
        onToggleAll: (checked: boolean) => void;
        onToggleSource: (sourceIndex: number, checked: boolean) => void;
    }

    let {
        ingredientName,
        sources,
        recipes,
        onToggleAll,
        onToggleSource,
    }: Props = $props();

    // Capitalize first letter for display
    const displayName = $derived(
        ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
    );

    // Calculate check state
    const allChecked = $derived(sources.every((s) => s.is_checked));
    const someChecked = $derived(
        sources.some((s) => s.is_checked) && !allChecked,
    );

    // Collapsible state
    let isExpanded = $state(false);

    const handleToggle = () => {
        onToggleAll(!allChecked);
    };

    // Find recipe name by ID
    const getRecipeName = (recipeId: string | null): string => {
        if (!recipeId) return "Manual";
        const recipe = recipes.find((r) => r.id === recipeId);
        return recipe?.title || "Unknown";
    };

    // Format all quantities for display (e.g., "4 quả, 3 trái")
    const formattedQuantities = $derived(
        sources
            .map(
                (s) => `${formatAmount(s.amount)}${s.unit ? " " + s.unit : ""}`,
            )
            .join(", "),
    );
</script>

<!-- Compact Row Layout with High Contrast -->
<div
    class="border-b border-app-border/60 last:border-0 hover:bg-app-surface-hover/30 transition-colors"
>
    <div class="flex items-center gap-3 py-3.5 px-2">
        <!-- Master Checkbox - Large tap target -->
        <button
            class="shrink-0 p-2 -m-2 active:scale-95 transition-transform"
            onclick={handleToggle}
            aria-label={`Toggle ${displayName}`}
        >
            {#if allChecked}
                <CheckSquare
                    size={26}
                    class="text-emerald-600"
                />
            {:else if someChecked}
                <Square size={26} class="text-app-primary">
                    <rect
                        x="7"
                        y="7"
                        width="10"
                        height="10"
                        fill="currentColor"
                    />
                </Square>
            {:else}
                <Square size={26} class="text-app-text/40" />
            {/if}
        </button>

        <!-- Ingredient Name & Quantities (single line) -->
        <button
            class="flex-1 text-left min-w-0 py-1"
            onclick={() => (isExpanded = !isExpanded)}
        >
            <div
                class="flex items-baseline gap-2 flex-wrap"
                class:line-through={allChecked}
                class:opacity-50={allChecked}
            >
                <span class="font-black text-base text-app-text">
                    {displayName}
                </span>
                <span class="text-sm text-app-text/60 font-semibold">
                    — {formattedQuantities}
                </span>
            </div>
        </button>

        <!-- Expand/Collapse Icon -->
        {#if sources.length > 1}
            <button
                class="shrink-0 p-1.5 -m-1.5 text-app-text/50 hover:text-app-text transition-colors rounded-lg hover:bg-app-surface-deep/50"
                onclick={() => (isExpanded = !isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
            >
                {#if isExpanded}
                    <ChevronDown size={20} strokeWidth={2.5} />
                {:else}
                    <ChevronRight size={20} strokeWidth={2.5} />
                {/if}
            </button>
        {/if}
    </div>

    <!-- Collapsible Source Details -->
    {#if isExpanded && sources.length > 1}
        <div class="pb-3 pl-14 pr-4 space-y-1.5 bg-app-surface-deep/30">
            {#each sources as source, i}
                <button
                    class="flex items-center gap-2.5 w-full text-left py-1.5 px-2 hover:bg-app-surface-hover/50 rounded-lg transition-colors active:scale-[0.98]"
                    onclick={() => onToggleSource(i, !source.is_checked)}
                >
                    <!-- Regular checkbox style -->
                    <div class="shrink-0">
                        {#if source.is_checked}
                            <CheckSquare
                                size={18}
                                class="text-emerald-600"
                                strokeWidth={2.5}
                            />
                        {:else}
                            <Square
                                size={18}
                                class="text-app-text/40"
                                strokeWidth={2}
                            />
                        {/if}
                    </div>

                    <span
                        class="text-xs text-app-text/70 font-semibold"
                        class:line-through={source.is_checked}
                        class:opacity-60={source.is_checked}
                    >
                        {formatAmount(source.amount)}
                        {source.unit || ""}
                        <span class="text-app-text/40 ml-1.5 font-medium">
                            from {getRecipeName(source.recipe_id)}
                        </span>
                    </span>
                </button>
            {/each}
        </div>
    {/if}
</div>
