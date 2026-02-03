<script lang="ts">
    import type {
        MealType,
        Recipe,
        WeeklyPlan,
        DayPlan,
        PlannedRecipe,
        LeftoverItem,
        PlannedLeftover,
    } from "$lib/types";
    import RecipeModal from "$lib/components/RecipeModal.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import { getWeekPlan, saveWeekPlan } from "$lib/stores/plans";
    import { userRecipes } from "$lib/stores/recipes";
    import {
        addLeftoverToFridge,
        setLeftoverPlanned,
        setLeftoverNotPlanned,
        deleteLeftover,
    } from "$lib/stores/leftovers";
    import { getBoughtIngredientsForRecipe } from "$lib/stores/shoppingList";
    import { addIngredientsToFridge } from "$lib/stores/fridgeIngredients";
    import BoughtIngredientsConfirmModal from "$lib/components/BoughtIngredientsConfirmModal.svelte";
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { ChevronLeft, ChevronRight, Printer } from "lucide-svelte";
    import Header from "$lib/components/Header.svelte";
    import MealSlot from "$lib/components/MealSlot.svelte";
    import NotePopover from "$lib/components/NotePopover.svelte";
    import CookingView from "$lib/components/CookingView.svelte";
    import { twMerge } from "tailwind-merge";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import { derived } from "svelte/store";
    import { X } from "lucide-svelte";
    import { toasts } from "$lib/stores/toasts";

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
        currentLeftovers: LeftoverItem[];
    }>({
        isOpen: false,
        day: null,
        mealType: null,
        currentRecipes: [],
        currentLeftovers: [],
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

    // Derived store to fetch the specific recipe for the mode modal
    // We need to bridge Runes state to Store for documentStore
    import { get, writable } from "svelte/store";
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
        // Filter to only get recipes (not leftovers) for the modal's current selection
        const currentMeals = dayPlan ? dayPlan.meals[type] : [];
        const currentRecipes = currentMeals.filter(
            (item: any) => !("isLeftover" in item && item.isLeftover),
        ) as Recipe[];

        modal.isOpen = true;
        modal.day = day;
        modal.mealType = type;
        modal.currentRecipes = currentRecipes;

        // Extract leftover items for this slot to pass to modal
        const leftoverPlannedItems = currentMeals.filter(
            (item: any) => "isLeftover" in item && item.isLeftover,
        ) as PlannedLeftover[];

        // Reconstruct LeftoverItem from PlannedLeftover (or fetch from store)
        // Since we need the full LeftoverItem for the modal, we'll try to find them in the available leftovers
        // or just construct what's needed for the UI. The modal needs id, title, and imageUrl.
        const leftoversVal = get(leftovers);
        modal.currentLeftovers = leftoverPlannedItems
            .map((pl) => leftoversVal.data.find((l) => l.id === pl.leftoverId))
            .filter(Boolean) as LeftoverItem[];
    };

    import { leftovers } from "$lib/stores/leftovers";

    const handleRecipeSelect = (recipes: Recipe[]) => {
        const { day, mealType } = modal;
        if (!day || !mealType || mealType === "note") return;

        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            // Preserve existing leftovers in the slot
            const existingLeftovers = plan[dayIndex].meals[mealType].filter(
                (item: any) => "isLeftover" in item && item.isLeftover,
            );

            // Consolidate duplicate recipes by summing quantity
            const newRecipes: PlannedRecipe[] = [];
            recipes.forEach((newRecipe) => {
                const existingIndex = newRecipes.findIndex(
                    (r) => r.id === newRecipe.id,
                );
                if (existingIndex !== -1) {
                    // Add to quantity if recipe already exists
                    newRecipes[existingIndex].quantity += 1;
                } else {
                    // Add new recipe with quantity = 1
                    newRecipes.push({
                        ...newRecipe,
                        quantity: 1,
                    });
                }
            });

            // Combine leftovers (at start) with new recipes
            // @ts-ignore - MealSlotItem union type
            plan[dayIndex].meals[mealType] = [
                ...existingLeftovers,
                ...newRecipes,
            ];
            saveWeekPlan(weekId, plan);
        }
    };

    // State for bought ingredients confirmation
    let boughtIngredientsModal = $state<{
        isOpen: boolean;
        recipeTitle: string;
        recipeId: string;
        ingredients: Array<{
            ingredientName: string;
            amount: number;
            unit: string | null;
        }>;
        pendingRemoval: {
            day: string;
            type: MealType;
            index: number;
        } | null;
    }>({
        isOpen: false,
        recipeTitle: "",
        recipeId: "",
        ingredients: [],
        pendingRemoval: null,
    });

    const handleRemoveRecipe = async (
        day: string,
        type: MealType,
        index: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        const item = plan[dayIndex].meals[type][index];
        // Only check for bought ingredients if it's a recipe (not a leftover)
        if (item && "id" in item && !("isLeftover" in item)) {
            const recipe = item as PlannedRecipe;
            // Check for bought ingredients
            const boughtIngredients = await getBoughtIngredientsForRecipe(
                weekId,
                recipe.id,
                day,
                type,
            );

            if (boughtIngredients.length > 0) {
                // Show confirmation modal
                boughtIngredientsModal = {
                    isOpen: true,
                    recipeTitle: recipe.title,
                    recipeId: recipe.id,
                    ingredients: boughtIngredients,
                    pendingRemoval: { day, type, index },
                };
                return;
            }
        }

        // No bought ingredients, proceed with removal
        plan[dayIndex].meals[type].splice(index, 1);
        saveWeekPlan(weekId, plan);
    };

    const handleConfirmAddToFridge = async () => {
        if (!boughtIngredientsModal.pendingRemoval) return;

        const { day, type, index } = boughtIngredientsModal.pendingRemoval;
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        // Add ingredients to fridge
        await addIngredientsToFridge(
            boughtIngredientsModal.ingredients.map((ing) => ({
                name: ing.ingredientName,
                amount: ing.amount,
                unit: ing.unit,
            })),
        );

        // Remove the recipe from plan
        plan[dayIndex].meals[type].splice(index, 1);
        saveWeekPlan(weekId, plan);

        // Close modal and show success
        boughtIngredientsModal.isOpen = false;
        toasts.success("Ingredients added to fridge");
    };

    const handleSkipAddToFridge = () => {
        if (!boughtIngredientsModal.pendingRemoval) return;

        const { day, type, index } = boughtIngredientsModal.pendingRemoval;
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        // Just remove the recipe without saving ingredients
        plan[dayIndex].meals[type].splice(index, 1);
        saveWeekPlan(weekId, plan);

        // Close modal
        boughtIngredientsModal.isOpen = false;
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

    // Leftover Handlers
    const handleAddToFridge = async (
        title: string,
        recipeId: string,
        imageUrl?: string,
        day?: string,
        type?: MealType,
    ) => {
        try {
            let sourceDate: Date | undefined;
            if (day) {
                const dayIndex = DAYS.indexOf(day);
                if (dayIndex !== -1) {
                    const d = new Date(weekRange.start);
                    d.setDate(d.getDate() + dayIndex);
                    sourceDate = d;
                }
            }
            await addLeftoverToFridge(
                title,
                recipeId,
                imageUrl,
                sourceDate || new Date(),
                type || "dinner",
            );
            toasts.success("Leftover added to fridge");
        } catch (error: any) {
            console.error("Failed to add leftover to fridge:", error);
            toasts.error(error.message);
        }
    };

    const handleSelectLeftovers = async (selectedLeftovers: LeftoverItem[]) => {
        const { day, mealType } = modal;
        if (!day || !mealType || mealType === "note") return;

        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        // Current leftovers in the plan
        const existingLeftoversInPlan = plan[dayIndex].meals[mealType].filter(
            (item: any) => "isLeftover" in item && item.isLeftover,
        ) as PlannedLeftover[];

        const currentRecipesInPlan = plan[dayIndex].meals[mealType].filter(
            (item: any) => !("isLeftover" in item && item.isLeftover),
        ) as PlannedRecipe[];

        // 1. Identify removed leftovers
        const selectedLeftoverIds = new Set(selectedLeftovers.map((l) => l.id));
        const removedLeftovers = existingLeftoversInPlan.filter(
            (pl) => !selectedLeftoverIds.has(pl.leftoverId),
        );

        for (const removed of removedLeftovers) {
            await setLeftoverNotPlanned(removed.leftoverId);
        }

        // 2. Identify newly added leftovers
        const existingLeftoverIds = new Set(
            existingLeftoversInPlan.map((pl) => pl.leftoverId),
        );
        const newlyAddedLeftovers = selectedLeftovers.filter(
            (l) => !existingLeftoverIds.has(l.id),
        );

        for (const added of newlyAddedLeftovers) {
            await setLeftoverPlanned(added.id, weekId, day, mealType);
        }

        // 3. Update the plan with the new set of leftovers (mapping them to PlannedLeftover)
        const newPlannedLeftovers: PlannedLeftover[] = selectedLeftovers.map(
            (l) => {
                // Try to find existing one to preserve its stable ID if possible
                const existing = existingLeftoversInPlan.find(
                    (pl) => pl.leftoverId === l.id,
                );
                return (
                    existing || {
                        id: crypto.randomUUID(),
                        leftoverId: l.id,
                        title: l.title,
                        imageUrl: l.imageUrl,
                        sourceRecipeId: l.sourceRecipeId,
                        isLeftover: true,
                    }
                );
            },
        );

        // Combine new recipes and leftovers
        // @ts-ignore
        plan[dayIndex].meals[mealType] = [
            ...newPlannedLeftovers,
            ...currentRecipesInPlan,
        ];

        saveWeekPlan(weekId, plan);
    };

    const handleRemoveLeftoverFromPlan = async (
        day: string,
        type: MealType,
        leftoverId: string,
        index: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type].splice(index, 1);
            saveWeekPlan(weekId, plan);
        }
        // Set leftover back to not_planned
        await setLeftoverNotPlanned(leftoverId);
    };

    const handleMarkLeftoverAsEaten = async (
        day: string,
        type: MealType,
        leftoverId: string,
        index: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            // NOTE: We don't splice here if we want to keep it in the plan but mark as eaten?
            // Actually, the user's flow seems to be: Mark as eaten (disappears from fridge but stays in plan?)
            // Wait, if I splice, it's gone from plan.
            // But if it's gone from plan, how can they click it to "Mark as Not Eaten"?
            // Aha! If they "Mark as Eaten" in the FRIDGE, it stays in the PLAN.
            // If they "Mark as Eaten" in the WEEK VIEW, it SHOULD stay in the plan too?
            // "where is mark as eaten already, dont rmeove that, this is different from delete, because it will only remove from fridge"
            // This means when they "Mark as Eaten" in Week View, it should NOT be spliced from the plan.
            // It should only be deleted from the fridge.
            saveWeekPlan(weekId, plan);
        }
        // Permanently delete the leftover from fridge (cleanPlan = false)
        await deleteLeftover(leftoverId, false);
    };

    const handleMarkLeftoverAsNotEaten = async (
        day: string,
        type: MealType,
        leftoverId: string,
        index: number,
    ) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex === -1) return;

        const item = plan[dayIndex].meals[type][index] as PlannedLeftover;
        if (!item || !item.isLeftover) return;

        // 1. Add back to fridge
        const newLeftoverId = await addLeftoverToFridge(
            item.title,
            item.sourceRecipeId,
            item.imageUrl,
            new Date(), // Default to today since we lost the original source date info in the plan item
            type, // The meal type it was in
        );

        // 2. Update the meal plan with the NEW leftover ID
        item.leftoverId = newLeftoverId;
        plan[dayIndex].meals[type][index] = item;
        await saveWeekPlan(weekId, plan);

        // 3. Mark as planned in the fridge
        await setLeftoverPlanned(newLeftoverId, weekId, day, type);
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

    const handleNoteSave = (text: string) => {
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
            saveWeekPlan(weekId, plan);
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

    const handleDrop = (
        source: {
            day?: string;
            type: MealType | "sidebar-recipe" | "sidebar-leftover";
            index?: number;
            isRecipe?: boolean;
            recipeId?: string;
            leftoverId?: string;
        },
        target: { day: string; type: MealType },
    ) => {
        // Prevent dropping note into meal or recipe into note
        if (source.type === "note" && target.type !== "note") return;
        if (
            source.type !== "note" &&
            source.type !== "sidebar-recipe" &&
            source.type !== "sidebar-leftover" &&
            target.type === "note"
        )
            return;
        if (
            (source.type === "sidebar-recipe" ||
                source.type === "sidebar-leftover") &&
            target.type === "note"
        )
            return;

        // Handle Sidebar Recipe Drop
        if (source.type === "sidebar-recipe" && source.recipeId) {
            const targetDayIndex = plan.findIndex((d) => d.day === target.day);
            if (targetDayIndex === -1) return;

            const recipe = availableRecipes.find(
                (r) => r.id === source.recipeId,
            );
            if (!recipe) return;

            const targetList = plan[targetDayIndex].meals[target.type];

            // Check if recipe already exists in target list
            // @ts-ignore
            const existingIndex = targetList.findIndex(
                (r) => r.id === recipe.id,
            );

            if (existingIndex !== -1) {
                // Recipe exists, increase quantity
                // @ts-ignore
                targetList[existingIndex].quantity += 1;
            } else {
                // Recipe doesn't exist, add it with quantity 1
                // @ts-ignore
                targetList.push({
                    ...recipe,
                    quantity: 1, // Default quantity when dragging from sidebar
                });
            }

            saveWeekPlan(weekId, plan);
            return;
        }

        // Handle Sidebar Leftover Drop
        if (source.type === "sidebar-leftover" && source.leftoverId) {
            const targetDayIndex = plan.findIndex((d) => d.day === target.day);
            if (targetDayIndex === -1) return;

            const leftoversVal = get(leftovers);
            const leftover = leftoversVal.data.find(
                (l) => l.id === source.leftoverId,
            );
            if (!leftover) return;

            const targetList = plan[targetDayIndex].meals[target.type];

            // Check if already in this slot
            // @ts-ignore
            if (targetList.some((item) => item.leftoverId === leftover.id))
                return;

            // Add to plan
            // @ts-ignore
            targetList.unshift({
                id: crypto.randomUUID(),
                leftoverId: leftover.id,
                title: leftover.title,
                imageUrl: leftover.imageUrl,
                sourceRecipeId: leftover.sourceRecipeId,
                isLeftover: true,
            });

            // Mark as planned in store
            setLeftoverPlanned(leftover.id, weekId, target.day, target.type);

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

        // Check if recipe already exists in target list
        // @ts-ignore - Check for existing item with same ID, but not the item itself if in the same list
        const existingIndex = targetList.findIndex(
            (r: any, idx: number) =>
                r.id === item.id &&
                (sourceList !== targetList || idx !== source.index),
        );

        if (existingIndex !== -1) {
            // Recipe exists in target, merge quantities
            // @ts-ignore
            targetList[existingIndex].quantity =
                (targetList[existingIndex].quantity || 1) +
                (item.quantity || 1);

            // Remove from source
            // @ts-ignore
            sourceList.splice(source.index, 1);
        } else {
            // Recipe doesn't exist in target, move it
            // Remove from source
            // @ts-ignore
            sourceList.splice(source.index, 1);

            // Add to target
            // @ts-ignore
            targetList.push(item);
        }

        saveWeekPlan(weekId, plan);
    };
    import ShoppingCartButton from "$lib/components/ShoppingCartButton.svelte";
    import ShoppingListModal from "$lib/components/ShoppingListModal.svelte";
    import { getWeekShoppingList } from "$lib/stores/shoppingList";
    import { toPng } from "html-to-image";

    // Shopping List State
    let isShoppingListOpen = $state(false);
    let shoppingListStore = $derived(getWeekShoppingList(weekId));
    let itemCount = $derived($shoppingListStore.data.length);

    let printRef = $state<HTMLDivElement | null>(null);
    let isPrinting = $state(false);

    async function handlePrint() {
        if (!printRef) return;

        isPrinting = true;

        try {
            // Need to ensure the element is fully expanded if it's currently scrolling
            // html-to-image captures the element as it is.
            // Since it's a grid, it should have its full width if we target the right div.

            const dataUrl = await toPng(printRef, {
                backgroundColor: "#fffdfc",
                quality: 1,
                pixelRatio: 2, // Higher resolution
                style: {
                    margin: "0",
                    padding: "0",
                    // Reset any transforms or scroll states if needed
                },
            });

            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title></title>
                        <style>
                            @page { 
                                size: landscape; 
                                margin: 0; 
                            }
                            body { 
                                margin: 0; 
                                padding: 10mm;
                                display: flex; 
                                flex-direction: column;
                                align-items: center; 
                                background: white; 
                                font-family: sans-serif;
                            }
                            .header {
                                width: 100%;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 10px 0;
                                box-sizing: border-box;
                                border-bottom: 2px solid #c2410c;
                                margin-bottom: 15px;
                            }
                            .header h1 { color: #c2410c; margin: 0; font-size: 24px; }
                            .header p { color: #57534e; margin: 0; font-weight: bold; }
                            img { max-width: 100%; height: auto; display: block; border: 1px solid #e7e5e4; }
                        </style>
                    </head>
                    <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
                        <div class="header">
                            <h1>YumHero Meal Plan</h1>
                            <p>${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}, ${weekRange.start.getFullYear()}</p>
                        </div>
                        <img src="${dataUrl}" />
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        } catch (error) {
            console.error("Print failed:", error);
            toasts.error("Failed to generate print view");
        } finally {
            isPrinting = false;
        }
    }
</script>

<svelte:window onresize={checkScroll} onkeydown={handleKeydown} />

<SEO
    title="Weekly Meal Plan"
    description="Plan your weekly meals with YumHero. Organize breakfast, lunch, dinner, and snacks for the entire week."
/>

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

            <button
                class="p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors relative group disabled:opacity-50"
                onclick={handlePrint}
                disabled={isPrinting}
                aria-label="Print Week Plan"
            >
                {#if isPrinting}
                    <div
                        class="w-6 h-6 border-2 border-app-primary border-t-transparent rounded-full animate-spin"
                    ></div>
                {:else}
                    <Printer
                        size={24}
                        class="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                    />
                {/if}
            </button>

            <ShoppingCartButton
                onclick={() => (isShoppingListOpen = true)}
                {itemCount}
            />
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
                bind:this={printRef}
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
                                    onAddToFridge={(
                                        title,
                                        recipeId,
                                        imageUrl,
                                    ) =>
                                        handleAddToFridge(
                                            title,
                                            recipeId,
                                            imageUrl,
                                            dayPlan.day,
                                            section.type,
                                        )}
                                    onRemoveLeftoverFromPlan={(
                                        leftoverId,
                                        idx,
                                    ) =>
                                        handleRemoveLeftoverFromPlan(
                                            dayPlan.day,
                                            section.type,
                                            leftoverId,
                                            idx,
                                        )}
                                    onMarkLeftoverAsEaten={(leftoverId, idx) =>
                                        handleMarkLeftoverAsEaten(
                                            dayPlan.day,
                                            section.type,
                                            leftoverId,
                                            idx,
                                        )}
                                    onMarkLeftoverAsNotEaten={(
                                        leftoverId,
                                        idx,
                                    ) =>
                                        handleMarkLeftoverAsNotEaten(
                                            dayPlan.day,
                                            section.type,
                                            leftoverId,
                                            idx,
                                        )}
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
    currentLeftovers={modal.currentLeftovers}
    {availableRecipes}
    onClose={closeModal}
    onSelect={handleRecipeSelect}
    onSelectLeftovers={handleSelectLeftovers}
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

<!-- Bought Ingredients Confirmation Modal -->
<BoughtIngredientsConfirmModal
    isOpen={boughtIngredientsModal.isOpen}
    recipeTitle={boughtIngredientsModal.recipeTitle}
    ingredients={boughtIngredientsModal.ingredients}
    onConfirm={handleConfirmAddToFridge}
    onSkip={handleSkipAddToFridge}
    onClose={() => (boughtIngredientsModal.isOpen = false)}
/>
