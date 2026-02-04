<script lang="ts">
    import { onMount } from "svelte";
    import {
        ShoppingBag,
        Refrigerator,
        CheckCircle2,
        Check,
        Pointer,
        Smartphone,
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

        const targetPos = getRelativePosition(
            checkFridgeBtn,
            animationContainer,
        );

        if (handCursor) {
            let x = 0,
                y = 0,
                opacity = 0,
                scale = 1;

            // Start position (bottom right-ish)
            const startX = targetPos.x + 300;
            const startY = targetPos.y + 400;

            if (progress < 0.15) {
                // Move towards button
                const t = progress / 0.15;
                x = lerp(startX, targetPos.x, easeInOutCubic(t));
                y = lerp(startY, targetPos.y, easeInOutCubic(t));
                opacity = Math.min(1, t * 5);
            } else if (progress < 0.25) {
                // Click and wait
                x = targetPos.x;
                y = targetPos.y;
                opacity = 1;
                const clickT = (progress - 0.15) / 0.1;
                // Scale down slightly to simulate press
                scale = clickT < 0.3 ? 0.85 : 1;
                if (clickT > 0.1 && !isChecking) isChecking = true;
            } else if (progress < 0.4) {
                // Move away
                const t = (progress - 0.25) / 0.15;
                x = lerp(targetPos.x, targetPos.x + 150, easeInOutCubic(t));
                y = lerp(targetPos.y, targetPos.y + 100, easeInOutCubic(t));
                opacity = 1 - t;
            } else {
                opacity = 0;
            }

            handCursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            handCursor.style.opacity = String(opacity);
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
        class="bg-app-surface border border-app-border rounded-2xl shadow-md overflow-hidden relative"
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
                <div class="flex items-center justify-between gap-4 mb-10">
                    <div>
                        <h2
                            class="text-xl md:text-2xl font-black text-app-text tracking-tight"
                        >
                            Grocery list
                        </h2>
                    </div>

                    <button
                        bind:this={checkFridgeBtn}
                        class="flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3.5 bg-app-primary text-white rounded-xl md:rounded-2xl text-xs md:text-base font-bold shadow-lg shadow-app-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                    >
                        {#if isChecking}
                            <div
                                class="absolute inset-0 bg-white/20 animate-pulse"
                            ></div>
                        {/if}
                        <Refrigerator
                            size={16}
                            class="md:w-[18px] md:h-[18px]"
                        />
                        <span>Check Fridge</span>
                    </button>
                </div>

                <!-- Items List -->
                <div class="space-y-1 relative">
                    {#each itemsState as item}
                        <div
                            class="flex items-center gap-4 py-3 px-2 transition-all duration-500 {item.checked
                                ? 'opacity-85'
                                : 'hover:bg-app-primary/5 rounded-xl'}"
                        >
                            <div
                                class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 {item.checked
                                    ? 'bg-app-primary border-app-primary text-white'
                                    : 'border-app-border-strong bg-transparent hover:border-app-primary/50'}"
                            >
                                {#if item.checked}
                                    <div in:svelteScale={{ duration: 200 }}>
                                        <Check size={14} strokeWidth={4} />
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
                                    in:svelteScale={{
                                        duration: 400,
                                        start: 0.5,
                                    }}
                                    class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 text-emerald-700 rounded-lg border border-emerald-200 shadow-sm backdrop-blur-sm"
                                >
                                    <Check
                                        size={12}
                                        class="text-emerald-500"
                                        strokeWidth={3}
                                    />
                                    <span
                                        class="text-[10px] font-black uppercase tracking-wider"
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

                <!-- Cursor/Touch Animation Layer -->
                <div
                    bind:this={handCursor}
                    class="absolute top-0 left-0 pointer-events-none z-[100] opacity-0 will-change-transform"
                >
                    <!-- Desktop Hand Icon -->
                    <div class="hidden md:block">
                        <Pointer
                            size={32}
                            fill="#fff"
                            strokeWidth={1.5}
                            class="drop-shadow-2xl"
                        />
                    </div>

                    <!-- Mobile Touch Circle (Exact match to MobileMockup) -->
                    <div
                        class="md:hidden w-8 h-8 rounded-full bg-gray-400/30 border border-gray-400/50 backdrop-blur-sm shadow-xl"
                    ></div>

                    <!-- Click Effect Ping -->
                    <div
                        class="absolute top-2 left-2 md:top-2 md:left-2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-app-primary/40 rounded-full blur-md opacity-0 transition-opacity duration-200"
                        class:opacity-100={isChecking}
                        style="transform: scale({isChecking
                            ? 1.5
                            : 0.5}); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);"
                    ></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Highlight -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <!-- Smart Consolidation -->
        <div
            class="group p-8 bg-app-surface border border-app-border rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-app-primary/5 active:scale-[0.98]"
        >
            <div class="flex items-center gap-4 mb-5">
                <div
                    class="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 transition-transform duration-500 group-hover:scale-110"
                >
                    <ShoppingBag size={20} strokeWidth={2.5} />
                </div>
                <h3 class="text-lg font-black text-app-text tracking-tight">
                    Smart Consolidation
                </h3>
            </div>
            <p
                class="text-[14px] text-app-text-muted leading-relaxed font-medium"
            >
                YumHero automatically groups identical ingredients from
                different recipes to save you time.
            </p>
        </div>

        <!-- Inventory Sync -->
        <div
            class="group p-8 bg-app-surface border border-app-border rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
        >
            <div class="flex items-center gap-4 mb-5">
                <div
                    class="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform duration-500 group-hover:scale-110"
                >
                    <Refrigerator size={20} strokeWidth={2.5} />
                </div>
                <h3 class="text-lg font-black text-app-text tracking-tight">
                    Inventory Sync
                </h3>
            </div>
            <p
                class="text-[14px] text-app-text-muted leading-relaxed font-medium"
            >
                Avoid buying what you already have. One click checks your
                digital fridge and marks found items.
            </p>
        </div>

        <!-- Real-time Checkoff -->
        <div
            class="group p-8 bg-app-surface border border-app-border rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.98]"
        >
            <div class="flex items-center gap-4 mb-5">
                <div
                    class="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform duration-500 group-hover:scale-110"
                >
                    <Smartphone size={20} strokeWidth={2.5} />
                </div>
                <h3 class="text-lg font-black text-app-text tracking-tight">
                    Real-time Checkoff
                </h3>
            </div>
            <p
                class="text-[14px] text-app-text-muted leading-relaxed font-medium"
            >
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
