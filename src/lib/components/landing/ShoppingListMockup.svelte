<script lang="ts">
    import { Check } from "lucide-svelte";
    import { shoppingItems } from "$lib/data/landingData";

    const itemsState = shoppingItems.map((item, index) => ({
        ...item,
        checked: index < 4,
    }));
</script>

<div class="w-full max-w-4xl mx-auto">
    <div
        class="bg-app-surface border border-app-border rounded-2xl shadow-md overflow-hidden relative"
    >
        <div
            class="flex items-center justify-between px-6 py-4 bg-app-surface-hover border-b border-app-border"
        >
            <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>
            <div
                class="bg-app-bg/50 px-4 py-1.5 rounded-lg text-[10px] font-medium text-app-text-muted border border-app-border/30 w-64 text-center"
            >
                yumhero.app/shopping-list
            </div>
            <div class="w-12"></div>
        </div>

        <div class="flex h-[720px]">
            <div class="flex-1 bg-app-bg p-6 md:p-10 overflow-hidden relative">
                <div class="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <h2
                            class="text-xl md:text-2xl font-black text-app-text tracking-tight"
                        >
                            Grocery list
                        </h2>
                    </div>

                    <div
                        class="flex items-center justify-center gap-2 px-4 py-2.5 bg-app-primary/10 text-app-primary rounded-xl text-xs md:text-sm font-bold border border-app-primary/20"
                    >
                        <Check size={16} class="md:w-[18px] md:h-[18px]" />
                        <span>Some items done</span>
                    </div>
                </div>

                <div class="space-y-1 relative">
                    {#each itemsState as item}
                        <div
                            class="flex items-center gap-4 py-3 px-2 {item.checked
                                ? 'opacity-85'
                                : 'opacity-100'}"
                        >
                            <div
                                class="w-6 h-6 rounded-md border flex items-center justify-center {item.checked
                                    ? 'bg-app-primary border-app-primary text-white'
                                    : 'border-app-border-strong bg-transparent'}"
                            >
                                {#if item.checked}
                                    <Check size={14} strokeWidth={4} />
                                {/if}
                            </div>

                            <div class="flex-1 flex items-baseline gap-2">
                                <span
                                    class="text-[15px] font-bold text-app-text {item.checked
                                        ? 'line-through decoration-2'
                                        : ''}"
                                >
                                    {item.name}
                                </span>

                                <div class="flex items-baseline gap-1">
                                    <span
                                        class="text-sm font-black text-app-primary"
                                    >
                                        {item.amount.split(" ")[0]}
                                    </span>
                                    <span
                                        class="text-[11px] font-medium text-app-text-muted uppercase tracking-tight"
                                    >
                                        {item.amount
                                            .split(" ")
                                            .slice(1)
                                            .join(" ")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
