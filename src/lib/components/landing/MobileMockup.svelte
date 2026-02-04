<script lang="ts">
    import { ShoppingCart } from "lucide-svelte";
    import {
        mockPlan,
        mealTypes,
        getDotColor,
        getMealStyles,
    } from "$lib/data/landingData";

    import { onMount, onDestroy, tick } from "svelte";

    interface Props {
        forceShow?: boolean;
    }

    let { forceShow = false }: Props = $props();

    // Mobile carousel state
    let mobileDayIndex = $state(0);
    let touchStartX = 0;
    let touchDiff = $state(0);
    let isSwiping = $state(false);
    let hasInteracted = $state(false);

    // Demo state
    let showModal = $state(false);

    // Cursor Simulation State
    let cursorPos = $state({ x: 0, y: 0 }); // px relative to carouselRef
    let isCursorClicking = $state(false);
    let showCursor = $state(false);

    // UI Interaction States (visual feedback)
    let isAddButtonActive = $state(false);
    let activeAddType = $state<string | null>(null);
    let isRecipeActive = $state(false);
    let activeRecipeName = $state<string | null>(null);

    // DOM References for exact coordinates
    let carouselRef: HTMLDivElement | undefined = $state();
    let addLunchRef: HTMLDivElement | undefined = $state();
    let addDinnerRef: HTMLDivElement | undefined = $state();
    let addSnackRef: HTMLDivElement | undefined = $state();
    let recipeTunaRef: HTMLDivElement | undefined = $state();
    let recipeRiceRef: HTMLDivElement | undefined = $state();
    let recipeSnackRef: HTMLDivElement | undefined = $state();

    function updateCursorTarget(target: HTMLElement | undefined) {
        if (!target || !carouselRef) return { x: 0, y: 0 };
        const carouselRect = carouselRef.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        return {
            x: targetRect.left - carouselRect.left + targetRect.width / 2,
            y: targetRect.top - carouselRect.top + targetRect.height / 2,
        };
    }

    // Initialize local plan with Monday meals empty
    let localPlan = $state(
        mockPlan.map((day) => {
            if (day.day === "Monday") {
                return {
                    ...day,
                    meals: {
                        ...day.meals,
                        lunch: [],
                        dinner: [],
                        snack: [],
                        note: [],
                    },
                };
            }
            return day;
        }),
    );

    function handleTouchStart(e: TouchEvent) {
        hasInteracted = true;
        touchStartX = e.touches[0].clientX;
        touchDiff = 0;
        isSwiping = true;
    }

    function handleTouchMove(e: TouchEvent) {
        touchDiff = e.touches[0].clientX - touchStartX;
    }

    function handleTouchEnd() {
        const SWIPE_THRESHOLD = 50;
        if (touchDiff > SWIPE_THRESHOLD && mobileDayIndex > 0) {
            mobileDayIndex--;
        } else if (
            touchDiff < -SWIPE_THRESHOLD &&
            mobileDayIndex < mockPlan.length - 1
        ) {
            mobileDayIndex++;
        }
        touchDiff = 0;
        isSwiping = false;
    }

    // Demo Animation Loop
    let demoAbortController: AbortController | null = null;

    // Timing constants for animation steps (in ms)
    const TIMING = {
        INITIAL_DELAY: 500,
        CURSOR_MOVE: 1000,
        CLICK_START: 300,
        MODAL_OPEN: 500,
        RECIPE_HOVER: 800,
        RECIPE_CLICK: 300,
        AFTER_ADD: 800,
        CURSOR_EXIT: 500,
        LOOP_DELAY: 2000,
    } as const;

    // Helper to create a cancellable delay
    function delay(ms: number, signal: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);
            signal.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new DOMException("Aborted", "AbortError"));
            });
        });
    }

    // Helper to check if demo should continue
    function shouldContinue(): boolean {
        return !hasInteracted;
    }

    // Helper to wait for an element to be rendered and get its position
    async function waitForElementAndGetPosition(
        getRef: () => HTMLDivElement | undefined,
        signal: AbortSignal,
        maxAttempts = 20,
    ): Promise<{ x: number; y: number }> {
        for (let i = 0; i < maxAttempts; i++) {
            await tick();
            const ref = getRef();
            if (ref && carouselRef) {
                const targetRect = ref.getBoundingClientRect();
                // Check if element has valid dimensions (is rendered)
                if (targetRect.width > 0 && targetRect.height > 0) {
                    const carouselRect = carouselRef.getBoundingClientRect();
                    return {
                        x:
                            targetRect.left -
                            carouselRect.left +
                            targetRect.width / 2,
                        y:
                            targetRect.top -
                            carouselRect.top +
                            targetRect.height / 2,
                    };
                }
            }
            // Wait a frame and try again
            await delay(50, signal);
        }
        // Fallback to center of carousel
        if (carouselRef) {
            const rect = carouselRef.getBoundingClientRect();
            return { x: rect.width / 2, y: rect.height / 2 };
        }
        return { x: 0, y: 0 };
    }

    // Reset all demo state to initial values
    function resetDemoState() {
        localPlan = mockPlan.map((day) => {
            if (day.day === "Monday") {
                return {
                    ...day,
                    meals: {
                        ...day.meals,
                        lunch: [],
                        dinner: [],
                        snack: [],
                        note: [],
                    },
                };
            }
            return day;
        });
        showModal = false;
        showCursor = false;
        isCursorClicking = false;
        isAddButtonActive = false;
        activeAddType = null;
        isRecipeActive = false;
        activeRecipeName = null;
        mobileDayIndex = 0;

        // Start position (off-bottom center)
        if (carouselRef) {
            const rect = carouselRef.getBoundingClientRect();
            cursorPos = { x: rect.width / 2, y: rect.height + 50 };
        }
    }

    // Update Monday's meals in localPlan
    function updateMondayMeals(meals: {
        lunch?: Array<{ name: string }>;
        dinner?: Array<{ name: string }>;
        snack?: Array<{ name: string }>;
    }) {
        localPlan = localPlan.map((day) => {
            if (day.day === "Monday") {
                return {
                    ...day,
                    meals: {
                        ...day.meals,
                        ...meals,
                    },
                };
            }
            return day;
        });
    }

    // Animate adding a single meal
    async function animateMealAddition(
        signal: AbortSignal,
        getAddButtonRef: () => HTMLDivElement | undefined,
        getRecipeRef: () => HTMLDivElement | undefined,
        mealType: string,
        recipeName: string,
        mealsAfterAdd: {
            lunch?: Array<{ name: string }>;
            dinner?: Array<{ name: string }>;
            snack?: Array<{ name: string }>;
        },
    ): Promise<void> {
        // Move cursor to add button
        // We wait a bit for the button to ensure it's mounted if it was just rendered
        await tick();
        cursorPos = updateCursorTarget(getAddButtonRef());
        await delay(TIMING.CURSOR_MOVE, signal);
        if (!shouldContinue()) return;

        // Click the add button
        isCursorClicking = true;
        isAddButtonActive = true;
        activeAddType = mealType;
        await delay(TIMING.CLICK_START, signal);
        if (!shouldContinue()) return;

        // Release click and show modal
        isCursorClicking = false;
        isAddButtonActive = false;
        showModal = true;
        await delay(TIMING.MODAL_OPEN, signal);
        if (!shouldContinue()) return;

        // Move cursor to recipe (wait for element to be rendered in modal)
        cursorPos = await waitForElementAndGetPosition(getRecipeRef, signal);
        await delay(TIMING.RECIPE_HOVER, signal);
        if (!shouldContinue()) return;

        // Click the recipe
        isCursorClicking = true;
        isRecipeActive = true;
        activeRecipeName = recipeName;
        await delay(TIMING.RECIPE_CLICK, signal);
        if (!shouldContinue()) return;

        // Complete selection and close modal
        isCursorClicking = false;
        isRecipeActive = false;
        showModal = false;
        updateMondayMeals(mealsAfterAdd);
        await delay(TIMING.AFTER_ADD, signal);
    }

    async function runDemoSequence(signal: AbortSignal): Promise<void> {
        try {
            // Initial delay before starting
            await delay(TIMING.INITIAL_DELAY, signal);
            if (!shouldContinue()) return;

            // Show cursor
            showCursor = true;

            // Step 1: Add Lunch
            await animateMealAddition(
                signal,
                () => addLunchRef,
                () => recipeTunaRef,
                "lunch",
                "Tuna Salad",
                { lunch: [{ name: "Tuna Salad" }] },
            );
            if (!shouldContinue()) return;

            // Step 2: Add Dinner
            await animateMealAddition(
                signal,
                () => addDinnerRef,
                () => recipeRiceRef,
                "dinner",
                "Egg Fried Rice",
                {
                    lunch: [{ name: "Tuna Salad" }],
                    dinner: [{ name: "Egg Fried Rice" }],
                },
            );
            if (!shouldContinue()) return;

            // Step 3: Add Snack
            await animateMealAddition(
                signal,
                () => addSnackRef,
                () => recipeSnackRef,
                "snack",
                "Greek Yogurt",
                {
                    lunch: [{ name: "Tuna Salad" }],
                    dinner: [{ name: "Egg Fried Rice" }],
                    snack: [{ name: "Greek Yogurt" }],
                },
            );
            if (!shouldContinue()) return;

            // Move cursor away
            if (carouselRef) {
                const rect = carouselRef.getBoundingClientRect();
                cursorPos = { x: rect.width / 2, y: rect.height + 50 };
            }
            await delay(TIMING.CURSOR_EXIT, signal);
            if (!shouldContinue()) return;

            // Wait before looping
            await delay(TIMING.LOOP_DELAY, signal);
            if (!shouldContinue()) return;

            // Loop the demo
            runDemo();
        } catch (error) {
            // AbortError is expected when demo is cancelled
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            throw error;
        }
    }

    function runDemo() {
        // Cancel any existing demo
        if (demoAbortController) {
            demoAbortController.abort();
        }

        // Reset state
        resetDemoState();

        // Start new demo sequence
        demoAbortController = new AbortController();
        runDemoSequence(demoAbortController.signal);
    }

    onMount(() => {
        // Wait a tick for layout
        setTimeout(runDemo, 500);
    });

    onDestroy(() => {
        if (demoAbortController) {
            demoAbortController.abort();
        }
    });

    $effect(() => {
        if (hasInteracted) {
            if (demoAbortController) {
                demoAbortController.abort();
            }
            showModal = false;
            showCursor = false;
            localPlan = mockPlan; // Restore full plan
        }
    });
