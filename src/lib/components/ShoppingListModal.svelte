<script lang="ts">
    import { X, Plus } from "lucide-svelte";
    import type { Recipe } from "$lib/types";
    import GroupedIngredientCard from "./GroupedIngredientCard.svelte";
    import Modal from "./Modal.svelte";
    import {
        userShoppingList,
        toggleShoppingItemCheck as toggleShoppingSourceCheck,
        toggleAllShoppingItemChecks as toggleAllShoppingItemChecks,
        addManualShoppingItem,
        deleteShoppingItem,
    } from "$lib/stores/shoppingList";
    import type { WeeklyPlan } from "$lib/types";

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
    let shoppingList = $derived($userShoppingList.data);
    let isLoading = $derived($userShoppingList.loading);

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
            await toggleShoppingSourceCheck(itemId, sourceIndex, checked);
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
</script>

<Modal {isOpen} {onClose} class="max-w-4xl" closeOnEsc={!showAddManualModal}>
    {#snippet header()}
        <div class="px-6 pt-6 pb-2 flex items-start justify-between shrink-0">
            <div class="flex-1">
                <h2 class="text-2xl font-display font-black text-app-text">
                    Shopping List
                </h2>
                <p class="text-sm text-app-text-muted font-medium mt-1">
                    {shoppingList.length} ingredient{shoppingList.length === 1
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
                    class="p-2 -mr-2 -mt-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all"
                    onclick={onClose}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    {/snippet}

    <div class="px-6 pb-6">
        {#if isLoading}
            <div class="flex items-center justify-center h-64">
                <div
                    class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if shoppingList.length === 0}
            <div
                class="flex flex-col items-center justify-center h-64 text-center py-16"
            >
                <p class="font-black text-xl text-app-text mb-2">
                    No ingredients yet
                </p>
                <p class="text-sm font-bold text-app-text-muted max-w-60">
                    Add recipes to your meal plan or add manual items to get
                    started.
                </p>
            </div>
        {:else}
            <div>
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
</Modal>

<Modal
    isOpen={showAddManualModal}
    onClose={() => (showAddManualModal = false)}
    title="Add Manual Item"
    class="max-w-md"
>
    <div class="p-6 pt-0 space-y-4">
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
                placeholder="e.g., Tomatoes"
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
                    placeholder="pcs, kg, etc."
                />
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
</Modal>
