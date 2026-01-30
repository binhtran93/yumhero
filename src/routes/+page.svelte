<script lang="ts">
    import type {
        MealType,
        Recipe,
        WeeklyPlan,
        DayPlan,
        PlannedRecipe,
    } from "$lib/types";
    import RecipeModal from "$lib/components/RecipeModal.svelte";
    import { getWeekPlan, saveWeekPlan } from "$lib/stores/plans";
    import { userRecipes } from "$lib/stores/recipes";
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { ChevronLeft, ChevronRight } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import MealSlot from "$lib/components/MealSlot.svelte";
    import NotePopover from "$lib/components/NotePopover.svelte";
    import CookingView from "$lib/components/CookingView.svelte";
    import { twMerge } from "tailwind-merge";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import { derived } from "svelte/store";
    import { X } from "lucide-svelte";

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

    // Subscribe to user recipes
    let availableRecipes = $state<Recipe[]>([]);

    $effect(() => {
        const unsubscribe = userRecipes.subscribe((state) => {
            availableRecipes = state.data;
        });
        return unsubscribe;
    });

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

    // Global Active Dropdown State
    let activeDropdown = $state<{
        day: string;
        type: MealType;
        index: number;
    } | null>(null);

    // Recipe Mode Modal State (Cooking/Shopping)
    let recipeModeModal = $state<{
        isOpen: boolean;
        mode: "cooking";
        recipeId: string | null;
    }>({
        isOpen: false,
        mode: "cooking",
        recipeId: null,
    });

    // Derived store to fetch the specific recipe for the mode modal
    // We need to bridge Runes state to Store for documentStore
    import { writable } from "svelte/store";
    let activeRecipeIdStore = writable<string | null>(null);

    $effect(() => {
        activeRecipeIdStore.set(recipeModeModal.recipeId);
    });

    let modeRecipeStore = derived(
        [user, activeRecipeIdStore],
        ([$user, $recipeId], set) => {
            if (!$user || !$recipeId) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<Recipe>(
                `users/${$user.uid}/recipes/${$recipeId}`,
            );
            return store.subscribe(set);
        },
        { data: null, loading: false } as DocumentState<Recipe>,
    );

    let modeRecipe = $derived($modeRecipeStore.data);
    let modeLoading = $derived($modeRecipeStore.loading);

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
        const { day, mealType } = modal;
        if (!day || !mealType || mealType === "note") return;

        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            // Replace the entire list for this slot with the new selection
            // Consolidate duplicates by summing quantity
            const newMeals: PlannedRecipe[] = [];
            recipes.forEach((newRecipe) => {
                const existingIndex = newMeals.findIndex(
                    (r) => r.id === newRecipe.id,
                );
                if (existingIndex !== -1) {
                    // Add to quantity if recipe already exists
                    newMeals[existingIndex].quantity += 1;
                } else {
                    // Add new recipe with quantity = 1
                    newMeals.push({
                        ...newRecipe,
                        quantity: 1,
                    });
                }
            });

            plan[dayIndex].meals[mealType] = newMeals;
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

    const handleRecipeUpdate = (
        day: string,
        type: MealType,
        index: number,
        newQuantity: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            // @ts-ignore
            const item = plan[dayIndex].meals[type][index];
            if (item && "quantity" in item) {
                // Update the quantity (number of batches)
                // @ts-ignore
                plan[dayIndex].meals[type][index] = {
                    ...item,
                    quantity: newQuantity,
                };
                saveWeekPlan(weekId, plan);
            }
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

    const handleToggleDropdown = (
        day: string,
        type: MealType,
        index: number,
        rect: DOMRect,
    ) => {
        if (
            activeDropdown &&
            activeDropdown.day === day &&
            activeDropdown.type === type &&
            activeDropdown.index === index
        ) {
            // Close if clicking the same one
            activeDropdown = null;
        } else {
            // Open new one
            activeDropdown = { day, type, index };
        }
    };

    const handleCloseDropdown = () => {
        activeDropdown = null;
    };

    function handleOpenRecipeMode(mode: "cooking", recipeId: string) {
        recipeModeModal = {
            isOpen: true,
            mode,
            recipeId,
        };
    }

    function handleCloseRecipeMode() {
        recipeModeModal = {
            ...recipeModeModal,
            isOpen: false,
            recipeId: null,
        };
    }

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

    const handleDrop = (
        source: {
            day?: string;
            type: MealType | "sidebar-recipe";
            index?: number;
            isRecipe?: boolean;
            recipeId?: string;
        },
        target: { day: string; type: MealType },
    ) => {
        // Prevent dropping note into meal or recipe into note
        if (source.type === "note" && target.type !== "note") return;
        if (
            source.type !== "note" &&
            source.type !== "sidebar-recipe" &&
            target.type === "note"
        )
            return;
        if (source.type === "sidebar-recipe" && target.type === "note") return;

        // Handle Sidebar Drop
        if (source.type === "sidebar-recipe" && source.recipeId) {
            const targetDayIndex = plan.findIndex((d) => d.day === target.day);
            if (targetDayIndex === -1) return;

            const recipe = availableRecipes.find(
                (r) => r.id === source.recipeId,
            );
            if (!recipe) return;

            const targetList = plan[targetDayIndex].meals[target.type];
            // @ts-ignore
            targetList.push({
                ...recipe,
                quantity: 1, // Default quantity when dragging from sidebar
            });

            saveWeekPlan(weekId, plan);
            return;
        }

        const sourceDayIndex = plan.findIndex((d) => d.day === source.day);
        const targetDayIndex = plan.findIndex((d) => d.day === target.day);

        if (sourceDayIndex === -1 || targetDayIndex === -1) return;

        // @ts-ignore
        const sourceList = plan[sourceDayIndex].meals[source.type];
        // @ts-ignore
        const targetList = plan[targetDayIndex].meals[target.type];

        // Access the item safely
        // @ts-ignore
        const item = sourceList[source.index];

        if (!item) return;

        // Remove from source
        // @ts-ignore
        sourceList.splice(source.index, 1);

        // Add to target
        // @ts-ignore
        targetList.push(item);

        saveWeekPlan(weekId, plan);
    };
    import ShoppingCartButton from "$lib/components/ShoppingCartButton.svelte";
    import ShoppingListModal from "$lib/components/ShoppingListModal.svelte";

    // Shopping List Modal State
    let isShoppingListOpen = $state(false);
</script>

<svelte:window onresize={checkScroll} />

<div class="h-full flex flex-col">
    <!-- Header -->
    <!-- Header -->
    <Header title="Plan Your Meal" mobileTitle="Plan">
        <div class="flex items-center gap-2">
            <div
                class="flex items-center gap-1 bg-app-bg p-1 rounded-full border border-app-border shadow-sm"
            >
                <button
                    class="p-1.5 hover:bg-app-surface-hover rounded-full text-app-text-muted transition-colors"
                    onclick={prevWeek}
                >
                    <ChevronLeft size={18} />
                </button>
                <span
                    class="text-xs font-bold text-center text-app-text min-w-[90px]"
                >
                    {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
                </span>
                <button
                    class="p-1.5 hover:bg-app-surface-hover rounded-full text-app-text-muted transition-colors"
                    onclick={nextWeek}
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div class="w-px h-6 bg-app-border mx-1"></div>

            <ShoppingCartButton onclick={() => (isShoppingListOpen = true)} />
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
                class="flex w-fit md:w-full md:min-w-fit md:grid md:grid-cols-[repeat(7,minmax(240px,1fr))] md:grid-flow-col md:grid-rows-[auto_repeat(5,auto)] border-r border-app-text/30"
            >
                {#each plan as dayPlan, i (dayPlan.day)}
                    <div class="w-screen flex flex-col md:contents snap-start">
                        <!-- Header -->
                        <div
                            class="sticky top-0 z-20 flex flex-col md:flex-col items-center justify-center bg-app-surface border-b border-r border-app-border transition-all duration-300 min-h-10 md:h-15 shadow-sm py-1 md:py-0"
                            bind:this={dayRefs[i]}
                        >
                            <!-- Mobile View: Horizontal Layout -->
                            <div
                                class="flex md:hidden items-center justify-center gap-1.5"
                            >
                                <span
                                    class="font-display font-black text-app-text text-sm"
                                >
                                    {dayPlan.day}
                                    {getDayDate(i).split(" ")[1]}
                                </span>
                                {#if isToday(dayPlan.day)}
                                    <span
                                        class="px-2 py-0.5 bg-[#c2410c] text-white text-[10px] font-bold uppercase rounded-full leading-none shadow-sm"
                                    >
                                        Today
                                    </span>
                                {/if}
                            </div>

                            <!-- Desktop View: Existing Layout -->
                            <div class="hidden md:flex items-center gap-2">
                                <span
                                    class="font-display font-black transition-all text-app-text text-base"
                                >
                                    {dayPlan.day.slice(0, 3)}
                                </span>
                                {#if isToday(dayPlan.day)}
                                    <span
                                        class="px-1.5 py-1 bg-app-primary text-white font-black rounded leading-none shadow-sm scale-75 origin-left"
                                    >
                                        Today
                                    </span>
                                {/if}
                            </div>

                            <span
                                class="hidden md:block text-xs text-app-text font-bold opacity-70"
                            >
                                {getDayDate(i).split(" ")[1]}
                            </span>

                            <!-- Today Flash Overlay -->
                            {#if flashingIndex === i}
                                <div
                                    transition:fade={{ duration: 300 }}
                                    class="absolute inset-0 bg-app-primary/5 pointer-events-none z-10"
                                ></div>
                            {/if}
                        </div>

                        {#each mealSections as section (section.type)}
                            <div
                                class="flex flex-col border-r border-b border-app-text/20 bg-app-bg relative"
                            >
                                <MealSlot
                                    day={dayPlan.day}
                                    type={section.type}
                                    items={dayPlan.meals[section.type]}
                                    onClick={(e) =>
                                        handleMealClick(
                                            dayPlan.day,
                                            section.type,
                                            e,
                                        )}
                                    onClear={() =>
                                        handleClearMeal(
                                            dayPlan.day,
                                            section.type,
                                        )}
                                    onRemove={(idx) =>
                                        handleRemoveRecipe(
                                            dayPlan.day,
                                            section.type,
                                            idx,
                                        )}
                                    onUpdate={(idx, newQuantity) =>
                                        handleRecipeUpdate(
                                            dayPlan.day,
                                            section.type,
                                            idx,
                                            newQuantity,
                                        )}
                                    onOpenRecipeMode={handleOpenRecipeMode}
                                    onDrop={handleDrop}
                                    {isLoading}
                                    {activeDropdown}
                                    onToggleDropdown={(idx, rect) =>
                                        handleToggleDropdown(
                                            dayPlan.day,
                                            section.type,
                                            idx,
                                            rect,
                                        )}
                                    onCloseDropdown={handleCloseDropdown}
                                    {availableRecipes}
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
                    </div>
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
    {availableRecipes}
    onClose={closeModal}
    onSelect={handleRecipeSelect}
/>

<NotePopover
    isOpen={noteModal.isOpen}
    position={noteModal.position}
    onClose={() => (noteModal.isOpen = false)}
    onSave={handleNoteSave}
/>

<ShoppingListModal
    isOpen={isShoppingListOpen}
    {plan}
    {availableRecipes}
    onClose={() => (isShoppingListOpen = false)}
/>

<!-- Recipe Mode Modal (Cooking/Shopping) -->
{#if recipeModeModal.isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        transition:fade={{ duration: 200 }}
        onclick={(e) => {
            if (e.target === e.currentTarget) handleCloseRecipeMode();
        }}
        onkeydown={(e) => {
            if (e.key === "Escape") handleCloseRecipeMode();
        }}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div
            class="bg-app-bg w-full max-w-3xl h-full md:h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <button
                class="absolute idx-50 top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors hidden md:block"
                onclick={handleCloseRecipeMode}
            >
                <X size={20} />
            </button>

            {#if modeLoading}
                <div class="flex items-center justify-center h-full">
                    <div
                        class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                    ></div>
                </div>
            {:else if modeRecipe}
                <CookingView
                    recipe={modeRecipe}
                    onBack={handleCloseRecipeMode}
                    onDone={handleCloseRecipeMode}
                />
            {:else}
                <div
                    class="flex flex-col items-center justify-center h-full text-center"
                >
                    <p class="text-lg font-medium text-app-text-muted">
                        Recipe not found
                    </p>
                    <button
                        class="mt-4 text-app-primary font-bold"
                        onclick={handleCloseRecipeMode}>Close</button
                    >
                </div>
            {/if}
        </div>
    </div>
{/if}
