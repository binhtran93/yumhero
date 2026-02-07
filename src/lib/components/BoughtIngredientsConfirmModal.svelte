<script lang="ts">
    import { fade, fly, slide } from "svelte/transition";
    import {
        X,
        Refrigerator,
        ShoppingCart,
        ArrowRight,
        Trash2,
    } from "lucide-svelte";
    import { formatAmount } from "$lib/utils/shopping";
    import { portal } from "$lib/actions";

    interface BoughtIngredient {
        ingredientName: string;
        amount: number;
        unit: string | null;
    }

    interface Props {
        isOpen: boolean;
        recipeTitle: string;
        ingredients: BoughtIngredient[];
        onConfirm: () => void;
        onSkip: () => void;
        onClose: () => void;
    }

    let {
        isOpen,
        recipeTitle,
        ingredients,
        onConfirm,
        onSkip,
        onClose,
    }: Props = $props();
</script>

{#if isOpen}
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        transition:fade={{ duration: 150 }}
        onclick={onClose}
        use:portal
    ></div>

    <!-- Modal -->
    <div
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        use:portal
    >
        <div
            class="bg-app-surface rounded-2xl shadow-2xl border border-app-border max-w-md w-full pointer-events-auto overflow-hidden"
            transition:fly={{ y: 20, duration: 200 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <!-- Header -->
            <div class="relative px-6 pt-6 pb-4">
                <button
                    class="absolute top-4 right-4 p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-xl transition-colors"
                    onclick={onClose}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div class="flex items-start gap-4">
                    <div
                        class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0"
                    >
                        <ShoppingCart size={24} />
                    </div>
                    <div class="flex-1 min-w-0 pr-8">
                        <h2
                            class="text-lg font-display font-black text-app-text mb-1"
                        >
                            Already Bought Ingredients
                        </h2>
                        <p class="text-sm text-app-text-muted">
                            You've already bought some ingredients for <span
                                class="font-semibold text-app-text"
                                >{recipeTitle}</span
                            >. Would you like to track them in your fridge?
                        </p>
                    </div>
                </div>
            </div>

            <!-- Ingredient List -->
            <div class="px-6 pb-4 max-h-64 overflow-y-auto">
                <div class="space-y-2">
                    {#each ingredients as ingredient (ingredient.ingredientName)}
                        <div
                            class="flex items-center justify-between p-3 bg-app-surface-deep rounded-xl border border-app-border"
                            transition:slide={{ duration: 150 }}
                        >
                            <span
                                class="font-medium text-app-text capitalize text-sm"
                            >
                                {ingredient.ingredientName}
                            </span>
                            <span
                                class="text-sm text-app-text-muted font-medium bg-app-surface px-2 py-1 rounded-lg"
                            >
                                {formatAmount(
                                    ingredient.amount,
                                )}{ingredient.unit ? ` ${ingredient.unit}` : ""}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Actions -->
            <div
                class="flex flex-col gap-2 px-6 py-4 bg-app-surface-deep border-t border-app-border"
            >
                <button
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-app-primary hover:bg-app-primary/90 text-white font-bold rounded-xl transition-colors"
                    onclick={onConfirm}
                >
                    <Refrigerator size={18} />
                    Add to Fridge
                    <ArrowRight size={16} class="ml-1" />
                </button>
                <button
                    class="w-full px-4 py-2.5 bg-app-bg border border-app-border text-app-text-muted hover:text-app-text hover:bg-app-surface-hover font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                    onclick={onSkip}
                >
                    <Trash2 size={18} />
                    Remove Anyway
                </button>
            </div>
        </div>
    </div>
{/if}
