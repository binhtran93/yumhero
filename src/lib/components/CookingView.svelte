<script lang="ts">
    import { ChefHat, Check, ChevronLeft, ChevronRight } from "lucide-svelte";
    import { twMerge } from "tailwind-merge";
    import type { Recipe } from "$lib/types";

    interface Props {
        recipe: Recipe;
        onDone: () => void;
    }

    let { recipe, onDone }: Props = $props();

    let currentStepIndex = $state(0);
    let containerRef = $state<HTMLElement | null>(null);

    // Swipe Physics
    let isDragging = $state(false);
    let startX = 0;
    let currentX = $state(0);
    let translateX = $state(0);

    const SWIPE_THRESHOLD = 50;

    // Calculate the percentage width of a single step relative to the full container
    let stepSize = $derived(100 / recipe.instructions.length);

    function handleTouchStart(e: TouchEvent) {
        isDragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
        // Disable transition while dragging for 1:1 movement
        if (containerRef) {
            containerRef.style.transition = "none";
        }
    }

    function handleTouchMove(e: TouchEvent) {
        if (!isDragging || !containerRef) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        // Calculate drag proportion relative to the VIEW width
        const viewWidth =
            containerRef.parentElement?.clientWidth || window.innerWidth;
        const dragRatio = diff / viewWidth;

        // Convert drag ratio to percentage of container width
        const dragPercent = dragRatio * stepSize;

        const baseTranslate = -currentStepIndex * stepSize;

        // Resistance at edges
        if (
            (currentStepIndex === 0 && diff > 0) ||
            (currentStepIndex === recipe.instructions.length - 1 && diff < 0)
        ) {
            translateX = baseTranslate + dragPercent * 0.3; // 30% resistance
        } else {
            translateX = baseTranslate + dragPercent;
        }
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Restore transition
        if (containerRef) {
            containerRef.style.transition =
                "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)";
        }

        const diff = currentX - startX;
        if (diff > SWIPE_THRESHOLD && currentStepIndex > 0) {
            currentStepIndex--;
        } else if (
            diff < -SWIPE_THRESHOLD &&
            currentStepIndex < recipe.instructions.length - 1
        ) {
            currentStepIndex++;
        }

        // Snap to current step
        translateX = -currentStepIndex * stepSize;
    }

    $effect(() => {
        // Update translate when index changes (e.g. via buttons)
        if (!isDragging) {
            translateX = -currentStepIndex * stepSize;
        }
    });

    function nextStep() {
        if (currentStepIndex < recipe.instructions.length - 1) {
            currentStepIndex++;
        } else {
            onDone();
        }
    }

    function prevStep() {
        if (currentStepIndex > 0) {
            currentStepIndex--;
        }
    }
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden select-none">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-0 relative">
        <!-- Progress Indicators -->
        <div
            class="absolute top-4 left-0 right-0 z-10 flex justify-center gap-1.5 px-4"
        >
            {#each recipe.instructions as _, i}
                <div
                    class={twMerge(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentStepIndex
                            ? "w-6 bg-app-primary"
                            : "w-1.5 bg-app-border",
                    )}
                ></div>
            {/each}
        </div>

        <!-- Carousel Container -->
        <div
            class="flex-1 overflow-hidden relative"
            ontouchstart={handleTouchStart}
            ontouchmove={handleTouchMove}
            ontouchend={handleTouchEnd}
        >
            <div
                bind:this={containerRef}
                class="h-full flex transition-transform duration-300 ease-out"
                style="transform: translateX({translateX}%); width: {recipe
                    .instructions.length * 100}%"
            >
                {#each recipe.instructions as step, i}
                    <!-- Individual Slide -->
                    <div
                        class="h-full w-full flex flex-col items-center justify-center p-6"
                        style="width: {100 / recipe.instructions.length}%"
                    >
                        <div
                            class="w-full max-w-2xl bg-app-surface border border-app-border rounded-3xl p-8 shadow-sm flex flex-col gap-6 min-h-[50vh] relative overflow-hidden"
                        >
                            <!-- Step Number Watermark -->
                            <div
                                class="absolute -right-4 -top-4 text-[120px] font-black text-app-text/5 leading-none select-none pointer-events-none"
                            >
                                {i + 1}
                            </div>

                            <!-- Chef's Note (Only on first slide) -->
                            {#if i === 0 && recipe.prepNotes}
                                <div
                                    class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 text-amber-900 z-10 mb-4"
                                >
                                    <ChefHat
                                        size={20}
                                        class="shrink-0 text-amber-600 mt-1"
                                    />
                                    <div>
                                        <div
                                            class="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1"
                                        >
                                            Chef's Note
                                        </div>
                                        <p
                                            class="text-sm leading-relaxed font-medium"
                                        >
                                            {recipe.prepNotes}
                                        </p>
                                    </div>
                                </div>
                            {/if}

                            <div
                                class="flex-1 flex flex-col items-center justify-center text-center z-10"
                            >
                                <span
                                    class="text-xs font-bold uppercase tracking-widest text-app-text-muted mb-4"
                                >
                                    Step {currentStepIndex + 1} of {recipe
                                        .instructions.length}
                                </span>
                                <h3
                                    class="text-2xl md:text-3xl font-medium text-app-text leading-relaxed"
                                >
                                    {step}
                                </h3>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Navigation Controls -->
        <div
            class="shrink-0 p-4 pb-8 w-full max-w-3xl mx-auto flex items-center gap-4 z-20"
        >
            <button
                onclick={prevStep}
                disabled={currentStepIndex === 0}
                class="h-14 w-14 rounded-full border border-app-border bg-app-surface text-app-text flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-app-surface-hover shadow-sm"
                aria-label="Previous step"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onclick={nextStep}
                class="flex-1 h-14 bg-app-primary text-white rounded-full flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-app-primary/20 transition-all active:scale-95 hover:bg-app-primary/90"
            >
                {#if currentStepIndex === recipe.instructions.length - 1}
                    <span>Finish Cooking</span>
                    <Check size={20} />
                {:else}
                    <span>Next Step</span>
                    <ChevronRight size={20} />
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    /* Prevent default touch actions like browser back swipe or scrolling */
    :global(body) {
        overscroll-behavior-y: none;
    }
</style>
