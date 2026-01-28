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
    class="h-16 border-b border-app-border bg-app-surface flex items-center justify-between px-6 shrink-0 z-20 relative"
>
    <div class="flex items-center gap-4">
        {#if showBack}
            <a
                href={backUrl}
                class="p-2 -ml-2 text-app-text-muted hover:text-app-text hover:bg-app-bg rounded-full transition-colors"
                aria-label="Go back"
            >
                <ChevronLeft size={24} />
            </a>
        {/if}
        <h1
            class="text-xl font-bold tracking-tight text-app-primary font-display"
        >
            {title}
        </h1>
    </div>

    <div class="flex items-center gap-2">
        {@render children?.()}
    </div>
</header>
