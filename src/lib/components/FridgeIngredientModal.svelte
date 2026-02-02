<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { addIngredientsToFridge } from "$lib/stores/fridgeIngredients";
    import { Check, Plus } from "lucide-svelte";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
    }

    let { isOpen, onClose }: Props = $props();

    let name = $state("");
    let amount = $state("");
    let unit = $state("");
    let loading = $state(false);

    const handleSubmit = async () => {
        if (!name || !amount) return;

        loading = true;
        try {
            await addIngredientsToFridge([
                {
                    name: name.toLowerCase().trim(),
                    amount: parseFloat(amount),
                    unit: unit.trim() || null,
                },
            ]);
            resetForm();
            onClose();
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
    title="Add Ingredient"
    description="Manually add an item to your fridge inventory."
    class="max-w-md"
>
    <div class="p-6 space-y-4">
        <!-- Name -->
        <div class="space-y-2">
            <label
                for="name"
                class="text-sm font-bold text-app-text-muted uppercase tracking-wider"
            >
                Ingredient Name
            </label>
            <input
                id="name"
                type="text"
                bind:value={name}
                placeholder="e.g. Milk, Eggs, Onions"
                class="w-full h-12 px-4 bg-app-surface border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                autocomplete="off"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <!-- Amount -->
            <div class="space-y-2">
                <label
                    for="amount"
                    class="text-sm font-bold text-app-text-muted uppercase tracking-wider"
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
                    class="w-full h-12 px-4 bg-app-surface border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                />
            </div>

            <!-- Unit -->
            <div class="space-y-2">
                <label
                    for="unit"
                    class="text-sm font-bold text-app-text-muted uppercase tracking-wider"
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
                    class="w-full h-12 px-4 bg-app-surface border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all font-medium"
                    autocomplete="off"
                />
            </div>
        </div>
    </div>

    {#snippet footer()}
        <div
            class="p-4 border-t border-app-border bg-app-surface-deep/50 flex justify-end gap-3"
        >
            <button
                class="px-5 py-2.5 font-bold text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-xl transition-colors"
                onclick={onClose}
            >
                Cancel
            </button>
            <button
                class="px-6 py-2.5 bg-app-primary text-white hover:bg-app-primary-hover rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                onclick={handleSubmit}
                disabled={!name || !amount || loading}
            >
                {#if loading}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                    Adding...
                {:else}
                    <Plus size={18} />
                    Add Ingredient
                {/if}
            </button>
        </div>
    {/snippet}
</Modal>
