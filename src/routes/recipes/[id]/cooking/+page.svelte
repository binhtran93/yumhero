<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import {
        ChefHat,
        Check,
        ChevronLeft,
        ChevronRight,
        X,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";

    let recipeId = $derived($page.params.id);

    // Derived store to fetch the specific recipe
    let recipeStore = derived(
        user,
        ($user, set) => {
            if (!$user) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<Recipe>(
                `users/${$user.uid}/recipes/${recipeId}`,
            );
            return store.subscribe(set);
        },
        { data: null, loading: true } as DocumentState<Recipe>,
    );

    let recipe = $derived($recipeStore.data);
    let loading = $derived($recipeStore.loading);

    // Track completed steps
    let completedSteps = $state<boolean[]>([]);
    let currentStepIndex = $state(0);

    $effect(() => {
        if (recipe && completedSteps.length === 0) {
            completedSteps = new Array(recipe.instructions.length).fill(false);
        }
    });

    function toggleStep(index: number) {
        completedSteps[index] = !completedSteps[index];
    }

    function nextStep() {
        if (recipe && currentStepIndex < recipe.instructions.length - 1) {
            currentStepIndex++;
        }
    }

    function prevStep() {
        if (currentStepIndex > 0) {
            currentStepIndex--;
        }
    }

    // Swipe logic
    let touchStartX = 0;
    let touchEndX = 0;

    function handleTouchStart(e: TouchEvent) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e: TouchEvent) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            // Swiped left
            nextStep();
        }
        if (touchEndX > touchStartX + threshold) {
            // Swiped right
            prevStep();
        }
    }

    let completedCount = $derived(completedSteps.filter(Boolean).length);
    let allDone = $derived(
        recipe && completedCount === recipe.instructions.length,
    );
</script>

