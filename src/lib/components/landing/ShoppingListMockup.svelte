<script lang="ts">
    import { onMount } from "svelte";
    import {
        ShoppingBag,
        Refrigerator,
        CheckCircle2,
        Pointer,
    } from "lucide-svelte";
    import { shoppingItems } from "$lib/data/landingData";
    import { fade, slide, scale as svelteScale } from "svelte/transition";

    interface Props {
        restartKey?: number;
    }

    let { restartKey = 0 }: Props = $props();

    let animationContainer: HTMLDivElement | undefined = $state();
    let checkFridgeBtn: HTMLButtonElement | undefined = $state();
    let handCursor: HTMLDivElement | undefined = $state();
    let scanLineTop = $state(0);
    let itemsState = $state(
        shoppingItems.map((item) => ({
            ...item,
            found: false,
            checked: false,
        })),
    );
    let isChecking = $state(false);
    let showScanLine = $state(false);

    // Animation constants
    const ANIMATION_DURATION = 8000;
    let animationStartTime = 0;
    let animationFrame: number | null = null;

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

    function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    function resetAnimation() {
        itemsState = shoppingItems.map((item) => ({
            ...item,
            found: false,
            checked: false,
        }));
        isChecking = false;
        showScanLine = false;
    }

    function animate(timestamp: number) {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsed = (timestamp - animationStartTime) % ANIMATION_DURATION;
        const progress = elapsed / ANIMATION_DURATION;

        if (progress < 0.01) {
            resetAnimation();
        }

        const btnPos = getRelativePosition(checkFridgeBtn, animationContainer);

        if (handCursor) {
            let x = 0,
                y = 0,
                opacity = 0,
                scale = 1;

            if (progress < 0.15) {
                // Move towards button
                const t = progress / 0.15;
                x = lerp(400, btnPos.x, easeInOutCubic(t));
                y = lerp(400, btnPos.y, easeInOutCubic(t));
                opacity = t * 2;
            } else if (progress < 0.2) {
                // Click animation
                x = btnPos.x;
                y = btnPos.y;
                opacity = 1;
                scale = 0.9;
                if (!isChecking) isChecking = true;
            } else if (progress < 0.3) {
                // Move away
                const t = (progress - 0.2) / 0.1;
                x = lerp(btnPos.x, btnPos.x + 100, easeInOutCubic(t));
                y = lerp(btnPos.y, btnPos.y + 50, easeInOutCubic(t));
                opacity = 1 - t;
            } else {
                opacity = 0;
            }

            handCursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            handCursor.style.opacity = String(Math.min(1, opacity));
        }

        // Handle item logic
        if (progress > 0.3 && progress < 0.55) {
            if (!showScanLine) showScanLine = true;
            const scanProgress = (progress - 0.3) / 0.25;
            scanLineTop = scanProgress * 100;

            // Scan through items
            itemsState.forEach((item, i) => {
                const itemThreshold = i / itemsState.length;
                if (
                    scanProgress > itemThreshold &&
                    item.inFridge &&
                    !item.found
                ) {
                    item.found = true;
                }
            });
        }

        if (progress > 0.6 && progress < 0.75) {
            // Check off found items
            itemsState.forEach((item) => {
                if (item.found && !item.checked) {
                    item.checked = true;
                }
            });
            showScanLine = false;
            isChecking = false;
        }

        animationFrame = requestAnimationFrame(animate);
    }

    onMount(() => {
        animationFrame = requestAnimationFrame(animate);
        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    });

    $effect(() => {
        if (restartKey > 0) {
            animationStartTime = 0;
            resetAnimation();
        }
    });
</script>

