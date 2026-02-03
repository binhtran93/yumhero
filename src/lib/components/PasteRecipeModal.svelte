<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { X, FileText, Loader2 } from "lucide-svelte";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        onImport: (text: string) => Promise<void>;
    }

    let { isOpen, onClose, onImport }: Props = $props();

    let recipeText = $state("");
    let isLoading = $state(false);
    let error = $state("");

    let textArea = $state<HTMLTextAreaElement>();

    // Reset form and focus when modal opens
    $effect(() => {
        if (isOpen) {
            recipeText = "";
            error = "";
            isLoading = false;
            // Focus textarea on next tick to ensure it's rendered
            setTimeout(() => textArea?.focus(), 50);
        }
    });

    const handleImport = async () => {
        error = "";

        if (!recipeText.trim()) {
            error = "Please paste some recipe text";
            return;
        }

        isLoading = true;
        try {
            await onImport(recipeText.trim());
            onClose();
        } catch (e: any) {
            error = e.message || "Failed to parse recipe. Please try again.";
        } finally {
            isLoading = false;
        }
    };
</script>

{#snippet headerContent()}
    <div
        class="px-4 md:px-6 py-4 bg-app-surface border-b border-app-border flex items-center justify-between shrink-0"
    >
        <div class="flex items-center gap-2">
            <div class="p-2 bg-app-primary/10 rounded-lg">
                <FileText size={20} class="text-app-primary" />
            </div>
            <h2 class="text-xl font-bold text-app-text">Paste Recipe Text</h2>
        </div>
        {#if isLoading}
            <div class="p-2 -mr-2 text-app-primary animate-spin">
                <Loader2 size={24} />
            </div>
        {:else}
            <button
                onclick={onClose}
                class="p-2 -mr-2 text-app-text-muted hover:text-app-text rounded-full hover:bg-app-surface-hover/50 transition-all font-bold"
            >
                <X size={24} />
            </button>
        {/if}
    </div>
{/snippet}

<Modal
    {isOpen}
    {onClose}
    class="w-full md:max-w-xl bg-app-surface p-0 overflow-hidden flex flex-col md:rounded-2xl rounded-none"
    showCloseButton={false}
    header={headerContent}
    closeOnEsc={!isLoading}
    closeOnClickOutside={!isLoading}
>
    <div class="p-4 md:p-6 space-y-4">
        <p class="text-sm text-app-text-muted">
            Paste the full text of a recipe here (title, ingredients, and
            instructions). We'll use AI to extract the details for you.
        </p>

        <div class="space-y-2">
            <label
                for="recipe-text"
                class="text-xs text-app-text-muted uppercase font-bold pl-1"
            >
                Recipe Content
            </label>
            <textarea
                id="recipe-text"
                bind:this={textArea}
                bind:value={recipeText}
                disabled={isLoading}
                placeholder="Paste recipe here..."
                class="w-full h-64 p-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/70 focus:outline-none focus:border-app-primary transition-colors disabled:opacity-50 resize-none"
            ></textarea>
            {#if error}
                <p class="text-sm text-red-500 pl-1">{error}</p>
            {/if}
        </div>

        <div class="flex gap-3 pt-2">
            <button
                onclick={onClose}
                disabled={isLoading}
                class="flex-1 py-3 rounded-xl bg-app-bg border border-app-border text-app-text font-bold text-sm hover:bg-app-surface-hover transition-colors disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                onclick={handleImport}
                disabled={isLoading}
                class="flex-1 py-3 rounded-xl bg-app-primary text-white font-bold text-sm shadow-sm hover:bg-app-primary/90 transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
                {#if isLoading}
                    <Loader2 size={18} class="animate-spin" />
                    <span>Parsing...</span>
                {:else}
                    <span>Extract Recipe</span>
                {/if}
            </button>
        </div>
    </div>
</Modal>
