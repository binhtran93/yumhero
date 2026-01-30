<script lang="ts">
    import {
        ChevronLeft,
        Square,
        CheckSquare,
        ShoppingCart,
        Trash2,
    } from "lucide-svelte";
    import { fade, slide, scale } from "svelte/transition";
    import type { Recipe } from "$lib/types";
    import { formatAmount } from "$lib/utils/shopping";
    import IngredientItem from "./IngredientItem.svelte";

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

    let completedCount = $derived(checkedIngredients.filter((v) => v).length);
    let totalItems = $derived(recipe.ingredients.length);
    let progress = $derived(
        totalItems > 0 ? (completedCount / totalItems) * 100 : 0,
    );

    function clearChecked() {
        checkedIngredients = checkedIngredients.map(() => false);
    }
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden select-none">
    <!-- Header -->
    <div
        class="shrink-0 z-20 bg-app-bg/80 backdrop-blur-md border-b border-app-border"
    >
        <div
            class="flex items-center justify-between px-4 h-16 max-w-5xl mx-auto w-full"
        >
            <button
                class="p-2 -ml-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-xl transition-all active:scale-90"
                onclick={onBack}
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <h1
                class="text-xl font-display font-black tracking-tight text-app-text text-center flex-1"
            >
                Shopping List
            </h1>
            <button
                class="p-2 -mr-2 text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all active:scale-90 disabled:opacity-0"
                onclick={clearChecked}
                disabled={completedCount === 0}
            >
                <Trash2 size={20} />
            </button>
        </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto pb-20">
        <div class="max-w-5xl mx-auto px-4 py-8">
            <!-- Summary Header -->
            <div
                class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <div
                            class="w-10 h-10 bg-app-primary/10 text-app-primary rounded-xl flex items-center justify-center shrink-0"
                        >
                            <ShoppingCart size={20} strokeWidth={2.5} />
                        </div>
                        <h2
                            class="text-2xl font-display font-black text-app-text leading-tight"
                        >
                            {recipe.title}
                        </h2>
                    </div>
                    <p class="text-app-text-muted font-bold ml-13">
                        {totalItems} items to collect
                    </p>
                </div>

                <!-- Progress Indicator -->
                <div
                    class="w-full md:w-64 bg-app-surface rounded-2xl p-4 border border-app-border shadow-sm"
                >
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-bold text-app-text"
                            >Progress</span
                        >
                        <span class="text-sm font-bold text-app-primary"
                            >{completedCount}/{totalItems}</span
                        >
                    </div>
                    <div
                        class="h-2 w-full bg-app-border rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-app-primary transition-all duration-500 ease-out"
                            style="width: {progress}%"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Ingredients Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each recipe.ingredients as ingredient, i}
                    <IngredientItem
                        name={ingredient.name}
                        amount={ingredient.amount}
                        unit={ingredient.unit}
                        notes={ingredient.notes}
                        checked={checkedIngredients[i]}
                        onToggle={() => toggleIngredient(i)}
                    />
                {/each}
            </div>

            {#if completedCount === totalItems && totalItems > 0}
                <div
                    in:slide
                    class="mt-12 p-8 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/20 rounded-3xl text-center"
                >
                    <div
                        class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckSquare size={32} strokeWidth={2.5} />
                    </div>
                    <h3
                        class="text-xl font-display font-black text-emerald-900 dark:text-emerald-100"
                    >
                        All Items Collected!
                    </h3>
                    <p class="text-emerald-700 dark:text-emerald-300 font-bold">
                        You're ready to start cooking.
                    </p>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Custom styles if needed beyond Tailwind */
    .ml-13 {
        margin-left: 3.25rem;
    }
</style>
