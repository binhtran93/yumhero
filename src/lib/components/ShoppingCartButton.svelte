<script lang="ts">
    import { ShoppingCart } from "lucide-svelte";

    interface Props {
        onclick?: () => void;
        itemCount?: number;
    }

    let { onclick, itemCount = 0 }: Props = $props();
</script>

<button
    class="p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors relative"
    {onclick}
    aria-label="Open Shopping Cart"
>
    <ShoppingCart size={24} />
    {#if itemCount > 0}
        <span
            class="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
        >
            {itemCount}
        </span>
    {/if}
</button>
