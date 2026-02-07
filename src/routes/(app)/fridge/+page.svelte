<script lang="ts">
    import {
        AlertCircle,
        Apple,
        Disc3Icon,
        EllipsisVertical,
        Plus,
        Search,
        UtensilsCrossed,
        X as XIcon,
    } from "lucide-svelte";
    import { slide } from "svelte/transition";
    import Header from "$lib/components/Header.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import { deleteLeftover, leftovers } from "$lib/stores/leftovers";
    import {
        deleteIngredient,
        fridgeIngredients,
    } from "$lib/stores/fridgeIngredients";
    import { isMealTimePast, parseWeekId } from "$lib/utils/mealtime";
    import { formatAmount } from "$lib/utils/shopping";
    import type { FridgeIngredient, LeftoverItem } from "$lib/types";
    import FridgeIngredientModal from "$lib/components/FridgeIngredientModal.svelte";
    import FridgeMenu from "$lib/components/FridgeMenu.svelte";

    // Tab state
    type TabType = "leftovers" | "ingredients";
    let activeTab = $state<TabType>("leftovers");

    // State for action menu
    let selectedItem = $state<LeftoverItem | null>(null);
    let selectedIngredient = $state<FridgeIngredient | null>(null);

    let activeTriggerRect = $state<DOMRect | null>(null);

    // State for confirmation modal
    let showConfirmDelete = $state(false);
    let itemToDelete = $state<LeftoverItem | null>(null);
    let ingredientToDelete = $state<FridgeIngredient | null>(null);
    let isEatingLeftover = $state(false);
    let ingredientToEdit = $state<FridgeIngredient | null>(null);

    // Current time for past-time detection
    let now = $state(new Date());

    // Update time every minute
    $effect(() => {
        const interval = setInterval(() => {
            now = new Date();
        }, 60000);
        return () => clearInterval(interval);
    });

    // Search state
    let searchQuery = $state("");

    function normalizeText(text: string) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }

    // Filtered data
    let filteredLeftovers = $derived(
        $leftovers.data.filter((item) =>
            normalizeText(item.title).includes(normalizeText(searchQuery)),
        ),
    );

    let filteredIngredientsList = $derived(
        $fridgeIngredients.data.filter((item) =>
            normalizeText(item.name).includes(normalizeText(searchQuery)),
        ),
    );

    // Categorize leftovers
    let availableItems = $derived(
        filteredLeftovers.filter((item) => item.status === "not_planned"),
    );

    let plannedItems = $derived(
        filteredLeftovers.filter((item) => item.status === "planned"),
    );

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
        activeTriggerRect = rect;
    };

    const handleIngredientClick = (item: FridgeIngredient, e: MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        selectedIngredient = item;
        selectedItem = null;
        activeTriggerRect = rect;
    };

    const closeActionMenu = () => {
        activeTriggerRect = null;
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

    const handleEditIngredient = () => {
        if (!selectedIngredient) return;
        ingredientToEdit = selectedIngredient;
        showAddIngredientModal = true;
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

    const getDiffDays = (date: Date): number => {
        const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d2 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );
        return Math.round((d1.getTime() - d2.getTime()) / 86400000);
    };

    const getRelativeLabel = (date: Date): string => {
        const diffDays = getDiffDays(date);

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays > 0) return `${diffDays} days ago`;
        if (diffDays === -1) return "Tomorrow";
        if (diffDays < -1) return `${Math.abs(diffDays)} days from now`;
        return "Today";
    };

    const formatSource = (item: LeftoverItem): string => {
        if (!item.sourceDate) return "Manual Entry";
        return getRelativeLabel(item.sourceDate);
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
            return getRelativeLabel(plannedDate);
        }

        // Fallback
        return item.plannedFor.day;
    };

    const getDaysInFridge = (date: Date) => {
        const diff = now.getTime() - date.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };

    const getDaysBadgeClass = (days: number) => {
        if (days <= 2)
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (days <= 4)
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    };

    let showAddIngredientModal = $state(false);

    // Swipe handling
    let touchStartX = 0;
    let touchDeltaX = $state(0);
    let isDragging = $state(false);

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
        isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const dx = currentX - touchStartX;

        // Constrain delta to prevent over-swiping at boundaries
        if (activeTab === "leftovers" && dx > 0) {
            touchDeltaX = dx * 0.2; // Resist overscroll
        } else if (activeTab === "ingredients" && dx < 0) {
            touchDeltaX = dx * 0.2; // Resist overscroll
        } else {
            touchDeltaX = dx;
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;

        const threshold = 100;
        if (touchDeltaX < -threshold && activeTab === "leftovers") {
            activeTab = "ingredients";
        } else if (touchDeltaX > threshold && activeTab === "ingredients") {
            activeTab = "leftovers";
        }

        touchDeltaX = 0;
        isDragging = false;
    };
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && closeActionMenu()} />

