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
    import { Loader2, Printer, X } from "lucide-svelte";
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

    const getItemTitle = (item: any): string => {
        if (item && "isLeftover" in item && item.isLeftover) {
            return item.title || "";
        }
        if (item && "recipe" in item) {
            return item.recipe?.title || "";
        }
        if (item && "text" in item) {
            return item.text || "";
        }
        return "";
    };
</script>

<svelte:head>
    <title>YumHero Plan ({weekLabel})</title>
</svelte:head>

<div
    class="bg-slate-100 min-h-screen w-full flex md:justify-center items-start p-4 sm:p-8 print:p-0 print:bg-white overflow-auto print:min-h-0 relative"
>
    {#if isLoading}
        <div
            class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-4 print:hidden"
        >
            <Loader2 class="w-10 h-10 text-app-primary animate-spin" />
            <p class="text-app-text-muted font-bold animate-pulse">
                Preparing your meal plan...
            </p>
        </div>
    {/if}
    <!-- A4 Landscape Simulation: 297mm x 210mm -->
    <div
        class="bg-white w-[297mm] h-[210mm] shadow-2xl print:shadow-none flex flex-col p-[10mm] print:p-0 shrink-0 mb-20 print:mb-0 print:h-auto print:max-h-full print:w-full print:overflow-visible mx-auto md:mx-0"
    >
        <!-- Header -->
        <div class="flex flex-col border-b-2 border-app-primary pb-2">
            <div class="flex justify-between items-baseline">
                <h1 class="text-[16pt] font-black text-app-primary m-0">
                    YumHero Meal Plan
                </h1>
                <p class="text-app-text-muted font-bold text-[8pt] m-0">
                    {weekLabel}
                </p>
            </div>
        </div>

        <!-- Grid -->
        <div
            class="border-l border-app-text/20 grid grid-cols-[repeat(7,1fr)] grid-flow-col grid-rows-[repeat(6,auto)] content-start"
        >
            {#each plan as dayPlan, i (dayPlan.day)}
                <div class="contents">
                    <!-- Column Header -->
                    <div
                        class="flex flex-col items-center justify-center p-1 border-b border-r border-app-text/20 bg-white h-15"
                    >
                        <span
                            class="font-display font-black text-app-text text-[10pt]"
                        >
                            {dayPlan.day.slice(0, 3)}
                        </span>
                        <span
                            class="text-[7.5pt] text-app-text font-bold opacity-70"
                        >
                            {getDayDate(i).split(" ")[1]}
                        </span>
                    </div>

                    <!-- Meal Slots -->
                    {#each mealSections as section (section.type)}
                        <div
                            class="flex flex-col border-r border-b border-app-text/20 bg-white relative h-full min-h-20"
                        >
                            <!-- Inline Meal Slot Rendering for Print -->
                            <div
                                class="p-2 py-1 flex items-center justify-between bg-white"
                            >
                                <div class="flex items-center">
                                    <div
                                        class={twMerge(
                                            "w-1.5 h-1.5 rounded-full mr-2",
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
                                        class="text-[6pt] font-bold capitalize tracking-wider text-app-text-muted"
                                    >
                                        {section.label}
                                    </span>
                                </div>
                            </div>

                            <div class="px-2 pb-2 flex flex-col gap-2 relative">
                                {#each dayPlan.meals[section.type] as item}
                                    {@const itemIsLeftover =
                                        "isLeftover" in item && item.isLeftover}
                                    <div
                                        class={twMerge(
                                            "relative flex items-center gap-2 pl-3 pr-2 py-1 rounded-xl border",
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
                                        <div class="flex-1 min-w-0">
                                            <p
                                                class={twMerge(
                                                    "font-bold leading-tight text-[7pt]!",
                                                    section.type === "breakfast"
                                                        ? "text-accent-breakfast-text"
                                                        : section.type ===
                                                            "lunch"
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
                                                {getItemTitle(item)}

                                                {#if itemIsLeftover}
                                                    <span
                                                        class="opacity-80 font-medium ml-1 text-[7pt]"
                                                        >— leftover</span
                                                    >
                                                {/if}

                                                {#if "quantity" in item && (item as any).quantity > 1}
                                                    <span
                                                        class="opacity-60 font-medium ml-1 text-[7pt]"
                                                        >x{(item as any)
                                                            .quantity}</span
                                                    >
                                                {/if}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>

    <div
        class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 print:hidden z-50 bg-white/80 backdrop-blur-md p-2 rounded-full border border-gray-200 shadow-2xl max-w-[95vw]"
    >
        <button
            onclick={() => window.print()}
            class="px-4 sm:px-8 py-3 bg-app-primary text-white rounded-full font-black shadow-lg hover:scale-105 transition-transform flex items-center gap-2 group whitespace-nowrap"
        >
            <Printer class="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
            <span class="text-sm sm:text-base">Print Plan</span>
        </button>

        <button
            onclick={() => window.close()}
            class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-gray-400 font-black rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shrink-0"
            title="Close"
        >
            <X class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
    </div>
</div>

<style>
    @media print {
        @page {
            size: landscape;
            margin: 0;
        }
        /* Ensure background colors are printed */
        :global(body) {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
            padding: 10mm;
        }
    }
</style>
