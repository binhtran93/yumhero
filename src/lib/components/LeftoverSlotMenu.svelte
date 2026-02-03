<script lang="ts">
    import { BrushCleaning, Undo2, Utensils, X as XIcon } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { portal } from "$lib/actions";

    interface Props {
        triggerRect: DOMRect;
        isEaten?: boolean;
        onClose: () => void;
        onRemoveFromPlan: () => void;
        onMarkAsEaten: () => void;
        onMarkAsNotEaten?: () => void;
    }

    let {
        triggerRect,
        isEaten = false,
        onClose,
        onRemoveFromPlan,
        onMarkAsEaten,
        onMarkAsNotEaten,
    }: Props = $props();

    // Calculate position with smart flip logic
    // The menu will appear below the trigger by default,
    // but will flip to appear above if there's not enough space below.

    let style = $state("");
    const MENU_HEIGHT = 200; // Approximate max height of leftover menu in pixels
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
        class="w-56 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-[9999] overflow-hidden"
        transition:fade={{ duration: 100 }}
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
            <BrushCleaning size={18} />
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
</div>
