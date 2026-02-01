<script lang="ts">
    import {
        Refrigerator,
        Circle,
        CheckCircle2,
        Clock,
        Trash2,
        X as XIcon,
        AlertCircle,
    } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";
    import Header from "$lib/components/Header.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import {
        leftovers,
        deleteLeftover,
        setLeftoverNotPlanned,
    } from "$lib/stores/leftovers";
    import { isMealTimePast, parseWeekId } from "$lib/utils/mealtime";
    import type { LeftoverItem } from "$lib/types";

    // State for action menu
    let selectedItem = $state<LeftoverItem | null>(null);
    let showActionMenu = $state(false);
    let actionMenuPosition = $state({ x: 0, y: 0 });

    // State for confirmation modal
    let showConfirmEaten = $state(false);
    let itemToConfirm = $state<LeftoverItem | null>(null);

    // Current time for past-time detection
    let now = $state(new Date());

    // Update time every minute
    $effect(() => {
        const interval = setInterval(() => {
            now = new Date();
        }, 60000);
        return () => clearInterval(interval);
    });

    // Categorize leftovers
    let availableItems = $derived(
        $leftovers.data.filter((item) => item.status === "not_planned"),
    );

    let plannedItems = $derived(
        $leftovers.data.filter((item) => item.status === "planned"),
    );

    // Check if a planned item's time has passed
    const isTimePast = (item: LeftoverItem): boolean => {
        if (!item.plannedFor) return false;
        const weekStart = parseWeekId(item.plannedFor.weekId);
        return isMealTimePast(
            weekStart,
            item.plannedFor.day,
            item.plannedFor.mealType,
            now,
        );
    };

    const handleItemClick = (item: LeftoverItem, e: MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        selectedItem = item;
        actionMenuPosition = { x: rect.right - 200, y: rect.bottom + 8 };
        showActionMenu = true;
    };

    const closeActionMenu = () => {
        showActionMenu = false;
        selectedItem = null;
    };

    const handleRemoveFromPlan = async () => {
        if (!selectedItem) return;
        await setLeftoverNotPlanned(selectedItem.id);
        closeActionMenu();
    };

    const handleMarkAsEaten = () => {
        if (!selectedItem) return;
        itemToConfirm = selectedItem;
        showConfirmEaten = true;
        closeActionMenu();
    };

    const confirmMarkAsEaten = async () => {
        if (!itemToConfirm) return;
        await deleteLeftover(itemToConfirm.id);
        showConfirmEaten = false;
        itemToConfirm = null;
    };

    const handlePastTimeConfirm = (item: LeftoverItem) => {
        itemToConfirm = item;
        showConfirmEaten = true;
    };

    // Format planned location
    const formatPlannedFor = (item: LeftoverItem): string => {
        if (!item.plannedFor) return "";
        const { day, mealType } = item.plannedFor;
        return `${day.slice(0, 3)} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    };
</script>

<svelte:window
    onclick={() => showActionMenu && closeActionMenu()}
    onkeydown={(e) => e.key === "Escape" && closeActionMenu()}
/>

<div class="h-full flex flex-col">
    <Header title="Your Fridge" mobileTitle="Fridge">
        <div class="flex items-center gap-2">
            <div
                class="flex items-center gap-1.5 px-3 py-1.5 bg-app-surface-deep rounded-full border border-app-border"
            >
                <Refrigerator size={16} class="text-app-primary" />
                <span class="text-sm font-bold text-app-text">
                    {$leftovers.data.length}
                </span>
            </div>
        </div>
    </Header>

    <div class="flex-1 overflow-auto bg-app-bg p-4 md:p-6">
        {#if $leftovers.loading}
            <div class="flex items-center justify-center h-full">
                <div
                    class="w-8 h-8 border-3 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if $leftovers.data.length === 0}
            <div
                class="flex flex-col items-center justify-center h-full text-center p-8"
            >
                <div class="p-4 bg-app-surface-deep rounded-2xl mb-4">
                    <Refrigerator size={48} class="text-app-text-muted/50" />
                </div>
                <h3 class="text-lg font-bold text-app-text mb-2">
                    Your fridge is empty
                </h3>
                <p class="text-sm text-app-text-muted max-w-xs">
                    Add leftovers from your meal plan to track what you have
                    available.
                </p>
            </div>
        {:else}
            <div class="max-w-2xl mx-auto space-y-6">
                <!-- Available Section -->
                {#if availableItems.length > 0}
                    <div>
                        <h2
                            class="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-3 px-1"
                        >
                            Available ({availableItems.length})
                        </h2>
                        <div class="space-y-2">
                            {#each availableItems as item (item.id)}
                                <button
                                    class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-colors text-left group"
                                    onclick={(e) => handleItemClick(item, e)}
                                    transition:slide={{ duration: 200 }}
                                >
                                    <Circle
                                        size={18}
                                        class="text-app-text-muted/50 shrink-0"
                                    />
                                    <span
                                        class="flex-1 font-medium text-app-text text-sm truncate"
                                    >
                                        {item.title}
                                    </span>
                                    <span
                                        class="text-xs text-app-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Click for options
                                    </span>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Planned Section -->
                {#if plannedItems.length > 0}
                    <div>
                        <h2
                            class="text-xs font-bold text-app-text-muted uppercase tracking-wider mb-3 px-1"
                        >
                            Planned ({plannedItems.length})
                        </h2>
                        <div class="space-y-2">
                            {#each plannedItems as item (item.id)}
                                {@const isPast = isTimePast(item)}
                                <div
                                    class="relative"
                                    transition:slide={{ duration: 200 }}
                                >
                                    <button
                                        class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border transition-colors text-left group {isPast
                                            ? 'border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/10'
                                            : 'border-app-border hover:bg-app-surface-hover'}"
                                        onclick={(e) =>
                                            handleItemClick(item, e)}
                                    >
                                        <CheckCircle2
                                            size={18}
                                            class="text-app-primary shrink-0"
                                        />
                                        <div class="flex-1 min-w-0">
                                            <span
                                                class="font-medium text-app-text text-sm truncate block"
                                            >
                                                {item.title}
                                            </span>
                                            <span
                                                class="text-xs text-app-text-muted"
                                            >
                                                → {formatPlannedFor(item)}
                                            </span>
                                        </div>

                                        {#if isPast}
                                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                                            <div
                                                class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                                role="button"
                                                tabindex="0"
                                                onclick={(e) => {
                                                    e.stopPropagation();
                                                    handlePastTimeConfirm(item);
                                                }}
                                                onkeydown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.stopPropagation();
                                                        handlePastTimeConfirm(
                                                            item,
                                                        );
                                                    }
                                                }}
                                            >
                                                <AlertCircle size={12} />
                                                Eaten?
                                            </div>
                                        {:else}
                                            <Clock
                                                size={14}
                                                class="text-app-text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                        {/if}
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<!-- Action Menu -->
{#if showActionMenu && selectedItem}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed z-50 w-52 bg-app-surface rounded-xl shadow-lg border border-app-border py-1 overflow-hidden"
        style="left: {actionMenuPosition.x}px; top: {actionMenuPosition.y}px;"
        transition:fade={{ duration: 100 }}
        onclick={(e) => e.stopPropagation()}
    >
        {#if selectedItem.status === "planned"}
            <button
                class="w-full text-left px-4 py-2.5 text-sm text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={handleRemoveFromPlan}
            >
                <XIcon size={18} />
                <span class="font-medium">Remove from Plan</span>
            </button>
        {/if}

        <button
            class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
            onclick={handleMarkAsEaten}
        >
            <Trash2 size={18} />
            <span class="font-medium">Mark as Eaten</span>
        </button>

        <div class="border-t border-app-border my-1"></div>

        <button
            class="w-full text-left px-4 py-2.5 text-sm text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
            onclick={closeActionMenu}
        >
            <XIcon size={18} />
            <span class="font-medium">Close</span>
        </button>
    </div>
{/if}

<!-- Confirm Modal -->
<ConfirmModal
    isOpen={showConfirmEaten}
    title="Mark as Eaten?"
    message={`This will remove "${itemToConfirm?.title ?? ""}" from your fridge permanently.`}
    confirmText="Yes, I ate it"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmMarkAsEaten}
    onClose={() => {
        showConfirmEaten = false;
        itemToConfirm = null;
    }}
/>
