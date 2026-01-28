<script lang="ts">
    import { X, ChefHat, Check } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import type { Recipe } from "$lib/types";

    interface Props {
        recipe: Recipe;
        onClose: () => void;
    }

    let { recipe, onClose }: Props = $props();

    // Track completed steps - use array for proper reactivity
    let completedSteps = $state<boolean[]>(
        new Array(recipe.instructions.length).fill(false),
    );

    function toggleStep(index: number) {
        completedSteps[index] = !completedSteps[index];
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            onClose();
        }
    }

    let completedCount = $derived(completedSteps.filter(Boolean).length);
</script>

```html
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
                        <ChefHat size={20} class="text-app-primary" />
                    </div>
                    <div>
                        <h2
                            class="text-xl md:text-2xl font-display font-bold text-app-text"
                        >
                            Cooking Mode
                        </h2>
                        <p class="text-sm text-app-text-muted">
                            {recipe.title}
                        </p>
                    </div>
                </div>
                <button
                    onclick={onClose}
                    class="w-10 h-10 rounded-full bg-app-surface-hover hover:bg-app-border transition-colors flex items-center justify-center"
                    aria-label="Close cooking mode"
                >
                    <X size={20} class="text-app-text" />
                </button>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
            <!-- Progress Bar -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold text-app-text-muted">
                        Progress
                    </span>
                    <span class="text-sm font-semibold text-app-text">
                        {completedCount} / {recipe.instructions.length}
                    </span>
                </div>
                <div
                    class="w-full h-2 bg-app-surface-hover rounded-full overflow-hidden"
                >
                    <div
                        class="h-full bg-app-primary transition-all duration-300"
                        style="width: {(completedCount /
                            recipe.instructions.length) *
                            100}%"
                    ></div>
                </div>
            </div>

            <!-- Chef's Note -->
            {#if recipe.prepNotes}
                <div
                    class="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 text-amber-900 mb-6"
                >
                    <ChefHat size={20} class="shrink-0 mt-0.5 text-amber-600" />
                    <div
                        class="text-sm md:text-base leading-relaxed font-medium"
                    >
                        <span
                            class="block font-bold text-xs uppercase tracking-wide text-amber-700 mb-1"
                            >Chef's Note</span
                        >
                        {recipe.prepNotes}
                    </div>
                </div>
            {/if}

            <!-- Instructions Grid - Responsive columns -->
            <div
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5"
            >
                {#each recipe.instructions as step, i}
                    <button
                        onclick={() => toggleStep(i)}
                        class="bg-app-surface border-2 rounded-2xl p-5 md:p-6 text-left transition-all hover:shadow-lg {completedSteps[
                            i
                        ]
                            ? 'border-app-primary/50 bg-app-primary/5'
                            : 'border-app-border hover:border-app-primary/30'}"
                    >
                        <div class="flex items-start gap-4">
                            <!-- Step Number / Checkbox -->
                            <div class="shrink-0">
                                {#if completedSteps[i]}
                                    <div
                                        class="w-10 h-10 rounded-full bg-app-primary flex items-center justify-center"
                                    >
                                        <Check size={20} class="text-white" />
                                    </div>
                                {:else}
                                    <div
                                        class="w-10 h-10 rounded-full border-2 border-app-border bg-app-surface-hover flex items-center justify-center text-lg font-bold text-app-text-muted"
                                    >
                                        {i + 1}
                                    </div>
                                {/if}
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0 pt-1">
                                <p
                                    class="text-base md:text-lg text-app-text leading-relaxed {completedSteps[
                                        i
                                    ]
                                        ? 'line-through opacity-60'
                                        : ''}"
                                >
                                    {step}
                                </p>
                            </div>
                        </div>
                    </button>
                {/each}
            </div>

            <!-- Completion Message -->
            {#if completedCount === recipe.instructions.length}
                <div
                    class="mt-8 py-10 flex flex-col items-center justify-center text-center"
                >
                    <div
                        class="w-20 h-20 rounded-full bg-app-primary/10 flex items-center justify-center mb-4"
                    >
                        <Check size={40} class="text-app-primary" />
                    </div>
                    <h3
                        class="text-2xl font-display font-bold text-app-text mb-2"
                    >
                        All Done!
                    </h3>
                    <p class="text-app-text-muted text-lg italic">
                        Bon Appétit!
                    </p>
                </div>
            {/if}
        </div>
    </div>
</div>
