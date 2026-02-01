<script lang="ts">
    import {
        Plus,
        EllipsisVertical,
        Loader,
        Refrigerator,
    } from "lucide-svelte";
    import WeekSlotMenu from "$lib/components/WeekSlotMenu.svelte";
    import LeftoverSlotMenu from "$lib/components/LeftoverSlotMenu.svelte";
    import type {
        Recipe,
        MealType,
        Note,
        PlannedRecipe,
        PlannedLeftover,
        MealSlotItem,
    } from "$lib/types";
    import { isPlannedLeftover } from "$lib/types";
    import { twMerge } from "tailwind-merge";
    import { leftovers } from "$lib/stores/leftovers";

    interface Props {
        day: string;
        type: MealType;
        items: (MealSlotItem | Note)[];
        onClick: (e: MouseEvent) => void;
        onClear?: (e: MouseEvent) => void;
        onRemove?: (index: number) => void;
        onDrop?: (source: any, target: { day: string; type: MealType }) => void;
        onUpdate?: (index: number, newQuantity: number) => void;
        onOpenRecipeMode?: (mode: "cooking", recipeId: string) => void;
        onAddToFridge?: (
            title: string,
            recipeId: string,
            imageUrl?: string,
        ) => void;
        onRemoveLeftoverFromPlan?: (leftoverId: string, index: number) => void;
        onMarkLeftoverAsEaten?: (leftoverId: string, index: number) => void;
        onMarkLeftoverAsNotEaten?: (leftoverId: string, index: number) => void;
        isLoading?: boolean;
        activeDropdown?: {
            day: string;
            type: MealType;
            index: number;
        } | null;
        onToggleDropdown?: (index: number, rect: DOMRect) => void;
        onCloseDropdown?: () => void;
        availableRecipes?: Recipe[];
    }

    let {
        day,
        type,
        items,
        onClick,
        onClear,
        onRemove,
        onDrop,
        onUpdate,
        onOpenRecipeMode,
        onAddToFridge,
        onRemoveLeftoverFromPlan,
        onMarkLeftoverAsEaten,
        onMarkLeftoverAsNotEaten,
        isLoading = false,
        activeDropdown = null,
        onToggleDropdown,
        onCloseDropdown,
        availableRecipes = [],
    }: Props = $props();

    const isEatenStatus = (leftoverId: string) => {
        return !$leftovers.data.some((l) => l.id === leftoverId);
    };

    const getLabel = (item: MealSlotItem | Note) => {
        if ("title" in item) return item.title;
        if ("text" in item) return (item as Note).text;
        return "";
    };

    let isDragOver = $state(false);
    let draggingIndex = $state<number | null>(null);
    // Remove local openMenuIndex logic, use activeDropdown prop
    let activeTriggerRect = $state<DOMRect | null>(null);

    const handleCardClick = (e: MouseEvent, index: number) => {
        // Stop propagation to prevent opening the recipe modal (if any parent handler exists)
        // Note: The main card click is handled here.
        e.stopPropagation();

        const target = e.currentTarget as HTMLElement;
        activeTriggerRect = target.getBoundingClientRect();

        // Notify parent to toggle
        onToggleDropdown?.(index, activeTriggerRect);
    };

    const handleMenuClose = () => {
        onCloseDropdown?.();
    };

    const handleDragEnd = () => {
        draggingIndex = null;
    };

    const handleDragStart = (
        e: DragEvent,
        index: number,
        item: MealSlotItem | Note,
    ) => {
        // Defer hiding the element so the browser has time to create the ghost image from the visible element
        setTimeout(() => {
            draggingIndex = index;
        }, 0);

        if (!e.dataTransfer) return;
        const isRecipe = "title" in item;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                day,
                type,
                index,
                isRecipe,
            }),
        );
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
            // If the source explicitly allows copy (like sidebar), prefer copy.
            // Otherwise default to move (internal DnD).
            if (
                e.dataTransfer.effectAllowed === "copy" ||
                e.dataTransfer.effectAllowed === "all"
            ) {
                e.dataTransfer.dropEffect = "copy";
            } else {
                e.dataTransfer.dropEffect = "move";
            }
        }
        isDragOver = true;
    };

    const handleDragLeave = (e: DragEvent) => {
        isDragOver = false;
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        isDragOver = false;
        if (!onDrop || !e.dataTransfer) return;

        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            onDrop(data, { day, type });
        } catch (err) {
            console.error("Failed to parse drag data", err);
        }
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class={twMerge(
        "group relative flex flex-col bg-app-surface transition-all duration-200 h-full min-h-20 cursor-pointer",
        isDragOver &&
            "ring-2 z-20 " +
                (type === "breakfast"
                    ? "ring-accent-breakfast bg-accent-breakfast/5"
                    : type === "lunch"
                      ? "ring-accent-lunch bg-accent-lunch/5"
                      : type === "dinner"
                        ? "ring-accent-dinner bg-accent-dinner/5"
                        : type === "snack"
                          ? "ring-accent-snack bg-accent-snack/5"
                          : "ring-accent-note bg-accent-note/5"),
    )}
    ondragover={handleDragOver}
    ondrop={handleDrop}
    ondragleave={handleDragLeave}
