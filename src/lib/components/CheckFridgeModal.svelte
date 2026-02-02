<script lang="ts">
    import {
        Refrigerator,
        Check,
        X,
        AlertCircle,
        Sparkles,
    } from "lucide-svelte";
    import Modal from "./Modal.svelte";
    import { toggleAllShoppingItemChecks } from "$lib/stores/shoppingList";
    import { formatAmount } from "$lib/utils/shopping";

    interface Match {
        shoppingItemId: string;
        fridgeIngredientId: string;
        name: string;
        fridgeName: string;
        amount: number;
        unit: string | null;
        fridgeAmount: number;
        fridgeUnit: string | null;
        type: "exact" | "ai";
        reasoning?: string;
        confidence?: number;
    }

    interface Props {
        isOpen: boolean;
        weekId: string;
        matches: Match[];
        onClose: () => void;
        onApplied: () => void;
    }

    let { isOpen, weekId, matches, onClose, onApplied }: Props = $props();

    let selectedMatches = $state<Set<string>>(new Set());
    let isApplying = $state(false);

    const toggleMatch = (id: string) => {
        if (selectedMatches.has(id)) {
            selectedMatches.delete(id);
        } else {
            selectedMatches.add(id);
        }
        selectedMatches = new Set(selectedMatches);
    };

    const handleApply = async () => {
        isApplying = true;
        try {
            for (const shoppingItemId of selectedMatches) {
                await toggleAllShoppingItemChecks(weekId, shoppingItemId, true);
            }
            onApplied();
            onClose();
        } catch (error) {
            console.error("Failed to apply matches:", error);
        } finally {
            isApplying = false;
        }
    };
</script>

<Modal
    {isOpen}
    {onClose}
    title="Fridge Match Results"
    description="Check the items you already have in your fridge to skip shopping for them."
    class="max-w-2xl"
>
    <div class="p-6 pt-2">
        {#if matches.length === 0}
            <div class="text-center py-12">
                <div
                    class="w-16 h-16 bg-app-bg border-4 border-app-border rounded-full flex items-center justify-center mx-auto mb-4 text-app-text-muted"
                >
                    <X size={32} />
                </div>
                <h4 class="font-bold text-app-text mb-1">No matches found</h4>
                <p class="text-sm text-app-text-muted">
                    We couldn't find any items in your fridge that match your
                    shopping list.
                </p>
            </div>
        {:else}
            <div
                class="max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar"
            >
                {#each (matches || []).filter((m) => m && m.shoppingItemId) as match (match.shoppingItemId)}
                    <button
                        class="w-full flex items-baseline gap-2 p-2 rounded-xl transition-all text-left hover:bg-app-surface-hover group"
                        onclick={() => toggleMatch(match.shoppingItemId)}
                    >
                        <div class="shrink-0">
                            <div
                                class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                {selectedMatches.has(match.shoppingItemId)
                                    ? 'bg-app-primary border-app-primary text-white'
                                    : 'border-app-border bg-white text-transparent group-hover:border-app-primary/50'}"
                            >
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>

                        <div class="flex-1">
                            <p class="text-app-text leading-relaxed text-sm">
                                You have <span class="font-bold"
                                    >{formatAmount(match.fridgeAmount)}
                                    {match.fridgeUnit || ""}</span
                                >
                                <span class="font-bold text-app-primary"
                                    >{match.fridgeName}</span
                                > in fridge already.
                            </p>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}

        <div class="flex gap-3 mt-8">
            <button
                class="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-app-primary text-white hover:bg-app-primary/90 transition-all enabled:active:scale-95 shadow-lg shadow-app-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 h-auto whitespace-normal"
                disabled={matches.length === 0 ||
                    isApplying ||
                    selectedMatches.size === 0}
                onclick={handleApply}
            >
                {#if isApplying}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"
                    ></div>
                    Applying...
                {:else}
                    Skip shopping
                {/if}
            </button>
        </div>
    </div>
</Modal>
