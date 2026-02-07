<script lang="ts">
    import { Calendar, Check, X } from "lucide-svelte";
    import Modal from "./Modal.svelte";
    import { batchToggleShoppingItemChecks } from "$lib/stores/shoppingList";
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

    let groupedMatches = $derived(
        matches.reduce(
            (acc, match) => {
                if (!match || !match.fridgeIngredientId) return acc;
                const fid = match.fridgeIngredientId;
                if (!acc[fid]) acc[fid] = [];
                acc[fid].push(match);
                return acc;
            },
            {} as Record<string, Match[]>,
        ),
    );

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
            if (selectedMatches.size > 0) {
                await batchToggleShoppingItemChecks(
                    weekId,
                    Array.from(selectedMatches),
                    true,
                    "fridge",
                );
            }
            onApplied();
            onClose();
        } catch (error) {
            console.error("Failed to apply matches:", error);
        } finally {
            isApplying = false;
        }
    };

    const isGroupSelected = (group: Match[]) =>
        group.every((m) => selectedMatches.has(m.shoppingItemId));
</script>

<Modal
    {isOpen}
    {onClose}
    title="We found these in your fridge"
    description="Select the items you already have to skip adding them to your shopping list."
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
                class="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-4"
            >
                {#each Object.entries(groupedMatches) as [fridgeId, group] (fridgeId)}
                    <div
                        class="border border-app-border rounded-2xl p-3 bg-app-bg/30"
                    >
                        <div class="mb-3 px-1">
                            <p class="text-sm font-medium text-app-text-muted">
                                You have
                                <span class="font-bold text-app-text"
                                    >{formatAmount(group[0].fridgeAmount)}</span
                                >
                                {#if group[0].fridgeUnit}
                                    <span class="font-bold text-app-text"
                                        >{group[0].fridgeUnit}</span
                                    >
                                {/if}
                                <span class="font-bold text-app-primary"
                                    >{group[0].fridgeName}</span
                                > in fridge already.
                            </p>
                        </div>

                        <div class="">
                            {#each group as match (match.shoppingItemId)}
                                <button
                                    class="w-full flex items-start gap-4 p-2 rounded-2xl transition-all text-left bg-app-bg hover:border-app-primary/70 hover:bg-app-primary/5 group/item relative overflow-hidden"
                                    onclick={() =>
                                        toggleMatch(match.shoppingItemId)}
                                >
                                    {#if selectedMatches.has(match.shoppingItemId)}
                                        <div
                                            class="absolute inset-0 bg-app-primary/5"
                                        ></div>
                                    {/if}

                                    <div class="shrink-0 relative z-10">
                                        <div
                                            class="w-6 h-6 rounded-md border flex items-center justify-center transition-all
                                            {selectedMatches.has(
                                                match.shoppingItemId,
                                            )
                                                ? 'bg-app-primary border-app-primary text-white'
                                                : 'border-app-border-strong bg-app-bg text-transparent group-hover/item:border-app-primary/50'}"
                                        >
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                    </div>

                                    <div class="flex-1 min-w-0 relative z-10">
                                        <div class="flex items-center gap-2">
                                            <p
                                                class="text-app-text font-black line-clamp-2"
                                            >
                                                {match.name}
                                                <span
                                                    class="text-app-text-muted font-medium text-sm"
                                                >
                                                    (Need {formatAmount(
                                                        match.amount,
                                                    )}
                                                    {match.unit || ""})
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="flex gap-3 mt-6">
            <button
                class="flex-1 px-4 py-3 rounded-2xl text-sm font-bold bg-app-bg text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all flex items-center justify-center gap-2"
                onclick={onClose}
                disabled={isApplying}
            >
                <X size={18} />
                Cancel
            </button>
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
                    <Check size={18} />
                    Skip shopping
                {/if}
            </button>
        </div>
    </div>
</Modal>
