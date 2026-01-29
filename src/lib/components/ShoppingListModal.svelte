<script lang="ts">
    import {
        X,
        Check,
        Search,
        Info,
        ChevronDown,
        ChevronUp,
    } from "lucide-svelte";
    import type { WeeklyPlan, Recipe } from "$lib/types";
    import {
        aggregatedShoppingList,
        formatAmount,
        type ShoppingItem,
    } from "$lib/utils/shopping";
    import { fade, slide } from "svelte/transition";
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
        // Create a new object for reactivity if needed, but in runes it should work?
        // Runes for objects are tricky if deep. let's assign.
        // Actually, just mutate because it's a proxy?
        // Let's do a re-assignment to be safe for persistence
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
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        onclick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
    >
        <div
            class="bg-app-bg w-full max-w-2xl h-[85vh] md:h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
            transition:slide={{ axis: "y", duration: 300 }}
        >
            <!-- Header -->
            <div
                class="p-4 md:p-6 border-b border-app-border bg-app-surface shrink-0 flex items-center justify-between"
            >
                <div>
                    <h2
                        class="text-2xl font-display font-black text-app-primary"
                    >
                        Shopping List
                    </h2>
                    <p class="text-xs text-app-text-muted font-bold mt-1">
                        {filteredList.filter((i) => !checkedItems[i.id]).length}
                        items remaining
                    </p>
                </div>
                <button
                    class="p-2 hover:bg-app-surface-hover rounded-full text-app-text-muted hover:text-app-text transition-colors"
                    onclick={onClose}
                >
                    <X size={24} />
                </button>
            </div>

            <!-- Controls -->
            <div
                class="px-4 py-3 border-b border-app-border bg-app-bg shrink-0 space-y-3"
            >
                <!-- Day Filter -->
                <div
                    class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                >
                    <button
                        class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border {selectedDay ===
                        'all'
                            ? 'bg-app-primary text-white border-app-primary'
                            : 'bg-app-surface text-app-text-muted border-app-border hover:bg-app-surface-hover'}"
                        onclick={() => (selectedDay = "all")}
                    >
                        All Week
                    </button>
                    {#each days as day}
                        <button
                            class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border {selectedDay ===
                            day
                                ? 'bg-app-primary text-white border-app-primary'
                                : 'bg-app-surface text-app-text-muted border-app-border hover:bg-app-surface-hover'}"
                            onclick={() => (selectedDay = day)}
                        >
                            {day}
                        </button>
                    {/each}
                </div>

                <!-- Search -->
                <!-- Ideally search is less important if list is small, but good to have -->
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-2">
                {#if filteredList.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-full text-app-text-muted py-10 opacity-60"
                    >
                        <div class="bg-app-surface-hover p-4 rounded-full mb-3">
                            <Search size={32} />
                        </div>
                        <p class="font-bold">No ingredients found</p>
                        <p class="text-xs">
                            Add recipes to your plan to see items here
                        </p>
                    </div>
                {:else}
                    {#each filteredList as item (item.id)}
                        {@const isChecked = checkedItems[item.id] || false}
                        <div
                            class="group bg-app-surface border border-app-border rounded-xl transition-all duration-200 overflow-hidden {isChecked
                                ? 'opacity-60 bg-app-bg'
                                : 'hover:border-app-primary/30 shadow-sm'}"
                        >
                            <!-- Main Row -->
                            <div class="flex items-center p-3 gap-3">
                                <!-- Checkbox -->
                                <button
                                    class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all {isChecked
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-app-text-muted/40 hover:border-app-primary text-transparent'}"
                                    onclick={() => toggleCheck(item.id)}
                                >
                                    <Check size={14} strokeWidth={4} />
                                </button>

                                <!-- Content -->
                                <div
                                    class="flex-1 min-w-0 flex flex-col justify-center"
                                    onclick={() => toggleCheck(item.id)}
                                >
                                    <div class="flex items-baseline gap-1.5">
                                        <span
                                            class="font-bold text-sm text-app-text {isChecked
                                                ? 'line-through text-app-text-muted'
                                                : ''} capitalize"
                                        >
                                            {item.name}
                                        </span>
                                    </div>
                                    <span
                                        class="text-xs text-app-text-muted font-medium"
                                    >
                                        {formatAmount(item.amount)}
                                        {item.unit}
                                    </span>
                                </div>

                                <!-- View Details Action -->
                                <button
                                    class="p-2 text-app-text-muted hover:text-app-primary hover:bg-app-surface-hover rounded-lg transition-colors"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(item.id);
                                    }}
                                    aria-label="View sources"
                                >
                                    {#if expandedItems[item.id]}
                                        <ChevronUp size={18} />
                                    {:else}
                                        <Info size={18} />
                                    {/if}
                                </button>
                            </div>

                            <!-- Expanded Details -->
                            {#if expandedItems[item.id]}
                                <div
                                    class="bg-app-surface-hover/50 border-t border-app-border p-3"
                                    transition:slide={{ duration: 200 }}
                                >
                                    <h4
                                        class="text-[10px] uppercase tracking-wider font-bold text-app-text-muted mb-2"
                                    >
                                        Used in:
                                    </h4>
                                    <ul class="space-y-1.5">
                                        {#each item.sources as source}
                                            <li
                                                class="flex items-center justify-between text-xs"
                                            >
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <span
                                                        class="w-1.5 h-1.5 rounded-full bg-app-primary/50"
                                                    ></span>
                                                    <span
                                                        class="font-medium text-app-text"
                                                        >{source.recipeName}</span
                                                    >
                                                    <span
                                                        class="text-app-text-muted"
                                                        >({source.day})</span
                                                    >
                                                </div>
                                                <span
                                                    class="font-mono text-app-text-muted opacity-80"
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
                {/if}
            </div>

            <!-- Footer -->
            <div
                class="p-4 border-t border-app-border bg-app-surface shrink-0 flex justify-between items-center text-xs"
            >
                {#if Object.values(checkedItems).filter(Boolean).length > 0}
                    <button
                        class="text-red-500 font-bold hover:underline"
                        onclick={() => {
                            if (confirm("Uncheck all items?")) {
                                checkedItems = {};
                                localStorage.removeItem("shoppingListChecked");
                            }
                        }}
                    >
                        Reset Checked
                    </button>
                {:else}
                    <div></div>
                {/if}
                <span class="text-app-text-muted">
                    Displaying {filteredList.length} items
                </span>
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
