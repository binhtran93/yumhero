<script lang="ts">
    import { UtensilsCrossed, Image as ImageIcon } from "lucide-svelte";
    import { fade } from "svelte/transition";

    interface Props {
        src?: string;
        alt: string;
        class?: string;
    }

    let { src, alt, class: className = "" }: Props = $props();

    let loaded = $state(false);
    let error = $state(false);

    function handleLoad() {
        loaded = true;
    }

    function handleError() {
        error = true;
        loaded = true; // Stop skeleton if error
    }
</script>

<div class="relative overflow-hidden bg-app-surface-hover shrink-0 {className}">
    <!-- Placeholder / Skeleton (Always present until loaded) -->
    {#if !loaded && !error && src}
        <div
            class="absolute inset-0 bg-app-surface-hover animate-pulse flex items-center justify-center text-app-text-muted/20"
        >
            <ImageIcon size={24} />
        </div>
    {/if}

    <!-- Actual Image -->
    {#if src && !error}
        <img
            {src}
            {alt}
            loading="lazy"
            class="w-full h-full object-cover transition-opacity duration-500 {loaded
                ? 'opacity-100'
                : 'opacity-0'}"
            onload={handleLoad}
            onerror={handleError}
        />
    {/if}

    <!-- Fallback (No Src or Error) -->
    {#if !src || error}
        <div
            class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100 text-orange-300 p-1.5"
            transition:fade
        >
            <UtensilsCrossed size={28} />
        </div>
    {/if}
</div>
