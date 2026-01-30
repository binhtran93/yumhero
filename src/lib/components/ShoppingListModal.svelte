<script lang="ts">
    import { X, Plus } from "lucide-svelte";
    import type { Recipe } from "$lib/types";
    import { fade, scale } from "svelte/transition";
    import GroupedIngredientCard from "./GroupedIngredientCard.svelte";
    import {
        userShoppingList,
        toggleShoppingItemCheck,
        toggleAllShoppingItemChecks,
        addManualShoppingItem,
    } from "$lib/stores/userData";
    import { buildShoppingListFromPlan } from "$lib/utils/shopping";
    import type { WeeklyPlan } from "$lib/types";
    import { addShoppingItem } from "$lib/stores/userData";

    interface Props {
        isOpen: boolean;
        plan: WeeklyPlan;
        availableRecipes: Recipe[];
        onClose: () => void;
    }

    let { isOpen, plan, availableRecipes, onClose }: Props = $props();

    let showAddManualModal = $state(false);
    let manualItemName = $state("");
    let manualItemAmount = $state("");
    let manualItemUnit = $state("");

    // Subscribe to shopping list
    let shoppingListState = $state({ data: [], loading: true });
    $effect(() => {
        const unsubscribe = userShoppingList.subscribe((state) => {
            shoppingListState = state;
        });
        return unsubscribe;
    });

    let shoppingList = $derived(shoppingListState.data);

    const handleToggleAll = async (itemId: string, checked: boolean) => {
        try {
            await toggleAllShoppingItemChecks(itemId, checked);
        } catch (error) {
            console.error("Failed to toggle all checks:", error);
        }
    };

    const handleToggleSource = async (
        itemId: string,
        sourceIndex: number,
        checked: boolean,
    ) => {
        try {
            await toggleShoppingItemCheck(itemId, sourceIndex, checked);
        } catch (error) {
            console.error("Failed to toggle source:", error);
        }
    };

    const handleAddManualItem = async () => {
        if (!manualItemName.trim()) return;

        const amount = parseFloat(manualItemAmount) || 0;
        try {
            await addManualShoppingItem(
                manualItemName,
                amount,
                manualItemUnit.trim() || null,
            );
            // Reset form
            manualItemName = "";
            manualItemAmount = "";
            manualItemUnit = "";
            showAddManualModal = false;
        } catch (error) {
            console.error("Failed to add manual item:", error);
        }
    };

    // Note: Shopping list is automatically populated via the sync logic in saveWeekPlan
    // No need to auto-generate here - it would cause race conditions and duplicates
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
            if (e.key === "Escape" && !showAddManualModal) onClose();
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
                    <div class="flex-1">
                        <h2
                            class="text-2xl font-display font-black text-app-text"
                        >
                            Shopping List
                        </h2>
                        <p class="text-sm text-app-text-muted font-medium mt-1">
                            {shoppingList.length} ingredient{shoppingList.length ===
                            1
                                ? ""
                                : "s"}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            class="px-3 py-2 rounded-xl text-xs font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all flex items-center gap-2 active:scale-95"
                            onclick={() => (showAddManualModal = true)}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Add Item
                        </button>
                        <button
                            class="p-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all"
                            onclick={onClose}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto px-4 pb-4">
                {#if shoppingListState.loading}
                    <div class="flex items-center justify-center h-full">
                        <div
                            class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                        ></div>
                    </div>
                {:else if shoppingList.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-full text-center py-16"
                    >
                        <p class="font-black text-xl text-app-text mb-2">
                            No ingredients yet
                        </p>
                        <p
                            class="text-sm font-bold text-app-text-muted max-w-60"
                        >
                            Add recipes to your meal plan or add manual items to
                            get started.
                        </p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {#each shoppingList as item (item.id)}
                            <GroupedIngredientCard
                                ingredientName={item.ingredient_name}
                                sources={item.sources}
                                recipes={availableRecipes}
                                onToggleAll={(checked) =>
                                    handleToggleAll(item.id, checked)}
                                onToggleSource={(idx, checked) =>
                                    handleToggleSource(item.id, idx, checked)}
                            />
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Add Manual Item Modal -->
{#if showAddManualModal}
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        transition:fade={{ duration: 200 }}
        onclick={(e) => {
            if (e.target === e.currentTarget) showAddManualModal = false;
        }}
        onkeydown={(e) => {
            if (e.key === "Escape") showAddManualModal = false;
        }}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div
            class="bg-app-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-app-border/20 p-6"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <h3 class="text-xl font-display font-black text-app-text mb-4">
                Add Manual Item
            </h3>

            <div class="space-y-4">
                <div>
                    <label
                        for="ingredient-name"
                        class="block text-sm font-bold text-app-text mb-2"
                    >
                        Ingredient Name
                    </label>
                    <input
                        id="ingredient-name"
                        type="text"
                        bind:value={manualItemName}
                        class="w-full px-4 py-2 rounded-xl border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary"
                        placeholder="e.g., Cà Chua"
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label
                            for="amount"
                            class="block text-sm font-bold text-app-text mb-2"
                        >
                            Amount
                        </label>
                        <input
                            id="amount"
                            type="number"
                            step="0.1"
                            bind:value={manualItemAmount}
                            class="w-full px-4 py-2 rounded-xl border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label
                            for="unit"
                            class="block text-sm font-bold text-app-text mb-2"
                        >
                            Unit
                        </label>
                        <input
                            id="unit"
                            type="text"
                            bind:value={manualItemUnit}
                            class="w-full px-4 py-2 rounded-xl border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary"
                            placeholder="trái, kg, etc."
                        />
                    </div>
                </div>
            </div>

            <div class="flex gap-3 mt-6">
                <button
                    class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-bg text-app-text hover:bg-app-surface-hover transition-all"
                    onclick={() => (showAddManualModal = false)}
                >
                    Cancel
                </button>
                <button
                    class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all active:scale-95"
                    onclick={handleAddManualItem}
                    disabled={!manualItemName.trim()}
                >
                    Add Item
                </button>
            </div>
        </div>
    </div>
{/if}
