<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        children?: Snippet;
    }

    let { title, children }: Props = $props();
</script>

<header
    class="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-6 shrink-0 z-20 relative"
>
    <div class="flex items-center gap-4">
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
