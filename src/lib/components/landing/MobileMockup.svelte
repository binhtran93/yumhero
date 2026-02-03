<script lang="ts">
    import { ShoppingCart } from "lucide-svelte";
    import {
        mockPlan,
        mealTypes,
        getDotColor,
        getMealStyles,
    } from "$lib/data/landingData";

    // Mobile carousel state
    let mobileDayIndex = $state(0);
    let touchStartX = 0;
    let touchDiff = $state(0);
    let isSwiping = $state(false);

    function handleTouchStart(e: TouchEvent) {
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
                    {#each mockPlan as day, index}
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
                                        >{day.day} {day.date}</span
                                    >
                                </div>
                                <div class="flex-1 overflow-hidden px-4">
                                    {#each mealTypes as type}
                                        <div
                                            class="py-3 border-b border-gray-50 last:border-0"
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
                                                {#if day.meals && day.meals[type]}
                                                    {#each day.meals[type] as meal}
                                                        <div
                                                            class="flex items-center justify-between p-2 rounded-xl border shadow-sm {getMealStyles(
                                                                type,
                                                            )}"
                                                        >
                                                            <span
                                                                class="text-sm font-bold text-gray-800"
                                                                >{meal?.name ||
                                                                    ""}</span
                                                            >
                                                        </div>
                                                    {/each}
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Home Indicator -->
                <div
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 rounded-full"
                ></div>
            </div>
        </div>
    </div>
</div>
