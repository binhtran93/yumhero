<script lang="ts">
    import type { MealType, Recipe, WeeklyPlan } from "$lib/types";
    import DayColumn from "$lib/components/DayColumn.svelte";
    import RecipeModal from "$lib/components/RecipeModal.svelte";

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    // State: Weekly Plan
    let plan = $state<WeeklyPlan>(
        DAYS.map((day) => ({
            day,
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
            },
        })),
    );

    // State: Modal
    // We keep this simple and local. No stores needed suitable for MVP.
    let modal = $state<{
        isOpen: boolean;
        day: string | null;
        mealType: MealType | null;
    }>({
        isOpen: false,
        day: null,
        mealType: null,
    });

    // Handlers
    const handleMealClick = (day: string, type: MealType) => {
        console.log("Open Modal:", day, type);
        modal.isOpen = true;
        modal.day = day;
        modal.mealType = type;
    };

    const handleRecipeSelect = (recipe: Recipe) => {
        if (!modal.day || !modal.mealType) return;

        const dayIndex = plan.findIndex((d) => d.day === modal.day);
        if (dayIndex !== -1) {
            // Append recipe
            plan[dayIndex].meals[modal.mealType].push(recipe);
        }

        modal.isOpen = false;
    };

    const handleClearMeal = (day: string, type: MealType) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            // Clear all for now
            plan[dayIndex].meals[type] = [];
        }
    };

    const closeModal = () => {
        modal.isOpen = false;
        // Optional: reset day/type if needed, but keeping them helps with exit animations if we had them
    };

    const currentDayName =
        DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    // Scroll Detection & Navigation
    let dayRefs: (HTMLDivElement | null)[] = $state([]);
    let scrollContainer: HTMLDivElement | null = $state(null);
    let isScrollable = $state(false);

    const checkScroll = () => {
        if (scrollContainer) {
            isScrollable =
                scrollContainer.scrollWidth > scrollContainer.clientWidth;
        }
    };

    let flashingIndex = $state<number | null>(null);
    let flashTimeout: ReturnType<typeof setTimeout>;

    const scrollToDay = (index: number) => {
        dayRefs[index]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });

        // Trigger flash
        if (flashTimeout) clearTimeout(flashTimeout);
        flashingIndex = index;
        flashTimeout = setTimeout(() => {
            flashingIndex = null;
        }, 500); // 0.5s flash duration
    };

    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    onMount(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    });
</script>

<svelte:window onresize={checkScroll} />

<div
    bind:this={scrollContainer}
    class="h-screen w-full overflow-x-auto bg-bg-default snap-x snap-mandatory"
>
    <div
        class="min-w-full w-max h-full flex flex-row items-start justify-center divide-x divide-border-default"
    >
        {#each plan as dayPlan, i (dayPlan.day)}
            <div
                class="h-full shrink-0 snap-start relative"
                bind:this={dayRefs[i]}
            >
                <DayColumn
                    {dayPlan}
                    isToday={dayPlan.day === currentDayName}
                    onMealClick={handleMealClick}
                    onMealClear={handleClearMeal}
                />
                {#if flashingIndex === i}
                    <div
                        transition:fade={{ duration: 300 }}
                        class="absolute inset-0 bg-yellow-400/20 pointer-events-none z-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-yellow-600/30"
                    ></div>
                {/if}
            </div>
        {/each}
    </div>
</div>

{#if isScrollable}
    <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 rounded-full bg-bg-surface/80 backdrop-blur-md border border-border-default shadow-lg transition-opacity duration-300"
    >
        {#each DAYS as day, i}
            <button
                class="{day === currentDayName
                    ? 'w-auto px-3 bg-bg-surface-hover text-text-primary'
                    : 'w-10 text-text-secondary'} h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-colors hover:bg-bg-surface-hover"
                onclick={() => scrollToDay(i)}
                aria-label="Scroll to {day}"
            >
                {day === currentDayName ? "Today" : day.slice(0, 3)}
            </button>
        {/each}
    </div>
{/if}

<!-- Modal acts as a pure controlled component -->
<RecipeModal
    isOpen={modal.isOpen}
    mealType={modal.mealType}
    onClose={closeModal}
    onSelect={handleRecipeSelect}
/>
