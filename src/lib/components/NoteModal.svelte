<script lang="ts">
    import Modal from "./Modal.svelte";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        onSave: (text: string) => void;
    }

    let { isOpen, onClose, onSave }: Props = $props();

    let text = $state("");

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
    };
</script>

<Modal {isOpen} {onClose} title="Add Note">
    <div class="p-4">
        <textarea
            bind:value={text}
            onkeydown={handleKeydown}
            placeholder="Enter your note here..."
            class="w-full h-32 p-3 bg-app-bg border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-primary/50 resize-none"
            autofocus
        ></textarea>

        <div class="flex justify-end gap-2 mt-4">
            <button
                class="px-4 py-2 text-sm font-bold text-app-text-muted hover:bg-app-surface-hover rounded-xl transition-colors"
                onclick={onClose}
            >
                Cancel
            </button>
            <button
                class="px-4 py-2 text-sm font-bold text-white bg-app-primary hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95"
                onclick={handleSave}
            >
                Save
            </button>
        </div>
    </div>
</Modal>
