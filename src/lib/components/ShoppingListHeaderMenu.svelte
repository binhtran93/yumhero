<script lang="ts">
    import {
        EllipsisVertical,
        Plus,
        RotateCcw,
        Eye,
        EyeOff,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";

    interface Props {
        showDeleted: boolean;
        onAddItem: () => void;
        onResetAll: () => void;
        onToggleDeleted: () => void;
    }

    let { showDeleted, onAddItem, onResetAll, onToggleDeleted }: Props =
        $props();

    let isMenuOpen = $state(false);

    function toggleMenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }

    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node) && isMenuOpen) {
                closeMenu();
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }

    function handleAction(action: () => void) {
        return (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
            action();
        };
    }
</script>

<div class="relative" use:clickOutside>
    <button
        onclick={toggleMenu}
        class="p-2 hover:bg-app-bg rounded-xl text-app-text-muted hover:text-app-text transition-all"
        aria-label="More options"
    >
        <EllipsisVertical size={20} />
    </button>

    {#if isMenuOpen}
        <div
            transition:fade={{ duration: 100 }}
            class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-50 overflow-hidden"
        >
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={handleAction(onAddItem)}
            >
                <Plus size={16} />
                Add Item
            </button>
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={handleAction(onToggleDeleted)}
            >
                {#if showDeleted}
                    <EyeOff size={16} />
                    Hide Deleted
                {:else}
                    <Eye size={16} />
                    Show Deleted
                {/if}
            </button>
            <button
                class="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-3 transition-colors"
                onclick={handleAction(onResetAll)}
            >
                <RotateCcw size={16} />
                Reset All
            </button>
        </div>
    {/if}
</div>
