<script lang="ts">
    import {
        X,
        ShoppingCart,
        ShoppingBasket,
        Plus,
        RotateCcw,
        Refrigerator,
        Printer,
        Check,
        Save,
    } from "lucide-svelte";
    import type { Recipe, ShoppingListItem } from "$lib/types";
    import GroupedIngredientCard from "./GroupedIngredientCard.svelte";
    import Modal from "./Modal.svelte";
    import {
        getWeekShoppingListStore,
        toggleShoppingItemCheck as toggleShoppingSourceCheck,
        toggleAllShoppingItemChecks as toggleAllShoppingItemChecks,
        addManualShoppingItem,
        deleteShoppingItem,
        updateShoppingItem,
        resetAllShoppingItems,
    } from "$lib/stores/shoppingList";
    import CheckFridgeModal from "./CheckFridgeModal.svelte";
    import type { WeeklyPlan } from "$lib/types";
    import { toasts } from "$lib/stores/toasts";
    import { apiRequest, jsonRequest } from "$lib/api/client";

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
    let showResetConfirmModal = $state(false);
    let editingItem = $state<ShoppingListItem | null>(null);
    let isResetting = $state(false);

    // Check Fridge states
    let showCheckFridgeModal = $state(false);
    let isMatching = $state(false);
    let matches = $state<any[]>([]);

    // Form states
    let manualItemName = $state("");
    let manualItemAmount = $state("");
    let manualItemUnit = $state("");
    let editItemAmount = $state("");
    let editItemUnit = $state("");

    // Subscribe to week-scoped shopping list
    let weekShoppingListStore = $derived(getWeekShoppingListStore(weekId));
    let shoppingList = $derived($weekShoppingListStore.data);
    let isLoading = $derived($weekShoppingListStore.loading);
    let optimisticChecks = $state<Record<string, boolean>>({});

    const sourceKey = (itemId: string, sourceIndex: number) =>
        `${itemId}:${sourceIndex}`;

    let optimisticShoppingList = $derived.by(() => {
        return (shoppingList || []).map((item) => ({
            ...item,
            sources: item.sources.map((source, index) => {
                const override = optimisticChecks[sourceKey(item.id, index)];
                if (override === undefined) return source;

                return {
                    ...source,
                    is_checked: override,
                    checked_from: override
                        ? source.checked_from || "user"
                        : null,
                };
            }),
        }));
    });

    // Remove optimistic overrides once Firestore snapshot catches up.
    $effect(() => {
        const next = { ...optimisticChecks };
        let changed = false;

        for (const item of shoppingList || []) {
            item.sources.forEach((source, index) => {
                const key = sourceKey(item.id, index);
                const override = next[key];
                if (override === undefined) return;
                if (source.is_checked === override) {
                    delete next[key];
                    changed = true;
                }
            });
        }

        if (changed) {
            optimisticChecks = next;
        }
    });

    let displayedItems = $derived(
        (optimisticShoppingList || []).filter((item) => item && item.id),
    );

    let itemCount = $derived(optimisticShoppingList.length);
    let checkedCount = $derived(
        optimisticShoppingList.filter((item) =>
            item.sources.every((s) => s.is_checked),
        ).length,
    );

    const handleToggleAll = async (itemId: string, checked: boolean) => {
        const item = (optimisticShoppingList || []).find(
            (entry) => entry.id === itemId,
        );
        if (!item) return;

        const nextOverrides = { ...optimisticChecks };
        item.sources.forEach((_, index) => {
            nextOverrides[sourceKey(itemId, index)] = checked;
        });
        optimisticChecks = nextOverrides;

        try {
            await toggleAllShoppingItemChecks(weekId, itemId, checked);
        } catch (error) {
            console.error("Failed to toggle all checks:", error);
            const rollback = { ...optimisticChecks };
            item.sources.forEach((_, index) => {
                delete rollback[sourceKey(itemId, index)];
            });
            optimisticChecks = rollback;
        }
    };

    const handleToggleSource = async (
        itemId: string,
        sourceIndex: number,
        checked: boolean,
    ) => {
        optimisticChecks = {
            ...optimisticChecks,
            [sourceKey(itemId, sourceIndex)]: checked,
        };

        try {
            await toggleShoppingSourceCheck(
                weekId,
                itemId,
                sourceIndex,
                checked,
            );
        } catch (error) {
            console.error("Failed to toggle source:", error);
            const rollback = { ...optimisticChecks };
            delete rollback[sourceKey(itemId, sourceIndex)];
            optimisticChecks = rollback;
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
            await deleteShoppingItem(weekId, itemId);
        } catch (error) {
            console.error("Failed to delete item:", error);
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

    const handleResetAll = () => {
        showResetConfirmModal = true;
    };

    const performResetAll = async () => {
        try {
            isResetting = true;
            await resetAllShoppingItems(weekId);
            showResetConfirmModal = false;
        } catch (error) {
            console.error("Failed to reset all items:", error);
        } finally {
            isResetting = false;
        }
    };

    const handleCheckFridge = async () => {
        isMatching = true;
        try {
            const data = await apiRequest<{ matches?: any[] }>(
                "/api/match-fridge-ingredients",
                {
                method: "POST",
                ...jsonRequest({
                    weekId,
                }),
            });
            matches = (data.matches || []).filter(
                (m: any) => m && m.shoppingItemId,
            );
            showCheckFridgeModal = true;
        } catch (error) {
            console.error("Error checking fridge:", error);
        } finally {
            isMatching = false;
        }
    };

    const handlePrint = async () => {
        if (shoppingList.length === 0) return;
        window.open(`/print/shopping/${weekId}`, "_blank");
    };
</script>

<Modal
    {isOpen}
    {onClose}
    adaptive={true}
    class="max-w-2xl"
    closeOnEsc={!showAddManualModal && !showEditModal && !showCheckFridgeModal}
>
    {#snippet header()}
        <div
            class="px-4 py-3 sm:px-6 sm:py-4 shrink-0 border-b border-app-border flex items-center justify-between"
        >
            <h2
                class="text-xl sm:text-2xl font-display font-black text-app-text flex items-center gap-2"
            >
                Shopping List
                {#if itemCount > 0}
                    <span class="text-sm font-bold text-app-text-muted mt-0.5">
                        ({checkedCount}/{itemCount})
                    </span>
                {/if}
            </h2>
            <button
                class="p-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all disabled:opacity-50"
                onclick={onClose}
                disabled={isMatching}
            >
                <X size={20} />
            </button>
        </div>

        {#if itemCount > 0}
            <div
                class="px-4 py-3 sm:px-6 sm:py-4 shrink-0 flex items-center gap-3 border-b border-app-border"
            >
                <button
                    class="flex items-center gap-1.5 py-2 px-3 bg-transparent border border-app-primary text-app-primary rounded-lg font-semibold text-sm hover:bg-app-primary/10 transition-all disabled:opacity-50"
                    onclick={() => (showAddManualModal = true)}
                    disabled={isMatching}
                >
                    <Plus size={16} />
                    Add item
                </button>
                <button
                    class="flex items-center gap-1.5 py-2 px-3 bg-app-bg text-app-text-muted rounded-lg font-semibold text-sm hover:bg-app-surface-hover hover:text-app-text transition-all disabled:opacity-50"
                    onclick={handleCheckFridge}
                    disabled={isMatching || shoppingList.length === 0}
                >
                    {#if isMatching}
                        <div
                            class="w-4 h-4 border-2 border-app-text-muted/30 border-t-app-text-muted rounded-full animate-spin"
                        ></div>
                    {:else}
                        <Refrigerator size={16} />
                    {/if}
                    <span class="hidden sm:inline">Check Fridge</span>
                </button>
                <button
                    class="flex items-center gap-1.5 py-2 px-3 bg-app-bg text-app-text-muted rounded-lg font-semibold text-sm hover:bg-app-surface-hover hover:text-app-text transition-all disabled:opacity-50"
                    onclick={handlePrint}
                    disabled={shoppingList.length === 0}
                >
                    <Printer size={16} />
                    <span class="hidden sm:inline">Print</span>
                </button>
                <button
                    class="flex items-center gap-1.5 py-2 px-3 bg-app-bg text-app-text-muted rounded-lg font-semibold text-sm hover:bg-app-surface-hover hover:text-app-text transition-all disabled:opacity-50"
                    onclick={handleResetAll}
                    disabled={isMatching}
                >
                    <RotateCcw size={16} />
                    <span class="hidden sm:inline">Reset</span>
                </button>
            </div>
        {/if}
    {/snippet}

    <div
        class="px-2 py-2 sm:px-4 sm:py-4 transition-all duration-300"
        class:pointer-events-none={isMatching}
        class:opacity-50={isMatching}
        class:grayscale-[0.3]={isMatching}
    >
        {#if isLoading}
            <div class="flex items-center justify-center h-64">
                <div
                    class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if displayedItems.length === 0}
            <div
                class="flex flex-col items-center justify-center min-h-100 text-center px-6 py-12"
            >
                <div class="relative mb-6">
                    <div
                        class="absolute inset-0 bg-app-primary/10 blur-2xl rounded-full scale-150"
                    ></div>
                    <div
                        class="relative w-24 h-24 bg-app-bg border-4 border-app-primary/20 rounded-3xl flex items-center justify-center shadow-sm"
                    >
                        {#if itemCount === 0}
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
                    {#if itemCount === 0}
                        All items completed!
                    {:else}
                        Ready to shop?
                    {/if}
                </h3>

                <p
                    class="text-app-text-muted font-medium max-w-70 leading-relaxed mb-8"
                >
                    {#if itemCount === 0}
                        You've cleared your list. Click below to add new items.
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
                </div>
            </div>
        {:else}
            <div>
                {#each displayedItems as item (item.id)}
                    <GroupedIngredientCard
                        ingredientName={item.ingredient_name}
                        sources={item.sources}
                        recipes={availableRecipes}
                        onToggleAll={(checked) =>
                            handleToggleAll(item.id, checked)}
                        onToggleSource={(idx, checked) =>
                            handleToggleSource(item.id, idx, checked)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onEdit={() => handleEditItem(item)}
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
    adaptive={true}
    title="Add Manual Item"
    class="max-w-md"
>
    <div class="p-6 pt-0 space-y-4">
        <div>
            <label
                for="ingredient-name"
                class="block text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1 mb-2"
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
                    class="block text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1 mb-2"
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
                    class="block text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1 mb-2"
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
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-bg border border-app-border text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all flex items-center justify-center gap-2"
                onclick={() => (showAddManualModal = false)}
            >
                <X size={18} />
                Cancel
            </button>
            <button
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                onclick={handleAddManualItem}
                disabled={!manualItemName.trim()}
            >
                <Plus size={18} />
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
    adaptive={true}
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
                    class="block text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1 mb-2"
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
                    class="block text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1 mb-2"
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
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-bg border border-app-border text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all flex items-center justify-center gap-2"
                onclick={() => {
                    showEditModal = false;
                    editingItem = null;
                }}
            >
                <X size={18} />
                Cancel
            </button>
            <button
                class="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                onclick={handleSaveEdit}
            >
                <Save size={18} />
                Save Changes
            </button>
        </div>
    </div>
</Modal>

<Modal
    isOpen={showResetConfirmModal}
    onClose={() => !isResetting && (showResetConfirmModal = false)}
    title="Reset Shopping List"
    class="max-w-md"
>
    <div class="p-6 pt-0">
        <p class="text-sm text-app-text-muted mb-4">
            Are you sure you want to reset the shopping list? This will:
        </p>
        <ul class="space-y-2 mb-6 text-app-text-muted text-sm">
            <li class="flex items-start gap-2">
                <span
                    class="mt-1.5 w-1.5 h-1.5 rounded-full bg-app-primary shrink-0"
                ></span>
                <span>Remove all manually added items</span>
            </li>
            <li class="flex items-start gap-2">
                <span
                    class="mt-1.5 w-1.5 h-1.5 rounded-full bg-app-primary shrink-0"
                ></span>
                <span
                    >Recalculate items based on current planned recipes in this
                    week</span
                >
            </li>
        </ul>

        <div class="flex gap-3">
            <button
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-app-bg border border-app-border text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                onclick={() => (showResetConfirmModal = false)}
                disabled={isResetting}
            >
                <X size={18} />
                Cancel
            </button>
            <button
                class="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-app-primary/90 text-app-bg hover:bg-app-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                onclick={performResetAll}
                disabled={isResetting}
            >
                {#if isResetting}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                {:else}
                    <RotateCcw size={18} />
                {/if}
                Reset List
            </button>
        </div>
    </div>
</Modal>

<CheckFridgeModal
    isOpen={showCheckFridgeModal}
    {weekId}
    {matches}
    onClose={() => (showCheckFridgeModal = false)}
    onApplied={() => {
        // Results are applied via toggleAllShoppingItemChecks which updates the store
    }}
/>
