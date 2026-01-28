<script lang="ts">
    import { Filter, Check } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import type { Tag } from "$lib/types";

    interface Props {
        activeFilter: string;
        tags: Tag[];
        class?: string;
    }

    let {
        activeFilter = $bindable(),
        tags,
        class: className,
    }: Props = $props();

    let isOpen = $state(false);

    function toggleDropdown(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        isOpen = !isOpen;
    }

    function closeDropdown() {
        isOpen = false;
    }

    // Handle clicking outside of menu
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node) && isOpen) {
                closeDropdown();
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }
</script>

<div class="relative {className}" use:clickOutside>
    <button
        onclick={toggleDropdown}
        class="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-default rounded-full transition-colors relative"
        aria-label="Filter recipes"
        title="Filter by tag"
    >
        <Filter size={20} />
        {#if activeFilter !== "All"}
            <span
                class="absolute top-1 right-1 w-2.5 h-2.5 bg-action-primary rounded-full border-2 border-bg-surface"
            ></span>
        {/if}
    </button>

    {#if isOpen}
        <div
            transition:fade={{ duration: 100 }}
            class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-border-default py-1 z-50 overflow-hidden"
        >
            <div class="px-3 py-2 border-b border-border-default mb-1">
                <span
                    class="text-xs font-bold text-text-secondary uppercase tracking-wider"
                    >Filter by Tag</span
                >
            </div>

            <div class="max-h-64 overflow-y-auto">
                <button
                    class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-hover flex items-center justify-between transition-colors"
                    onclick={() => {
                        activeFilter = "All";
                        closeDropdown();
                    }}
                >
                    <span class={activeFilter === "All" ? "font-bold" : ""}
                        >All Recipes</span
                    >
                    {#if activeFilter === "All"}
                        <Check size={16} class="text-action-primary" />
                    {/if}
                </button>

                {#each tags as tag}
                    <button
                        class="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-hover flex items-center justify-between transition-colors"
                        onclick={() => {
                            activeFilter = tag.label;
                            closeDropdown();
                        }}
                    >
                        <span
                            class={activeFilter === tag.label
                                ? "font-bold"
                                : ""}>{tag.label}</span
                        >
                        {#if activeFilter === tag.label}
                            <Check size={16} class="text-action-primary" />
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
