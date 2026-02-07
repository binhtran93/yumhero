<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { X, Check, Trash2, AlertTriangle } from "lucide-svelte";

    interface Props {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        isDestructive?: boolean;
        onConfirm: () => void;
        onClose: () => void;
        isLoading?: boolean;
    }

    let {
        isOpen,
        title,
        message,
        confirmText = "Confirm",
        cancelText = "Cancel",
        isDestructive = false,
        onConfirm,
        onClose,
        isLoading = false,
    }: Props = $props();
</script>

<Modal {isOpen} {onClose} class="max-w-md rounded-2xl" showCloseButton={false}>
    <div class="p-6">
        <div class="flex items-center gap-4 mb-4">
            {#if isDestructive}
                <div class="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                    <AlertTriangle size={24} />
                </div>
            {/if}
            <div>
                <h3 class="text-lg font-bold text-app-text leading-tight">
                    {title}
                </h3>
            </div>
        </div>

        <p class="text-app-text-muted leading-relaxed mb-6">
            {@html message}
        </p>

        <div class="flex items-center justify-end gap-3">
            <button
                onclick={onClose}
                class="px-4 py-2 text-sm font-bold bg-app-bg border border-app-border text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-xl transition-colors flex items-center gap-2"
            >
                <X size={18} />
                {cancelText}
            </button>
            <button
                onclick={onConfirm}
                class="px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 {isDestructive
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-app-primary hover:bg-app-primary/90 shadow-action-primary/20'}"
                disabled={isLoading}
            >
                {#if isLoading}
                    Processing...
                {:else}
                    {#if isDestructive}
                        <Trash2 size={18} />
                    {:else}
                        <Check size={18} />
                    {/if}
                    {confirmText}
                {/if}
            </button>
        </div>
    </div>
</Modal>
