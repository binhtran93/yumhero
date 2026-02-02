<script lang="ts">
    import { CheckSquare, Square, Eye, EyeOff } from "lucide-svelte";
    import { formatAmount } from "$lib/utils/shopping";
    import type { Recipe, ShoppingListSource } from "$lib/types";
    import ShoppingItemMenu from "./ShoppingItemMenu.svelte";

    interface Props {
        ingredientName: string;
        sources: ShoppingListSource[];
        recipes: Recipe[];
        onToggleAll: (checked: boolean) => void;
        onToggleSource: (sourceIndex: number, checked: boolean) => void;
        onDelete?: () => void;
        onEdit?: () => void;
    }

    let {
        ingredientName,
        sources,
        recipes,
        onToggleAll,
        onToggleSource,
        onDelete,
        onEdit,
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

    // Format all quantities for display - merge quantities with same unit
    const quantityGroups = $derived.by(() => {
        const unitMap = new Map<string, number>();

        // Group by unit and sum amounts
        sources.forEach((s) => {
            const unit = s.unit || "";
            const current = unitMap.get(unit) || 0;
            unitMap.set(unit, current + s.amount);
        });

        // Return array of objects for granular styling
        return Array.from(unitMap.entries()).map(([unit, amount]) => ({
            amount: formatAmount(amount),
            unit: unit || null,
        }));
    });
</script>

<div class="hover:bg-app-surface-hover/30 transition-colors">
    <div class="flex items-center gap-2 py-1.5 px-2">
        <!-- Master Checkbox - Large tap target -->
        <button
            class="shrink-0 p-2 -m-2 active:scale-95 transition-transform"
            onclick={handleToggle}
            aria-label={`Toggle ${displayName}`}
        >
            {#if allChecked}
                <CheckSquare size={24} class="text-emerald-600" />
            {:else if someChecked}
                <Square size={24} class="text-app-primary">
                    <rect
                        x="7"
                        y="7"
                        width="10"
                        height="10"
                        fill="currentColor"
                    />
                </Square>
            {:else}
                <Square size={24} class="text-app-text/40" />
            {/if}
        </button>

        <!-- Ingredient Name & Quantities (single line) -->
        <button class="flex-1 text-left min-w-0 py-0.5" onclick={handleToggle}>
            <div
                class="flex items-baseline gap-1.5 flex-wrap"
                class:line-through={allChecked}
                class:opacity-50={allChecked}
            >
                {#each quantityGroups as q, i}
                    <span class="font-black text-sm sm:text-base text-app-text">
                        {q.amount}
                    </span>
                    {#if q.unit}
                        <span
                            class="text-xs sm:text-sm text-app-text/60 font-medium"
                        >
                            {q.unit}
                        </span>
                    {/if}
                    {#if i < quantityGroups.length - 1}
                        <span class="text-xs sm:text-sm text-app-text/40"
                            >,</span
                        >
                    {/if}
                {/each}

                <span class="font-bold text-sm sm:text-base text-app-primary">
                    {displayName}
                </span>
            </div>
        </button>

        <!-- Expand/Collapse Icon -->
        {#if sources.length > 1 || (sources.length === 1 && (sources[0].recipe_id || sources[0].day || sources[0].meal_type))}
            <button
                class="shrink-0 p-1.5 -m-1.5 text-app-text/50 hover:text-app-text transition-colors rounded-lg hover:bg-app-surface-deep/50"
                onclick={() => (isExpanded = !isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
            >
                {#if isExpanded}
                    <EyeOff size={16} strokeWidth={2.5} />
                {:else}
                    <Eye size={16} strokeWidth={2.5} />
                {/if}
            </button>
        {/if}

        {#if onDelete && onEdit}
            <ShoppingItemMenu {onDelete} {onEdit} />
        {/if}
    </div>

    {#if isExpanded && (sources.length > 1 || (sources.length === 1 && (sources[0].recipe_id || sources[0].day || sources[0].meal_type)))}
        <div class="pb-2.5 pl-8 pr-4 space-y-1 bg-app-surface-deep/30">
            {#each sources as source, i}
                <button
                    class="flex items-center gap-2 w-full text-left py-1 px-2 hover:bg-app-surface-hover/50 rounded-lg transition-colors active:scale-[0.98]"
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
                        class="text-xs font-semibold flex items-baseline gap-1"
                        class:line-through={source.is_checked}
                        class:opacity-60={source.is_checked}
                    >
                        <span class="font-black text-app-text">
                            {formatAmount(source.amount)}
                        </span>
                        {#if source.unit}
                            <span class="text-app-text/60 font-medium">
                                {source.unit}
                            </span>
                        {/if}
                        <span class="text-app-text/40 ml-1 font-medium">
                            from {getRecipeName(source.recipe_id)}
                            {#if source.day}
                                • {source.day?.slice(0, 3)}
                            {/if}
                            {#if source.meal_type}
                                • <span class="capitalize"
                                    >{source.meal_type}</span
                                >
                            {/if}
                        </span>
                    </span>
                </button>
            {/each}
        </div>
    {/if}
</div>
