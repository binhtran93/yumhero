<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { onMount } from "svelte";

    interface Props {
        isOpen: boolean;
        position: { x: number; y: number };
        onClose: () => void;
        onSave: (text: string) => void;
    }

    let { isOpen, position, onClose, onSave }: Props = $props();

    let text = $state("");
    let popoverRef: HTMLDivElement | null = $state(null);

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
        if (
            isOpen &&
            popoverRef &&
            !popoverRef.contains(event.target as Node)
        ) {
            onClose();
        }
    };

    onMount(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    const handleSave = () => {
        if (text.trim()) {
            onSave(text.trim());
            text = "";
            onClose();
        }
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === "Escape") {
            onClose();
        }
    };
</script>

{#if isOpen}
    <div
        class="fixed z-50 w-72 bg-app-surface border border-app-border shadow-2xl rounded-xl overflow-hidden"
        style="top: {position.y}px; left: {position.x}px;"
        bind:this={popoverRef}
        transition:scale={{ duration: 150, start: 0.95 }}
    >
        <div class="p-3">
            <textarea
                bind:value={text}
                onkeydown={handleKeydown}
                placeholder="Write a note..."
                class="w-full h-24 p-2 text-sm bg-app-bg border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary/50 resize-none"
                autofocus
            ></textarea>
            <div class="flex justify-end gap-2 mt-2">
                <button
                    class="px-3 py-1.5 text-xs font-bold text-app-text-muted hover:bg-app-surface-hover rounded-lg transition-colors"
                    onclick={onClose}
                >
                    Cancel
                </button>
                <button
                    class="px-3 py-1.5 text-xs font-bold text-white bg-app-primary hover:bg-orange-700 rounded-lg shadow-sm transition-all active:scale-95"
                    onclick={handleSave}
                >
                    Save
                </button>
            </div>
        </div>
    </div>
{/if}
