<script lang="ts">
    import { ShoppingCart } from "lucide-svelte";
    import { scale } from "svelte/transition";

    interface Props {
        onclick?: () => void;
        itemCount?: number;
    }

    let { onclick, itemCount = 0 }: Props = $props();
</script>

<button
    class="p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-hover rounded-full transition-colors relative group"
    {onclick}
    aria-label="Open Shopping Cart"
>
    <div class="relative">
        <ShoppingCart
            size={24}
            class="transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
        />
        {#if itemCount > 0}
            <span
                transition:scale={{ duration: 200, start: 0.5 }}
                class="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#c2410c] text-[10px] font-black text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-2 border-app-bg select-none"
            >
                {itemCount > 99 ? "99+" : itemCount}
            </span>
        {/if}
    </div>
</button>
