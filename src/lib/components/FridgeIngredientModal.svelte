<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import {
        addIngredientsToFridge,
        updateIngredient,
    } from "$lib/stores/fridgeIngredients";
    import { X, Check, Plus, Save } from "lucide-svelte";
    import type { FridgeIngredient } from "$lib/types";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        adaptive?: boolean;
        ingredient?: FridgeIngredient | null;
    }

    let {
        isOpen,
        onClose,
        adaptive = true,
        ingredient = null,
    }: Props = $props();

    let name = $state("");
    let amount = $state("");
    let unit = $state("");
    let loading = $state(false);

    $effect(() => {
        if (isOpen && ingredient) {
            name = ingredient.name;
            amount = ingredient.amount.toString();
            unit = ingredient.unit || "";
        } else if (isOpen && !ingredient) {
            resetForm();
        }
    });

    const handleSubmit = async () => {
        if (!name || !amount) return;

        loading = true;
        try {
            if (ingredient) {
                await updateIngredient(ingredient.id, {
                    name,
                    amount: parseFloat(amount),
                    unit: unit || null,
                });
            } else {
                await addIngredientsToFridge([
                    {
                        name: name.toLowerCase().trim(),
                        amount: parseFloat(amount),
                        unit: unit.trim() || null,
                    },
                ]);
            }
            onClose();
            resetForm();
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    };

    const resetForm = () => {
        name = "";
        amount = "";
        unit = "";
    };
</script>

<Modal
    {isOpen}
    {onClose}
    {adaptive}
    title={ingredient ? "Edit Ingredient" : "Add Ingredient"}
    description={ingredient
        ? "Update ingredient details."
        : "Manually add an item to your fridge inventory."}
    class="max-w-md"
>
    <div class="p-6 space-y-4">
        <!-- Name -->
        <div class="space-y-2">
            <label
                for="name"
                class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
            >
                Ingredient Name
            </label>
            <input
                id="name"
                type="text"
                bind:value={name}
                placeholder="e.g. Milk, Eggs, Onions"
                class="w-full h-12 px-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                autocomplete="off"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <!-- Amount -->
            <div class="space-y-2">
                <label
                    for="amount"
                    class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                >
                    Amount
                </label>
                <input
                    id="amount"
                    type="number"
                    bind:value={amount}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full h-12 px-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                />
            </div>

            <!-- Unit -->
            <div class="space-y-2">
                <label
                    for="unit"
                    class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                >
                    Unit <span
                        class="text-app-text-muted/50 normal-case font-normal"
                        >(Optional)</span
                    >
                </label>
                <input
                    id="unit"
                    type="text"
                    bind:value={unit}
                    placeholder="kg, pcs, cups"
                    class="w-full h-12 px-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                    autocomplete="off"
                />
            </div>
        </div>
    </div>

    {#snippet footer()}
        <div
            class="p-4 border-t border-app-border bg-app-surface-deep/50 flex gap-3"
        >
            <button
                class="px-5 py-2.5 bg-app-bg border border-app-border font-bold text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-xl transition-colors flex items-center gap-2"
                onclick={onClose}
            >
                <X size={18} />
                Cancel
            </button>
            <button
                class="flex-1 justify-center px-6 py-3 bg-app-primary text-white hover:bg-app-primary-hover rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                onclick={handleSubmit}
                disabled={!name || !amount || loading}
            >
                {#if loading}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                    {ingredient ? "Saving..." : "Adding..."}
                {:else if ingredient}
                    <Save size={18} />
                    Save Changes
                {:else}
                    <Plus size={18} />
                    Add Ingredient
                {/if}
            </button>
        </div>
    {/snippet}
</Modal>
