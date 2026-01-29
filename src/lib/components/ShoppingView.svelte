<script lang="ts">
    import {
        ChevronLeft,
        Square,
        SquareCheck,
        ShoppingCart,
    } from "lucide-svelte";
    import type { Recipe } from "$lib/types";

    interface Props {
        recipe: Recipe;
        onBack: () => void;
    }

    let { recipe, onBack }: Props = $props();

    let checkedIngredients = $state<boolean[]>([]);

    $effect(() => {
        if (recipe && checkedIngredients.length === 0) {
            checkedIngredients = new Array(recipe.ingredients.length).fill(
                false,
            );
        }
    });

    function toggleIngredient(index: number) {
        checkedIngredients[index] = !checkedIngredients[index];
    }
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden select-none">
    <!-- Header -->
    <div class="shrink-0 z-20 bg-app-bg border-b border-app-border">
        <div class="flex items-center justify-between px-4 h-14 md:h-16">
            <button
                class="p-2 -ml-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors"
                onclick={onBack}
            >
                <ChevronLeft size={24} />
            </button>
            <h1 class="text-lg font-display font-bold text-app-text">
                Shopping List
            </h1>
            <div class="w-10"></div>
        </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-2xl mx-auto space-y-4">
            <!-- Recipe Info -->
            <div
                class="flex items-center gap-4 p-4 bg-app-surface border border-app-border rounded-2xl mb-6 shadow-sm"
            >
                <div
                    class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"
                >
                    <ShoppingCart size={24} />
                </div>
                <div>
                    <h2 class="font-bold text-app-text">{recipe.title}</h2>
                    <p class="text-sm text-app-text-muted">
                        {recipe.ingredients.length} items
                    </p>
                </div>
            </div>

            <!-- Ingredients -->
            <div
                class="bg-app-surface border border-app-border rounded-3xl overflow-hidden shadow-sm"
            >
                {#each recipe.ingredients as ingredient, i}
                    <button
                        class="w-full flex items-center gap-4 p-4 border-b border-app-border last:border-0 hover:bg-app-surface-hover transition-colors text-left group"
                        onclick={() => toggleIngredient(i)}
                    >
                        <div
                            class="shrink-0 transition-transform active:scale-95"
                        >
                            {#if checkedIngredients[i]}
                                <SquareCheck
                                    size={24}
                                    class="text-app-primary fill-app-primary/10"
                                />
                            {:else}
                                <Square
                                    size={24}
                                    class="text-app-text-muted group-hover:text-app-primary transition-colors"
                                />
                            {/if}
                        </div>
                        <div
                            class="{checkedIngredients[i]
                                ? 'opacity-40 line-through decoration-app-text-muted'
                                : ''} transition-opacity flex-1"
                        >
                            <span class="font-bold text-app-text mr-1"
                                >{ingredient.amount} {ingredient.unit}</span
                            >
                            <span class="text-app-text">{ingredient.name}</span>
                            {#if ingredient.notes}
                                <p class="text-xs text-app-text-muted mt-0.5">
                                    {ingredient.notes}
                                </p>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>
