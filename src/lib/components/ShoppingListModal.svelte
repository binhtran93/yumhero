<script lang="ts">
    import { X, Check, Search, ChevronRight } from "lucide-svelte";
    import type { WeeklyPlan, Recipe } from "$lib/types";
    import {
        aggregatedShoppingList,
        formatAmount,
        type ShoppingItem,
    } from "$lib/utils/shopping";
    import { fade, slide, scale } from "svelte/transition";
    import { onMount } from "svelte";

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

    let shoppingList = $derived(
        aggregatedShoppingList(plan, availableRecipes, selectedDay),
    );

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

    let checkedCount = $derived(
        Object.values(checkedItems).filter(Boolean).length,
    );
    let totalCount = $derived(filteredList.length);
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
            class="bg-app-surface w-full max-w-lg h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative border border-app-border/20"
            transition:scale={{ start: 0.95, duration: 250 }}
        >
            <!-- Header -->
            <div class="px-6 pt-6 pb-4 shrink-0">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2
                            class="text-2xl font-display font-black text-app-text"
                        >
                            Shopping List
                        </h2>
                        <p class="text-sm text-app-text-muted mt-1">
                            {totalCount - checkedCount} of {totalCount} items
                        </p>
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
            <div class="flex-1 overflow-y-auto px-6 pb-6">
                {#if filteredList.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-full text-center opacity-60 py-16"
                    >
                        <div
                            class="w-16 h-16 rounded-2xl bg-app-bg flex items-center justify-center mb-4"
                        >
                            <Search size={28} class="text-app-text-muted" />
                        </div>
                        <p class="font-bold text-app-text mb-1">
                            No ingredients
                        </p>
                        <p class="text-xs text-app-text-muted max-w-[200px]">
                            Add recipes to your plan to see shopping items
                        </p>
                    </div>
                {:else}
                    <div class="space-y-1">
                        {#each filteredList as item (item.id)}
                            {@const isChecked = checkedItems[item.id] || false}
                            {@const isExpanded =
                                expandedItems[item.id] || false}
                            <div
                                class="group rounded-xl transition-all duration-200 overflow-hidden"
                            >
                                <!-- Main Row -->
                                <div
                                    class="w-full flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer {isChecked
                                        ? 'bg-app-bg/50 opacity-60'
                                        : 'bg-app-bg hover:bg-app-surface-hover'}"
                                    onclick={() => toggleCheck(item.id)}
                                    role="button"
                                    tabindex="0"
                                    onkeydown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            toggleCheck(item.id);
                                        }
                                    }}
                                >
                                    <!-- Checkbox -->
                                    <div
                                        class="w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all {isChecked
                                            ? 'bg-green-500 border-green-500 scale-105'
                                            : 'border-app-text-muted/30 group-hover:border-app-primary/50'}"
                                    >
                                        {#if isChecked}
                                            <Check
                                                size={12}
                                                strokeWidth={3}
                                                class="text-white"
                                            />
                                        {/if}
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="font-semibold text-sm text-app-text {isChecked
                                                ? 'line-through'
                                                : ''} capitalize leading-tight"
                                        >
                                            {item.name}
                                        </p>
                                        <p
                                            class="text-xs text-app-text-muted mt-0.5 font-medium"
                                        >
                                            {formatAmount(item.amount)}
                                            {item.unit}
                                        </p>
                                    </div>

                                    <!-- Sources Badge -->
                                    {#if item.sources.length > 1}
                                        <div
                                            class="px-2 py-1 bg-app-primary/10 rounded-lg"
                                        >
                                            <span
                                                class="text-[10px] font-bold text-app-primary"
                                            >
                                                {item.sources.length}×
                                            </span>
                                        </div>
                                    {/if}

                                    <!-- Expand Button -->
                                    <button
                                        class="p-1.5 text-app-text-muted hover:text-app-primary rounded-lg transition-all {isExpanded
                                            ? 'rotate-90'
                                            : ''}"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(item.id);
                                        }}
                                        aria-label="View sources"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <!-- Expanded Details -->
                                {#if isExpanded}
                                    <div
                                        class="bg-app-surface-hover/30 mx-4 mb-2 rounded-xl p-3 border-l-2 border-app-primary/30"
                                        transition:slide={{ duration: 200 }}
                                    >
                                        <h4
                                            class="text-[10px] uppercase tracking-widest font-bold text-app-text-muted mb-2 opacity-60"
                                        >
                                            Used in {item.sources.length}
                                            {item.sources.length === 1
                                                ? "recipe"
                                                : "recipes"}
                                        </h4>
                                        <ul class="space-y-2">
                                            {#each item.sources as source}
                                                <li
                                                    class="flex items-start justify-between gap-2"
                                                >
                                                    <div class="flex-1 min-w-0">
                                                        <p
                                                            class="font-medium text-xs text-app-text leading-tight truncate"
                                                        >
                                                            {source.recipeName}
                                                        </p>
                                                        <p
                                                            class="text-[10px] text-app-text-muted mt-0.5"
                                                        >
                                                            {source.day} • {source.mealType}
                                                        </p>
                                                    </div>
                                                    <span
                                                        class="text-xs font-mono text-app-text-muted shrink-0"
                                                    >
                                                        {formatAmount(
                                                            source.originalAmount,
                                                        )}
                                                    </span>
                                                </li>
                                            {/each}
                                        </ul>
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