<div class="h-svh flex flex-col bg-app-bg overflow-hidden select-none">
    <!-- Header with Toolbar -->
    <div class="shrink-0 z-20 bg-app-bg border-b border-app-border">
        <Header
            title="Cooking Mode"
            showBack={true}
            backUrl="/recipes/{recipeId}"
        />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-0 bg-app-bg">
        {#if loading}
            <div class="flex items-center justify-center h-full">
                <div
                    class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if recipe}
            <div
                class="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative"
                ontouchstart={handleTouchStart}
                ontouchend={handleTouchEnd}
            >
                <div
                    class="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-6"
                >
                    <!-- Chef's Note (Mini) -->
                    {#if recipe.prepNotes}
                        <div
                            class="bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-3 text-amber-900 shrink-0"
                        >
                            <ChefHat
                                size={16}
                                class="shrink-0 text-amber-600 mt-0.5"
                            />
                            <p
                                class="text-xs leading-relaxed font-medium line-clamp-2"
                            >
                                <span class="font-bold">Chef's Note:</span>
                                {recipe.prepNotes}
                            </p>
                        </div>
                    {/if}

                    <!-- Card Stepper -->
                    <div class="flex-1 relative min-h-0">
                        {#key currentStepIndex}
                            <div
                                in:fly={{ x: 100, duration: 300, delay: 200 }}
                                out:fly={{ x: -100, duration: 300 }}
                                class="stepper-transition-container inset-0 flex flex-col"
                            >
                                <button
                                    onclick={() => toggleStep(currentStepIndex)}
                                    class="flex-1 bg-app-surface border-2 rounded-3xl p-6 md:p-12 text-left transition-all shadow-sm flex flex-col items-center justify-center gap-8 group active:scale-[0.98] {completedSteps[
                                        currentStepIndex
                                    ]
                                        ? 'border-app-primary bg-app-primary/[0.02]'
                                        : 'border-app-border hover:border-app-primary/30'}"
                                >
                                    <div
                                        class="flex flex-col items-center text-center gap-6"
                                    >
                                        <!-- Step Indicator -->
                                        <div
                                            class="flex items-center justify-center gap-2"
                                        >
                                            {#if completedSteps[currentStepIndex]}
                                                <div
                                                    class="w-8 h-8 rounded-full bg-app-primary flex items-center justify-center shadow-lg transform scale-110 transition-transform duration-300"
                                                >
                                                    <Check
                                                        size={20}
                                                        class="text-white"
                                                    />
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-10 h-10 rounded-full border-2 border-app-border bg-app-surface-hover flex items-center justify-center text-lg font-black text-app-text-muted"
                                                >
                                                    {currentStepIndex + 1}
                                                </div>
                                            {/if}
                                            <span
                                                class="text-lg font-bold text-app-text-muted"
                                                >/ {recipe.instructions
                                                    .length}</span
                                            >
                                        </div>

                                        <!-- Instruction Content -->
                                        <div
                                            class="max-h-[30vh] md:max-h-[40vh] overflow-y-auto px-2"
                                        >
                                            <p
                                                class="text-xl md:text-3xl font-medium text-app-text leading-relaxed {completedSteps[
                                                    currentStepIndex
                                                ]
                                                    ? 'line-through opacity-50'
                                                    : ''}"
                                            >
                                                {recipe.instructions[
                                                    currentStepIndex
                                                ]}
                                            </p>
                                        </div>

                                        <!-- Tap to Complete Hint -->
                                        <div
                                            class="mt-4 text-sm font-bold uppercase tracking-widest {completedSteps[
                                                currentStepIndex
                                            ]
                                                ? 'text-app-primary'
                                                : 'text-app-text-muted group-hover:text-app-primary'} transition-colors"
                                        >
                                            {completedSteps[currentStepIndex]
                                                ? "Completed"
                                                : "Tap to Mark Complete"}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        {/key}
                    </div>

                    <!-- Navigation Controls -->
                    <div
                        class="shrink-0 flex items-center justify-between gap-4 py-4"
                    >
                        <button
                            onclick={prevStep}
                            disabled={currentStepIndex === 0}
                            class="flex-1 h-14 bg-app-surface border border-app-border rounded-2xl flex items-center justify-center gap-2 font-bold text-app-text transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-app-surface-hover"
                        >
                            <ChevronLeft size={24} />
                            <span class="hidden sm:inline">Previous</span>
                        </button>

                        <button
                            onclick={nextStep}
                            disabled={currentStepIndex ===
                                recipe.instructions.length - 1}
                            class="flex-1 h-14 bg-app-primary text-white rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-md active:scale-95 disabled:bg-app-surface disabled:border-app-border disabled:text-app-text-muted disabled:shadow-none hover:bg-app-primary/90"
                        >
                            <span class="hidden sm:inline">Next Step</span>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <!-- Completion Overlay -->
                {#if allDone}
                    <div
                        transition:fade
                        class="absolute inset-0 z-50 bg-app-bg flex flex-col items-center justify-center text-center p-8"
                    >
                        <div
                            class="w-32 h-32 rounded-full bg-app-primary/10 flex items-center justify-center mb-8 animate-bounce"
                        >
                            <Check size={64} class="text-app-primary" />
                        </div>
                        <h3
                            class="text-4xl font-display font-black text-app-text mb-4"
                        >
                            All Done!
                        </h3>
                        <p class="text-app-text-muted text-xl italic mb-12">
                            Everything is ready. Bon Appétit!
                        </p>
                        <button
                            onclick={() => goto(`/recipes/${recipeId}`)}
                            class="px-10 py-4 bg-app-primary text-white font-bold rounded-2xl shadow-xl hover:bg-app-primary/90 transition-all active:scale-95"
                        >
                            Back to Recipe
                        </button>
                    </div>
                {/if}
            </div>
        {:else}
            <div
                class="flex-1 flex flex-col items-center justify-center text-center px-4"
            >
                <div
                    class="w-24 h-24 bg-app-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
                >
                    <span class="text-4xl">👨‍🍳</span>
                </div>
                <h2 class="text-2xl font-display font-bold text-app-text mb-2">
                    Recipe not found
                </h2>
                <a
                    href="/recipes"
                    class="px-6 py-3 bg-app-primary text-white font-bold rounded-xl shadow-lg mt-6"
                >
                    Back to Cookbook
                </a>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Ensure the absolute container used for transitions fills its parent */
    .stepper-transition-container {
        position: absolute;
        width: 100%;
    }
</style>
