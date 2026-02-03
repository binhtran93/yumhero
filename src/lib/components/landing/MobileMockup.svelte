<script lang="ts">
    import { ShoppingCart } from "lucide-svelte";
    import {
        mockPlan,
        mealTypes,
        getDotColor,
        getMealStyles,
    } from "$lib/data/landingData";

    import { onMount, onDestroy } from "svelte";

    // Mobile carousel state
    let mobileDayIndex = $state(0);
    let touchStartX = 0;
    let touchDiff = $state(0);
    let isSwiping = $state(false);
    let hasInteracted = $state(false);

    // Demo state
    let showModal = $state(false);
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
    let demoTimeout: NodeJS.Timeout;

    function runDemo() {
        // Reset to empty
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

        // Step 1: Open Modal after 1s
        demoTimeout = setTimeout(() => {
            if (hasInteracted) return;
            showModal = true;

            // Step 2: Select item & fill slot after 1.5s
            demoTimeout = setTimeout(() => {
                if (hasInteracted) return;
                showModal = false;

                // Fill with Tuna Salad
                localPlan = mockPlan.map((day) => {
                    if (day.day === "Monday") {
                        return {
                            ...day,
                            meals: {
                                ...day.meals,
                                lunch: [{ name: "Tuna Salad" }],
                                dinner: [], // Keep empty
                                snack: [], // Keep empty
                                note: [], // Keep empty
                            },
                        };
                    }
                    return day;
                });

                // Step 3: Reset loop after 3s
                demoTimeout = setTimeout(() => {
                    if (hasInteracted) return;
                    runDemo();
                }, 3000);
            }, 1500);
        }, 1000);
    }

    onMount(() => {
        runDemo();
    });

    onDestroy(() => {
        clearTimeout(demoTimeout);
    });

    $effect(() => {
        if (hasInteracted) {
            clearTimeout(demoTimeout);
            showModal = false;
            localPlan = mockPlan; // Restore full plan
        }
    });
</script>

<div class="md:hidden flex justify-center py-6">
    <div class="relative w-[85vw]">
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
                                                {:else if day.day === "Monday" && type === "lunch"}
                                                    <!-- Empty Slot Placeholder -->
                                                    <div
                                                        class="w-full h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center animate-pulse"
                                                    >
                                                        <span
                                                            class="text-xs font-bold text-gray-400"
                                                            >Add Lunch</span
                                                        >
                                                    </div>
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
                            class="absolute inset-x-4 top-[30%] bg-white rounded-2xl shadow-2xl p-4 z-30 animate-in fade-in zoom-in-95 duration-300 border border-gray-100"
                        >
                            <h3
                                class="text-sm font-bold text-app-text mb-3 px-1"
                            >
                                Select Recipe
                            </h3>
                            <div class="space-y-2">
                                <div
                                    class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors bg-app-primary/5 border border-app-primary/20"
                                >
                                    <div
                                        class="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden"
                                    >
                                        <img
                                            src="/mockup/tuna.png"
                                            alt="Tuna Salad"
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-xs font-bold text-app-text"
                                        >
                                            Tuna Salad
                                        </p>
                                        <p
                                            class="text-[10px] text-gray-500 mt-0.5"
                                        >
                                            320 kcal • 10m
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors opacity-50"
                                >
                                    <div
                                        class="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden"
                                    >
                                        <img
                                            src="/mockup/pasta.png"
                                            alt="Pasta"
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-xs font-bold text-app-text"
                                        >
                                            15-min Pasta
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Home Indicator -->
                <div
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 rounded-full"
                ></div>
            </div>
        </div>
    </div>
</div>
