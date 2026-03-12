<script lang="ts">
    import type {
        MealType,
        PlannedRecipe,
        Recipe,
        WeeklyPlan,
    } from "$lib/types";
    import RecipeModal from "$lib/components/RecipeModal.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { doc, onSnapshot } from "firebase/firestore";
    import SEO from "$lib/components/SEO.svelte";
    import {
        getWeekPlan,
        removePlannedRecipeFromWeekPlan,
        saveWeekPlan,
    } from "$lib/stores/plans";
    import { userRecipes } from "$lib/stores/recipes";
    import { getWeekShoppingListStore } from "$lib/stores/shoppingList";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import {
        BrushCleaning,
        ChevronLeft,
        ChevronRight,
        EllipsisVertical,
        Printer,
    } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import MealSlot from "$lib/components/MealSlot.svelte";
    import NotePopover from "$lib/components/NotePopover.svelte";
    import PlanMenu from "$lib/components/PlanMenu.svelte";
    import CookingView from "$lib/components/CookingView.svelte";
    import { twMerge } from "tailwind-merge";
    import { user } from "$lib/stores/auth";
    import { derived, writable } from "svelte/store";
    import { db } from "$lib/firebase";
    import { toasts } from "$lib/stores/toasts";
    import ShoppingCartButton from "$lib/components/ShoppingCartButton.svelte";
    import ShoppingListModal from "$lib/components/ShoppingListModal.svelte";
    import { headerActions } from "$lib/stores/ui";
    import HeaderActions from "$lib/components/HeaderActions.svelte";

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

    const isPlannedRecipeItem = (item: unknown): item is PlannedRecipe => {
        if (!item || typeof item !== "object") return false;
        return "recipe" in (item as any) && "quantity" in (item as any);
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
        editIndex: number | null;
        initialText: string;
    }>({
        isOpen: false,
        day: null,
        position: { x: 0, y: 0 },
        editIndex: null,
        initialText: "",
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

            const recipeRef = doc(db, `users/${$user.uid}/recipes/${$recipeId}`);
            return onSnapshot(
                recipeRef,
                (snapshot) => {
                    if (!snapshot.exists()) {
                        set({ data: null, loading: false });
                        return;
                    }
                    const recipeData = snapshot.data() as Recipe;
                    set({ data: { ...recipeData, id: snapshot.id }, loading: false });
                },
                (error) => {
                    console.error("Error listening to recipe:", error);
                    set({ data: null, loading: false });
                },
            );
        },
        { data: null, loading: false } as { data: Recipe | null; loading: boolean },
    );

    let modeRecipe = $derived($modeRecipeStore.data);
    let modeLoading = $derived($modeRecipeStore.loading);

    let isResetModalOpen = $state(false);
    let isResettingPlan = $state(false);

    let planMenu = $state<{
        isOpen: boolean;
        triggerRect: DOMRect | null;
    }>({
        isOpen: false,
        triggerRect: null,
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
    const getCellKey = (day: string, type: MealType) => `${day}::${type}`;
    let dropSavingCells = $state<Record<string, number>>({});

    const markDropSaving = (day: string, type: MealType) => {
        const key = getCellKey(day, type);
        dropSavingCells = {
            ...dropSavingCells,
            [key]: (dropSavingCells[key] || 0) + 1,
        };
    };

    const unmarkDropSaving = (day: string, type: MealType) => {
        const key = getCellKey(day, type);
        const current = dropSavingCells[key] || 0;
        const next = { ...dropSavingCells };
        if (current <= 1) {
            delete next[key];
        } else {
            next[key] = current - 1;
        }
        dropSavingCells = next;
    };

    const isDropSaving = (day: string, type: MealType) =>
        !!dropSavingCells[getCellKey(day, type)];

    const withCellSaving = async (
        day: string,
        type: MealType,
        work: () => Promise<void>,
    ) => {
        markDropSaving(day, type);
        try {
            await work();
        } finally {
            unmarkDropSaving(day, type);
        }
    };

    const savePlan = async () => {
        await saveWeekPlan(weekId, plan);
    };

    const removePlannedRecipe = async (plannedItemId: string) => {
        await removePlannedRecipeFromWeekPlan(weekId, plannedItemId);
    };

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
            noteModal.editIndex = null;
            noteModal.initialText = "";
            noteModal.position = {
                x: x,
                y: rect.top,
            };
            return;
        }

        console.log("Open Modal:", day, type);
        const dayPlan = plan.find((d) => d.day === day);
        const currentMeals = dayPlan ? dayPlan.meals[type] : [];
        const currentRecipes = currentMeals.map((item: any) => item.recipe) as Recipe[];

        modal.isOpen = true;
        modal.day = day;
        modal.mealType = type;
        modal.currentRecipes = currentRecipes;
    };

    const handleRecipeSelect = async (recipes: Recipe[]) => {
        const { day, mealType } = modal;
        if (!day || !mealType || mealType === "note") return;

        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            const newRecipes: PlannedRecipe[] = [];
            recipes.forEach((newRecipe) => {
                const existingIndex = newRecipes.findIndex(
                    (r) => r.recipe.id === newRecipe.id,
                );
                if (existingIndex !== -1) {
                    newRecipes[existingIndex].quantity += 1;
                } else {
                    newRecipes.push({
                        id: crypto.randomUUID(),
                        recipe: newRecipe,
                        quantity: 1,
                    });
                }
            });

            plan[dayIndex].meals[mealType] = newRecipes;
            await withCellSaving(day, mealType, async () => {
                await savePlan();
            });
        }
    };

    const handleRemoveRecipe = async (
        day: string,
        type: MealType,
        index: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        const item = plan[dayIndex].meals[type][index];
        if (item && isPlannedRecipeItem(item)) {
            await withCellSaving(day, type, async () => {
                await removePlannedRecipe(item.id);
                plan[dayIndex].meals[type].splice(index, 1);
            });
            return;
        }

        await withCellSaving(day, type, async () => {
            plan[dayIndex].meals[type].splice(index, 1);
            await savePlan();
        });
    };

    const handleRecipeUpdate = async (
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
                await savePlan();
            }
        }
    };

    const handleClearMeal = async (day: string, type: MealType) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type] = [];
            await savePlan();
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

    const handleOpenPlanMenu = (e: MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        planMenu = {
            isOpen: true,
            triggerRect: rect,
        };
    };

    function handleCloseRecipeMode() {
        recipeModeModal = {
            ...recipeModeModal,
            isOpen: false,
            recipeId: null,
        };
    }

    const handleResetPlan = async () => {
        if (isResettingPlan) return;
        isResettingPlan = true;
        try {
            plan = createEmptyPlan(DAYS[0]);
            await savePlan();
            isResetModalOpen = false;
        } catch (error) {
            console.error("Failed to clear week plan:", error);
            toasts.error("Failed to clear week plan");
        } finally {
            isResettingPlan = false;
        }
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

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            if (activeDropdown) {
                handleCloseDropdown();
            }
        }
    };

    onMount(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => {
            window.removeEventListener("resize", checkScroll);
        };
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

    const handleNoteSave = async (text: string) => {
        if (!noteModal.day) return;

        const dayIndex = plan.findIndex((d) => d.day === noteModal.day);
        if (dayIndex !== -1) {
            if (noteModal.editIndex !== null) {
                // Update existing note
                plan[dayIndex].meals.note[noteModal.editIndex].text = text;
            } else {
                // Add new note
                plan[dayIndex].meals.note.push({
                    id: crypto.randomUUID(),
                    text: text,
                });
            }
            await savePlan();
        }
    };

    const handleEditNote = (day: string, index: number, rect: DOMRect) => {
        const dayPlan = plan.find((d) => d.day === day);
        if (!dayPlan) return;

        const note = dayPlan.meals.note[index];
        if (!note) return;

        // Calculate position (similar to handleMealClick)
        const POPOVER_WIDTH = 300;
        const windowWidth = window.innerWidth;

        let x = rect.right + 10;
        if (x + POPOVER_WIDTH > windowWidth) {
            x = rect.left - POPOVER_WIDTH - 10;
        }
        if (x < 10) {
            x = windowWidth - POPOVER_WIDTH - 10;
        }

        noteModal.isOpen = true;
        noteModal.day = day;
        noteModal.editIndex = index;
        noteModal.initialText = note.text;
        noteModal.position = {
            x: x,
            y: rect.top,
        };
    };

    const handleDrop = async (
        source: {
            day?: string;
            type: MealType | "sidebar-recipe";
            index?: number;
            recipeId?: string;
        },
        target: { day: string; type: MealType },
    ) => {
        const savePlanForDropTarget = async () =>
            withCellSaving(target.day, target.type, async () => {
                await savePlan();
            });

        // Prevent dropping note into meal or recipe into note
        if (source.type === "note" && target.type !== "note") return;
        if (
            source.type !== "note" &&
            source.type !== "sidebar-recipe" &&
            target.type === "note"
        )
            return;
        if (source.type === "sidebar-recipe" && target.type === "note")
            return;

        // Handle Sidebar Recipe Drop
        if (source.type === "sidebar-recipe" && source.recipeId) {
            const targetDayIndex = plan.findIndex((d) => d.day === target.day);
            if (targetDayIndex === -1) return;

            const recipe = availableRecipes.find(
                (r) => r.id === source.recipeId,
            );
            if (!recipe) return;

            const targetList = plan[targetDayIndex].meals[target.type] as any[];

            // Check if recipe already exists in target list
            const existingIndex = targetList.findIndex(
                (r: any) => r.recipe?.id === recipe.id,
            );

            if (existingIndex !== -1) {
                // Recipe exists, increase quantity
                const targetRecipe = targetList[existingIndex] as PlannedRecipe;
                targetRecipe.quantity += 1;
            } else {
                // Recipe doesn't exist, add it with quantity 1
                targetList.push({
                    id: crypto.randomUUID(),
                    recipe,
                    quantity: 1, // Default quantity when dragging from sidebar
                });
            }

            await savePlanForDropTarget();
            return;
        }

        // Internal drop into the same cell is a no-op (no reordering target),
        // so skip save/loading to avoid unnecessary writes.
        if (source.day === target.day && source.type === target.type) {
            return;
        }

        const sourceDayIndex = plan.findIndex((d) => d.day === source.day);
        const targetDayIndex = plan.findIndex((d) => d.day === target.day);
        const sourceIndex = source.index;

        if (
            sourceDayIndex === -1 ||
            targetDayIndex === -1 ||
            sourceIndex === undefined
        )
            return;

        const sourceList = plan[sourceDayIndex].meals[source.type as MealType] as any[];
        const targetList = plan[targetDayIndex].meals[target.type] as any[];

        // Access the item safely
        const item = sourceList[sourceIndex];

        if (!item) return;

        // Check if recipe already exists in target list
        const sourceRecipeId = item.recipe.id;
        const existingIndex = targetList.findIndex(
            (r: any, idx: number) =>
                r.recipe?.id === sourceRecipeId &&
                (sourceList !== targetList || idx !== sourceIndex),
        );

        if (existingIndex !== -1) {
            // Recipe exists in target, merge quantities
            const targetRecipe = targetList[existingIndex] as any;
            const sourceRecipe = item as any;
            targetRecipe.quantity =
                (targetRecipe.quantity || 1) + (sourceRecipe.quantity || 1);

            // Remove from source
            sourceList.splice(sourceIndex, 1);
        } else {
            // Recipe doesn't exist in target, move it
            // Remove from source
            sourceList.splice(sourceIndex, 1);

            // Add to target
            // @ts-ignore
            targetList.push(item);
        }

        await savePlanForDropTarget();
    };

    // Shopping List State
    let isShoppingListOpen = $state(false);
    let shoppingListStore = $derived(getWeekShoppingListStore(weekId));
    let itemCount = $derived($shoppingListStore.data.length);
</script>

<svelte:window onresize={checkScroll} onkeydown={handleKeydown} />

<SEO
    title="Weekly Meal Plan"
    description="Plan your weekly meals with YumHero. Organize breakfast, lunch, dinner, and snacks for the entire week."
/>

{#snippet planActions()}
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
                class="text-xs font-bold text-center text-app-text min-w-22.5"
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

        <div class="hidden md:flex items-center gap-2">
            <button
                class="p-2 text-app-text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors relative group disabled:opacity-50"
                onclick={() => (isResetModalOpen = true)}
                aria-label="Clear Week Plan"
            >
                <BrushCleaning
                    size={20}
                    class="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                />
            </button>

            <a
                href="/print/{weekId}"
                target="_blank"
                class="p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors relative group block text-app-text-muted cursor-pointer"
                aria-label="Print Week Plan"
            >
                <Printer
                    size={20}
                    class="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                />
            </a>
        </div>

        <button
            class="md:hidden p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors relative group"
            onclick={handleOpenPlanMenu}
            aria-label="More options"
        >
            <EllipsisVertical
                size={24}
                class="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
            />
        </button>

        <ShoppingCartButton
            onclick={() => (isShoppingListOpen = true)}
            {itemCount}
        />
    </div>
{/snippet}

<!-- Sync with Header Actions Store for Desktop -->
<HeaderActions>
    {@render planActions()}
</HeaderActions>

<div class="h-full flex flex-col">
    <!-- Header (Mobile Only) -->
    <div class="md:hidden">
        <Header
            title="Plan Your Meal"
            mobileTitle="Plan"
            children={planActions}
        />
    </div>

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
                                    onEditNote={(idx, rect) =>
                                        handleEditNote(dayPlan.day, idx, rect)}
                                    onOpenRecipeMode={handleOpenRecipeMode}
                                    onDrop={handleDrop}
                                    {isLoading}
                                    isSaving={isDropSaving(
                                        dayPlan.day,
                                        section.type,
                                    )}
                                    {activeDropdown}
                                    onToggleDropdown={(idx, rect) =>
                                        handleToggleDropdown(
                                            dayPlan.day,
                                            section.type,
                                            idx,
                                            rect,
                                        )}
                                    onCloseDropdown={handleCloseDropdown}
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
    initialText={noteModal.initialText}
    onClose={() => (noteModal.isOpen = false)}
    onSave={handleNoteSave}
/>

<ShoppingListModal
    isOpen={isShoppingListOpen}
    {weekId}
    {plan}
    {availableRecipes}
    onClose={() => (isShoppingListOpen = false)}
/>

<!-- Recipe Mode Modal (Cooking/Shopping) -->
<Modal
    isOpen={recipeModeModal.isOpen}
    onClose={handleCloseRecipeMode}
    title="Cooking Mode"
    class="max-w-3xl h-[85vh]"
>
    {#if modeLoading}
        <div class="flex items-center justify-center h-full">
            <div
                class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if modeRecipe}
        <CookingView recipe={modeRecipe} onDone={handleCloseRecipeMode} />
    {:else}
        <div
            class="flex flex-col items-center justify-center h-full text-center"
        >
            <p class="text-lg font-medium text-app-text-muted">
                Recipe not found
            </p>
            <button
                class="mt-4 text-app-primary font-bold"
                onclick={handleCloseRecipeMode}
            >
                Close
            </button>
        </div>
    {/if}
</Modal>

<ConfirmModal
    isOpen={isResetModalOpen}
    title="Clear Week Plan"
    message="Are you sure you want to remove all planned recipes for this week? This action cannot be undone."
    confirmText="Clear All"
    isDestructive={true}
    isLoading={isResettingPlan}
    onConfirm={handleResetPlan}
    onClose={() => {
        if (isResettingPlan) return;
        isResetModalOpen = false;
    }}
/>

{#if planMenu.isOpen && planMenu.triggerRect}
    <PlanMenu
        triggerRect={planMenu.triggerRect}
        onClose={() => (planMenu.isOpen = false)}
        onPrint={() => {
            window.open(`/print/${weekId}`, "_blank");
            planMenu.isOpen = false;
        }}
        onClear={() => (isResetModalOpen = true)}
    />
{/if}
