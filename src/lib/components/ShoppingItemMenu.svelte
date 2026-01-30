<script lang="ts">
    import { EllipsisVertical, Trash2, Pencil, RotateCcw } from "lucide-svelte";
    import { fade } from "svelte/transition";

    interface Props {
        hasHistory: boolean;
        isDeleted?: boolean;
        onDelete: () => void;
        onEdit: () => void;
        onReset?: () => void;
        onRestore?: () => void;
    }

    let {
        hasHistory,
        isDeleted = false,
        onDelete,
        onEdit,
        onReset,
        onRestore,
    }: Props = $props();

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
        class="p-1.5 text-app-text-muted hover:text-app-text hover:bg-app-surface-deep/50 rounded-lg transition-colors"
        aria-label="More options"
    >
        <EllipsisVertical size={18} />
    </button>

    {#if isMenuOpen}
        <div
            transition:fade={{ duration: 100 }}
            class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-app-surface rounded-xl shadow-lg border border-app-border py-1 z-50 overflow-hidden"
        >
            {#if isDeleted}
                <!-- Deleted item: show restore option -->
                <button
                    class="w-full text-left px-3 py-2.5 text-sm font-medium text-app-primary hover:bg-app-surface-hover flex items-center gap-2.5 transition-colors"
                    onclick={handleAction(onRestore || (() => {}))}
                >
                    <RotateCcw size={15} />
                    Restore
                </button>
            {:else}
                <!-- Normal item: show edit, delete, and optionally reset -->
                <button
                    class="w-full text-left px-3 py-2.5 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2.5 transition-colors"
                    onclick={handleAction(onEdit)}
                >
                    <Pencil size={15} />
                    Edit
                </button>
                {#if hasHistory && onReset}
                    <button
                        class="w-full text-left px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors"
                        onclick={handleAction(onReset)}
                    >
                        <RotateCcw size={15} />
                        Reset
                    </button>
                {/if}
                <button
                    class="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                    onclick={handleAction(onDelete)}
                >
                    <Trash2 size={15} />
                    Delete
                </button>
            {/if}
        </div>
    {/if}
</div>
