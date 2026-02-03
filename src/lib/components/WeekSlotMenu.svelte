<script lang="ts">
    import {
        ChefHat,
        Minus,
        Plus,
        X as XIcon,
        Hash,
        Users,
        Refrigerator,
        Info,
        BrushCleaning,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import { twMerge } from "tailwind-merge";
    import { portal } from "$lib/actions";

    interface Props {
        recipeId: string;
        recipeTitle?: string;
        quantity: number;
        baseServings?: number;
        triggerRect: DOMRect;
        onUpdate: (newQuantity: number) => void;
        onClose: () => void;
        onAction: (action: "cooking") => void;
        onRemove?: () => void;
        onAddToFridge?: (title: string) => void;
    }

    let {
        recipeId,
        recipeTitle = "",
        quantity,
        baseServings = 1,
        triggerRect,
        onUpdate,
        onClose,
        onAction,
        onRemove,
        onAddToFridge,
    }: Props = $props();

    let showTooltip = $state(false);

    // Calculate position with smart flip logic
    // The menu will appear below the trigger by default,
    // but will flip to appear above if there's not enough space below.

    let style = $state("");
    let menuRef = $state<HTMLElement | null>(null);
    const MENU_HEIGHT = 320; // Approximate max height of menu in pixels
    const MARGIN = 8; // Safety margin from viewport edge

    $effect(() => {
        if (triggerRect) {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Calculate available space below and above
            const spaceBelow = viewportHeight - triggerRect.bottom - MARGIN;
            const spaceAbove = triggerRect.top - MARGIN;

            // Determine if we should flip to show above
            const showAbove =
                spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow;

            // Calculate right alignment (menu right edge aligns with trigger right edge)
            const right = viewportWidth - triggerRect.right;

            if (showAbove) {
                // Position above the trigger
                const bottom = viewportHeight - triggerRect.top + 4;
                style = `bottom: ${bottom}px; right: ${right}px; position: fixed;`;
            } else {
                // Position below the trigger (default)
                const top = triggerRect.bottom + 4;
                style = `top: ${top}px; right: ${right}px; position: fixed;`;
            }
        }
    });

    function handleCookingView() {
        onClose();
        // goto(`/recipes/${recipeId}/cooking`);
        onAction("cooking");
    }

    function handleQuantityChange(delta: number) {
        const newQuantity = Math.max(1, quantity + delta);
        onUpdate(newQuantity);
    }

    let infoButtonRef = $state<HTMLElement | null>(null);
    let tooltipPosition = $state<{ top: number; left: number } | null>(null);

    function toggleTooltip() {
        if (showTooltip) {
            showTooltip = false;
        } else {
            showTooltip = true;
            if (infoButtonRef) {
                const rect = infoButtonRef.getBoundingClientRect();
                const TOOLTIP_WIDTH = 256; // w-64
                // Check if right side has space
                let left = rect.right + 8;
                if (left + TOOLTIP_WIDTH > window.innerWidth) {
                    // Not enough space on right, try left
                    left = rect.left - TOOLTIP_WIDTH - 8;
                }

                // Fallback: align to right edge if left also fails (mobile)
                if (left < 0) {
                    left = window.innerWidth - TOOLTIP_WIDTH - 8;
                }

                tooltipPosition = {
                    top: rect.top, // Align top of tooltip with button
                    left: left,
                };
            }
        }
    }
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") onClose();
    }}
