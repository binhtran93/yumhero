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

    const handleRecipeSelect = (recipes: Recipe[]) => {
        if (!modal.day || !modal.mealType) return;

        const dayIndex = plan.findIndex((d) => d.day === modal.day);
        if (dayIndex !== -1) {
            const currentMeals = plan[dayIndex].meals[modal.mealType];

            recipes.forEach((newRecipe) => {
                const existingRecipe = currentMeals.find(
                    (r) => r.id === newRecipe.id,
                );
                if (existingRecipe) {
                    // Update servings if recipe exists
                    existingRecipe.servings =
                        (existingRecipe.servings || 1) +
                        (newRecipe.servings || 1);
                } else {
                    // Add new recipe
                    currentMeals.push(newRecipe);
                }
            });
        }
    };

    const handleRemoveRecipe = (day: string, type: MealType, index: number) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type].splice(index, 1);
        }
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

    // Week Navigation logic
    let currentDate = $state(new Date());

    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        start.setDate(diff);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return { start, end };
    };

    let weekRange = $derived(getWeekRange(currentDate));

    import { ChevronLeft, ChevronRight } from "lucide-svelte";

    // Format: "Jan 26 - Feb 01"
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        });
    };

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        currentDate = d;
        // Logic to refresh plan would go here
    };

    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        currentDate = d;
        // Logic to refresh plan would go here
    };
    import Header from "$lib/components/Header.svelte";
</script>

<svelte:window onresize={checkScroll} />

<div class="h-full flex flex-col">
    <!-- Header -->
    <!-- Header -->
    <Header title="Plan Your Meal">
        <div
            class="flex items-center gap-2 bg-bg-default p-1 rounded-full border border-border-default shadow-sm"
        >
            <button
                class="p-1.5 hover:bg-bg-surface-hover rounded-full text-text-secondary transition-colors"
                onclick={prevWeek}
            >
                <ChevronLeft size={18} />
            </button>
            <span class="text-xs font-bold text-center text-text-primary">
                {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
            </span>
            <button
                class="p-1.5 hover:bg-bg-surface-hover rounded-full text-text-secondary transition-colors"
                onclick={nextWeek}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    </Header>

    <div
        bind:this={scrollContainer}
        class="flex-1 w-full overflow-x-auto bg-bg-default snap-x snap-mandatory"
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
                        index={i}
                        onMealClick={handleMealClick}
                        onMealClear={handleClearMeal}
                        onRemoveRecipe={(type, index) =>
                            handleRemoveRecipe(dayPlan.day, type, index)}
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
</div>

{#if isScrollable}
    <div
        class="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-bg-surface/90 backdrop-blur-md border border-border-default shadow-xl transition-opacity duration-300"
    >
        {#each DAYS as day, i}
            <button
                class="w-auto px-3 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all hover:bg-bg-surface-hover active:scale-95 text-text-secondary"
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
