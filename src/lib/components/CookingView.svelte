<script lang="ts">
    import {
        ChefHat,
        Check,
        ChevronLeft,
        ChevronRight,
        X,
    } from "lucide-svelte";
    import type { Recipe } from "$lib/types";
    import Header from "./Header.svelte";

    interface Props {
        recipe: Recipe;
        onBack: () => void;
        onDone: () => void;
    }

    let { recipe, onBack, onDone }: Props = $props();

    // Track completed steps
    let completedSteps = $state<boolean[]>([]);
    let currentStepIndex = $state(0);

    $effect(() => {
        if (recipe && completedSteps.length === 0) {
            completedSteps = new Array(recipe.instructions.length).fill(false);
            currentStepIndex = 0; // Reset when recipe changes
        }
    });

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

    // Original Logic: let allDone = $derived(recipe && completedCount === recipe.instructions.length);
    // But original logic didn't seem to have a "check step" UI in the code I saw, only navigation.
    // Wait, I saw toggleStep but it wasn't used in the template.
    // The original template used "Next Step" button.
    // Let's stick to the visible behavior: Last step reached? Or specific "All Done" state?
    // The original code had:
    // let allDone = $derived(recipe && completedCount === recipe.instructions.length);
    // But `completedCount` relied on `completedSteps` which was only updated by `toggleStep`.
    // And `toggleStep` was NOT CALLED in the template provided.
    // So `allDone` might have been broken or I missed something.
    // However, `nextStep` just increments index.
    // Let's assume reaching the end is enough or add a "Finish" button on last step.
    // Actually looking at the original template again...
    // It shows "All Done!" overlay if `allDone` is true.
    // And `allDone` is true if `completedCount === total`.
    // But where is completion happening?
    // Ah, I might have missed `toggleStep` usage or it was intended but not implemented fully.
    // Let's implement a logical "Finish" flow. When on last step, "Next Step" becomes "Finish".

    function handleNextOrFinish() {
        if (currentStepIndex < recipe.instructions.length - 1) {
            nextStep();
        } else {
            // Mark all as done or just trigger done
            onDone();
        }
    }
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden select-none">
    <!-- Header -->
    <Header title="Cooking Mode" showBack={true} {onBack} />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-0 bg-app-bg">
        <div
            class="flex-1 flex flex-col p-4 overflow-hidden relative"
            ontouchstart={handleTouchStart}
            ontouchend={handleTouchEnd}
        >
            <div class="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-6">
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
                <div class="flex-1 relative min-h-0 flex flex-col">
                    <div
                        class="flex-1 bg-app-surface border rounded-3xl p-4 text-left shadow-sm flex flex-col items-center justify-center gap-8 border-app-border"
                    >
                        <div
                            class="flex flex-col items-center text-center gap-6"
                        >
                            <!-- Step Indicator -->
                            <div class="flex items-center justify-center gap-2">
                                <span
                                    class="text-sm font-black tracking-widest uppercase text-app-text-muted"
                                >
                                    Step {currentStepIndex + 1} / {recipe
                                        .instructions.length}
                                </span>
                            </div>

                            <!-- Instruction Content -->
                            <div class="max-h-[70vh] overflow-y-auto px-2">
                                <p
                                    class="text-xl md:text-3xl font-medium text-app-text leading-relaxed"
                                >
                                    {recipe.instructions[currentStepIndex]}
                                </p>
                            </div>
                        </div>
                    </div>
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
                        onclick={handleNextOrFinish}
                        class="flex-1 h-14 bg-app-primary text-white rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-md active:scale-95 hover:bg-app-primary/90"
                    >
                        {#if currentStepIndex === recipe.instructions.length - 1}
                            <span class="hidden sm:inline">Finish Cooking</span>
                            <Check size={24} />
                        {:else}
                            <span class="hidden sm:inline">Next Step</span>
                            <ChevronRight size={24} />
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
