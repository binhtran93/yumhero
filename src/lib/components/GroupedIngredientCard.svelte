<script lang="ts">
    import { CheckSquare, Square } from "lucide-svelte";
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
    const singleSource = $derived(sources.length === 1);

    const handleToggle = () => {
        if (singleSource) {
            onToggleSource(0, !sources[0].is_checked);
        } else {
            onToggleAll(!allChecked);
        }
    };

    // Find recipe name by ID
    const getRecipeName = (recipeId: string | null): string => {
        if (!recipeId) return "Manual item";
        const recipe = recipes.find((r) => r.id === recipeId);
        return recipe?.title || "Unknown recipe";
    };
</script>

{#if singleSource}
    <!-- Single source - simple line format -->
    <button
        class="bg-app-surface border border-app-border/50 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-app-surface-hover hover:border-app-border transition-all active:scale-[0.99] w-full"
        onclick={handleToggle}
    >
        <div class="shrink-0">
            {#if sources[0].is_checked}
                <CheckSquare
                    size={24}
                    class="text-emerald-500"
                    strokeWidth={2.5}
                />
            {:else}
                <Square size={24} class="text-app-text-muted" strokeWidth={2} />
            {/if}
        </div>
        <div
            class="flex-1 text-left"
            class:line-through={sources[0].is_checked}
            class:opacity-60={sources[0].is_checked}
        >
            <span class="font-display font-black text-base text-app-text">
                {formatAmount(sources[0].amount)}
                {sources[0].unit || ""}
                {displayName}
            </span>
        </div>
    </button>
{:else}
    <!-- Multiple sources - grouped card format -->
    <div
        class="bg-app-surface border border-app-border/50 rounded-2xl overflow-hidden hover:border-app-border transition-colors"
    >
        <!-- Header with Master Toggle -->
        <button
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-app-surface-hover transition-colors active:scale-[0.99]"
            onclick={handleToggle}
        >
            <div class="shrink-0">
                {#if allChecked}
                    <CheckSquare
                        size={24}
                        class="text-emerald-500"
                        strokeWidth={2.5}
                    />
                {:else if sources.some((s) => s.is_checked)}
                    <!-- Some checked - indeterminate state -->
                    <Square
                        size={24}
                        class="text-app-primary"
                        strokeWidth={2.5}
                    >
                        <rect
                            x="8"
                            y="8"
                            width="8"
                            height="8"
                            fill="currentColor"
                        />
                    </Square>
                {:else}
                    <Square
                        size={24}
                        class="text-app-text-muted"
                        strokeWidth={2}
                    />
                {/if}
            </div>
            <span
                class="font-display font-black text-base text-app-text text-left flex-1"
                class:line-through={allChecked}
                class:opacity-60={allChecked}
            >
                {displayName}
            </span>
        </button>

        <!-- Sources List -->
        <div class="px-4 pb-3 space-y-2">
            {#each sources as source, i (i)}
                <button
                    class="w-full flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-app-surface-deep/50 transition-colors text-left active:scale-[0.98]"
                    onclick={() => onToggleSource(i, !source.is_checked)}
                >
                    <div class="shrink-0 pt-0.5">
                        {#if source.is_checked}
                            <CheckSquare
                                size={18}
                                class="text-emerald-500"
                                strokeWidth={2.5}
                            />
                        {:else}
                            <Square
                                size={18}
                                class="text-app-text-muted"
                                strokeWidth={2}
                            />
                        {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div
                            class="flex items-baseline gap-2 flex-wrap"
                            class:line-through={source.is_checked}
                            class:opacity-60={source.is_checked}
                        >
                            <span class="font-bold text-app-text">
                                {formatAmount(source.amount)}
                                {source.unit || ""}
                            </span>
                            <span
                                class="text-xs text-app-text-muted font-medium truncate"
                            >
                                from {getRecipeName(source.recipe_id)}
                            </span>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    </div>
{/if}
