<script lang="ts">
    import {
        Refrigerator,
        Trash2,
        Pointer,
        Smartphone,
        History,
        Package,
        AlertCircle,
        Clock,
    } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";
    import { fade, slide, scale as svelteScale } from "svelte/transition";

    // --- Types and Mock Data ---
    interface FridgeItem {
        id: string;
        name: string;
        date: string; // e.g. "Today", "3d ago"
        daysAgo: number;
        type: "leftover" | "ingredient";
        image?: string;
    }

    const initialLeftovers: FridgeItem[] = [
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

    const initialIngredients: FridgeItem[] = [
        {
            id: "i1",
            name: "Organic Eggs",
            date: "1 day ago",
            daysAgo: 1,
            type: "ingredient",
            image: "/mockup/avocado.png", // Using as placeholder
        },
        {
            id: "i2",
            name: "Whole Milk",
            date: "2 days ago",
            daysAgo: 2,
            type: "ingredient",
            image: "/mockup/yogurt.png", // Using as placeholder
        },
        {
            id: "i3",
            name: "Butter",
            date: "5 days ago",
            daysAgo: 5,
            type: "ingredient",
        },
    ];

    // --- Component State ---
    let activeTab = $state<"leftover" | "ingredient">("leftover");
    let leftovers = $state([...initialLeftovers]);
    let ingredients = $state([...initialIngredients]);
    let activeItems = $derived(
        activeTab === "leftover" ? leftovers : ingredients,
    );

    let isRemoving = $state(false);
    let itemToHighlightId = $state<string | null>(null);

    // --- Animation State ---
    let animationContainer: HTMLElement | undefined = $state();
    let trashBtn: HTMLElement | undefined = $state();
    let handCursor: HTMLElement | undefined = $state();

    let animationStartTime: number | null = null;
    let requestAnimationFrameId: number;

    const ANIMATION_DURATION = 10000; // 10 seconds loop

    function getRelativePosition(
        element: HTMLElement | undefined,
        container: HTMLElement | undefined,
    ) {
        if (!element || !container) return { x: 0, y: 0 };
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2,
        };
    }

    function lerp(start: number, end: number, t: number) {
        return start + (end - start) * t;
    }

    function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function resetDemo() {
        leftovers = [...initialLeftovers];
        ingredients = [...initialIngredients];
        isRemoving = false;
        itemToHighlightId = null;
        activeTab = "leftover";
    }

    function handleManualTrigger() {
        // Jump progress to exactly 0.2 (2000ms) to start mouse movement immediately
        const now = performance.now();
        animationStartTime = now - 2000;
        // Reset removing state in case we're interrupting a previous loop
        isRemoving = false;
    }

    function animate(timestamp: number) {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsed = (timestamp - animationStartTime) % ANIMATION_DURATION;
        const progress = elapsed / ANIMATION_DURATION;

        if (progress < 0.01) {
            resetDemo();
        }

        const targetItemId = activeTab === "leftover" ? "l3" : "i3";
        const btnId = `trash-${targetItemId}`;
        const targetBtn = document.getElementById(btnId);

        if (handCursor && animationContainer) {
            let x = 0,
                y = 0,
                opacity = 0,
                scale = 1;

            if (targetBtn) {
                const targetPos = getRelativePosition(
                    targetBtn,
                    animationContainer,
                );

                // Start position (off-screen bottom)
                const startX = targetPos.x + 150;
                const startY = targetPos.y + 250;

                if (progress < 0.2) {
                    // Phase 1: Show the list (2 seconds)
                    opacity = 0;
                } else if (progress < 0.35) {
                    // Phase 2: Move to button (1.5 seconds)
                    const t = (progress - 0.2) / 0.15;
                    x = lerp(startX, targetPos.x, easeInOutCubic(t));
                    y = lerp(startY, targetPos.y, easeInOutCubic(t));
                    opacity = Math.min(1, t * 5);
                } else if (progress < 0.45) {
                    // Phase 3: Click button (1 second)
                    const t = (progress - 0.35) / 0.1;
                    x = targetPos.x;
                    y = targetPos.y;
                    opacity = 1;

                    // Click effect
                    const clickScale = t < 0.3 ? 0.85 : 1;
                    scale = clickScale;

                    if (t > 0.15 && !isRemoving) {
                        isRemoving = true;
                        // Trigger removal
                        setTimeout(() => {
                            if (activeTab === "leftover") {
                                leftovers = leftovers.filter(
                                    (it) => it.id !== targetItemId,
                                );
                            } else {
                                ingredients = ingredients.filter(
                                    (it) => it.id !== targetItemId,
                                );
                            }
                            isRemoving = false;
                        }, 500);
                    }
                } else if (progress < 0.6) {
                    // Phase 4: Move away (1.5 seconds)
                    const t = (progress - 0.45) / 0.15;
                    x = lerp(targetPos.x, targetPos.x + 80, easeInOutCubic(t));
                    y = lerp(targetPos.y, targetPos.y + 40, easeInOutCubic(t));
                    opacity = 1 - t;
                } else {
                    opacity = 0;
                }
            }

            handCursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            handCursor.style.opacity = String(opacity);
        }

        requestAnimationFrameId = requestAnimationFrame(animate);
    }

    onMount(() => {
        requestAnimationFrameId = requestAnimationFrame(animate);
    });

    onDestroy(() => {
        cancelAnimationFrame(requestAnimationFrameId);
    });

    function getBadgeStyles(daysAgo: number) {
        if (daysAgo <= 1)
            return "bg-emerald-100/80 text-emerald-700 border-emerald-200";
        if (daysAgo <= 4)
            return "bg-amber-100/80 text-amber-700 border-amber-200";
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

            <!-- Tab Switcher -->
            <div
                class="flex p-1 bg-app-surface border border-app-border rounded-xl w-full sm:w-auto overflow-x-auto"
            >
                <button
                    onclick={() => (activeTab = "leftover")}
                    class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 rounded-lg text-sm transition-all duration-300 {activeTab ===
                    'leftover'
                        ? 'bg-app-primary text-white shadow-lg font-black'
                        : 'text-app-text-muted hover:text-app-text font-bold'}"
                >
                    <History
                        size={16}
                        class={activeTab === "leftover" ? "text-white" : ""}
                    />
                    <span class="whitespace-nowrap">Leftovers</span>
                </button>
                <button
                    onclick={() => (activeTab = "ingredient")}
                    class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 rounded-lg text-sm transition-all duration-300 {activeTab ===
                    'ingredient'
                        ? 'bg-app-primary text-white shadow-lg font-black'
                        : 'text-app-text-muted hover:text-app-text font-bold'}"
                >
                    <Package
                        size={16}
                        class={activeTab === "ingredient" ? "text-white" : ""}
                    />
                    <span class="whitespace-nowrap">Ingredients</span>
                </button>
            </div>
        </div>

        <div
            bind:this={animationContainer}
            class="h-[380px] overflow-hidden bg-white/50 relative"
        >
            <div class="p-6 grid grid-cols-1 items-start">
                {#key activeTab}
                    {@const items =
                        activeTab === "leftover" ? leftovers : ingredients}
                    <div
                        class="space-y-3 col-start-1 row-start-1 w-full"
                        in:fade={{ duration: 250, delay: 250 }}
                        out:fade={{ duration: 200 }}
                    >
                        {#each items as item (item.id)}
                            <div
                                out:slide={{ duration: 400 }}
                                class="group flex items-center justify-between p-4 bg-white border border-app-border rounded-2xl transition-all hover:border-app-primary/30 hover:shadow-sm"
                            >
                                <div class="flex items-center gap-4">
                                    <!-- Thumbnail or Icon based on item data -->
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
                                        <h4
                                            class="font-bold text-app-text text-sm"
                                        >
                                            {item.name}
                                        </h4>
                                        <!-- Date Badge Under Name -->
                                        <div
                                            class="inline-block mt-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider {getBadgeStyles(
                                                item.daysAgo,
                                            )}"
                                        >
                                            {item.date}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-4">
                                    {#if item.daysAgo >= 5}
                                        <!-- Action Button -->
                                        <button
                                            id="trash-{item.id}"
                                            onclick={(e) => {
                                                e.preventDefault();
                                                handleManualTrigger();
                                            }}
                                            class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                                        >
                                            Throw away
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/key}
            </div>

            <!-- Hand Cursor -->
            <div
                bind:this={handCursor}
                class="absolute top-0 left-0 pointer-events-none z-[100] opacity-0 will-change-transform"
            >
                <div class="hidden md:block">
                    <!-- Tip is at top-left of the icon box -->
                    <Pointer
                        size={28}
                        fill="#fff"
                        strokeWidth={1.5}
                        class="drop-shadow-2xl -translate-x-1 -translate-y-1"
                    />
                </div>
                <!-- Mobile Touch Circle -->
                <div
                    class="md:hidden w-10 h-10 rounded-full bg-gray-400/20 border border-gray-400/40 backdrop-blur-[2px] shadow-xl -translate-x-1/2 -translate-y-1/2"
                ></div>

                <!-- Click Effect Ping -->
                <div
                    class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-red-500/20 rounded-full blur-md opacity-0 transition-opacity duration-200"
                    class:opacity-100={isRemoving}
                    style="transform: translate(-50%, -50%) scale({isRemoving
                        ? 1.5
                        : 0.5}); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);"
                ></div>
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
                <div
                    class="flex items-center gap-2"
                    out:fade={{ duration: 200 }}
                >
                    <AlertCircle size={14} class="text-red-500" />
                    <span
                        class="text-red-500 uppercase tracking-wider text-[10px]"
                        >{activeItems.filter((i) => i.daysAgo >= 4).length} urgent</span
                    >
                </div>
            {/if}
        </div>
    </div>
</div>