<div class="w-full max-w-4xl mx-auto">
    <div
        class="bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-hidden relative"
    >
        <!-- Browser Chrome -->
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
            <!-- Main Content -->
            <div
                class="flex-1 bg-app-bg p-6 md:p-10 overflow-hidden relative"
                bind:this={animationContainer}
            >
                <!-- Header Actions -->
                <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
                >
                    <div>
                        <h2
                            class="text-2xl font-black text-app-text tracking-tight"
                        >
                            Shopping List
                        </h2>
                        <p class="text-sm text-app-text-muted">
                            10 items total to purchase
                        </p>
                    </div>

                    <button
                        bind:this={checkFridgeBtn}
                        class="flex items-center justify-center gap-2 px-8 py-3.5 bg-app-primary text-white rounded-2xl font-bold shadow-lg shadow-app-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                    >
                        {#if isChecking}
                            <div
                                class="absolute inset-0 bg-white/20 animate-pulse"
                            ></div>
                        {/if}
                        <Refrigerator size={18} />
                        <span>Check Fridge</span>
                    </button>
                </div>

                <!-- Items List -->
                <div class="space-y-1 relative">
                    {#each itemsState as item}
                        <div
                            class="flex items-center gap-4 py-3 px-2 border-b border-app-border/30 last:border-0 transition-all duration-500 {item.checked
                                ? 'opacity-40 translate-x-1'
                                : 'hover:bg-app-primary/5 rounded-lg'}"
                        >
                            <div
                                class="w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 {item.checked
                                    ? 'bg-app-primary border-app-primary text-white shadow-lg shadow-app-primary/20'
                                    : 'border-app-border bg-transparent hover:border-app-primary/50'}"
                            >
                                {#if item.checked}
                                    <div in:svelteScale={{ duration: 200 }}>
                                        <CheckCircle2 size={18} />
                                    </div>
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

                            {#if item.found}
                                <div
                                    in:slide={{ axis: "x", duration: 400 }}
                                    class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/10 backdrop-blur-sm"
                                >
                                    <CheckCircle2 size={12} />
                                    <span
                                        class="text-[9px] font-black uppercase tracking-wider"
                                        >In Fridge</span
                                    >
                                </div>
                            {/if}
                        </div>
                    {/each}

                    <!-- Scan Line -->
                    {#if showScanLine}
                        <div
                            class="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-app-primary to-transparent shadow-[0_0_15px_rgba(251,146,60,0.5)] z-20 pointer-events-none"
                            style="top: {scanLineTop}%;"
                        ></div>
                    {/if}
                </div>

                <!-- Cursor Animation Layer -->
                <div
                    bind:this={handCursor}
                    class="absolute pointer-events-none z-50 opacity-0"
                >
                    <Pointer
                        size={32}
                        fill="#fff"
                        strokeWidth={1.5}
                        class="drop-shadow-2xl"
                    />
                    <div
                        class="absolute top-2 left-2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-app-primary/30 rounded-full blur-md animate-ping"
                    ></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Highlight -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="p-6 bg-app-surface border border-app-border rounded-2xl">
            <div
                class="w-10 h-10 bg-app-primary/10 rounded-xl flex items-center justify-center text-app-primary mb-4"
            >
                <ShoppingBag size={20} />
            </div>
            <h4 class="font-bold text-app-text mb-2">Smart Consolidation</h4>
            <p class="text-sm text-app-text-muted leading-relaxed">
                YumHero automatically groups identical ingredients from
                different recipes to save you time.
            </p>
        </div>
        <div class="p-6 bg-app-surface border border-app-border rounded-2xl">
            <div
                class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4"
            >
                <Refrigerator size={20} />
            </div>
            <h4 class="font-bold text-app-text mb-2">Inventory Sync</h4>
            <p class="text-sm text-app-text-muted leading-relaxed">
                Avoid buying what you already have. One click checks your
                digital fridge and marks found items.
            </p>
        </div>
        <div class="p-6 bg-app-surface border border-app-border rounded-2xl">
            <div
                class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4"
            >
                <ShoppingBag size={20} />
            </div>
            <h4 class="font-bold text-app-text mb-2">Real-time Checkoff</h4>
            <p class="text-sm text-app-text-muted leading-relaxed">
                Cross off items as you shop. Progress syncs instantly across all
                your family members' devices.
            </p>
        </div>
    </div>
</div>

<style>
    @keyframes scan {
        0% {
            top: 0;
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            top: 100%;
            opacity: 0;
        }
    }
</style>