>
    <!-- Hidden button for accessibility and click handling -->
    <button
        type="button"
        class="absolute inset-0 w-full h-full p-0 m-0 border-0 bg-transparent z-0 opacity-0 cursor-pointer disabled:cursor-default"
        onclick={onClick}
        disabled={isLoading}
        aria-label={`Add to ${type}`}
    ></button>
    <!-- Cell Header (Subtle Label) -->
    <div
        class="relative z-10 pointer-events-none p-2 py-1 flex items-center justify-between transition-colors bg-app-bg/10 group-hover:bg-app-bg/20"
    >
        <div class="flex items-center pointer-events-none">
            <div
                class={twMerge(
                    "w-2 h-2 rounded-full mr-2",
                    type === "breakfast"
                        ? "bg-accent-breakfast"
                        : type === "lunch"
                          ? "bg-accent-lunch"
                          : type === "dinner"
                            ? "bg-accent-dinner"
                            : type === "snack"
                              ? "bg-accent-snack"
                              : "bg-accent-note",
                )}
            ></div>
            <span
                class="text-[10px] font-semibold capitalize tracking-widest text-app-text-muted transition-colors"
            >
                {type}
            </span>
        </div>
        <button
            type="button"
            class="hidden md:block p-1 transition-all duration-200 text-app-text-muted/0 group-hover:text-app-text-muted/80 hover:!text-app-text-muted/100 pointer-events-auto"
            onclick={onClick}
            aria-label={`Add to ${type}`}
        >
            <Plus size={14} />
        </button>
    </div>

    <!-- Cell Content -->
    <div
        class="pointer-events-none z-10 flex-1 px-2 pb-2 flex flex-col gap-2 overflow-y-auto relative"
    >
        {#each items as item, i}
            {@const itemIsLeftover = "isLeftover" in item && item.isLeftover}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
                class={twMerge(
                    "pointer-events-auto group/item relative flex items-center gap-2 px-3 py-1 rounded-xl shadow-sm transition-all border cursor-pointer active:cursor-grabbing select-none",
                    type === "breakfast"
                        ? "bg-accent-breakfast-bg hover:bg-accent-breakfast-hover border-accent-breakfast-border"
                        : type === "lunch"
                          ? "bg-accent-lunch-bg hover:bg-accent-lunch-hover border-accent-lunch-border"
                          : type === "dinner"
                            ? "bg-accent-dinner-bg hover:bg-accent-dinner-hover border-accent-dinner-border"
                            : type === "snack"
                              ? "bg-accent-snack-bg hover:bg-accent-snack-hover border-accent-snack-border"
                              : "bg-accent-note-bg hover:bg-accent-note-hover border-accent-note-border",
                    draggingIndex === i && "invisible",
                )}
                draggable="true"
                ondragstart={(e) => handleDragStart(e, i, item)}
                ondragend={handleDragEnd}
                onclick={(e) => handleCardClick(e, i)}
                class:opacity-50={itemIsLeftover &&
                    isEatenStatus(item.leftoverId)}
            >
                <!-- Leftover icon indicator -->
                {#if itemIsLeftover}
                    <Refrigerator
                        size={12}
                        class="shrink-0 text-app-primary mt-0.5"
                    />
                {/if}

                <div
                    class="flex-1 min-w-0 pt-0.5 pointer-events-none line-clamp-3"
                >
                    <p
                        class={twMerge(
                            "font-bold leading-tight text-sm md:text-xs 2xl:text-sm",
                            itemIsLeftover &&
                                isEatenStatus(item.leftoverId) &&
                                "line-through opacity-60",
                            type === "breakfast"
                                ? "text-accent-breakfast-text"
                                : type === "lunch"
                                  ? "text-accent-lunch-text"
                                  : type === "dinner"
                                    ? "text-accent-dinner-text"
                                    : type === "snack"
                                      ? "text-accent-snack-text"
                                      : "text-accent-note-text",
                        )}
                    >
                        {getLabel(item)}

                        {#if "quantity" in item && item.quantity > 1}
                            <span class="opacity-60 font-medium ml-1 text-xs"
                                >x{item.quantity}</span
                            >
                        {/if}
                    </p>
                </div>

                <!-- Show menu based on item type -->
                {#if activeDropdown?.day === day && activeDropdown?.type === type && activeDropdown?.index === i && activeTriggerRect}
                    {#if itemIsLeftover}
                        <!-- Leftover menu (simplified) -->
                        <LeftoverSlotMenu
                            leftoverId={item.leftoverId}
                            triggerRect={activeTriggerRect}
                            isEaten={isEatenStatus(item.leftoverId)}
                            onClose={handleMenuClose}
                            onRemoveFromPlan={() =>
                                onRemoveLeftoverFromPlan?.(item.leftoverId, i)}
                            onMarkAsEaten={() =>
                                onMarkLeftoverAsEaten?.(item.leftoverId, i)}
                            onMarkAsNotEaten={() =>
                                onMarkLeftoverAsNotEaten?.(item.leftoverId, i)}
                        />
                    {:else if onUpdate && "quantity" in item}
                        <!-- Recipe menu (full feature set) -->
                        {@const quantity = item.quantity || 1}
                        {@const baseServings = item.servings || undefined}

                        <WeekSlotMenu
                            recipeId={item.id}
                            recipeTitle={item.title}
                            {quantity}
                            {baseServings}
                            triggerRect={activeTriggerRect}
                            onUpdate={(newQuantity: number) =>
                                onUpdate(i, newQuantity)}
                            onClose={handleMenuClose}
                            onAction={(action) => {
                                if (onOpenRecipeMode && "id" in item) {
                                    onOpenRecipeMode(action, item.id);
                                }
                            }}
                            onRemove={() => onRemove?.(i)}
                            onAddToFridge={onAddToFridge
                                ? (title) =>
                                      onAddToFridge(title, item.id, item.image)
                                : undefined}
                        />
                    {/if}
                {/if}

                {#if onRemove}
                    <button
                        class={twMerge(
                            "flex items-center justify-center w-6 h-6 -mr-1 rounded-full opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-all hover:bg-black/5",
                            type === "breakfast"
                                ? "text-accent-breakfast-text"
                                : type === "lunch"
                                  ? "text-accent-lunch-text"
                                  : type === "dinner"
                                    ? "text-accent-dinner-text"
                                    : type === "snack"
                                      ? "text-accent-snack-text"
                                      : "text-accent-note-text",
                        )}
                        onclick={(e) => handleCardClick(e, i)}
                        aria-label="More options"
                    >
                        <EllipsisVertical size={14} />
                    </button>
                {/if}
            </div>
        {/each}

        {#if items.length === 0 && !isLoading}
            <div
                class="flex-1 flex items-center justify-center -mt-2 md:mt-0 md:block"
            >
                <Plus
                    size={16}
                    class="text-app-text-muted/80 md:hidden transition-colors"
                />
            </div>
        {:else}
            <!-- Bottom Plus: Show only on mobile, remove from desktop -->
            <div
                class="flex-1 flex items-center justify-center min-h-8 md:hidden"
            >
                <Plus size={16} class="text-app-text-muted/80" />
            </div>
        {/if}

        <!-- Loading Overlay -->
        {#if isLoading}
            <div
                class="absolute inset-0 bg-white/60 dark:bg-app-surface/60 flex items-center justify-center z-20"
            >
                <Loader size={16} class="animate-spin text-app-primary" />
            </div>
        {/if}
    </div>
</div>
