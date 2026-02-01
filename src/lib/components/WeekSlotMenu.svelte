<script lang="ts">
    import {
        ChefHat,
        ShoppingCart,
        Minus,
        Plus,
        Snowflake,
        Ellipsis,
        X as XIcon,
        Hash,
        Users,
        Trash2,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { portal } from "$lib/actions";

    interface Props {
        recipeId: string;
        quantity: number;
        baseServings?: number;
        triggerRect: DOMRect;
        onUpdate: (newQuantity: number) => void;
        onClose: () => void;
        onAction: (action: "cooking") => void;
        onRemove?: () => void;
    }

    let {
        recipeId,
        quantity,
        baseServings = 1,
        triggerRect,
        onUpdate,
        onClose,
        onAction,
        onRemove,
    }: Props = $props();

    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node)) {
                // Check if the click was on the trigger element (to avoid double toggle)
                // We optimize this by just handling the close. The parent toggle logic
                // handles the re-opening/closing of the specific index.
                onClose();
            }
        };

        // Defer attachment to avoid immediate trigger from the opening click
        setTimeout(() => {
            document.addEventListener("click", handleClick);
        }, 0);

        return {
            destroy() {
                document.removeEventListener("click", handleClick);
            },
        };
    }

    // Calculate position
    // We want the menu to appear below the card, right aligned if possible,
    // but we need to ensure it fits in viewport.
    // For simplicity, let's align top-right of menu to bottom-right of trigger,
    // or top-left to top-left if it fits better.
    // Let's stick to the previous visual: "absolute right-0 top-full" relative to card.
    // So with fixed positioning:
    // left = trigger.right - menu.width (but we don't know menu width easily without layout)
    // or left = trigger.left + trigger.width - menu.width
    // Simpler: right aligned to the trigger right edge.
    // top = trigger.bottom + 4px

    let style = $state("");

    $effect(() => {
        if (triggerRect) {
            // Default: Open below, aligned to right edge
            // We can use right/top css with fixed position
            // right = viewport width - trigger.right
            const right = window.innerWidth - triggerRect.right;
            const top = triggerRect.bottom + 4;
            style = `top: ${top}px; right: ${right}px; position: fixed;`;
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
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Escape") onClose();
    }}
/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
    class="w-56 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-9999 overflow-hidden"
    transition:fade={{ duration: 100 }}
    use:portal
    use:clickOutside
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

    <div
        class="px-4 py-2.5 text-sm font-medium text-app-text flex items-center justify-between hover:bg-app-surface-hover select-none"
        onclick={(e) => e.stopPropagation()}
        role="separator"
    >
        <div class="flex items-center gap-3">
            <Hash size={18} class="text-app-text-muted" />
            <span class="text-app-text-muted">Quantity:</span>
        </div>
        <div class="flex items-center gap-1">
            <button
                class="p-1.5 hover:bg-black/10 rounded disabled:opacity-30 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(-1);
                }}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
            >
                <Minus size={16} />
            </button>
            <span class="font-bold min-w-[1.5rem] text-center">{quantity}</span>
            <button
                class="p-1.5 hover:bg-black/10 rounded transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(1);
                }}
                aria-label="Increase quantity"
            >
                <Plus size={16} />
            </button>
        </div>
    </div>

    <!-- Servings Note -->
    <div
        class="px-4 pb-2 text-xs text-app-text-muted/70 text-right font-medium italic flex items-center justify-end gap-1"
    >
        {#if baseServings}
            {@const min = Math.floor(baseServings) * quantity}
            {@const max = Math.ceil(baseServings) * quantity}
            <span>Serves {min === max ? min : `${min}-${max}`}</span>
            <Users size={12} fill="currentColor" />
        {/if}
    </div>

    <button
        class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text-muted hover:bg-app-surface-hover flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed"
        disabled
        onclick={(e) => e.stopPropagation()}
    >
        <Snowflake size={18} />
        Add to freezer
    </button>

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
            <Trash2 size={18} />
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
