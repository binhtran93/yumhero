<script lang="ts">
    import type { MealType, Recipe, WeeklyPlan, DayPlan } from "$lib/types";
    import RecipeModal from "$lib/components/RecipeModal.svelte";
    import { getWeekPlan, saveWeekPlan } from "$lib/stores/userData";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { ChevronLeft, ChevronRight } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import MealSlot from "$lib/components/MealSlot.svelte";
    import NotePopover from "$lib/components/NotePopover.svelte";
    import { twMerge } from "tailwind-merge";

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const createEmptyPlan = (startDayName: string): WeeklyPlan => {
        return DAYS.map((day) => ({
            day,
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: [],
                note: [],
            },
        }));
    };

    // State: Weekly Plan
    let plan = $state<WeeklyPlan>(createEmptyPlan("Monday"));
    let isLoading = $state(true);

    // State: Modal
    let modal = $state<{
        isOpen: boolean;
        day: string | null;
        mealType: MealType | null;
        currentRecipes: Recipe[];
    }>({
        isOpen: false,
        day: null,
        mealType: null,
        currentRecipes: [],
    });

    let noteModal = $state<{
        isOpen: boolean;
        day: string | null;
        position: { x: number; y: number };
    }>({
        isOpen: false,
        day: null,
        position: { x: 0, y: 0 },
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

    // Firestore Sync
    const getWeekId = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    let weekId = $derived(getWeekId(weekRange.start));

    $effect(() => {
        const store = getWeekPlan(weekId);
        const unsubscribe = store.subscribe((state) => {
            isLoading = state.loading;
            if (state.data) {
                plan = state.data.map((day) => ({
                    ...day,
                    meals: {
                        breakfast: day.meals.breakfast || [],
                        lunch: day.meals.lunch || [],
                        dinner: day.meals.dinner || [],
                        snack: day.meals.snack || [],
                        note: day.meals.note || [],
                    },
                }));
            } else {
                plan = createEmptyPlan(DAYS[0]);
            }
        });
        return unsubscribe;
    });

    // Handlers
    const handleMealClick = (day: string, type: MealType, e: MouseEvent) => {
        if (type === "note") {
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();

            // Popover width is w-72 (288px) + padding/margin ~ 300px
            const POPOVER_WIDTH = 300;
            const windowWidth = window.innerWidth;

            let x = rect.right + 10;
            // If it goes off screen to the right, position it to the left of the trigger
            if (x + POPOVER_WIDTH > windowWidth) {
                x = rect.left - POPOVER_WIDTH - 10;
            }

            // If it goes off screen to the left (very small screen), just stick to the right edge with some padding
            if (x < 10) {
                x = windowWidth - POPOVER_WIDTH - 10;
            }

            noteModal.isOpen = true;
            noteModal.day = day;
            noteModal.position = {
                x: x,
                y: rect.top,
            };
            return;
        }

        console.log("Open Modal:", day, type);
        const dayPlan = plan.find((d) => d.day === day);
        // @ts-ignore
        const currentRecipes = dayPlan ? dayPlan.meals[type] : [];

        modal.isOpen = true;
        modal.day = day;
        modal.mealType = type;
        modal.currentRecipes = currentRecipes;
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
                    existingRecipe.servings =
                        (existingRecipe.servings || 1) +
                        (newRecipe.servings || 1);
                } else {
                    currentMeals.push({
                        ...newRecipe,
                        servings: newRecipe.servings || 1,
                    });
                }
            });

            saveWeekPlan(weekId, plan);
        }
    };

    const handleRemoveRecipe = (day: string, type: MealType, index: number) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type].splice(index, 1);
            saveWeekPlan(weekId, plan);
        }
    };

    const handleClearMeal = (day: string, type: MealType) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type] = [];
            saveWeekPlan(weekId, plan);
        }
    };

    const closeModal = () => {
        modal.isOpen = false;
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

        if (flashTimeout) clearTimeout(flashTimeout);
        flashingIndex = index;
        flashTimeout = setTimeout(() => {
            flashingIndex = null;
        }, 500);
    };

    onMount(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    });

    // Format: "Jan 26 - Feb 01"
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        });
    };

    const prevWeek = () => {
        isLoading = true;
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        currentDate = d;
    };

    const nextWeek = () => {
        isLoading = true;
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        currentDate = d;
    };

    const mealSections = [
        { type: "breakfast" as const, label: "Breakfast" },
        { type: "lunch" as const, label: "Lunch" },
        { type: "dinner" as const, label: "Dinner" },
        { type: "snack" as const, label: "Snack" },
        { type: "note" as const, label: "Note" },
    ];

    const isToday = (dayName: string) => dayName === currentDayName;

    const getDayDate = (dayIndex: number) => {
        const date = new Date(weekRange.start);
        date.setDate(date.getDate() + dayIndex);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const handleNoteSave = (text: string) => {
        if (!noteModal.day) return;

        const dayIndex = plan.findIndex((d) => d.day === noteModal.day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals.note.push({
                id: crypto.randomUUID(),
                text: text,
            });
            saveWeekPlan(weekId, plan);
        }
    };
</script>

<svelte:window onresize={checkScroll} />

<div class="h-full flex flex-col">
    <!-- Header -->
    <!-- Header -->
    <Header title="Plan Your Meal">
        <div
            class="flex items-center gap-2 bg-app-bg p-1 rounded-full border border-app-border shadow-sm"
        >
            <button
                class="p-1.5 hover:bg-app-surface-hover rounded-full text-app-text-muted transition-colors"
                onclick={prevWeek}
            >
                <ChevronLeft size={18} />
            </button>
            <span class="text-xs font-bold text-center text-app-text">
                {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
            </span>
            <button
                class="p-1.5 hover:bg-app-surface-hover rounded-full text-app-text-muted transition-colors"
                onclick={nextWeek}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    </Header>

    <div
        bind:this={scrollContainer}
        class="flex-1 w-full overflow-hidden flex flex-row bg-app-bg"
    >
        <!-- Scrollable Grid -->
        <div
            class="flex-1 overflow-auto snap-x snap-mandatory scroll-smooth"
            bind:this={scrollContainer}
        >
            <div
                class="grid divide-app-text/30 border-r border-app-text/30 w-fit md:w-full grid-cols-[repeat(7,100vw)] md:grid-cols-7"
            >
                <!-- Headers Row -->
                {#each plan as dayPlan, i (dayPlan.day)}
                    <div
                        class="sticky top-0 z-20 flex flex-col items-center justify-center bg-app-surface border-b border-r border-app-border transition-all duration-300 h-15 snap-start shadow-sm"
                        bind:this={dayRefs[i]}
                    >
                        <div class="flex items-center gap-2">
                            <span
                                class="font-display font-black transition-all text-app-text text-base"
                            >
                                {dayPlan.day}
                            </span>
                            {#if isToday(dayPlan.day)}
                                <span
                                    class="px-1.5 py-0.5 bg-app-primary text-white text-xs font-black uppercase rounded leading-none shadow-sm scale-75 origin-left"
                                >
                                    Today
                                </span>
                            {/if}
                        </div>

                        <span
                            class="text-xs text-app-text font-bold opacity-70"
                        >
                            {getDayDate(i)}
                        </span>

                        <!-- Today Flash Overlay -->
                        {#if flashingIndex === i}
                            <div
                                transition:fade={{ duration: 300 }}
                                class="absolute inset-0 bg-app-primary/5 pointer-events-none z-10"
                            ></div>
                        {/if}
                    </div>
                {/each}

                <!-- Meal Sections Rows -->
                {#each mealSections as section}
                    {#each plan as dayPlan, i (dayPlan.day + section.type)}
                        <div
                            class="flex flex-col border-r border-b border-app-text/20 bg-app-bg relative"
                        >
                            <MealSlot
                                type={section.type}
                                items={dayPlan.meals[section.type]}
                                onClick={(e) =>
                                    handleMealClick(
                                        dayPlan.day,
                                        section.type,
                                        e,
                                    )}
                                onClear={() =>
                                    handleClearMeal(dayPlan.day, section.type)}
                                onRemove={(idx) =>
                                    handleRemoveRecipe(
                                        dayPlan.day,
                                        section.type,
                                        idx,
                                    )}
                                {isLoading}
                            />

                            <!-- Today Flash Overlay for each cell -->
                            {#if flashingIndex === i}
                                <div
                                    transition:fade={{ duration: 300 }}
                                    class="absolute inset-0 bg-app-primary/5 pointer-events-none z-10"
                                ></div>
                            {/if}
                        </div>
                    {/each}
                {/each}
            </div>
        </div>
    </div>
</div>

{#if isScrollable}
    <div
        class="fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-app-surface/90 backdrop-blur-md border border-app-border shadow-md transition-opacity duration-300"
    >
        {#each DAYS as day, i}
            <button
                class="w-auto px-3 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all hover:bg-app-surface-hover active:scale-95 text-app-text-muted"
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
    currentRecipes={modal.currentRecipes}
    onClose={closeModal}
    onSelect={handleRecipeSelect}
/>

<NotePopover
    isOpen={noteModal.isOpen}
    position={noteModal.position}
    onClose={() => (noteModal.isOpen = false)}
    onSave={handleNoteSave}
/>
