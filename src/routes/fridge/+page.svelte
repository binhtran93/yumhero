<script lang="ts">
    import {
        Refrigerator,
        Utensils,
        Trash2,
        X as XIcon,
        AlertCircle,
        EllipsisVertical,
        UtensilsCrossed,
        Apple,
        ChefHat,
    } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";
    import Header from "$lib/components/Header.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { leftovers, deleteLeftover } from "$lib/stores/leftovers";
    import {
        fridgeIngredients,
        deleteIngredient,
    } from "$lib/stores/fridgeIngredients";
    import { isMealTimePast, parseWeekId } from "$lib/utils/mealtime";
    import { formatAmount } from "$lib/utils/shopping";
    import type { LeftoverItem, FridgeIngredient } from "$lib/types";

    // Tab state
    type TabType = "leftovers" | "ingredients";
    let activeTab = $state<TabType>("leftovers");

    // State for action menu
    let selectedItem = $state<LeftoverItem | null>(null);
    let selectedIngredient = $state<FridgeIngredient | null>(null);
    let showActionMenu = $state(false);
    let actionMenuPosition = $state({ x: 0, y: 0 });

    // State for confirmation modal
    let showConfirmDelete = $state(false);
    let itemToDelete = $state<LeftoverItem | null>(null);
    let ingredientToDelete = $state<FridgeIngredient | null>(null);
    let isEatingLeftover = $state(false);

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

    // Ingredients data
    let ingredientsList = $derived($fridgeIngredients.data);

    // Counts for tab badges
    let leftoverCount = $derived($leftovers.data.length);
    let ingredientCount = $derived($fridgeIngredients.data.length);

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
        selectedIngredient = null;
        actionMenuPosition = { x: rect.right - 200, y: rect.bottom + 8 };
        showActionMenu = true;
    };

    const handleIngredientClick = (item: FridgeIngredient, e: MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        selectedIngredient = item;
        selectedItem = null;
        actionMenuPosition = { x: rect.right - 200, y: rect.bottom + 8 };
        showActionMenu = true;
    };

    const closeActionMenu = () => {
        showActionMenu = false;
        selectedItem = null;
        selectedIngredient = null;
    };

    const handleMarkAsEaten = () => {
        if (!selectedItem) return;
        isEatingLeftover = true;
        itemToDelete = selectedItem;
        showConfirmDelete = true;
        closeActionMenu();
    };

    const handleDeleteLeftover = () => {
        if (!selectedItem) return;
        isEatingLeftover = false;
        itemToDelete = selectedItem;
        showConfirmDelete = true;
        closeActionMenu();
    };

    const handleDeleteIngredient = () => {
        if (!selectedIngredient) return;
        ingredientToDelete = selectedIngredient;
        showConfirmDelete = true;
        closeActionMenu();
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            // Mark as Eaten only removes from fridge (cleanPlan = false)
            // Delete removes from both (cleanPlan = true)
            await deleteLeftover(itemToDelete.id, !isEatingLeftover);
        } else if (ingredientToDelete) {
            await deleteIngredient(ingredientToDelete.id);
        }
        showConfirmDelete = false;
        itemToDelete = null;
        ingredientToDelete = null;
    };

    const handlePastTimeConfirm = (item: LeftoverItem) => {
        isEatingLeftover = true;
        itemToDelete = item;
        showConfirmDelete = true;
    };

    // Format planned location
    const formatPlannedFor = (item: LeftoverItem): string => {
        if (!item.plannedFor) return "";
        const { day, mealType } = item.plannedFor;
        return `${day.slice(0, 3)} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    };

    const formatSource = (item: LeftoverItem): string => {
        if (!item.sourceDate) return "Manual Entry";

        // Format date as "Mon, Jan 1"
        const dateStr = item.sourceDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const mealTypeStr = item.sourceMealType
            ? item.sourceMealType.charAt(0).toUpperCase() +
              item.sourceMealType.slice(1)
            : "";

        return `${dateStr} • ${mealTypeStr}`;
    };

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    const formatPlannedDate = (item: LeftoverItem): string => {
        if (!item.plannedFor) return "";
        const weekStart = parseWeekId(item.plannedFor.weekId);
        const dayIndex = DAYS.indexOf(item.plannedFor.day);

        if (dayIndex !== -1) {
            const plannedDate = new Date(weekStart);
            plannedDate.setDate(weekStart.getDate() + dayIndex);
            const dateStr = plannedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            const meal = item.plannedFor.mealType;
            return `${dateStr} • ${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
        }

        // Fallback
        return formatPlannedFor(item);
    };

    const getDaysInFridge = (date: Date) => {
        const diff = now.getTime() - date.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const getDaysBadgeClass = (days: number) => {
        if (days <= 2)
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (days <= 5)
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    };

    import FridgeIngredientModal from "$lib/components/FridgeIngredientModal.svelte";
    import { Plus } from "lucide-svelte";

    let showAddIngredientModal = $state(false);
</script>

<svelte:window
    onclick={() => showActionMenu && closeActionMenu()}
    onkeydown={(e) => e.key === "Escape" && closeActionMenu()}
/>

<div class="h-full flex flex-col">
    <Header title="Your Fridge" mobileTitle="Fridge" />

    <div class="flex-1 overflow-auto bg-app-bg">
        <!-- Tab Bar -->
        <div class="sticky top-0 z-10 bg-app-bg border-b border-app-border">
            <div class="max-w-2xl mx-auto px-4 pt-4 pb-2">
                <div
                    class="flex gap-1 p-1 bg-app-surface-deep rounded-xl border border-app-border"
                >
                    <button
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all {activeTab ===
                        'leftovers'
                            ? 'bg-app-surface text-app-text shadow-sm border border-app-border'
                            : 'text-app-text-muted hover:text-app-text'}"
                        onclick={() => (activeTab = "leftovers")}
                    >
                        <UtensilsCrossed size={16} />
                        Leftovers
                        {#if leftoverCount > 0}
                            <span
                                class="px-1.5 py-0.5 text-xs font-bold rounded-full {activeTab ===
                                'leftovers'
                                    ? 'bg-app-primary/10 text-app-primary'
                                    : 'bg-app-text-muted/10 text-app-text-muted'}"
                            >
                                {leftoverCount}
                            </span>
                        {/if}
                    </button>
                    <button
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all {activeTab ===
                        'ingredients'
                            ? 'bg-app-surface text-app-text shadow-sm border border-app-border'
                            : 'text-app-text-muted hover:text-app-text'}"
                        onclick={() => (activeTab = "ingredients")}
                    >
                        <Apple size={16} />
                        Ingredients
                        {#if ingredientCount > 0}
                            <span
                                class="px-1.5 py-0.5 text-xs font-bold rounded-full {activeTab ===
                                'ingredients'
                                    ? 'bg-app-primary/10 text-app-primary'
                                    : 'bg-app-text-muted/10 text-app-text-muted'}"
                            >
                                {ingredientCount}
                            </span>
                        {/if}
                    </button>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="p-4 md:p-6">
            {#if activeTab === "leftovers"}
                <!-- Leftovers Tab -->
                {#if $leftovers.loading}
                    <div class="flex items-center justify-center h-64">
                        <div
                            class="w-8 h-8 border-3 border-app-primary border-t-transparent rounded-full animate-spin"
                        ></div>
                    </div>
                {:else if $leftovers.data.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-64 text-center p-8"
                    >
                        <div class="p-4 bg-app-surface-deep rounded-2xl mb-4">
                            <UtensilsCrossed
                                size={48}
                                class="text-app-text-muted/50"
                            />
                        </div>
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            No leftovers yet
                        </h3>
                        <p class="text-sm text-app-text-muted max-w-xs">
                            Add leftovers from your meal plan to track what you
                            have available.
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
                                        {@const days = getDaysInFridge(
                                            item.createdAt,
                                        )}
                                        <div
                                            class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-colors text-left group"
                                            transition:slide={{ duration: 200 }}
                                        >
                                            {#if item.imageUrl}
                                                <div
                                                    class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border"
                                                >
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        class="w-full h-full object-cover"
                                                    />
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-10 h-10 rounded-lg bg-app-surface-deep flex items-center justify-center shrink-0 border border-app-border"
                                                >
                                                    <UtensilsCrossed
                                                        size={14}
                                                        class="text-app-text-muted/60"
                                                    />
                                                </div>
                                            {/if}
                                            <div class="flex-1 min-w-0">
                                                <span
                                                    class="font-medium text-app-text text-sm truncate block"
                                                >
                                                    {item.title}
                                                </span>
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <span
                                                        class="text-xs text-app-text-muted"
                                                    >
                                                        {formatSource(item)}
                                                    </span>
                                                    <span
                                                        class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                            days,
                                                        )}"
                                                    >
                                                        {days}
                                                        {days === 1 ||
                                                        days === 0
                                                            ? "day"
                                                            : "days"}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                class="p-1 text-app-text-muted hover:text-app-text hover:bg-app-surface-deep rounded-lg transition-colors"
                                                onclick={(e) =>
                                                    handleItemClick(item, e)}
                                                aria-label="Options"
                                            >
                                                <EllipsisVertical size={18} />
                                            </button>
                                        </div>
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
                                        {@const days = getDaysInFridge(
                                            item.createdAt,
                                        )}
                                        <div
                                            class="relative"
                                            transition:slide={{ duration: 200 }}
                                        >
                                            <div
                                                class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-colors text-left group"
                                            >
                                                {#if item.imageUrl}
                                                    <div
                                                        class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border"
                                                    >
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            class="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                {:else}
                                                    <div
                                                        class="w-10 h-10 rounded-lg bg-app-surface-deep flex items-center justify-center shrink-0 border border-app-border"
                                                    >
                                                        <UtensilsCrossed
                                                            size={14}
                                                            class="text-app-text-muted/60"
                                                        />
                                                    </div>
                                                {/if}
                                                <div class="flex-1 min-w-0">
                                                    <span
                                                        class="font-medium text-app-text text-sm truncate block"
                                                    >
                                                        {item.title}
                                                    </span>
                                                    <div
                                                        class="flex items-center gap-2"
                                                    >
                                                        <span
                                                            class="text-xs text-app-text-muted block"
                                                        >
                                                            {formatSource(item)}
                                                            → {formatPlannedDate(
                                                                item,
                                                            )}
                                                        </span>
                                                        <span
                                                            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                                days,
                                                            )}"
                                                        >
                                                            {days}
                                                            {days === 1 ||
                                                            days === 0
                                                                ? "day"
                                                                : "days"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {#if isPast}
                                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                                    <div
                                                        class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                                        role="button"
                                                        tabindex="0"
                                                        onclick={(e) => {
                                                            e.stopPropagation();
                                                            handlePastTimeConfirm(
                                                                item,
                                                            );
                                                        }}
                                                        onkeydown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    "Enter" ||
                                                                e.key === " "
                                                            ) {
                                                                e.stopPropagation();
                                                                handlePastTimeConfirm(
                                                                    item,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <AlertCircle
                                                            size={12}
                                                        />
                                                        Eaten?
                                                    </div>
                                                {/if}

                                                <button
                                                    class="p-1 text-app-text-muted hover:text-app-text hover:bg-app-surface-deep rounded-lg transition-colors"
                                                    onclick={(e) =>
                                                        handleItemClick(
                                                            item,
                                                            e,
                                                        )}
                                                    aria-label="Options"
                                                >
                                                    <EllipsisVertical
                                                        size={18}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            {:else}
                <!-- Ingredients Tab -->
                {#if $fridgeIngredients.loading}
                    <div class="flex items-center justify-center h-64">
                        <div
                            class="w-8 h-8 border-3 border-app-primary border-t-transparent rounded-full animate-spin"
                        ></div>
                    </div>
                {:else if ingredientsList.length === 0}
                    <div
                        class="flex flex-col items-center justify-center h-64 text-center p-8"
                    >
                        <div class="p-4 bg-app-surface-deep rounded-2xl mb-4">
                            <Apple size={48} class="text-app-text-muted/50" />
                        </div>
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            No ingredients tracked
                        </h3>
                        <p class="text-sm text-app-text-muted max-w-xs">
                            When you remove a recipe after buying ingredients,
                            you can save them here.
                        </p>
                    </div>
                {:else}
                    <div class="max-w-2xl mx-auto">
                        <div class="space-y-2">
                            {#each ingredientsList as ingredient (ingredient.id)}
                                {@const days = getDaysInFridge(
                                    ingredient.addedAt,
                                )}
                                <div
                                    class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-colors text-left group"
                                    transition:slide={{ duration: 200 }}
                                >
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="flex items-center justify-between gap-3"
                                        >
                                            <div
                                                class="flex-1 min-w-0 flex items-baseline gap-1"
                                            >
                                                <span
                                                    class="font-bold text-app-text tabular-nums text-sm"
                                                >
                                                    {formatAmount(
                                                        ingredient.amount,
                                                    )}
                                                </span>
                                                {#if ingredient.unit}
                                                    <span
                                                        class="text-[13px] font-medium text-app-text-muted"
                                                    >
                                                        {ingredient.unit}
                                                    </span>
                                                {/if}
                                                <span
                                                    class="font-bold text-app-primary text-sm capitalize truncate"
                                                >
                                                    {ingredient.name}
                                                </span>
                                            </div>

                                            <span
                                                class="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                    days,
                                                )}"
                                            >
                                                {days}
                                                {days === 1 || days === 0
                                                    ? "day"
                                                    : "days"}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        class="p-1 text-app-text-muted hover:text-app-text hover:bg-app-surface-deep rounded-lg transition-colors"
                                        onclick={(e) =>
                                            handleIngredientClick(
                                                ingredient,
                                                e,
                                            )}
                                        aria-label="Options"
                                    >
                                        <EllipsisVertical size={18} />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<!-- Leftover Action Menu -->
{#if showActionMenu && selectedItem}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed z-50 w-52 bg-app-surface rounded-xl shadow-lg border border-app-border py-1 overflow-hidden"
        style="left: {actionMenuPosition.x}px; top: {actionMenuPosition.y}px;"
        transition:fade={{ duration: 100 }}
        onclick={(e) => e.stopPropagation()}
    >
        <button
            class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
            onclick={handleMarkAsEaten}
        >
            <Utensils size={18} />
            <span class="font-medium">Mark as Eaten</span>
        </button>

        <button
            class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
            onclick={handleDeleteLeftover}
        >
            <Trash2 size={18} />
            <span class="font-medium">Throw away</span>
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

<!-- Ingredient Action Menu -->
{#if showActionMenu && selectedIngredient}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed z-50 w-52 bg-app-surface rounded-xl shadow-lg border border-app-border py-1 overflow-hidden"
        style="left: {actionMenuPosition.x}px; top: {actionMenuPosition.y}px;"
        transition:fade={{ duration: 100 }}
        onclick={(e) => e.stopPropagation()}
    >
        <button
            class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
            onclick={handleDeleteIngredient}
        >
            <Trash2 size={18} />
            <span class="font-medium">Throw away</span>
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
    isOpen={showConfirmDelete}
    title={itemToDelete
        ? isEatingLeftover
            ? "Mark as Eaten?"
            : "Throw away leftover?"
        : "Throw away ingredient?"}
    message={itemToDelete
        ? isEatingLeftover
            ? `This will remove this leftover from your fridge inventory.`
            : `This will permanently remove this leftover from your fridge ${itemToDelete?.status === "planned" ? "and your meal plan" : ""}.`
        : `This will throw away "${ingredientToDelete?.name}" from your fridge.`}
    confirmText={itemToDelete
        ? isEatingLeftover
            ? "I ate it!"
            : "Throw away"
        : "Throw away"}
    cancelText="Cancel"
    isDestructive={itemToDelete ? !isEatingLeftover : true}
    onConfirm={confirmDelete}
    onClose={() => {
        showConfirmDelete = false;
        itemToDelete = null;
        ingredientToDelete = null;
    }}
/>

<!-- Add Ingredient Modal -->
<FridgeIngredientModal
    isOpen={showAddIngredientModal}
    onClose={() => (showAddIngredientModal = false)}
/>

{#if activeTab === "ingredients"}
    <div
        class="fixed bottom-6 right-6 z-30"
        transition:fade={{ duration: 150 }}
    >
        <button
            class="w-14 h-14 bg-app-primary text-white rounded-full shadow-lg shadow-app-primary/25 flex items-center justify-center hover:bg-app-primary-hover transition-all active:scale-95"
            onclick={() => (showAddIngredientModal = true)}
            aria-label="Add Ingredient"
        >
            <Plus size={28} />
        </button>
    </div>
{/if}