<SEO
    title="My Fridge"
    description="Track leftovers and ingredients in your fridge. Never waste food again."
/>

<div class="h-full flex flex-col">
    <div class="md:hidden">
        <Header title="Your Fridge" mobileTitle="Fridge" />
    </div>

    <div class="flex-1 flex flex-col min-h-0 bg-app-bg">
        <!-- Controls Bar -->
        <div
            class="bg-app-bg border-b border-app-border shrink-0 transition-all px-4 md:px-6"
        >
            <div class="max-w-2xl mx-auto">
                <!-- Tab Bar -->
                <div class="pt-4 pb-2">
                    <div
                        class="relative flex gap-1 p-1 bg-app-surface-deep rounded-xl border border-app-border"
                    >
                        <!-- Sliding background indicator -->
                        <div
                            class="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-app-surface shadow-sm border border-app-border rounded-lg transition-transform duration-300 ease-out z-0"
                            style="transform: translateX({activeTab ===
                            'leftovers'
                                ? '0'
                                : 'calc(100% + 4px)'})"
                        ></div>

                        <button
                            class="flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors {activeTab ===
                            'leftovers'
                                ? 'text-app-text'
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
                            class="flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors {activeTab ===
                            'ingredients'
                                ? 'text-app-text'
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

                <!-- Search & Actions Bar -->
                <div class="pb-4 pt-1 flex gap-2">
                    <div class="relative flex-1">
                        <Search
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
                            size={18}
                        />
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Search {activeTab}..."
                            class="w-full bg-app-surface border border-app-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all font-medium placeholder:text-app-text-muted/60"
                            id="fridge-search"
                        />
                        {#if searchQuery}
                            <button
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text transition-colors"
                                onclick={() => (searchQuery = "")}
                                aria-label="Clear search"
                            >
                                <XIcon size={16} />
                            </button>
                        {/if}
                    </div>

                    {#if activeTab === "ingredients"}
                        <button
                            class="bg-app-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md shadow-app-primary/20 hover:bg-app-primary-hover transition-all active:scale-95 shrink-0"
                            onclick={() => (showAddIngredientModal = true)}
                        >
                            <Plus size={18} />
                            <span class="hidden sm:inline">Add</span>
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-hidden relative">
            <div
                class="h-full flex {isDragging
                    ? ''
                    : 'transition-transform duration-300 ease-out'}"
                style="width: 200%; transform: translateX(calc({activeTab ===
                'leftovers'
                    ? '0%'
                    : '-50%'} + {touchDeltaX}px))"
                ontouchstart={handleTouchStart}
                ontouchmove={handleTouchMove}
                ontouchend={handleTouchEnd}
            >
                <div class="w-1/2 h-full overflow-y-auto p-4 md:p-6">
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
                            <div
                                class="p-4 bg-app-surface-deep rounded-2xl mb-4"
                            >
                                <UtensilsCrossed
                                    size={48}
                                    class="text-app-text-muted/50"
                                />
                            </div>
                            <h3 class="text-lg font-bold text-app-text mb-2">
                                No leftovers yet
                            </h3>
                            <p class="text-sm text-app-text-muted max-w-xs">
                                Add leftovers from your meal plan to track what
                                you have available.
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
                                            {@const days = getDiffDays(
                                                item.sourceDate,
                                            )}
                                            <div
                                                class="w-full flex items-center gap-3 p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-colors text-left group"
                                                transition:slide={{
                                                    duration: 200,
                                                }}
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
                                                        class="font-bold text-app-text text-sm truncate block"
                                                    >
                                                        {item.title}
                                                    </span>
                                                    <div
                                                        class="flex items-center gap-2 mt-1"
                                                    >
                                                        <span
                                                            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                                days,
                                                            )}"
                                                        >
                                                            {formatSource(item)}
                                                        </span>
                                                    </div>
                                                </div>
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
                                            {@const days = getDiffDays(
                                                item.sourceDate,
                                            )}
                                            <div
                                                class="relative"
                                                transition:slide={{
                                                    duration: 200,
                                                }}
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
                                                            class="flex items-center gap-2 mt-1"
                                                        >
                                                            <span
                                                                class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                                    days,
                                                                )}"
                                                            >
                                                                {formatSource(
                                                                    item,
                                                                )}
                                                            </span>
                                                            <span
                                                                class="text-[10px] text-app-text-muted font-bold"
                                                                >→</span
                                                            >
                                                            <span
                                                                class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-app-surface-deep text-app-text-muted border border-app-border"
                                                            >
                                                                {formatPlannedFor(
                                                                    item,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

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
                </div>

                <div class="w-1/2 h-full overflow-y-auto p-4 md:p-6">
                    <!-- Ingredients Tab -->
                    {#if $fridgeIngredients.loading}
                        <div class="flex items-center justify-center h-64">
                            <div
                                class="w-8 h-8 border-3 border-app-primary border-t-transparent rounded-full animate-spin"
                            ></div>
                        </div>
                    {:else if filteredIngredientsList.length === 0}
                        <div
                            class="flex flex-col items-center justify-center h-64 text-center p-8"
                        >
                            <div
                                class="p-4 bg-app-surface-deep rounded-2xl mb-4"
                            >
                                <Apple
                                    size={48}
                                    class="text-app-text-muted/50"
                                />
                            </div>
                            <h3 class="text-lg font-bold text-app-text mb-2">
                                {searchQuery
                                    ? "No matches found"
                                    : "No ingredients tracked"}
                            </h3>
                            <p class="text-sm text-app-text-muted max-w-xs">
                                {searchQuery
                                    ? `Could't find any ingredients matching "${searchQuery}"`
                                    : "When you remove a recipe after buying ingredients, you can save them here."}
                            </p>
                        </div>
                    {:else}
                        <div class="max-w-2xl mx-auto">
                            <div class="space-y-2">
                                {#each filteredIngredientsList as ingredient (ingredient.id)}
                                    {@const days = getDiffDays(
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
                                                    class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold {getDaysBadgeClass(
                                                        days,
                                                    )}"
                                                >
                                                    {getRelativeLabel(
                                                        ingredient.addedAt,
                                                    )}
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
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Action Menu -->
{#if activeTriggerRect}
    {#if selectedItem}
        <FridgeMenu
            triggerRect={activeTriggerRect}
            type="leftover"
            onClose={closeActionMenu}
            onMarkAsEaten={handleMarkAsEaten}
            onDelete={handleDeleteLeftover}
        />
    {:else if selectedIngredient}
        <FridgeMenu
            triggerRect={activeTriggerRect}
            type="ingredient"
            onClose={closeActionMenu}
            onEdit={handleEditIngredient}
            onDelete={handleDeleteIngredient}
        />
    {/if}
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
    ingredient={ingredientToEdit}
    onClose={() => {
        showAddIngredientModal = false;
        ingredientToEdit = null;
    }}
/>