</script>

<div class="{forceShow ? 'flex' : 'md:hidden flex'} justify-center py-6">
    <div class="relative w-[85vw] max-w-[375px] mx-auto">
        <div
            class="bg-[#1a1a1b] rounded-[48px] p-2.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
        >
            <!-- Dynamic Island -->
            <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20"
            ></div>

            <!-- Screen -->
            <div
                class="bg-white rounded-[40px] overflow-hidden relative z-0 isolate min-h-[720px]"
            >
                <!-- Status bar -->
                <div
                    class="flex items-center justify-between px-8 pt-4 pb-2 bg-white"
                >
                    <span class="text-[12px] font-bold text-black">9:41</span>
                    <div class="flex items-center gap-1.5">
                        <div class="w-4 h-4 text-black">
                            <svg viewBox="0 0 24 24" fill="currentColor"
                                ><path
                                    d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
                                /></svg
                            >
                        </div>
                        <div class="w-6 h-3 bg-black rounded-[2px] relative">
                            <div
                                class="absolute right-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-black rounded-r-[1px]"
                            ></div>
                        </div>
                    </div>
                </div>

                <!-- App Toolbar -->
                <div
                    class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
                >
                    <span class="text-2xl font-black text-app-primary"
                        >Plan</span
                    >
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <ShoppingCart size={22} class="text-gray-600" />
                            <div
                                class="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-bold text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white"
                            >
                                25
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Day Carousel -->
                <div
                    bind:this={carouselRef}
                    class="relative h-[600px] overflow-hidden bg-white"
                    ontouchstart={handleTouchStart}
                    ontouchmove={handleTouchMove}
                    ontouchend={handleTouchEnd}
                >
                    {#each localPlan as day, index}
                        <div
                            class="absolute inset-0 {isSwiping
                                ? ''
                                : 'transition-transform duration-500 ease-out'}"
                            style="transform: translateX(calc({(index -
                                mobileDayIndex) *
                                100}% + {touchDiff}px));"
                        >
                            <div class="h-full flex flex-col">
                                <div
                                    class="py-2.5 text-center border-b border-app-border bg-white"
                                >
                                    <span
                                        class="text-base font-black text-gray-800"
                                        >{day.day}</span
                                    >
                                </div>
                                <div class="flex-1 overflow-hidden">
                                    {#each mealTypes as type}
                                        <div
                                            class="py-3 px-4 border-b border-app-border last:border-0 min-h-24"
                                        >
                                            <div
                                                class="flex items-center gap-2.5 mb-2"
                                            >
                                                <div
                                                    class="w-2.5 h-2.5 rounded-full {getDotColor(
                                                        type,
                                                    )}"
                                                ></div>
                                                <span
                                                    class="text-[11px] font-bold text-gray-400 capitalize tracking-wider"
                                                    >{type}</span
                                                >
                                            </div>
                                            <div class="space-y-2">
                                                {#if day.meals && day.meals[type] && day.meals[type].length > 0}
                                                    {#each day.meals[type] as meal}
                                                        <div
                                                            class="flex items-center justify-between p-2 rounded-xl border shadow-sm transition-all duration-500 {getMealStyles(
                                                                type,
                                                            )} animate-in fade-in slide-in-from-bottom-2"
                                                        >
                                                            <span
                                                                class="text-sm font-bold text-gray-800"
                                                                >{meal?.name ||
                                                                    ""}</span
                                                            >
                                                        </div>
                                                    {/each}
                                                {:else if day.day === "Monday"}
                                                    <!-- Empty Slot Placeholder -->
                                                    {#if type === "lunch"}
                                                        <div
                                                            bind:this={
                                                                addLunchRef
                                                            }
                                                            class="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center transition-transform duration-200 {activeAddType ===
                                                                'lunch' &&
                                                            isAddButtonActive
                                                                ? 'scale-95 bg-gray-50'
                                                                : ''}"
                                                        >
                                                            <span
                                                                class="text-xs font-bold text-gray-400"
                                                                >Add Lunch</span
                                                            >
                                                        </div>
                                                    {:else if type === "dinner"}
                                                        <div
                                                            bind:this={
                                                                addDinnerRef
                                                            }
                                                            class="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center transition-transform duration-200 {activeAddType ===
                                                                'dinner' &&
                                                            isAddButtonActive
                                                                ? 'scale-95 bg-gray-50'
                                                                : ''}"
                                                        >
                                                            <span
                                                                class="text-xs font-bold text-gray-400"
                                                                >Add Dinner</span
                                                            >
                                                        </div>
                                                    {:else if type === "snack"}
                                                        <div
                                                            bind:this={
                                                                addSnackRef
                                                            }
                                                            class="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center transition-transform duration-200 {activeAddType ===
                                                                'snack' &&
                                                            isAddButtonActive
                                                                ? 'scale-95 bg-gray-50'
                                                                : ''}"
                                                        >
                                                            <span
                                                                class="text-xs font-bold text-gray-400"
                                                                >Add Snack</span
                                                            >
                                                        </div>
                                                    {:else}
                                                        <div
                                                            class="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center"
                                                        >
                                                            <span
                                                                class="text-xs font-bold text-gray-400"
                                                            >
                                                                Add {type
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    type.slice(
                                                                        1,
                                                                    )}
                                                            </span>
                                                        </div>
                                                    {/if}
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}

                    <!-- Recipe Selection Modal -->
                    {#if showModal}
                        <div
                            class="absolute inset-x-4 top-[37%] bg-white rounded-2xl shadow-2xl p-4 z-30 animate-in fade-in zoom-in-95 duration-300 border border-gray-100"
                        >
                            <h3
                                class="text-sm font-bold text-app-text mb-3 px-1"
                            >
                                Select Recipe
                            </h3>
                            <div class="space-y-2.5">
                                <div
                                    bind:this={recipeTunaRef}
                                    class="group flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 {isRecipeActive &&
                                    activeRecipeName === 'Tuna Salad'
                                        ? 'bg-app-primary/15 border-app-primary/30 scale-[0.98] shadow-inner'
                                        : 'bg-gray-50/50 border-gray-100 hover:border-app-primary/20 hover:bg-app-primary/5'}"
                                >
                                    <div
                                        class="w-12 h-12 rounded-xl bg-white shrink-0 overflow-hidden shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="/mockup/tuna.png"
                                            alt="Tuna Salad"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-[13px] font-black text-gray-800"
                                        >
                                            Tuna Salad
                                        </p>
                                        <div
                                            class="flex items-center gap-2 mt-0.5"
                                        >
                                            <span
                                                class="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"
                                                >2 servings</span
                                            >
                                            <span
                                                class="text-[10px] font-medium text-app-primary/70"
                                                >• 10m</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <div
                                    bind:this={recipeRiceRef}
                                    class="group flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 {isRecipeActive &&
                                    activeRecipeName === 'Egg Fried Rice'
                                        ? 'bg-app-primary/15 border-app-primary/30 scale-[0.98] shadow-inner'
                                        : 'bg-gray-50/50 border-gray-100 hover:border-app-primary/20 hover:bg-app-primary/5'}"
                                >
                                    <div
                                        class="w-12 h-12 rounded-xl bg-white shrink-0 overflow-hidden shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="/mockup/rice.png"
                                            alt="Rice"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-[13px] font-black text-gray-800"
                                        >
                                            Egg Fried Rice
                                        </p>
                                        <div
                                            class="flex items-center gap-2 mt-0.5"
                                        >
                                            <span
                                                class="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"
                                                >1-2 servings</span
                                            >
                                            <span
                                                class="text-[10px] font-medium text-app-primary/70"
                                                >• 12m</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <div
                                    bind:this={recipeSnackRef}
                                    class="group flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 {isRecipeActive &&
                                    activeRecipeName === 'Greek Yogurt'
                                        ? 'bg-app-primary/15 border-app-primary/30 scale-[0.98] shadow-inner'
                                        : 'bg-gray-50/50 border-gray-100 hover:border-app-primary/20 hover:bg-app-primary/5'}"
                                >
                                    <div
                                        class="w-12 h-12 rounded-xl bg-white shrink-0 overflow-hidden shadow-sm border border-gray-100"
                                    >
                                        <img
                                            src="/mockup/yogurt.png"
                                            alt="Yogurt"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-[13px] font-black text-gray-800"
                                        >
                                            Greek Yogurt
                                        </p>
                                        <div
                                            class="flex items-center gap-2 mt-0.5"
                                        >
                                            <span
                                                class="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"
                                                >1 serving</span
                                            >
                                            <span
                                                class="text-[10px] font-medium text-app-primary/70"
                                                >• 2m</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- Simulated Touch Cursor -->
                    <div
                        class="absolute transition-all duration-700 ease-in-out z-50 pointer-events-none"
                        style="
                            left: {cursorPos.x}px; 
                            top: {cursorPos.y}px; 
                            opacity: {showCursor ? 1 : 0};
                            transform: translate(-50%, -50%) scale({isCursorClicking
                            ? 0.8
                            : 1});
                        "
                    >
                        <div
                            class="w-8 h-8 rounded-full bg-gray-400/30 border border-gray-400/50 backdrop-blur-sm shadow-xl"
                        ></div>
                    </div>
                </div>

                <!-- Home Indicator -->
                <div
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 rounded-full"
                ></div>
            </div>
        </div>
    </div>
</div>
