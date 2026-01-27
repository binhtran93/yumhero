<script lang="ts">
    import type { Snippet } from "svelte";

    import { ChevronLeft } from "lucide-svelte";

    interface Props {
        title: string;
        showBack?: boolean;
        backUrl?: string;
        children?: Snippet;
    }

    let { title, showBack = false, backUrl = "/", children }: Props = $props();
</script>

<header
    class="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-6 shrink-0 z-20 relative"
>
    <div class="flex items-center gap-4">
        {#if showBack}
            <a
                href={backUrl}
                class="p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-bg-default rounded-full transition-colors"
                aria-label="Go back"
            >
                <ChevronLeft size={24} />
            </a>
        {/if}
        <h1
            class="text-xl font-bold tracking-tight text-action-primary font-display"
        >
            {title}
        </h1>
    </div>

    <div class="flex items-center gap-2">
        {@render children?.()}
    </div>
</header>
