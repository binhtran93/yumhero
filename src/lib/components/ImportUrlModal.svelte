<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import { X, Globe, Loader2 } from "lucide-svelte";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        onImport: (url: string) => Promise<void>;
    }

    let { isOpen, onClose, onImport }: Props = $props();

    let url = $state("");
    let isLoading = $state(false);
    let error = $state("");

    let urlInput = $state<HTMLInputElement>();

    // Reset form and focus when modal opens
    $effect(() => {
        if (isOpen) {
            url = "";
            error = "";
            isLoading = false;
            // Focus input on next tick to ensure it's rendered
            setTimeout(() => urlInput?.focus(), 50);
        }
    });

    const validateUrl = (urlString: string): boolean => {
        try {
            const urlObj = new URL(urlString);
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleImport = async () => {
        error = "";

        if (!url.trim()) {
            error = "Please enter a URL";
            return;
        }

        if (!validateUrl(url.trim())) {
            error =
                "Please enter a valid URL (must start with http:// or https://)";
            return;
        }

        isLoading = true;
        try {
            await onImport(url.trim());
            onClose();
        } catch (e: any) {
            error = e.message || "Failed to import recipe. Please try again.";
        } finally {
            isLoading = false;
        }
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) {
            handleImport();
        }
    };
</script>

{#snippet headerContent()}
    <div
        class="px-4 md:px-6 py-4 bg-app-surface border-b border-app-border flex items-center justify-between shrink-0"
    >
        <div class="flex items-center gap-2">
            <div class="p-2 bg-app-primary/10 rounded-lg">
                <Globe size={20} class="text-app-primary" />
            </div>
            <h2 class="text-xl font-bold text-app-text">Import from Web</h2>
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
    class="w-full md:max-w-lg bg-app-surface p-0 overflow-hidden flex flex-col md:rounded-2xl rounded-none"
    showCloseButton={false}
    header={headerContent}
    closeOnEsc={!isLoading}
    closeOnClickOutside={!isLoading}
>
    <div class="p-4 md:p-6 space-y-4">
        <p class="text-sm text-app-text-muted">
            Enter the URL of a recipe from any website. We'll automatically
            extract the recipe details for you.
        </p>

        <div class="space-y-2">
            <label
                for="recipe-url"
                class="text-xs text-app-text-muted uppercase font-bold pl-1"
            >
                Recipe URL
            </label>
            <input
                id="recipe-url"
                type="url"
                bind:this={urlInput}
                bind:value={url}
                onkeydown={handleKeydown}
                disabled={isLoading}
                placeholder="https://example.com/recipe"
                class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/70 focus:outline-none focus:border-app-primary transition-colors disabled:opacity-50"
            />
            {#if error}
                <p class="text-sm text-red-500 pl-1">{error}</p>
            {/if}
        </div>

        <div class="flex gap-3 pt-2">
            <button
                onclick={onClose}
                disabled={isLoading}
                class="flex-1 py-3 rounded-xl bg-app-surface-deep border border-app-border text-app-text font-bold text-sm hover:bg-app-surface-hover transition-colors disabled:opacity-50"
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
                    <span>Importing...</span>
                {:else}
                    <span>Import Recipe</span>
                {/if}
            </button>
        </div>
    </div>
</Modal>
