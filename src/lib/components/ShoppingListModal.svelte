<script lang="ts">
    import { X, ShoppingCart, ShoppingBasket, Plus, Eye } from "lucide-svelte";
    import type { Recipe, ShoppingListItem } from "$lib/types";
    import GroupedIngredientCard from "./GroupedIngredientCard.svelte";
    import Modal from "./Modal.svelte";
    import ShoppingListHeaderMenu from "./ShoppingListHeaderMenu.svelte";
    import {
        getWeekShoppingList,
        toggleShoppingItemCheck as toggleShoppingSourceCheck,
        toggleAllShoppingItemChecks as toggleAllShoppingItemChecks,
        addManualShoppingItem,
        softDeleteShoppingItem,
        restoreShoppingItem,
        updateShoppingItem,
        resetShoppingItem,
        resetAllShoppingItems,
        hasItemHistory,
    } from "$lib/stores/shoppingList";
    import type { WeeklyPlan } from "$lib/types";

    interface Props {
        isOpen: boolean;
        weekId: string;
        plan: WeeklyPlan;
        availableRecipes: Recipe[];
        onClose: () => void;
    }

    let { isOpen, weekId, plan, availableRecipes, onClose }: Props = $props();

    // Modal states
    let showAddManualModal = $state(false);
    let showEditModal = $state(false);
    let editingItem = $state<ShoppingListItem | null>(null);

    // Form states
    let manualItemName = $state("");
    let manualItemAmount = $state("");
    let manualItemUnit = $state("");
    let editItemAmount = $state("");
    let editItemUnit = $state("");

    // Toggle for showing deleted items
    let showDeleted = $state(false);

    // Subscribe to week-scoped shopping list
    let weekShoppingListStore = $derived(getWeekShoppingList(weekId));
    let shoppingList = $derived($weekShoppingListStore.data);
    let isLoading = $derived($weekShoppingListStore.loading);

    // Filter items based on showDeleted state
    let displayedItems = $derived(
        showDeleted
            ? shoppingList
            : shoppingList.filter((item) => !item.is_deleted),
    );

    // Count for display
    let activeCount = $derived(
        shoppingList.filter((item) => !item.is_deleted).length,
    );
    let deletedCount = $derived(
        shoppingList.filter((item) => item.is_deleted).length,
    );

    const handleToggleAll = async (itemId: string, checked: boolean) => {
        try {
            await toggleAllShoppingItemChecks(weekId, itemId, checked);
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
            await toggleShoppingSourceCheck(
                weekId,
                itemId,
                sourceIndex,
                checked,
            );
        } catch (error) {
            console.error("Failed to toggle source:", error);
        }
    };

    const handleAddManualItem = async () => {
        if (!manualItemName.trim()) return;

        const amount = parseFloat(manualItemAmount) || 0;
        try {
            await addManualShoppingItem(
                weekId,
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

    const handleDeleteItem = async (itemId: string) => {
        try {
            await softDeleteShoppingItem(weekId, itemId);
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    };

    const handleRestoreItem = async (itemId: string) => {
        try {
            await restoreShoppingItem(weekId, itemId);
        } catch (error) {
            console.error("Failed to restore item:", error);
        }
    };

    const handleEditItem = (item: ShoppingListItem) => {
        editingItem = item;
        // Calculate total amount for display
        const totalAmount = item.sources.reduce((sum, s) => sum + s.amount, 0);
        editItemAmount = totalAmount.toString();
        editItemUnit = item.sources[0]?.unit || "";
        showEditModal = true;
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        const amount = parseFloat(editItemAmount) || 0;
        try {
            await updateShoppingItem(
                weekId,
                editingItem.id,
                amount,
                editItemUnit.trim() || null,
            );
            showEditModal = false;
            editingItem = null;
        } catch (error) {
            console.error("Failed to update item:", error);
        }
    };

    const handleResetItem = async (itemId: string) => {
        try {
            await resetShoppingItem(weekId, itemId);
        } catch (error) {
            console.error("Failed to reset item:", error);
        }
    };

    const handleResetAll = async () => {
        try {
            await resetAllShoppingItems(weekId);
        } catch (error) {
            console.error("Failed to reset all items:", error);
        }
    };
</script>

<Modal
    {isOpen}
    {onClose}
    class="max-w-4xl"
    closeOnEsc={!showAddManualModal && !showEditModal}
>
    {#snippet header()}
        <div class="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
            <div class="flex-1">
                <h2 class="text-2xl font-display font-black text-app-text">
                    Shopping List
                </h2>
                <p class="text-sm text-app-text-muted font-medium mt-1">
                    {activeCount} ingredient{activeCount === 1 ? "" : "s"}
                    {#if showDeleted && deletedCount > 0}
                        <span class="text-red-500">
                            ({deletedCount} deleted)
                        </span>
                    {/if}
                </p>
            </div>
            <div class="flex items-center gap-1">
                <ShoppingListHeaderMenu
                    {showDeleted}
                    onAddItem={() => (showAddManualModal = true)}
                    onResetAll={handleResetAll}
                    onToggleDeleted={() => (showDeleted = !showDeleted)}
                />
                <button
                    class="p-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all"
                    onclick={onClose}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    {/snippet}

    <div class="px-4 pb-4">
        {#if isLoading}
            <div class="flex items-center justify-center h-64">
                <div
                    class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if displayedItems.length === 0}
            <div
                class="flex flex-col items-center justify-center min-h-[400px] text-center px-6 py-12"
            >
                <div class="relative mb-6">
                    <div
                        class="absolute inset-0 bg-app-primary/10 blur-2xl rounded-full scale-150"
                    ></div>
                    <div
                        class="relative w-24 h-24 bg-app-bg border-4 border-app-primary/20 rounded-3xl flex items-center justify-center shadow-sm"
                    >
                        {#if activeCount === 0 && deletedCount > 0}
                            <ShoppingBasket
                                class="text-app-primary/40"
                                size={48}
                                strokeWidth={1.5}
                            />
                        {:else}
                            <ShoppingCart
                                class="text-app-primary"
                                size={48}
                                strokeWidth={1.5}
                            />
                        {/if}
                    </div>
                </div>

                <h3 class="font-display font-black text-2xl text-app-text mb-3">
                    {#if activeCount === 0 && deletedCount > 0}
                        All items completed!
                    {:else}
                        Ready to shop?
                    {/if}
                </h3>

                <p
                    class="text-app-text-muted font-medium max-w-[280px] leading-relaxed mb-8"
                >
                    {#if activeCount === 0 && deletedCount > 0}
                        You've cleared your list. You can view your history or
                        add new items.
                    {:else}
                        Add recipes to your meal plan or add manual items to
                        build your shopping list.
                    {/if}
                </p>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        onclick={() => (showAddManualModal = true)}
                        class="flex items-center justify-center gap-2 px-6 py-3 bg-app-primary text-white rounded-2xl font-bold hover:bg-app-primary/90 transition-all active:scale-95 shadow-lg shadow-app-primary/20"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add First Item
                    </button>

                    {#if activeCount === 0 && deletedCount > 0 && !showDeleted}
                        <button
                            onclick={() => (showDeleted = true)}
                            class="flex items-center justify-center gap-2 px-6 py-3 bg-app-bg text-app-text border border-app-border rounded-2xl font-bold hover:bg-app-surface-hover transition-all active:scale-95"
                        >
                            <Eye size={20} />
                            View Checked Off
                        </button>
                    {/if}
                </div>
            </div>
        {:else}
            <div>
                {#each displayedItems as item (item.id)}
                    <GroupedIngredientCard
                        ingredientName={item.ingredient_name}
                        sources={item.sources}
                        recipes={availableRecipes}
                        isDeleted={item.is_deleted}
                        hasHistory={hasItemHistory(item)}
                        onToggleAll={(checked) =>
                            handleToggleAll(item.id, checked)}
                        onToggleSource={(idx, checked) =>
                            handleToggleSource(item.id, idx, checked)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onEdit={() => handleEditItem(item)}
                        onReset={() => handleResetItem(item.id)}
                        onRestore={() => handleRestoreItem(item.id)}
                    />
                {/each}
            </div>
        {/if}
    </div>
</Modal>

<!-- Add Manual Item Modal -->
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

<!-- Edit Item Modal -->
<Modal
    isOpen={showEditModal}
    onClose={() => {
        showEditModal = false;
        editingItem = null;
    }}
    title={editingItem
        ? `Edit ${editingItem.ingredient_name.charAt(0).toUpperCase() + editingItem.ingredient_name.slice(1)}`
        : "Edit Item"}
    class="max-w-md"
>
    <div class="p-6 pt-0 space-y-4">
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label
                    for="edit-amount"
                    class="block text-sm font-bold text-app-text mb-2"
                >
                    Amount
                </label>
                <input
                    id="edit-amount"
                    type="number"
                    step="0.1"
                    bind:value={editItemAmount}
                    class="w-full px-4 py-2 rounded-xl border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary"
                    placeholder="0"
                />
            </div>

            <div>
                <label
                    for="edit-unit"
                    class="block text-sm font-bold text-app-text mb-2"
                >
                    Unit
                </label>
                <input
                    id="edit-unit"
                    type="text"
                    bind:value={editItemUnit}
                    class="w-full px-4 py-2 rounded-xl border border-app-border bg-app-bg text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary"
                    placeholder="pcs, kg, etc."
                />
            </div>
        </div>

        <div class="flex gap-3 mt-6">
            <button
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-bg text-app-text hover:bg-app-surface-hover transition-all"
                onclick={() => {
                    showEditModal = false;
                    editingItem = null;
                }}
            >
                Cancel
            </button>
            <button
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all active:scale-95"
                onclick={handleSaveEdit}
            >
                Save Changes
            </button>
        </div>
    </div>
</Modal>
