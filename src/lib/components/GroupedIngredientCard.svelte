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

<!-- Compact Row Layout -->
<div class="border-b border-app-border/30 last:border-0">
    <div class="flex items-center gap-3 py-3 px-1">
        <!-- Master Checkbox - Large tap target -->
        <button
            class="shrink-0 p-2 -m-2 active:scale-95 transition-transform"
            onclick={handleToggle}
            aria-label={`Toggle ${displayName}`}
        >
            {#if allChecked}
                <CheckSquare
                    size={24}
                    class="text-emerald-500"
                    strokeWidth={2.5}
                />
            {:else if someChecked}
                <Square size={24} class="text-app-primary" strokeWidth={2.5}>
                    <rect
                        x="8"
                        y="8"
                        width="8"
                        height="8"
                        fill="currentColor"
                    />
                </Square>
            {:else}
                <Square size={24} class="text-app-text-muted" strokeWidth={2} />
            {/if}
        </button>

        <!-- Ingredient Name & Quantities (single line) -->
        <button
            class="flex-1 text-left min-w-0 py-1"
            onclick={() => (isExpanded = !isExpanded)}
        >
            <div
                class="flex items-baseline gap-2"
                class:line-through={allChecked}
                class:opacity-60={allChecked}
            >
                <span class="font-bold text-base text-app-text truncate">
                    {displayName}
                </span>
                <span class="text-sm text-app-text-muted font-medium">
                    — {formattedQuantities}
                </span>
            </div>
        </button>

        <!-- Expand/Collapse Icon -->
        {#if sources.length > 1}
            <button
                class="shrink-0 p-1 text-app-text-muted hover:text-app-text transition-colors"
                onclick={() => (isExpanded = !isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
            >
                {#if isExpanded}
                    <ChevronDown size={18} strokeWidth={2} />
                {:else}
                    <ChevronRight size={18} strokeWidth={2} />
                {/if}
            </button>
        {/if}
    </div>

    <!-- Collapsible Source Details -->
    {#if isExpanded && sources.length > 1}
        <div class="pb-2 pl-12 pr-4 space-y-1">
            {#each sources as source, i}
                <button
                    class="flex items-center gap-2 w-full text-left py-1 hover:bg-app-surface-hover/50 rounded transition-colors active:scale-[0.98]"
                    onclick={() => onToggleSource(i, !source.is_checked)}
                >
                    <!-- Small dot-style checkbox -->
                    <div class="shrink-0">
                        {#if source.is_checked}
                            <div
                                class="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"
                            >
                                <div
                                    class="w-1.5 h-1.5 bg-white rounded-full"
                                />
                            </div>
                        {:else}
                            <div
                                class="w-3 h-3 rounded-full border-2 border-app-text-muted/50"
                            />
                        {/if}
                    </div>

                    <span
                        class="text-xs text-app-text-muted font-medium"
                        class:line-through={source.is_checked}
                    >
                        {formatAmount(source.amount)}
                        {source.unit || ""}
                        <span class="opacity-60 ml-1">
                            from {getRecipeName(source.recipe_id)}
                        </span>
                    </span>
                </button>
            {/each}
        </div>
    {/if}
</div>
