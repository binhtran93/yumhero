<script lang="ts">
    import {
        ChefHat,
        ShoppingCart,
        Minus,
        Plus,
        Snowflake,
        Ellipsis,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { portal } from "$lib/actions";

    interface Props {
        recipeId: string;
        servings: number;
        triggerRect: DOMRect;
        onUpdate: (newServings: number) => void;
        onClose: () => void;
    }

    let { recipeId, servings, triggerRect, onUpdate, onClose }: Props =
        $props();

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
            document.addEventListener("click", handleClick, true);
        }, 0);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
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
        goto(`/recipes/${recipeId}/cooking`);
    }

    function handleShoppingView() {
        onClose();
        goto(`/recipes/${recipeId}/shopping`);
    }

    function handleQuantityChange(delta: number) {
        const newServings = Math.max(1, servings + delta);
        onUpdate(newServings);
    }
</script>

<div
    class="w-48 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-[9999] overflow-hidden"
    transition:fade={{ duration: 100 }}
    use:portal
    use:clickOutside
    {style}
    role="menu"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
>
    <button
        class="w-full text-left px-3 py-2 text-xs font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
        onclick={(e) => {
            e.stopPropagation();
            handleCookingView();
        }}
    >
        <ChefHat size={14} class="text-app-primary" />
        Cooking view
    </button>

    <button
        class="w-full text-left px-3 py-2 text-xs font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
        onclick={(e) => {
            e.stopPropagation();
            handleShoppingView();
        }}
    >
        <ShoppingCart size={14} class="text-accent-lunch" />
        Shopping view
    </button>

    <div
        class="px-3 py-2 text-xs font-medium text-app-text flex items-center justify-between hover:bg-app-surface-hover select-none"
        onclick={(e) => e.stopPropagation()}
        role="separator"
    >
        <div class="flex items-center gap-2">
            <span class="text-app-text-muted">Servings:</span>
        </div>
        <div class="flex items-center gap-2">
            <button
                class="p-0.5 hover:bg-black/10 rounded disabled:opacity-30 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(-1);
                }}
                disabled={servings <= 1}
            >
                <Minus size={12} />
            </button>
            <span class="font-bold min-w-[1rem] text-center">{servings}</span>
            <button
                class="p-0.5 hover:bg-black/10 rounded transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(1);
                }}
            >
                <Plus size={12} />
            </button>
        </div>
    </div>

    <button
        class="w-full text-left px-3 py-2 text-xs font-medium text-app-text-muted hover:bg-app-surface-hover flex items-center gap-2 transition-colors opacity-50 cursor-not-allowed"
        disabled
        onclick={(e) => e.stopPropagation()}
    >
        <Snowflake size={14} />
        Add to freezer
    </button>
</div>
