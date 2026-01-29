<script lang="ts">
    import { X } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        title?: string;
        description?: string;
        children?: import("svelte").Snippet;
        header?: import("svelte").Snippet;
        footer?: import("svelte").Snippet;
        class?: string;
        showCloseButton?: boolean;
        headerClass?: string;
    }

    let {
        isOpen,
        onClose,
        title,
        description,
        children,
        header,
        footer,
        class: className,
        showCloseButton = true,
        headerClass = "",
    }: Props = $props();

    const handleKeydown = (e: KeyboardEvent) => {
        if (isOpen && e.key === "Escape") {
            e.stopPropagation(); // Prevent bubbling if multiple modals exist
            onClose();
        }
    };
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <div class="fixed inset-0 z-60 flex items-center justify-center p-4">
        <!-- Soft Backdrop -->
        <div
            class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onclick={onClose}
            role="button"
            tabindex="-1"
            onkeydown={() => {}}
            transition:fade={{ duration: 200 }}
        ></div>

        <!-- Modal Content -->
        <div
            class={twMerge(
                "relative z-10 w-full bg-app-surface border border-app-border shadow-2xl flex flex-col rounded-3xl overflow-hidden max-h-[90vh]",
                className,
            )}
            transition:scale={{ duration: 300, easing: quintOut, start: 0.95 }}
            role="dialog"
            aria-modal="true"
        >
            {#if header}
                {@render header()}
            {:else if title || showCloseButton}
                <!-- Header -->
                <div
                    class={twMerge(
                        "p-6 pb-2 flex items-start justify-between shrink-0",
                        headerClass,
                    )}
                >
                    <div>
                        {#if title}
                            <h2
                                class="text-2xl font-display font-bold text-app-text"
                            >
                                {title}
                            </h2>
                        {/if}
                        {#if description}
                            <p class="text-app-text-muted text-sm mt-1">
                                {description}
                            </p>
                        {/if}
                    </div>
                    {#if showCloseButton}
                        <button
                            onclick={onClose}
                            class="p-2 -mr-2 -mt-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    {/if}
                </div>
            {/if}

            <!-- Body -->
            <div class="flex-1 overflow-auto">
                {@render children?.()}
            </div>

            <!-- Footer -->
            {#if footer}
                {@render footer()}
            {/if}
        </div>
    </div>
{/if}
