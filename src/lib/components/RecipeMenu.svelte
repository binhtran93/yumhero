<script lang="ts">
    import { Pencil, Share2, Trash2, X as XIcon } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { portal } from "$lib/actions";

    interface Props {
        triggerRect: DOMRect;
        onClose: () => void;
        onEdit?: () => void;
        onDelete: () => void;
        onShare?: () => void;
    }

    let { triggerRect, onClose, onEdit, onDelete, onShare }: Props = $props();

    // Calculate position with smart flip logic
    let style = $state("");
    const MENU_HEIGHT = 180; // Approximate height
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

    // Handle escape key
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") onClose();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

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
            {#if onShare}
                <button
                    class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                    onclick={(e) => {
                        e.stopPropagation();
                        onShare();
                        onClose();
                    }}
                >
                    <Share2 size={18} />
                    Share Recipe
                </button>
            {/if}

            {#if onEdit}
                <button
                    class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                    onclick={(e) => {
                        e.stopPropagation();
                        onEdit();
                        onClose();
                    }}
                >
                    <Pencil size={18} />
                    Edit Recipe
                </button>
            {/if}
        </div>

        <div class="border-t border-app-border my-1"></div>

        <button
            class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition-colors"
            onclick={(e) => {
                e.stopPropagation();
                onDelete();
                onClose();
            }}
        >
            <Trash2 size={18} />
            Delete Recipe
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
