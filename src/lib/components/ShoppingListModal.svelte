<script lang="ts">
    import { X, Check, Search, Info, CheckSquare, Square } from "lucide-svelte";
    import type { WeeklyPlan, Recipe } from "$lib/types";
    import {
        aggregatedShoppingList,
        formatAmount,
        type ShoppingItem,
    } from "$lib/utils/shopping";
    import { fade, slide, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import IngredientItem from "./IngredientItem.svelte";

    interface Props {
        isOpen: boolean;
        plan: WeeklyPlan;
        availableRecipes: Recipe[];
        onClose: () => void;
    }

    let { isOpen, plan, availableRecipes, onClose }: Props = $props();

    let selectedDay = $state<string | "all">("all");
    let searchQuery = $state("");

    // Checked items state (persisted)
    let checkedItems = $state<Record<string, boolean>>({});

    // Expanded details for items
    let expandedItems = $state<Record<string, boolean>>({});

    onMount(() => {
        const stored = localStorage.getItem("shoppingListChecked");
        if (stored) {
            try {
                checkedItems = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse checked items", e);
            }
        }
    });

    const toggleCheck = (id: string) => {
        checkedItems[id] = !checkedItems[id];
        checkedItems = { ...checkedItems };
        localStorage.setItem(
            "shoppingListChecked",
            JSON.stringify(checkedItems),
        );
    };

    const toggleExpand = (id: string) => {
        expandedItems[id] = !expandedItems[id];
        expandedItems = { ...expandedItems };
    };

    let shoppingList = $derived(aggregatedShoppingList(plan, selectedDay));

    let filteredList = $derived(
        shoppingList.filter((item) => {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }),
    );

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    let totalCount = $derived(filteredList.length);
    let checkedCount = $derived(
        filteredList.filter((item) => checkedItems[item.id]).length,
    );
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        onclick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
        onkeydown={(e) => {
            if (e.key === "Escape") onClose();
        }}
        tabindex="-1"
    >
        <div
            class="bg-app-surface w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-app-border/20"
            transition:scale={{ start: 0.95, duration: 250 }}
        >
            <!-- Header -->
            <div class="px-4 pt-4 pb-2 shrink-0">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2
                            class="text-2xl font-display font-black text-app-text"
                        >
                            Shopping List
                        </h2>
                    </div>
                    <button
                        class="p-2 -mr-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all"
                        onclick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <!-- Day Filter -->
                <div
                    class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
                >
                    <button
                        class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all {selectedDay ===
                        'all'
                            ? 'bg-app-primary text-white shadow-md'
                            : 'bg-app-bg text-app-text-muted hover:bg-app-surface-hover'}"
                        onclick={() => (selectedDay = "all")}
                    >
                        All Week
                    </button>
                    {#each days as day}
                        <button
                            class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all {selectedDay ===
                            day
                                ? 'bg-app-primary text-white shadow-md'
                                : 'bg-app-bg text-app-text-muted hover:bg-app-surface-hover'}"
                            onclick={() => (selectedDay = day)}
                        >
                            {day.slice(0, 3)}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto px-2 md:px-4 pb-2 md:pb-4">
                {#if filteredList.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-full text-center py-16"
                    >
                        <div
                            class="w-20 h-20 rounded-3xl bg-app-surface-deep flex items-center justify-center mb-4 shadow-inner"
                        >
                            <Search
                                size={32}
                                class="text-app-text-muted opacity-40"
                            />
                        </div>
                        <p class="font-black text-xl text-app-text mb-2">
                            No ingredients found
                        </p>
                        <p
                            class="text-sm font-bold text-app-text-muted max-w-60"
                        >
                            Try changing your search or adding recipes to your
                            plan.
                        </p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2">
                        {#each filteredList as item (item.id)}
                            {@const isChecked = checkedItems[item.id] || false}
                            {@const isExpanded =
                                expandedItems[item.id] || false}
                            <div
                                class="group transition-all duration-200
                                {isChecked
                                    ? 'bg-app-surface/50 opacity-90'
                                    : 'bg-app-surface hover:bg-app-surface-hover'}"
                            >
                                <!-- Main Row -->
                                <IngredientItem
                                    name={item.name}
                                    amount={item.amount}
                                    unit={item.unit}
                                    checked={isChecked}
                                    showInfo={true}
                                    {isExpanded}
                                    onToggle={() => toggleCheck(item.id)}
                                    onInfoClick={() => toggleExpand(item.id)}
                                />

                                <!-- Expanded Details -->
                                {#if isExpanded}
                                    <div
                                        class="px-4 pb-4 pt-0"
                                        transition:slide={{ duration: 200 }}
                                    >
                                        <div
                                            class="bg-app-surface-deep rounded-xl p-3 space-y-3 border border-app-border/50"
                                        >
                                            <h4
                                                class="text-[10px] font-black uppercase tracking-[0.15em] text-app-text-muted opacity-60 flex items-center gap-2"
                                            >
                                                <span
                                                    class="w-1 h-1 bg-app-primary rounded-full"
                                                ></span>
                                                Breakdown
                                            </h4>
                                            <ul class="space-y-2.5">
                                                {#each item.sources as source}
                                                    <li
                                                        class="flex items-center justify-between gap-4"
                                                    >
                                                        <div class="min-w-0">
                                                            <p
                                                                class="font-bold text-xs text-app-text truncate"
                                                            >
                                                                {source.recipeName}
                                                            </p>
                                                            <p
                                                                class="text-[10px] font-bold text-app-text-muted uppercase tracking-tight"
                                                            >
                                                                {source.day.slice(
                                                                    0,
                                                                    3,
                                                                )} • {source.mealType}
                                                            </p>
                                                        </div>
                                                        <span
                                                            class="text-xs font-black text-app-text-muted tabular-nums bg-app-bg px-2 py-1 rounded-md border border-app-border/40"
                                                        >
                                                            {formatAmount(
                                                                source.originalAmount,
                                                            )}
                                                        </span>
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style lang="postcss">
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