/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div use:portal>
    <div class="fixed inset-0 z-[9998] bg-transparent" onclick={onClose}></div>

    <div
        class="w-72 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-[9999]"
        transition:fade={{ duration: 100 }}
        {style}
        role="menu"
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
    >
        <!-- Menu Items -->
        <div class="py-1">
            <button
                class="w-full text-left px-4 py-2.5 text-sm text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={handleCookingView}
            >
                <ChefHat size={18} />
                <span class="font-medium">Cooking view</span>
            </button>
        </div>

        <!-- Quantity Row -->
        <div
            class="w-full px-4 py-2.5 text-sm text-app-text flex items-center justify-between select-none cursor-default"
            onclick={(e) => e.stopPropagation()}
            role="separator"
        >
            <div class="flex items-center gap-3 text-app-text">
                <Hash size={18} class="text-app-text-muted/80" />
                <span class="font-medium">Quantity</span>
            </div>

            <div class="flex items-center gap-2">
                <!-- Counter -->
                <div
                    class="flex items-center bg-app-surface-deep rounded-md border border-app-border h-8"
                >
                    <button
                        class="w-8 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-l-md"
                        onclick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(-1);
                        }}
                        disabled={quantity <= 1}
                        aria-label="Decrease"
                    >
                        <Minus size={14} />
                    </button>

                    <span
                        class="w-8 text-center font-bold text-sm tabular-nums text-app-text"
                    >
                        {quantity}
                    </span>

                    <button
                        class="w-8 h-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-r-md"
                        onclick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(1);
                        }}
                        aria-label="Increase"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <!-- Info Button -->
                <div class="relative">
                    <button
                        bind:this={infoButtonRef}
                        class={twMerge(
                            "w-8 h-8 rounded-full transition-colors flex items-center justify-center",
                            showTooltip
                                ? "bg-app-primary/10 text-app-primary"
                                : "text-app-text-muted/60 hover:text-app-text hover:bg-app-surface-hover",
                        )}
                        onclick={(e) => {
                            e.stopPropagation();
                            toggleTooltip();
                        }}
                        aria-label="Serving Info"
                    >
                        <Info size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>

        <!-- Tooltip Portal -->
        {#if showTooltip && baseServings && tooltipPosition}
            {@const min = Math.floor(baseServings) * quantity}
            {@const max = Math.ceil(baseServings) * quantity}
            <div
                class="fixed z-[10001] w-64 p-4 bg-app-surface border border-app-border rounded-xl shadow-xl pointer-events-none flex flex-col gap-3"
                style="top: {tooltipPosition.top}px; left: {tooltipPosition.left}px;"
                transition:fly={{ y: 5, duration: 200, opacity: 0 }}
                use:portal
            >
                <div class="flex items-start gap-3">
                    <div
                        class="p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 mt-0.5"
                    >
                        <Users size={16} />
                    </div>
                    <div class="flex flex-col gap-1">
                        <h4
                            class="text-xs font-bold text-app-text uppercase tracking-wide opacity-50"
                        >
                            Serving Guide
                        </h4>
                        <p class="text-sm text-app-text leading-snug">
                            Each recipe batch is designed to serve <strong
                                class="text-app-primary"
                                >{Math.floor(baseServings) ===
                                Math.ceil(baseServings)
                                    ? Math.floor(baseServings)
                                    : `${Math.floor(baseServings)}-${Math.ceil(baseServings)}`}</strong
                            > people.
                        </p>
                    </div>
                </div>

                <div class="w-full h-px bg-app-border/50"></div>

                <div class="flex items-center justify-between px-1">
                    <span class="text-xs font-medium text-app-text-muted"
                        >Total for {quantity} batch{quantity > 1
                            ? "es"
                            : ""}</span
                    >
                    <span class="text-sm font-black text-app-text"
                        >{min === max ? min : `${min}-${max}`} servings</span
                    >
                </div>
            </div>
        {/if}

        {#if onAddToFridge}
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    onAddToFridge(recipeTitle);
                    onClose();
                }}
            >
                <Refrigerator size={18} />
                Put leftover to fridge
            </button>
        {/if}

        {#if onRemove}
            <div class="border-t border-app-border my-1"></div>
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    onRemove();
                    onClose();
                }}
            >
                <BrushCleaning size={18} />
                Remove from plan
            </button>
        {/if}

        <div class="border-t border-app-border my-1"></div>

        <button
            class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
            onclick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <XIcon size={18} />
            Close
        </button>
    </div>
</div>
