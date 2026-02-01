<script lang="ts">
    import {
        X as XIcon,
        Trash2,
        Refrigerator,
        Undo2,
        Utensils,
        Eraser,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { portal } from "$lib/actions";
    import { twMerge } from "tailwind-merge";

    interface Props {
        leftoverId: string;
        triggerRect: DOMRect;
        isEaten?: boolean;
        onClose: () => void;
        onRemoveFromPlan: () => void;
        onMarkAsEaten: () => void;
        onMarkAsNotEaten?: () => void;
    }

    let {
        leftoverId,
        triggerRect,
        isEaten = false,
        onClose,
        onRemoveFromPlan,
        onMarkAsEaten,
        onMarkAsNotEaten,
    }: Props = $props();

    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node)) {
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

    let style = $state("");

    $effect(() => {
        if (triggerRect) {
            const right = window.innerWidth - triggerRect.right;
            const top = triggerRect.bottom + 4;
            style = `top: ${top}px; right: ${right}px; position: fixed;`;
        }
    });
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
        {#if isEaten}
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    onMarkAsNotEaten?.();
                    onClose();
                }}
            >
                <Undo2 size={18} />
                Mark as Not Eaten
            </button>
        {:else}
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.stopPropagation();
                    onMarkAsEaten();
                    onClose();
                }}
            >
                <Utensils size={18} />
                Mark as Eaten
            </button>
        {/if}
    </div>

    <div class="border-t border-app-border my-1"></div>

    <button
        class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
        onclick={(e) => {
            e.stopPropagation();
            onRemoveFromPlan();
            onClose();
        }}
    >
        <Eraser size={18} />
        Remove from Plan
    </button>

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
