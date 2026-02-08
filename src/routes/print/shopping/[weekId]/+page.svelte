<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";
    import { getWeekShoppingListStore } from "$lib/stores/shoppingList";
    import type { ShoppingListItem } from "$lib/types";
    import { Fraction } from "$lib/utils/fraction";
    import { Loader2, Printer, X } from "lucide-svelte";
    import "../../../../app.css";

    const weekId = $page.params.weekId ?? "";

    const getWeekDate = (id: string) => {
        const parts = id.split("-").map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const getWeekRangeLabel = (startDate: Date) => {
        const end = new Date(startDate);
        end.setDate(startDate.getDate() + 6);
        const format = (d: Date) =>
            d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        return `${format(startDate)} - ${format(end)}, ${startDate.getFullYear()}`;
    };

    const weekStartDate = getWeekDate(weekId);
    const weekLabel = getWeekRangeLabel(weekStartDate);

    let isLoading = $state(true);
    let shoppingList = $state<ShoppingListItem[]>([]);

    $effect(() => {
        if (!$authLoading) {
            if (!$user) {
                goto(`/login?redirect=/print/shopping/${weekId}`, {
                    replaceState: true,
                });
            } else if (!$subscriptionLoading && !$isSubscribed) {
                goto("/subscribe", { replaceState: true });
            }
        }
    });

    $effect(() => {
        const store = getWeekShoppingListStore(weekId);
        const unsubscribe = store.subscribe((state) => {
            isLoading = state.loading;
            shoppingList = state.data || [];
        });

        return () => unsubscribe();
    });

    const printItems = $derived(
        [...shoppingList]
            .filter((item) => item && item.id)
            .sort((a, b) =>
                a.ingredient_name.localeCompare(b.ingredient_name),
            ),
    );

    const formatLine = (item: ShoppingListItem): string => {
        const totalAmount = item.sources.reduce(
            (sum, source) => sum + (source.amount || 0),
            0,
        );
        const unit = item.sources[0]?.unit || "";
        const amountText =
            totalAmount > 0
                ? `${Fraction.format(totalAmount)} ${unit}`.trim()
                : "";
        return amountText
            ? `${amountText} ${item.ingredient_name}`
            : item.ingredient_name;
    };

    onMount(() => {
        const checkLoaded = setInterval(() => {
            if (!isLoading) {
                clearInterval(checkLoaded);
                setTimeout(() => {
                    window.print();
                }, 450);
            }
        }, 100);

        return () => clearInterval(checkLoaded);
    });
</script>

<svelte:head>
    <title>YumHero Shopping List ({weekLabel})</title>
</svelte:head>

<div
    class="bg-slate-100 min-h-screen w-full flex md:justify-center items-start p-4 sm:p-8 print:p-0 print:bg-white overflow-auto print:min-h-0 relative"
>
    {#if isLoading}
        <div
            class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-4 print:hidden"
        >
            <Loader2 class="w-10 h-10 text-app-primary animate-spin" />
            <p class="text-app-text-muted font-bold animate-pulse">
                Preparing your shopping list...
            </p>
        </div>
    {/if}

    <div
        class="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none flex flex-col p-[10mm] print:p-0 shrink-0 mb-20 print:mb-0 print:h-auto print:max-h-full print:w-full print:overflow-visible mx-auto md:mx-0"
    >
        <div class="flex items-center justify-between border-b-2 border-app-primary pb-2 mb-4">
            <h1 class="text-[16pt] font-black text-app-primary m-0">
                YumHero Shopping List
            </h1>
            <p class="text-app-text-muted font-bold text-[8pt] m-0">
                {weekLabel}
            </p>
        </div>

        {#if printItems.length === 0}
            <p class="text-[10pt] text-app-text-muted font-semibold">
                No shopping items for this week.
            </p>
        {:else}
            <div class="columns-2 gap-8">
                {#each printItems as item (item.id)}
                    <div
                        class="break-inside-avoid mb-1.5 py-1 flex items-start gap-2"
                    >
                        <div
                            class="w-3.5 h-3.5 border-2 border-stone-500 mt-0.5 shrink-0"
                        ></div>
                        <p
                            class="text-[10pt] font-semibold text-app-text leading-tight lowercase"
                        >
                            {formatLine(item)}
                        </p>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div
        class="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 print:hidden z-50 bg-white/80 backdrop-blur-md p-2 rounded-full border border-gray-200 shadow-2xl max-w-[95vw]"
    >
        <button
            onclick={() => window.print()}
            class="px-4 sm:px-8 py-3 bg-app-primary text-white rounded-full font-black shadow-lg hover:scale-105 transition-transform flex items-center gap-2 group whitespace-nowrap"
        >
            <Printer class="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
            <span class="text-sm sm:text-base">Print List</span>
        </button>

        <button
            onclick={() => window.close()}
            class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-gray-400 font-black rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shrink-0"
            title="Close"
        >
            <X class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
    </div>
</div>

<style>
    @media print {
        @page {
            size: A4 portrait;
            margin: 0;
        }
        :global(body) {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
            padding: 10mm;
        }
    }
</style>
