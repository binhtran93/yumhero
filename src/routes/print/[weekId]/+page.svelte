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
        class="flex-1 border-l border-app-text/30 grid grid-cols-[repeat(7,1fr)] grid-flow-col grid-rows-[repeat(6,auto)] content-start border-r"
    >
        {#each plan as dayPlan, i (dayPlan.day)}
            <div class="contents">
                <!-- Column Header -->
                <div
                    class="flex flex-col items-center justify-center p-1 border-b border-r border-app-border bg-white h-15"
                >
                    <span
                        class="font-display font-black text-app-text text-base"
                    >
                        {dayPlan.day.slice(0, 3)}
                    </span>
                    <span class="text-xs text-app-text font-bold opacity-70">
                        {getDayDate(i).split(" ")[1]}
                    </span>
                </div>

                <!-- Meal Slots -->
                {#each mealSections as section (section.type)}
                    <div
                        class="flex flex-col border-r border-b border-app-text/20 bg-white relative h-full min-h-10"
                    >
                        <!-- Inline Meal Slot Rendering for Print -->
                        <div
                            class="p-2 py-1 flex items-center justify-between bg-white border-b border-app-text/5"
                        >
                            <div class="flex items-center">
                                <div
                                    class={twMerge(
                                        "w-2 h-2 rounded-full mr-2",
                                        section.type === "breakfast"
                                            ? "bg-accent-breakfast"
                                            : section.type === "lunch"
                                              ? "bg-accent-lunch"
                                              : section.type === "dinner"
                                                ? "bg-accent-dinner"
                                                : section.type === "snack"
                                                  ? "bg-accent-snack"
                                                  : "bg-accent-note",
                                    )}
                                ></div>
                                <span
                                    class="text-[10px] font-semibold capitalize tracking-widest text-app-text-muted"
                                >
                                    {section.label}
                                </span>
                            </div>
                        </div>

                        <div
                            class="px-2 pb-2 flex flex-col gap-2 relative mt-2"
                        >
                            {#each dayPlan.meals[section.type] as item}
                                {@const itemIsLeftover =
                                    "isLeftover" in item && item.isLeftover}
                                <div
                                    class={twMerge(
                                        "relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border",
                                        section.type === "breakfast"
                                            ? "bg-accent-breakfast-bg border-accent-breakfast-border"
                                            : section.type === "lunch"
                                              ? "bg-accent-lunch-bg border-accent-lunch-border"
                                              : section.type === "dinner"
                                                ? "bg-accent-dinner-bg border-accent-dinner-border"
                                                : section.type === "snack"
                                                  ? "bg-accent-snack-bg border-accent-snack-border"
                                                  : "bg-accent-note-bg border-accent-note-border",
                                    )}
                                >
                                    <div class="flex-1 min-w-0 pt-0.5">
                                        <p
                                            class={twMerge(
                                                "font-bold leading-tight !text-[11px]",
                                                section.type === "breakfast"
                                                    ? "text-accent-breakfast-text"
                                                    : section.type === "lunch"
                                                      ? "text-accent-lunch-text"
                                                      : section.type ===
                                                          "dinner"
                                                        ? "text-accent-dinner-text"
                                                        : section.type ===
                                                            "snack"
                                                          ? "text-accent-snack-text"
                                                          : "text-accent-note-text",
                                            )}
                                        >
                                            {"title" in item
                                                ? item.title
                                                : "text" in item
                                                  ? item.text
                                                  : ""}

                                            {#if "quantity" in item && item.quantity > 1}
                                                <span
                                                    class="opacity-60 font-medium ml-1 text-[10px]"
                                                    >x{item.quantity}</span
                                                >
                                            {/if}
                                        </p>
                                        {#if itemIsLeftover}
                                            <div
                                                class="flex items-center gap-1.5 -mt-0.5"
                                            >
                                                <div
                                                    class="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500"
                                                ></div>
                                                <p
                                                    class="text-[9px] font-bold opacity-60"
                                                >
                                                    Leftover
                                                </p>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
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
