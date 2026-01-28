<script lang="ts">
    import { X, ShoppingCart } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import type { Recipe } from "$lib/types";

    interface Props {
        recipe: Recipe;
        onClose: () => void;
    }

    let { recipe, onClose }: Props = $props();

    // Track checked items - use array for proper reactivity
    let checkedItems = $state<boolean[]>(
        new Array(recipe.ingredients.length).fill(false),
    );

    function toggleItem(index: number) {
        checkedItems[index] = !checkedItems[index];
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            onClose();
        }
    }

    let checkedCount = $derived(checkedItems.filter(Boolean).length);
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal Backdrop -->
<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    transition:fade={{ duration: 200 }}
    onclick={onClose}
>
    <!-- Modal Container -->
    <div
        class="bg-app-bg rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        transition:scale={{ duration: 200, start: 0.95 }}
        onclick={(e) => e.stopPropagation()}
    >
        <!-- Header -->
        <div
            class="shrink-0 bg-app-surface border-b border-app-border px-6 py-4 rounded-t-3xl"
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-app-primary/10 flex items-center justify-center"
                    >
                        <ShoppingCart size={20} class="text-app-primary" />
                    </div>
                    <div>
                        <h2
                            class="text-xl md:text-2xl font-display font-bold text-app-text"
                        >
                            Shopping List
                        </h2>
                        <p class="text-sm text-app-text-muted">
                            {recipe.title}
                        </p>
                    </div>
                </div>
                <button
                    onclick={onClose}
                    class="w-10 h-10 rounded-full bg-app-surface-hover hover:bg-app-border transition-colors flex items-center justify-center"
                    aria-label="Close shopping mode"
                >
                    <X size={20} class="text-app-text" />
                </button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
            <!-- Stats -->
            <div
                class="mb-6 flex items-center gap-4 text-sm text-app-text-muted"
            >
                <span class="font-semibold">
                    {recipe.ingredients.length} items
                </span>
                <span class="w-px h-4 bg-app-border"></span>
                <span>
                    {checkedCount} checked
                </span>
            </div>

            <!-- Ingredients Grid - Responsive columns -->
            <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            >
                {#each recipe.ingredients as ingredient, i}
                    <button
                        onclick={() => toggleItem(i)}
                        class="bg-app-surface border border-app-border rounded-2xl p-4 text-left transition-all hover:shadow-md hover:border-app-primary/30 {checkedItems[
                            i
                        ]
                            ? 'opacity-50 bg-app-surface-hover'
                            : ''}"
                    >
                        <div class="flex items-start gap-3">
                            <!-- Checkbox -->
                            <div
                                class="mt-0.5 w-5 h-5 rounded-md border-2 {checkedItems[
                                    i
                                ]
                                    ? 'bg-app-primary border-app-primary'
                                    : 'border-app-border'} flex items-center justify-center shrink-0 transition-all"
                            >
                                {#if checkedItems[i]}
                                    <svg
                                        class="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                {/if}
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div
                                    class="text-base font-bold text-app-text {checkedItems[
                                        i
                                    ]
                                        ? 'line-through'
                                        : ''}"
                                >
                                    {ingredient.amount}
                                    {ingredient.unit}
                                </div>
                                <div
                                    class="text-base text-app-text mt-0.5 {checkedItems[
                                        i
                                    ]
                                        ? 'line-through'
                                        : ''}"
                                >
                                    {ingredient.name}
                                </div>
                                {#if ingredient.notes}
                                    <div
                                        class="text-xs text-app-text-muted italic mt-1"
                                    >
                                        {ingredient.notes}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>
