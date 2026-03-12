<script lang="ts">
    import {
        Refrigerator,
        History,
        Package,
        AlertCircle,
    } from "lucide-svelte";

    interface FridgeItem {
        id: string;
        name: string;
        date: string;
        daysAgo: number;
        type: "leftover" | "ingredient";
        image?: string;
    }

    const leftovers: FridgeItem[] = [
        {
            id: "l1",
            name: "Homemade Beef Stew",
            date: "Today",
            daysAgo: 0,
            type: "leftover",
            image: "/mockup/bolognese.png",
        },
        {
            id: "l2",
            name: "Lemon Herb Chicken",
            date: "3 days ago",
            daysAgo: 3,
            type: "leftover",
            image: "/mockup/tuna.png",
        },
        {
            id: "l3",
            name: "Garlic Pasta",
            date: "6 days ago",
            daysAgo: 6,
            type: "leftover",
            image: "/mockup/pasta.png",
        },
    ];

    const ingredients: FridgeItem[] = [
        {
            id: "i1",
            name: "Organic Eggs",
            date: "1 day ago",
            daysAgo: 1,
            type: "ingredient",
            image: "/mockup/avocado.png",
        },
        {
            id: "i2",
            name: "Whole Milk",
            date: "2 days ago",
            daysAgo: 2,
            type: "ingredient",
            image: "/mockup/yogurt.png",
        },
        {
            id: "i3",
            name: "Butter",
            date: "5 days ago",
            daysAgo: 5,
            type: "ingredient",
        },
    ];

    let activeTab = $state<"leftover" | "ingredient">("leftover");
    let activeItems = $derived(activeTab === "leftover" ? leftovers : ingredients);

    function getBadgeStyles(daysAgo: number) {
        if (daysAgo <= 1) {
            return "bg-emerald-100/80 text-emerald-700 border-emerald-200";
        }
        if (daysAgo <= 4) {
            return "bg-amber-100/80 text-amber-700 border-amber-200";
        }
        return "bg-red-100/80 text-red-700 border-red-200";
    }
</script>

<div class="w-full max-w-4xl mx-auto">
    <div
        class="bg-app-surface border border-app-border rounded-2xl shadow-md overflow-hidden relative"
    >
        <!-- Top Toolbar -->
        <div
            class="bg-white border-b border-app-border px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
            <div class="flex items-center gap-3 w-full sm:w-auto">
                <div
                    class="p-2 bg-app-primary/10 text-app-primary rounded-lg shrink-0"
                >
                    <Refrigerator size={20} />
                </div>
                <div>
                    <h3
                        class="font-black text-app-text tracking-tight whitespace-nowrap"
                    >
                        Fridge Inventory
                    </h3>
                </div>
            </div>

            <!-- Tab Switcher (Static, no transition animation) -->
            <div
                class="flex p-1 bg-app-surface border border-app-border rounded-xl w-full sm:w-auto overflow-x-auto"
            >
                <button
                    onclick={() => (activeTab = "leftover")}
                    class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 rounded-lg text-sm {activeTab ===
                    'leftover'
                        ? 'bg-app-primary text-white font-black'
                        : 'text-app-text-muted font-bold'}"
                >
                    <History
                        size={16}
                        class={activeTab === "leftover" ? "text-white" : ""}
                    />
                    <span class="whitespace-nowrap">Leftovers</span>
                </button>
                <button
                    onclick={() => (activeTab = "ingredient")}
                    class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 rounded-lg text-sm {activeTab ===
                    'ingredient'
                        ? 'bg-app-primary text-white font-black'
                        : 'text-app-text-muted font-bold'}"
                >
                    <Package
                        size={16}
                        class={activeTab === "ingredient" ? "text-white" : ""}
                    />
                    <span class="whitespace-nowrap">Ingredients</span>
                </button>
            </div>
        </div>

        <div class="h-[380px] overflow-hidden bg-white/50 relative">
            <div class="p-6 grid grid-cols-1 items-start">
                <div class="space-y-3 col-start-1 row-start-1 w-full">
                    {#each activeItems as item (item.id)}
                        <div
                            class="flex items-center justify-between p-4 bg-white border border-app-border rounded-2xl"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-app-border {item.type ===
                                    'leftover'
                                        ? 'bg-app-surface text-app-text-muted'
                                        : 'bg-emerald-50 text-emerald-500'}"
                                >
                                    {#if item.image}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            class="w-full h-full object-cover"
                                        />
                                    {:else}
                                        <Package size={20} />
                                    {/if}
                                </div>

                                <div>
                                    <h4 class="font-bold text-app-text text-sm">
                                        {item.name}
                                    </h4>
                                    <div
                                        class="inline-block mt-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider {getBadgeStyles(
                                            item.daysAgo,
                                        )}"
                                    >
                                        {item.date}
                                    </div>
                                </div>
                            </div>

                            {#if item.daysAgo >= 5}
                                <span
                                    class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                >
                                    Throw away
                                </span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Bottom Stat Bar -->
        <div
            class="bg-app-surface px-6 py-3 border-t border-app-border flex items-center justify-between text-xs text-app-text-muted font-bold"
        >
            <div class="flex items-center gap-4">
                <span class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    {activeItems.filter((i) => i.daysAgo < 2).length} Fresh
                </span>
                <span class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    1 Overdue
                </span>
            </div>
            {#if activeItems.filter((i) => i.daysAgo >= 4).length > 0}
                <div class="flex items-center gap-2">
                    <AlertCircle size={14} class="text-red-500" />
                    <span class="text-red-500 uppercase tracking-wider text-[10px]"
                        >{activeItems.filter((i) => i.daysAgo >= 4).length} urgent</span
                    >
                </div>
            {/if}
        </div>
    </div>
</div>
