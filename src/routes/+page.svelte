<script lang="ts">
    import { onMount } from "svelte";
    import {
        Refrigerator,
        Zap,
        Clock,
        Pointer,
        ShoppingCart,
    } from "lucide-svelte";

    // Import extracted components
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import HeroSection from "$lib/components/landing/HeroSection.svelte";
    import FeatureFridge from "$lib/components/landing/FeatureFridge.svelte";
    import FeatureGrid from "$lib/components/landing/FeatureGrid.svelte";
    import JournalSection from "$lib/components/landing/JournalSection.svelte";
    import PricingSection from "$lib/components/landing/PricingSection.svelte";
    import FAQSection from "$lib/components/landing/FAQSection.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";

    // Import data and utilities
    import {
        mockPlan,
        mealTypes,
        mockLeftovers,
        mockQuickRecipes,
        getMealStyles,
        getLabelColor,
        getDotColor,
    } from "$lib/data/landingData";

    // Animation state
    let restartKey = $state(0);
    let animationContainer: HTMLDivElement | undefined = $state();
    let quickRecipeRefs: HTMLDivElement[] = $state([]);
    let leftoverRefs: HTMLDivElement[] = $state([]);
    let wedBreakfastTarget: HTMLDivElement | undefined = $state();
    let wedLunchTarget: HTMLDivElement | undefined = $state();
    let handCursor: HTMLDivElement | undefined = $state();
    let ghostCard: HTMLDivElement | undefined = $state();
    let ghostCard2: HTMLDivElement | undefined = $state();
    let dropRevealCard: HTMLDivElement | undefined = $state();
    let dropRevealCard2: HTMLDivElement | undefined = $state();

    // Mobile carousel state
    let mobileDayIndex = $state(0);
    let touchStartX = 0;
    let touchDiff = $state(0);
    let isSwiping = $state(false);

    function handleTouchStart(e: TouchEvent) {
        touchStartX = e.touches[0].clientX;
        touchDiff = 0;
        isSwiping = true;
    }

    function handleTouchMove(e: TouchEvent) {
        touchDiff = e.touches[0].clientX - touchStartX;
    }

    function handleTouchEnd() {
        const SWIPE_THRESHOLD = 50;
        if (touchDiff > SWIPE_THRESHOLD && mobileDayIndex > 0) {
            mobileDayIndex--;
        } else if (
            touchDiff < -SWIPE_THRESHOLD &&
            mobileDayIndex < mockPlan.length - 1
        ) {
            mobileDayIndex++;
        }
        touchDiff = 0;
        isSwiping = false;
    }

    // Animation constants and state
    let animationFrame: number | null = null;
    let animationStartTime: number = 0;
    const ANIMATION_DURATION = 15000;

    interface Position {
        x: number;
        y: number;
    }

    function getRelativePosition(
        element: HTMLElement | undefined,
        container: HTMLElement | undefined,
    ): Position {
        if (!element || !container) return { x: 0, y: 0 };
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return {
            x: elementRect.left - containerRect.left + elementRect.width / 2,
            y: elementRect.top - containerRect.top + elementRect.height / 2,
        };
    }

    function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    function animate(timestamp: number) {
        if (!animationStartTime) animationStartTime = timestamp;
        const elapsed = (timestamp - animationStartTime) % ANIMATION_DURATION;
        const progress = elapsed / ANIMATION_DURATION;

        const avocadoPos = getRelativePosition(
            quickRecipeRefs[0],
            animationContainer,
        );
        const veggiesPos = getRelativePosition(
            leftoverRefs[1],
            animationContainer,
        );
        const wedBreakfastPos = getRelativePosition(
            wedBreakfastTarget,
            animationContainer,
        );
        const wedLunchPos = getRelativePosition(
            wedLunchTarget,
            animationContainer,
        );

        animateElements(
            progress,
            avocadoPos,
            veggiesPos,
            wedBreakfastPos,
            wedLunchPos,
        );
        animationFrame = requestAnimationFrame(animate);
    }

    function animateElements(
        progress: number,
        avocadoPos: Position,
        veggiesPos: Position,
        wedBreakfastPos: Position,
        wedLunchPos: Position,
    ) {
        // Hand cursor animation
        if (handCursor) {
            let x = 0,
                y = 0,
                opacity = 0,
                scale = 1;

            if (progress < 0.05) {
                const t = progress / 0.05;
                x = lerp(0, avocadoPos.x, easeInOutCubic(t));
                y = lerp(0, avocadoPos.y, easeInOutCubic(t));
                opacity = t;
            } else if (progress < 0.07) {
                x = avocadoPos.x;
                y = avocadoPos.y;
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.2) {
                const t = (progress - 0.07) / 0.13;
                x = lerp(avocadoPos.x, wedBreakfastPos.x, easeInOutCubic(t));
                y = lerp(avocadoPos.y, wedBreakfastPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.22) {
                x = wedBreakfastPos.x;
                y = wedBreakfastPos.y;
                opacity = 1;
                scale = 1.1;
            } else if (progress < 0.35) {
                const t = (progress - 0.22) / 0.13;
                x = lerp(wedBreakfastPos.x, veggiesPos.x, easeInOutCubic(t));
                y = lerp(wedBreakfastPos.y, veggiesPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 1;
            } else if (progress < 0.37) {
                x = veggiesPos.x;
                y = veggiesPos.y;
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.5) {
                const t = (progress - 0.37) / 0.13;
                x = lerp(veggiesPos.x, wedLunchPos.x, easeInOutCubic(t));
                y = lerp(veggiesPos.y, wedLunchPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.52) {
                x = wedLunchPos.x;
                y = wedLunchPos.y;
                opacity = 1;
                scale = 1.1;
            } else if (progress < 0.6) {
                const t = (progress - 0.52) / 0.08;
                x = wedLunchPos.x + 50 * t;
                y = wedLunchPos.y + 50 * t;
                opacity = 1 - t;
                scale = 1;
            } else {
                opacity = 0;
            }

            handCursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            handCursor.style.opacity = String(opacity);
        }

        // Ghost card 1 (Avocado Toast)
        if (ghostCard) {
            let x = 0,
                y = 0,
                opacity = 0,
                rotation = 0;
            if (progress >= 0.07 && progress < 0.2) {
                const t = (progress - 0.07) / 0.13;
                x = lerp(avocadoPos.x, wedBreakfastPos.x, easeInOutCubic(t));
                y = lerp(avocadoPos.y, wedBreakfastPos.y, easeInOutCubic(t));
                opacity = 0.9;
                rotation = lerp(0, -3, t);
            } else {
                opacity = 0;
            }
            ghostCard.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            ghostCard.style.opacity = String(opacity);
        }

        // Ghost card 2 (Grilled Veggies)
        if (ghostCard2) {
            let x = 0,
                y = 0,
                opacity = 0,
                rotation = 0;
            if (progress >= 0.37 && progress < 0.5) {
                const t = (progress - 0.37) / 0.13;
                x = lerp(veggiesPos.x, wedLunchPos.x, easeInOutCubic(t));
                y = lerp(veggiesPos.y, wedLunchPos.y, easeInOutCubic(t));
                opacity = 0.9;
                rotation = lerp(0, 3, t);
            } else {
                opacity = 0;
            }
            ghostCard2.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            ghostCard2.style.opacity = String(opacity);
        }

        // Drop reveal card 1
        if (dropRevealCard) {
            let opacity = 0,
                scale = 0.8,
                translateY = 10;
            if (progress >= 0.2 && progress < 0.22) {
                const t = (progress - 0.2) / 0.02;
                opacity = t;
                scale = lerp(0.8, 1, easeInOutCubic(t));
                translateY = lerp(10, 0, easeInOutCubic(t));
            } else if (progress >= 0.22 && progress < 0.6) {
                opacity = 1;
                scale = 1;
                translateY = 0;
            } else if (progress >= 0.6) {
                opacity = 0;
            }
            dropRevealCard.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            dropRevealCard.style.opacity = String(opacity);
        }

        // Drop reveal card 2
        if (dropRevealCard2) {
            let opacity = 0,
                scale = 0.8,
                translateY = 10;
            if (progress >= 0.5 && progress < 0.52) {
                const t = (progress - 0.5) / 0.02;
                opacity = t;
                scale = lerp(0.8, 1, easeInOutCubic(t));
                translateY = lerp(10, 0, easeInOutCubic(t));
            } else if (progress >= 0.52 && progress < 0.9) {
                opacity = 1;
                scale = 1;
                translateY = 0;
            } else if (progress >= 0.9) {
                const t = (progress - 0.9) / 0.1;
                opacity = 1 - t;
                scale = 1;
                translateY = 0;
            }
            dropRevealCard2.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            dropRevealCard2.style.opacity = String(opacity);
        }

        // Source element visibility
        if (quickRecipeRefs[0]) {
            if (progress >= 0.07 && progress < 0.6) {
                quickRecipeRefs[0].style.opacity = "0";
                quickRecipeRefs[0].style.pointerEvents = "none";
            } else {
                quickRecipeRefs[0].style.opacity = "1";
                quickRecipeRefs[0].style.pointerEvents = "auto";
            }
        }

        if (leftoverRefs[1]) {
            if (progress >= 0.37 && progress < 0.9) {
                leftoverRefs[1].style.opacity = "0";
                leftoverRefs[1].style.pointerEvents = "none";
            } else {
                leftoverRefs[1].style.opacity = "1";
                leftoverRefs[1].style.pointerEvents = "auto";
            }
        }
    }

    function startAnimation() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationStartTime = 0;
        animationFrame = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    const restartAnimationHandler = () => {
        restartKey += 1;
        setTimeout(() => startAnimation(), 50);
    };

    const handleSeeItInAction = () => {
        restartAnimationHandler();
        document.getElementById("preview")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    onMount(() => {
        const timer = setTimeout(() => startAnimation(), 100);
        return () => {
            clearTimeout(timer);
            stopAnimation();
        };
    });

    $effect(() => {
        if (restartKey > 0) startAnimation();
    });
</script>

<div class="min-h-screen bg-app-bg text-app-text font-display">
    <LandingNav />
    <HeroSection onSeeItInAction={handleSeeItInAction} />

    <!-- Hero Mockup Section -->
    <section class="relative pb-6 md:pb-10 overflow-hidden">
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div id="preview" class="scroll-mt-20">
                <div class="relative">
                    <!-- Desktop Browser Frame -->
                    <div
                        class="hidden md:block bg-app-surface border border-app-border rounded-xl shadow-md overflow-hidden transform hover:translate-y-[-4px] transition-transform duration-300"
                    >
                        <!-- Browser Chrome -->
                        <div
                            class="flex items-center gap-2 px-4 py-3 bg-app-surface-hover border-b border-app-border"
                        >
                            <div class="flex gap-1.5">
                                <div
                                    class="w-3 h-3 rounded-full bg-red-400"
                                ></div>
                                <div
                                    class="w-3 h-3 rounded-full bg-yellow-400"
                                ></div>
                                <div
                                    class="w-3 h-3 rounded-full bg-green-400"
                                ></div>
                            </div>
                            <div class="flex-1 mx-4">
                                <div
                                    class="bg-app-bg rounded-md px-3 py-1.5 text-xs text-app-text-muted max-w-md mx-auto"
                                >
                                    yumhero.app/plan
                                </div>
                            </div>
                        </div>

                        <div class="relative">
                            <!-- Animation Overlay -->
                            {#key restartKey}
                                <div
                                    bind:this={animationContainer}
                                    class="absolute inset-0 pointer-events-none z-10 overflow-hidden"
                                >
                                    <!-- Ghost Cards -->
                                    <div
                                        bind:this={ghostCard}
                                        class="absolute w-48 p-2 bg-app-surface border border-app-primary/40 rounded-xl shadow-xl opacity-0"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-app-border/30"
                                            >
                                                <img
                                                    src="/mockup/avocado.png"
                                                    alt="Avocado Toast"
                                                    class="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p
                                                    class="text-xs font-bold text-app-text leading-tight truncate"
                                                >
                                                    Avocado Toast
                                                </p>
                                                <div
                                                    class="flex items-center gap-1 mt-0.5"
                                                >
                                                    <Clock
                                                        size={8}
                                                        class="text-app-text-muted"
                                                    />
                                                    <span
                                                        class="text-[8px] font-medium text-app-text-muted"
                                                        >15m</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        bind:this={ghostCard2}
                                        class="absolute w-48 p-2 bg-app-surface border border-app-primary/40 rounded-xl shadow-xl opacity-0"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-app-border/30"
                                            >
                                                <img
                                                    src="/mockup/veggies.png"
                                                    alt="Grilled Veggies"
                                                    class="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p
                                                    class="text-xs font-bold text-app-text leading-tight truncate"
                                                >
                                                    Grilled Veggies
                                                </p>
                                                <div
                                                    class="flex items-center gap-1 mt-0.5"
                                                >
                                                    <div
                                                        class="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                                    ></div>
                                                    <span
                                                        class="text-[8px] font-medium text-app-text-muted"
                                                        >2d ago</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Pointer Cursor -->
                                    <div
                                        bind:this={handCursor}
                                        class="absolute opacity-0 drop-shadow-xl z-50"
                                    >
                                        <Pointer
                                            size={32}
                                            fill="#fff"
                                            strokeWidth={1.5}
                                        />
                                        <div
                                            class="absolute top-2 left-2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-app-primary/30 rounded-full blur-md scale-0 cursor-ping-pulse"
                                        ></div>
                                    </div>
                                </div>
                            {/key}

                            <div
                                class="flex flex-row bg-app-bg min-h-100 overflow-hidden"
                            >
                                <!-- Mock Sidebar -->
                                <div
                                    class="flex w-64 flex-col border-r border-app-border bg-app-surface/50 overflow-hidden shrink-0"
                                >
                                    <div class="flex-1 overflow-y-auto">
                                        <!-- Leftovers Section -->
                                        <div class="p-4 space-y-3">
                                            <div
                                                class="flex items-center justify-between"
                                            >
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <Refrigerator
                                                        size={14}
                                                        class="text-app-primary"
                                                    />
                                                    <span
                                                        class="text-[10px] font-bold uppercase tracking-wider text-app-text"
                                                        >Leftovers</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="space-y-1.5">
                                                {#each mockLeftovers as item, index}
                                                    <div
                                                        bind:this={
                                                            leftoverRefs[index]
                                                        }
                                                        class="flex items-center gap-3 p-2 bg-app-surface border border-app-border/40 rounded-xl shadow-sm hover:shadow-md hover:bg-app-surface-hover transition-all duration-300"
                                                    >
                                                        {#if item.image}
                                                            <div
                                                                class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border/30 shadow-inner"
                                                            >
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    class="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        {/if}
                                                        <div
                                                            class="flex-1 min-w-0"
                                                        >
                                                            <p
                                                                class="text-xs font-bold text-app-text leading-tight truncate"
                                                            >
                                                                {item.name}
                                                            </p>
                                                            <div
                                                                class="flex items-center gap-1 mt-1"
                                                            >
                                                                <div
                                                                    class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                                                                ></div>
                                                                <span
                                                                    class="text-[8px] font-medium text-app-text-muted"
                                                                    >{item.date}</span
                                                                >
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        </div>

                                        <!-- Quick Recipes Section -->
                                        <div
                                            class="p-4 space-y-3 border-t border-app-border"
                                        >
                                            <div
                                                class="flex items-center justify-between"
                                            >
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <Zap
                                                        size={14}
                                                        class="text-amber-500"
                                                    />
                                                    <span
                                                        class="text-[10px] font-bold uppercase tracking-wider text-app-text"
                                                        >Quick Recipes</span
                                                    >
                                                </div>
                                            </div>
                                            <div class="space-y-1.5">
                                                {#each mockQuickRecipes as item, index}
                                                    <div
                                                        bind:this={
                                                            quickRecipeRefs[
                                                                index
                                                            ]
                                                        }
                                                        class="flex items-center gap-3 p-2 bg-app-surface border border-app-border/40 rounded-xl shadow-sm hover:shadow-md hover:border-app-primary/40 hover:bg-app-surface-hover transition-all duration-300 cursor-pointer group"
                                                    >
                                                        {#if item.image}
                                                            <div
                                                                class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border/30 shadow-inner"
                                                            >
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    class="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        {/if}
                                                        <div
                                                            class="flex-1 min-w-0"
                                                        >
                                                            <p
                                                                class="text-xs font-bold text-app-text leading-tight group-hover:text-app-primary transition-colors truncate"
                                                            >
                                                                {item.name}
                                                            </p>
                                                            <div
                                                                class="flex items-center gap-2 mt-1"
                                                            >
                                                                <div
                                                                    class="flex items-center gap-1"
                                                                >
                                                                    <Clock
                                                                        size={8}
                                                                        class="text-app-text-muted"
                                                                    />
                                                                    <span
                                                                        class="text-[8px] font-medium text-app-text-muted"
                                                                        >15m</span
                                                                    >
                                                                </div>
                                                                <span
                                                                    class="text-[8px] font-medium text-app-text-muted"
                                                                    >• {item.calorie}</span
                                                                >
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Main Grid -->
                                <div
                                    class="flex-1 min-w-0 p-4 md:p-6 overflow-x-auto"
                                >
                                    <div
                                        class="grid bg-app-border border border-app-border rounded-lg overflow-hidden"
                                        style="grid-template-columns: repeat(7, minmax(140px, 1fr)); width: max-content; min-width: 100%;"
                                    >
                                        {#each mockPlan as day}
                                            <div
                                                class="flex flex-col bg-app-bg border-r border-app-border last:border-r-0"
                                            >
                                                <!-- Day Header -->
                                                <div
                                                    class="flex flex-col items-center justify-center py-2 bg-app-surface border-b border-app-border h-12"
                                                >
                                                    <span
                                                        class="text-xs font-black text-app-text"
                                                        >{day.day}</span
                                                    >
                                                </div>

                                                <!-- Meal Slots -->
                                                {#each mealTypes as type}
                                                    <div
                                                        class="flex flex-col border-b border-app-border last:border-0 bg-app-surface min-h-25"
                                                    >
                                                        <div
                                                            class="flex items-center p-2 bg-app-bg/10"
                                                        >
                                                            <div
                                                                class="w-2 h-2 rounded-full mr-2 {getLabelColor(
                                                                    type,
                                                                ).replace(
                                                                    'text-',
                                                                    'bg-',
                                                                )}"
                                                            ></div>
                                                            <span
                                                                class="text-[8px] font-bold uppercase tracking-widest text-app-text-muted truncate"
                                                                >{type}</span
                                                            >
                                                        </div>
                                                        <div
                                                            class="px-2 pb-2 flex flex-col gap-1.5"
                                                        >
                                                            {#each day.meals[type] as meal}
                                                                <div
                                                                    class="px-3 py-1.5 rounded-xl border shadow-sm transition-all {getMealStyles(
                                                                        type,
                                                                    )}"
                                                                >
                                                                    <p
                                                                        class="text-xs font-bold leading-tight line-clamp-2"
                                                                    >
                                                                        {meal.name}
                                                                    </p>
                                                                </div>
                                                            {/each}

                                                            <!-- Animation Target Drop -->
                                                            {#if day.day === "Wednesday" && type === "breakfast"}
                                                                {#key restartKey}
                                                                    <div
                                                                        bind:this={
                                                                            wedBreakfastTarget
                                                                        }
                                                                        class="wed-breakfast-target"
                                                                    >
                                                                        <div
                                                                            bind:this={
                                                                                dropRevealCard
                                                                            }
                                                                            class="px-3 py-1.5 rounded-xl border shadow-sm {getMealStyles(
                                                                                type,
                                                                            )} opacity-0"
                                                                        >
                                                                            <p
                                                                                class="text-xs font-bold leading-tight line-clamp-2"
                                                                            >
                                                                                Avocado
                                                                                Toast
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                {/key}
                                                            {/if}
                                                            {#if day.day === "Wednesday" && type === "lunch"}
                                                                {#key restartKey}
                                                                    <div
                                                                        bind:this={
                                                                            wedLunchTarget
                                                                        }
                                                                        class="wed-lunch-target"
                                                                    >
                                                                        <div
                                                                            bind:this={
                                                                                dropRevealCard2
                                                                            }
                                                                            class="px-3 py-1.5 rounded-xl border shadow-sm {getMealStyles(
                                                                                type,
                                                                            )} opacity-0"
                                                                        >
                                                                            <p
                                                                                class="text-xs font-bold leading-tight line-clamp-2"
                                                                            >
                                                                                Grilled
                                                                                Veggies
                                                                            </p>
                                                                            <div
                                                                                class="flex items-center gap-1 mt-0.5"
                                                                            >
                                                                                <span
                                                                                    class="text-[8px] font-medium text-app-text-muted"
                                                                                    >Leftover</span
                                                                                >
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                {/key}
                                                            {/if}
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile iPhone Mockup -->
                    <div class="md:hidden flex justify-center py-6">
                        <div class="relative w-[85vw]">
                            <div
                                class="bg-[#1a1a1b] rounded-[48px] p-2.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                            >
                                <!-- Dynamic Island -->
                                <div
                                    class="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20"
                                ></div>

                                <!-- Screen -->
                                <div
                                    class="bg-white rounded-[40px] overflow-hidden relative z-0 isolate min-h-[720px]"
                                >
                                    <!-- Status bar -->
                                    <div
                                        class="flex items-center justify-between px-8 pt-4 pb-2 bg-white"
                                    >
                                        <span
                                            class="text-[12px] font-bold text-black"
                                            >9:41</span
                                        >
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-4 h-4 text-black">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    ><path
                                                        d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
                                                    /></svg
                                                >
                                            </div>
                                            <div
                                                class="w-6 h-3 bg-black rounded-[2px] relative"
                                            >
                                                <div
                                                    class="absolute right-[-1px] top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-black rounded-r-[1px]"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- App Toolbar -->
                                    <div
                                        class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200"
                                    >
                                        <span
                                            class="text-2xl font-black text-app-primary"
                                            >Plan</span
                                        >
                                        <div class="flex items-center gap-3">
                                            <div class="relative">
                                                <ShoppingCart
                                                    size={22}
                                                    class="text-gray-600"
                                                />
                                                <div
                                                    class="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-bold text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white"
                                                >
                                                    25
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Day Carousel -->
                                    <div
                                        class="relative h-[600px] overflow-hidden bg-white"
                                        ontouchstart={handleTouchStart}
                                        ontouchmove={handleTouchMove}
                                        ontouchend={handleTouchEnd}
                                    >
                                        {#each mockPlan as day, index}
                                            <div
                                                class="absolute inset-0 {isSwiping
                                                    ? ''
                                                    : 'transition-transform duration-500 ease-out'}"
                                                style="transform: translateX(calc({(index -
                                                    mobileDayIndex) *
                                                    100}% + {touchDiff}px));"
                                            >
                                                <div
                                                    class="h-full flex flex-col"
                                                >
                                                    <div
                                                        class="py-2.5 text-center border-b border-app-border bg-white"
                                                    >
                                                        <span
                                                            class="text-base font-black text-gray-800"
                                                            >{day.day}
                                                            {day.date}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="flex-1 overflow-hidden px-4"
                                                    >
                                                        {#each mealTypes as type}
                                                            <div
                                                                class="py-3 border-b border-gray-50 last:border-0"
                                                            >
                                                                <div
                                                                    class="flex items-center gap-2.5 mb-2"
                                                                >
                                                                    <div
                                                                        class="w-2.5 h-2.5 rounded-full {getDotColor(
                                                                            type,
                                                                        )}"
                                                                    ></div>
                                                                    <span
                                                                        class="text-[11px] font-bold text-gray-400 capitalize tracking-wider"
                                                                        >{type}</span
                                                                    >
                                                                </div>
                                                                <div
                                                                    class="space-y-2"
                                                                >
                                                                    {#if day.meals && day.meals[type]}
                                                                        {#each day.meals[type] as meal}
                                                                            <div
                                                                                class="flex items-center justify-between p-2 rounded-xl border shadow-sm {getMealStyles(
                                                                                    type,
                                                                                )}"
                                                                            >
                                                                                <span
                                                                                    class="text-sm font-bold text-gray-800"
                                                                                    >{meal?.name ||
                                                                                        ""}</span
                                                                                >
                                                                            </div>
                                                                        {/each}
                                                                    {/if}
                                                                </div>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>

                                    <!-- Home Indicator -->
                                    <div
                                        class="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 rounded-full"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Shadow/Glow Effect -->
                    <div
                        class="absolute -inset-4 bg-gradient-to-r from-app-primary/5 via-transparent to-app-primary/5 rounded-2xl -z-10 blur-xl opacity-50"
                    ></div>
                </div>
            </div>
        </div>
    </section>

    <FeatureFridge />
    <FeatureGrid />
    <JournalSection />
    <PricingSection />
    <FAQSection />
    <LandingFooter />
</div>
