<script lang="ts">
    import { X } from "lucide-svelte";
    import { fade, scale, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { twMerge } from "tailwind-merge";
    import { onMount } from "svelte";

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
        closeOnEsc?: boolean;
        closeOnClickOutside?: boolean;
        variant?: "center" | "bottom" | "responsive";
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
        closeOnEsc = true,
        closeOnClickOutside = true,
        variant = "responsive",
    }: Props = $props();

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let isMobile = $derived(
        variant === "bottom" || (variant === "responsive" && innerWidth < 640),
    );

    // Gesture states
    let startY = 0;
    let dragY = $state(0);
    let isDragging = $state(false);

    const handleKeydown = (e: KeyboardEvent) => {
        if (isOpen && closeOnEsc && e.key === "Escape") {
            onClose();
        }
    };

    const onTouchStart = (e: TouchEvent) => {
        if (!isMobile) return;
        startY = e.touches[0].clientY;
        isDragging = true;
    };

    const onTouchMove = (e: TouchEvent) => {
        if (!isDragging || !isMobile) return;
        const delta = e.touches[0].clientY - startY;
        if (delta > 0) {
            dragY = delta;
        }
    };

    const onTouchEnd = () => {
        if (!isDragging || !isMobile) return;
        if (dragY > 100) {
            onClose();
        }
        isDragging = false;
        dragY = 0;
    };

    $effect(() => {
        if (!isOpen) {
            dragY = 0;
            isDragging = false;
        }
    });
</script>

<svelte:window onkeydown={handleKeydown} bind:innerWidth bind:innerHeight />

{#if isOpen}
    {#snippet modalInner()}
        <!-- Handle for mobile -->
        {#if isMobile}
            <div
                class="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
                ontouchstart={onTouchStart}
                ontouchmove={onTouchMove}
                ontouchend={onTouchEnd}
            >
                <div
                    class="w-12 h-1.5 bg-app-border rounded-full opacity-50"
                ></div>
            </div>
        {/if}

        {#if header}
            <div
                ontouchstart={onTouchStart}
                ontouchmove={onTouchMove}
                ontouchend={onTouchEnd}
                class="shrink-0"
            >
                {@render header()}
            </div>
        {:else if title || showCloseButton}
            <!-- Header -->
            <div
                class={twMerge(
                    "p-6 pb-2 flex items-start justify-between shrink-0",
                    isMobile ? "cursor-grab active:cursor-grabbing" : "",
                    headerClass,
                )}
                ontouchstart={onTouchStart}
                ontouchmove={onTouchMove}
                ontouchend={onTouchEnd}
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
            <div class="shrink-0">
                {@render footer()}
            </div>
        {/if}
    {/snippet}

    <div
        class={twMerge(
            "fixed inset-0 z-60 flex justify-center",
            isMobile ? "items-end p-0 sm:p-4" : "items-center p-4",
        )}
    >
        <!-- Soft Backdrop -->
        <div
            class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onclick={() => closeOnClickOutside && onClose()}
            role="button"
            tabindex="-1"
            onkeydown={() => {}}
            transition:fade={{ duration: 200 }}
        ></div>

        <!-- Modal Content -->
        {#if !isMobile}
            <!-- Desktop variant (Centered) -->
            <div
                class={twMerge(
                    "relative z-10 w-full bg-app-surface border border-app-border shadow-2xl flex flex-col rounded-3xl overflow-hidden max-h-[90vh]",
                    className,
                )}
                transition:scale={{
                    duration: 300,
                    easing: quintOut,
                    start: 0.95,
                }}
                role="dialog"
                aria-modal="true"
            >
                {@render modalInner()}
            </div>
        {:else}
            <!-- Mobile variant (Bottom Sheet) -->
            <div
                class={twMerge(
                    "relative z-10 w-full bg-app-surface border-x border-t border-app-border shadow-2xl flex flex-col rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden max-h-[96vh]",
                    className,
                )}
                style:transform={dragY > 0 ? `translateY(${dragY}px)` : ""}
                style:transition={isDragging
                    ? "none"
                    : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.125)"}
                in:fly={{ y: innerHeight, duration: 450, easing: quintOut }}
                out:fly={{ y: innerHeight, duration: 300, easing: quintOut }}
                role="dialog"
                aria-modal="true"
            >
                {@render modalInner()}
            </div>
        {/if}
    </div>
{/if}
