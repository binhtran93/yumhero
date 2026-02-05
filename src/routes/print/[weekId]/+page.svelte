<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";
    import { getWeekPlan } from "$lib/stores/plans";
    import { userRecipes } from "$lib/stores/recipes";
    import type { WeeklyPlan, Recipe } from "$lib/types";
    import MealSlot from "$lib/components/MealSlot.svelte";
    import { twMerge } from "tailwind-merge";
    import "../../../app.css"; // Ensure global styles are applied

    const weekId = $page.params.weekId ?? "";

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

    let plan = $state<WeeklyPlan>(createEmptyPlan("Monday"));
    let isLoading = $state(true);
    let availableRecipes = $state<Recipe[]>([]);

    // Transform weekId (YYYY-MM-DD) to Date object for header
    const getWeekDate = (id: string) => {
        const parts = id.split("-").map(Number);
        // Create date in local time from YYYY-MM-DD parts
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const weekStartDate = getWeekDate(weekId);

    const getWeekRangeLabel = (startDate: Date) => {
        const end = new Date(startDate);
        end.setDate(startDate.getDate() + 6);

        const format = (d: Date) =>
            d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        return `${format(startDate)} - ${format(end)}, ${startDate.getFullYear()}`;
    };

    const weekLabel = getWeekRangeLabel(weekStartDate);

    // Auth & Subscription Check
    $effect(() => {
        if (!$authLoading) {
            if (!$user) {
                goto(`/login?redirect=/print/${weekId}`, {
                    replaceState: true,
                });
            } else if (!$subscriptionLoading && !$isSubscribed) {
                goto("/subscribe", { replaceState: true });
            }
        }
    });

    // Fetch Data
    $effect(() => {
        // Subscribe to recipes
        const unsubscribeRecipes = userRecipes.subscribe((state) => {
            availableRecipes = state.data;
        });

        // Subscribe to plan
        const store = getWeekPlan(weekId);
        const unsubscribePlan = store.subscribe((state) => {
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

        return () => {
            unsubscribeRecipes();
            unsubscribePlan();
        };
    });

    onMount(() => {
        // Wait for data to load then print
        const checkLoaded = setInterval(() => {
            if (!isLoading && plan.length > 0) {
                clearInterval(checkLoaded);
                // Give a small buffer for rendering
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        }, 100);

        return () => clearInterval(checkLoaded);
    });

    const mealSections = [
        { type: "breakfast" as const, label: "Breakfast" },
        { type: "lunch" as const, label: "Lunch" },
        { type: "dinner" as const, label: "Dinner" },
        { type: "snack" as const, label: "Snack" },
        { type: "note" as const, label: "Note" },
    ];

    // Helper to get formatted date for column
    const getDayDate = (dayIndex: number) => {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + dayIndex);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // No-op handlers for read-only view
    const noop = () => {};
</script>

<svelte:head>
    <title>Print Plan - YumHero</title>
</svelte:head>

<div class="bg-white min-h-screen w-full flex flex-col p-4 print:p-0">
    <!-- Header -->
    <div
        class="flex flex-col border-b-2 border-app-primary pb-2 mb-4 print:mb-2"
    >
        <div class="flex justify-between items-baseline">
            <h1 class="text-2xl font-black text-app-primary m-0">
                YumHero Meal Plan
            </h1>
            <p class="text-app-text-muted font-bold text-sm m-0">{weekLabel}</p>
        </div>
    </div>

    <!-- Grid -->
    <div
        class="flex-1 border-l border-app-text/30 grid grid-cols-[repeat(7,1fr)] grid-flow-col grid-rows-[auto_repeat(5,auto)] border-r"
    >
        {#each plan as dayPlan, i (dayPlan.day)}
            <div class="contents">
                <!-- Column Header -->
                <div
                    class="flex flex-col items-center justify-center p-1 border-b border-r border-app-border bg-app-surface h-12"
                >
                    <span class="font-display font-black text-app-text text-sm">
                        {dayPlan.day.slice(0, 3)}
                    </span>
                    <span
                        class="text-[10px] text-app-text font-bold opacity-70"
                    >
                        {getDayDate(i).split(" ")[1]}
                    </span>
                </div>

                <!-- Meal Slots -->
                {#each mealSections as section (section.type)}
                    <div
                        class="flex flex-col border-r border-b border-app-text/20 bg-white relative h-full"
                    >
                        <!-- Reusing MealSlot in read-only mode by passing no-ops and isPrinting=true -->
                        <MealSlot
                            day={dayPlan.day}
                            type={section.type}
                            items={dayPlan.meals[section.type]}
                            onClick={noop}
                            isLoading={false}
                            {availableRecipes}
                            isPrinting={true}
                        />
                    </div>
                {/each}
            </div>
        {/each}
    </div>

    <div class="mt-8 text-center print:hidden">
        <p class="text-app-text-muted mb-2">
            Printing should start automatically...
        </p>
        <button
            onclick={() => window.print()}
            class="px-4 py-2 bg-app-primary text-white rounded-lg font-bold"
        >
            Print Again
        </button>
        <button
            onclick={() => window.close()}
            class="px-4 py-2 ml-2 text-app-text-muted font-bold hover:bg-gray-100 rounded-lg"
        >
            Close
        </button>
    </div>
</div>

<style>
    @media print {
        @page {
            size: landscape;
            margin: 5mm;
        }
        /* Ensure background colors are printed */
        :global(body) {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }
</style>
