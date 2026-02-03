<script lang="ts">
    import { onMount } from "svelte";
    import {
        ArrowRight,
        Calendar,
        ChefHat,
        Refrigerator,
        Utensils,
        Search,
        Zap,
        Clock,
        Pointer,
        ChevronDown,
        MoreVertical,
        ShoppingCart,
        ChevronLeft,
        ChevronRight,
        Plus,
    } from "lucide-svelte";

    interface MockMeal {
        name: string;
    }

    interface MockDay {
        day: string;
        date: string;
        meals: Record<string, MockMeal[]>;
    }

    const mockPlan: MockDay[] = [
        {
            day: "Monday",
            date: "2",
            meals: {
                breakfast: [{ name: "Avocado Toast" }],
                lunch: [{ name: "Quinoa Bowl" }],
                dinner: [{ name: "Baked Salmon" }],
                snack: [{ name: "Apple & Almonds" }],
                note: [{ name: "Buy fresh herbs" }],
            },
        },
        {
            day: "Tuesday",
            date: "3",
            meals: {
                breakfast: [{ name: "Greek Yogurt" }],
                lunch: [{ name: "Chicken Wrap" }],
                dinner: [{ name: "Beef Stir-fry" }],
                snack: [],
                note: [],
            },
        },
        {
            day: "Wednesday",
            date: "4",
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snack: [],
                note: [],
            },
        },
        {
            day: "Thursday",
            date: "5",
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                note: [],
            },
        },
        {
            day: "Friday",
            date: "6",
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                note: [],
            },
        },
        {
            day: "Saturday",
            date: "7",
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                note: [],
            },
        },
        {
            day: "Sunday",
            date: "8",
            meals: {
                breakfast: [],
                lunch: [],
                dinner: [],
                note: [],
            },
        },
    ];

    const mealTypes = ["breakfast", "lunch", "dinner", "snack", "note"];

    const mockLeftovers = [
        {
            name: "Bolognese Sauce",
            date: "yesterday",
            image: "/mockup/bolognese.png",
        },
        {
            name: "Grilled Veggies",
            date: "2d ago",
            image: "/mockup/veggies.png",
        },
    ];

    const mockQuickRecipes = [
        {
            name: "Avocado Toast",
            calorie: "290 kcal",
            image: "/mockup/avocado.png",
        },
        {
            name: "15-min Pasta",
            calorie: "450 kcal",
            image: "/mockup/pasta.png",
        },
        { name: "Tuna Salad", calorie: "320 kcal", image: "/mockup/tuna.png" },
        {
            name: "Egg Fried Rice",
            calorie: "380 kcal",
            image: "/mockup/rice.png",
        },
    ];

    let restartKey = $state(0);

    // Element references for dynamic position calculation
    let animationContainer: HTMLDivElement | undefined = $state();
    let leftoverRefs: (HTMLDivElement | undefined)[] = $state([]);
    let quickRecipeRefs: (HTMLDivElement | undefined)[] = $state([]);
    let wedBreakfastTarget: HTMLDivElement | undefined = $state();
    let wedLunchTarget: HTMLDivElement | undefined = $state();
    let handCursor: HTMLDivElement | undefined = $state();
    let ghostCard: HTMLDivElement | undefined = $state();
    let ghostCard2: HTMLDivElement | undefined = $state();
    let dropRevealCard: HTMLDivElement | undefined = $state();
    let dropRevealCard2: HTMLDivElement | undefined = $state();

    // Mobile carousel state
    let mobileDayIndex = $state(0);
    let mobileSwipeInterval: ReturnType<typeof setInterval> | null = null;

    // Animation state
    let animationFrame: number | null = null;
    let animationStartTime: number = 0;
    const ANIMATION_DURATION = 15000; // 10 seconds total cycle

    interface Position {
        x: number;
        y: number;
    }

    // Calculate position relative to animation container
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

    // Easing function for smooth animation
    function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Linear interpolation
    function lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    // Main animation loop
    function animate(timestamp: number) {
        if (!animationStartTime) animationStartTime = timestamp;

        const elapsed = (timestamp - animationStartTime) % ANIMATION_DURATION;
        const progress = elapsed / ANIMATION_DURATION;

        // Get current positions (recalculated each frame in case of resize)
        // Avocado Toast is first item (index 0) in Quick Recipes
        // Grilled Veggies is second item (index 1) in Leftovers
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

        // Animation timeline (percentages of 20s cycle):
        // 0-5%: Cursor fades in, moves to avocado toast
        // 5-7%: Cursor clicks (grab)
        // 7-20%: Drag to Thursday Breakfast
        // 20-22%: Drop
        // 22-35%: Move to Grilled Veggies
        // 35-37%: Grab
        // 37-50%: Drag to Thursday Lunch
        // 50-52%: Drop
        // 52-60%: Fade out
        // 60-100%: Hidden

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
                // Fade in and move to avocado
                const t = progress / 0.05;
                opacity = t;
                x = lerp(avocadoPos.x + 100, avocadoPos.x, easeInOutCubic(t));
                y = lerp(avocadoPos.y + 100, avocadoPos.y, easeInOutCubic(t));
            } else if (progress < 0.07) {
                // At avocado, grabbing
                x = avocadoPos.x;
                y = avocadoPos.y;
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.2) {
                // Drag to Thursday Breakfast
                const t = (progress - 0.07) / 0.13;
                x = lerp(avocadoPos.x, wedBreakfastPos.x, easeInOutCubic(t));
                y = lerp(avocadoPos.y, wedBreakfastPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.22) {
                // Drop at Thursday Breakfast
                x = wedBreakfastPos.x;
                y = wedBreakfastPos.y;
                opacity = 1;
                scale = 1.1;
            } else if (progress < 0.35) {
                // Move to Grilled Veggies
                const t = (progress - 0.22) / 0.13;
                x = lerp(wedBreakfastPos.x, veggiesPos.x, easeInOutCubic(t));
                y = lerp(wedBreakfastPos.y, veggiesPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 1;
            } else if (progress < 0.37) {
                // At veggies, grabbing
                x = veggiesPos.x;
                y = veggiesPos.y;
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.5) {
                // Drag to Thursday Lunch
                const t = (progress - 0.37) / 0.13;
                x = lerp(veggiesPos.x, wedLunchPos.x, easeInOutCubic(t));
                y = lerp(veggiesPos.y, wedLunchPos.y, easeInOutCubic(t));
                opacity = 1;
                scale = 0.85;
            } else if (progress < 0.52) {
                // Drop at Thursday Lunch
                x = wedLunchPos.x;
                y = wedLunchPos.y;
                opacity = 1;
                scale = 1.1;
            } else if (progress < 0.6) {
                // Fade out
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
                // Visible during drag
                const t = (progress - 0.07) / 0.13;
                x =
                    lerp(avocadoPos.x, wedBreakfastPos.x, easeInOutCubic(t)) -
                    96; // offset for card width
                y =
                    lerp(avocadoPos.y, wedBreakfastPos.y, easeInOutCubic(t)) -
                    20;
                opacity = 1;
                rotation = lerp(-2, 2, t);
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
                // Visible during drag
                const t = (progress - 0.37) / 0.13;
                x = lerp(veggiesPos.x, wedLunchPos.x, easeInOutCubic(t)) - 96;
                y = lerp(veggiesPos.y, wedLunchPos.y, easeInOutCubic(t)) - 20;
                opacity = 1;
                rotation = lerp(-2, 2, t);
            } else {
                opacity = 0;
            }

            ghostCard2.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            ghostCard2.style.opacity = String(opacity);
        }

        // Drop reveal card 1 (Avocado Toast in Thursday Breakfast)
        if (dropRevealCard) {
            let opacity = 0,
                scale = 0.9,
                translateY = 4;

            if (progress >= 0.205 && progress < 0.23) {
                // Reveal animation
                const t = (progress - 0.205) / 0.025;
                opacity = t;
                scale = lerp(0.9, 1, easeInOutCubic(t));
                translateY = lerp(4, 0, easeInOutCubic(t));
            } else if (progress >= 0.23 && progress < 0.9) {
                // Visible
                opacity = 1;
                scale = 1;
                translateY = 0;
            } else if (progress >= 0.9) {
                // Fade out
                const t = (progress - 0.9) / 0.1;
                opacity = 1 - t;
                scale = 1;
                translateY = 0;
            }

            dropRevealCard.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            dropRevealCard.style.opacity = String(opacity);
        }

        // Drop reveal card 2 (Grilled Veggies in Thursday Lunch)
        if (dropRevealCard2) {
            let opacity = 0,
                scale = 0.9,
                translateY = 4;

            if (progress >= 0.505 && progress < 0.53) {
                // Reveal animation
                const t = (progress - 0.505) / 0.025;
                opacity = t;
                scale = lerp(0.9, 1, easeInOutCubic(t));
                translateY = lerp(4, 0, easeInOutCubic(t));
            } else if (progress >= 0.53 && progress < 0.9) {
                // Visible
                opacity = 1;
                scale = 1;
                translateY = 0;
            } else if (progress >= 0.9) {
                // Fade out
                const t = (progress - 0.9) / 0.1;
                opacity = 1 - t;
                scale = 1;
                translateY = 0;
            }

            dropRevealCard2.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            dropRevealCard2.style.opacity = String(opacity);
        }

        // Source element visibility (Mimic real life: moved leftovers are "gone")
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
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
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
        // Small delay to ensure elements are rendered
        setTimeout(() => {
            startAnimation();
        }, 50);
    };

    onMount(() => {
        // Start animation when component mounts
        const timer = setTimeout(() => {
            startAnimation();
        }, 100);

        return () => {
            clearTimeout(timer);
            stopAnimation();
        };
    });

    // Restart animation when restartKey changes
    $effect(() => {
        if (restartKey > 0) {
            startAnimation();
        }
    });

    const getMealStyles = (type: string) => {
        switch (type) {
            case "breakfast":
                return "bg-accent-breakfast-bg text-accent-breakfast-text border-accent-breakfast/10";
            case "lunch":
                return "bg-accent-lunch-bg text-accent-lunch-text border-accent-lunch/10";
            case "dinner":
                return "bg-accent-dinner-bg text-accent-dinner-text border-accent-dinner/10";
            case "snack":
                return "bg-accent-snack-bg text-accent-snack-text border-accent-snack/10";
            case "note":
                return "bg-accent-note-bg text-accent-note-text border-accent-note/10";
            default:
                return "";
        }
    };

    const getLabelColor = (type: string) => {
        switch (type) {
            case "breakfast":
                return "text-accent-breakfast";
            case "lunch":
                return "text-accent-lunch";
            case "dinner":
                return "text-accent-dinner";
            case "snack":
                return "text-accent-snack";
            case "note":
                return "text-accent-note";
            default:
                return "";
        }
    };
</script>

<div class="min-h-screen bg-app-bg text-app-text font-display">
    <!-- Navigation -->
    <nav
        class="fixed top-0 left-0 right-0 z-50 bg-app-bg/80 backdrop-blur-md border-b border-app-border"
    >
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="flex items-center justify-between h-16">
                <!-- Logo -->
                <a href="/" class="flex items-center gap-2">
                    <div class="p-1.5 bg-app-primary/10 rounded-lg">
                        <ChefHat size={24} class="text-app-primary" />
                    </div>
                    <span class="text-xl font-bold text-app-text">YumHero</span>
                </a>

                <!-- Desktop Nav -->
                <div class="hidden md:flex items-center gap-8">
                    <a
                        href="#features"
                        class="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors"
                        >Features</a
                    >
                    <a
                        href="#journal"
                        class="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors"
                        >Journal</a
                    >
                    <a
                        href="#pricing"
                        class="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors"
                        >Pricing</a
                    >
                    <a
                        href="#faq"
                        class="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors"
                        >FAQ</a
                    >
                </div>

                <!-- CTA -->
                <a
                    href="/plan"
                    class="px-5 py-2.5 bg-app-primary text-white text-sm font-bold rounded-lg hover:bg-app-primary/90 transition-all active:scale-95"
                >
                    Start Planning
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-20 pb-6 md:pt-28 md:pb-10 overflow-hidden">
        <!-- Premium Glow Effects -->
        <div
            class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
        >
            <!-- Main amber glow (top-left) -->
            <div
                class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12)_0%,transparent_70%)] blur-[100px]"
            ></div>
            <!-- Secondary subtle glow (middle-right) -->
            <div
                class="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(194,65,12,0.08)_0%,transparent_70%)] blur-[80px]"
            ></div>
        </div>

        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
                class="max-w-4xl mx-auto text-center flex flex-col items-center relative"
            >
                <!-- Concentrated Heading Glow -->
                <div
                    class="absolute top-[20%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.18)_0%,transparent_60%)] blur-[120px] -z-10 pointer-events-none"
                ></div>

                <h1
                    class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-app-text mb-4 tracking-tight relative"
                >
                    Plan with Precision.<br />
                    <span class="text-app-primary">Eat with Intent.</span>
                </h1>
                <p
                    class="text-base md:text-xl text-app-text-muted mb-6 max-w-4xl mx-auto leading-relaxed"
                >
                    Precision meal planning for the organized home. Track your
                    fridge, log leftovers, and master your menu in a clean,
                    high-performance interface.
                </p>
                <div
                    class="flex flex-col flex-col-reverse sm:flex-row items-center gap-4"
                >
                    <button
                        on:click={() => {
                            restartAnimationHandler();
                            document.getElementById("preview")?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }}
                        class="hidden items-center gap-2 px-6 py-3 bg-app-surface text-app-text font-bold rounded-full border border-app-border hover:bg-app-surface-hover transition-all active:scale-95 text-base md:text-lg shadow-sm"
                    >
                        See it in action
                        <ChevronDown size={18} />
                    </button>
                    <a
                        href="/plan"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-app-primary text-white font-bold rounded-full hover:bg-app-primary/90 transition-all active:scale-95 text-base md:text-lg shadow-lg hover:shadow-app-primary/25"
                    >
                        Start Planning for Free
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>

            <!-- Hero Mockup -->
            <div id="preview" class="mt-8 md:mt-12 scroll-mt-20">
                <div class="relative">
                    <!-- Desktop Browser Frame (hidden on mobile) -->
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

                        <!-- Full desktop layout (sidebar + grid) -->
                        <div class="relative">
                            <!-- Drag Animation Overlay -->
                            {#key restartKey}
                                <div
                                    bind:this={animationContainer}
                                    class="absolute inset-0 pointer-events-none z-10 overflow-hidden"
                                >
                                    <!-- Ghost Card -->
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
                                    <!-- Scrollable Sections -->
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
                                    <!-- Simplified Week Grid Preview -->
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
                                                        <!-- Slot Header -->
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

                                                        <!-- Slot Content -->
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
                                                            <!-- Animation Target Drop 2 (Lunch) -->
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

                    <!-- Mobile iPhone Mockup (Polished to match image) -->
                    <div class="md:hidden flex justify-center py-6">
                        <!-- iPhone Frame -->
                        <div class="relative w-[340px]">
                            <!-- iPhone outer shell -->
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

                                    <!-- App Toolbar (Redesigned to match image) -->
                                    <div
                                        class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100"
                                    >
                                        <span
                                            class="text-2xl font-black text-app-primary"
                                            >Plan</span
                                        >

                                        <!-- Date range pill -->
                                        <div
                                            class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-[11px] font-bold text-gray-700"
                                        >
                                            <ChevronLeft
                                                size={14}
                                                class="text-gray-400"
                                            />
                                            <span>Feb 02 - Feb 08</span>
                                            <ChevronRight
                                                size={14}
                                                class="text-gray-400"
                                            />
                                        </div>

                                        <div class="flex items-center gap-3">
                                            <MoreVertical
                                                size={20}
                                                class="text-gray-400"
                                            />
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

                                    <!-- Day Carousel (Compact non-scrollable) -->
                                    <div
                                        class="relative h-[600px] overflow-hidden bg-white"
                                    >
                                        {#each mockPlan as day, index}
                                            <div
                                                class="absolute inset-0 transition-transform duration-500 ease-in-out"
                                                style="transform: translateX({(index -
                                                    mobileDayIndex) *
                                                    100}%);"
                                            >
                                                <!-- Day Content -->
                                                <div
                                                    class="h-full flex flex-col"
                                                >
                                                    <!-- Day Header -->
                                                    <div
                                                        class="py-2.5 text-center border-b border-gray-50 bg-white"
                                                    >
                                                        <span
                                                            class="text-base font-black text-gray-800"
                                                            >{day.day}
                                                            {day.date}</span
                                                        >
                                                    </div>

                                                    <!-- Meal Slots -->
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
                                                                        class="w-2.5 h-2.5 rounded-full {type ===
                                                                        'breakfast'
                                                                            ? 'bg-accent-breakfast'
                                                                            : type ===
                                                                                'lunch'
                                                                              ? 'bg-accent-lunch'
                                                                              : type ===
                                                                                  'dinner'
                                                                                ? 'bg-accent-dinner'
                                                                                : type ===
                                                                                    'snack'
                                                                                  ? 'bg-accent-snack'
                                                                                  : 'bg-accent-note'}"
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
                                                                                class="flex items-center justify-between p-3.5 rounded-xl border shadow-sm {type ===
                                                                                'breakfast'
                                                                                    ? 'bg-accent-breakfast-bg/40 border-accent-breakfast-border/40'
                                                                                    : type ===
                                                                                        'lunch'
                                                                                      ? 'bg-accent-lunch-bg/40 border-accent-lunch-border/40'
                                                                                      : type ===
                                                                                          'dinner'
                                                                                        ? 'bg-accent-dinner-bg/40 border-accent-dinner-border/40'
                                                                                        : type ===
                                                                                            'snack'
                                                                                          ? 'bg-accent-snack-bg/40 border-accent-snack-border/40'
                                                                                          : 'bg-accent-note-bg/40 border-accent-note-border/40'}"
                                                                            >
                                                                                <span
                                                                                    class="text-sm font-bold text-gray-800"
                                                                                    >{meal?.name ||
                                                                                        ""}</span
                                                                                >
                                                                                <MoreVertical
                                                                                    size={16}
                                                                                    class="text-gray-400"
                                                                                />
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

    <!-- Feature 1: Waste-Zero Logic -->
    <section id="features" class="py-20 md:py-32 bg-app-surface">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                    <div
                        class="inline-flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full text-app-primary text-sm font-medium mb-6"
                    >
                        <Refrigerator size={16} />
                        Inventory Management
                    </div>
                    <h2
                        class="text-3xl md:text-4xl font-bold text-app-text mb-6"
                    >
                        Your fridge, digitized.
                    </h2>
                    <p class="text-lg text-app-text-muted mb-8">
                        Stop wondering what's in the back of the shelf. YumHero
                        prioritizes what you already own, turning forgotten
                        ingredients into scheduled meals.
                    </p>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-accent-lunch-bg flex items-center justify-center shrink-0 mt-0.5"
                            >
                                <div
                                    class="w-2 h-2 rounded-full bg-accent-lunch"
                                ></div>
                            </div>
                            <div>
                                <span class="font-bold text-app-text"
                                    >Live Inventory</span
                                >
                                <span class="text-app-text-muted">
                                    — Log ingredients as you buy them.</span
                                >
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <div
                                class="w-6 h-6 rounded-full bg-accent-dinner-bg flex items-center justify-center shrink-0 mt-0.5"
                            >
                                <div
                                    class="w-2 h-2 rounded-full bg-accent-dinner"
                                ></div>
                            </div>
                            <div>
                                <span class="font-bold text-app-text"
                                    >Leftover Tracking</span
                                >
                                <span class="text-app-text-muted">
                                    — Tuesday's dinner becomes Wednesday's lunch
                                    with one click.</span
                                >
                            </div>
                        </li>
                    </ul>
                </div>
                <!-- Fridge Mockup -->
                <div class="bg-app-bg border border-app-border rounded-xl p-6">
                    <div class="flex items-center gap-2 mb-4">
                        <Refrigerator size={20} class="text-app-primary" />
                        <span class="font-bold text-app-text">Your Fridge</span>
                    </div>
                    <div class="space-y-3">
                        {#each [{ name: "Chicken Breast", tag: "Today", tagColor: "bg-red-100 text-red-700" }, { name: "Broccoli", tag: "2 days", tagColor: "bg-yellow-100 text-yellow-700" }, { name: "Leftover Pasta", tag: "Ready to eat", tagColor: "bg-green-100 text-green-700" }, { name: "Greek Yogurt", tag: "5 days", tagColor: "bg-gray-100 text-gray-600" }] as item}
                            <div
                                class="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border"
                            >
                                <span class="font-medium text-app-text"
                                    >{item.name}</span
                                >
                                <span
                                    class="text-xs px-2 py-1 rounded-full {item.tagColor}"
                                    >{item.tag}</span
                                >
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Feature 2: Expert Grid -->
    <section class="py-20 md:py-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                <!-- 3-Step Diagram -->
                <div class="order-2 md:order-1">
                    <div class="flex flex-col md:flex-row items-center gap-4">
                        <!-- Step 1 -->
                        <div
                            class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                        >
                            <div
                                class="w-10 h-10 rounded-full bg-app-primary/10 text-app-primary font-bold flex items-center justify-center mx-auto mb-3"
                            >
                                1
                            </div>
                            <div class="text-sm font-medium text-app-text">
                                Browse Recipes
                            </div>
                            <div
                                class="mt-2 h-12 bg-app-surface-hover rounded-lg flex items-center justify-center"
                            >
                                <Utensils
                                    size={20}
                                    class="text-app-text-muted"
                                />
                            </div>
                        </div>
                        <!-- Arrow -->
                        <ArrowRight
                            size={24}
                            class="text-app-text-muted shrink-0 rotate-90 md:rotate-0"
                        />
                        <!-- Step 2 -->
                        <div
                            class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                        >
                            <div
                                class="w-10 h-10 rounded-full bg-app-primary/10 text-app-primary font-bold flex items-center justify-center mx-auto mb-3"
                            >
                                2
                            </div>
                            <div class="text-sm font-medium text-app-text">
                                Drag to Calendar
                            </div>
                            <div
                                class="mt-2 h-12 bg-accent-dinner-bg rounded-lg flex items-center justify-center"
                            >
                                <Calendar
                                    size={20}
                                    class="text-accent-dinner"
                                />
                            </div>
                        </div>
                        <!-- Arrow -->
                        <ArrowRight
                            size={24}
                            class="text-app-text-muted shrink-0 rotate-90 md:rotate-0"
                        />
                        <!-- Step 3 -->
                        <div
                            class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                        >
                            <div
                                class="w-10 h-10 rounded-full bg-accent-lunch/20 text-accent-lunch font-bold flex items-center justify-center mx-auto mb-3"
                            >
                                ✓
                            </div>
                            <div class="text-sm font-medium text-app-text">
                                Week Planned!
                            </div>
                            <div
                                class="mt-2 h-12 bg-accent-lunch-bg rounded-lg flex items-center justify-center text-sm text-accent-lunch font-medium"
                            >
                                Done in 2 min
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-1 md:order-2">
                    <div
                        class="inline-flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full text-app-primary text-sm font-medium mb-6"
                    >
                        <Calendar size={16} />
                        Speed & Efficiency
                    </div>
                    <h2
                        class="text-3xl md:text-4xl font-bold text-app-text mb-6"
                    >
                        A UI built for speed.
                    </h2>
                    <p class="text-lg text-app-text-muted">
                        No fluff, just functionality. Our drag-and-drop grid
                        allows you to map out an entire week in under two
                        minutes. Every pixel is designed for rapid meal
                        planning.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Journal Section -->
    <section id="journal" class="py-20 md:py-32 bg-app-surface">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                    The YumHero Journal
                </h2>
                <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                    Insights and strategies for the modern kitchen. Expert
                    advice to maximize your meal prep.
                </p>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                {#each [{ title: "The Engineering of a Weekly Prep", subtitle: "How to save 4 hours a week with systematic planning.", color: "bg-amber-100" }, { title: "Why 'Fridge-First' Planning Works", subtitle: "The secret to reducing food waste by 60%.", color: "bg-emerald-100" }, { title: "5 Pantry Essentials", subtitle: "Building a high-performance kitchen from scratch.", color: "bg-sky-100" }] as post}
                    <article
                        class="bg-app-bg border border-app-border rounded-xl overflow-hidden hover:border-app-border-strong transition-colors group cursor-pointer"
                    >
                        <div
                            class="h-40 {post.color} flex items-center justify-center"
                        >
                            <Utensils
                                size={32}
                                class="text-app-text-muted/30"
                            />
                        </div>
                        <div class="p-5">
                            <h3
                                class="font-bold text-app-text group-hover:text-app-primary transition-colors mb-2"
                            >
                                {post.title}
                            </h3>
                            <p class="text-sm text-app-text-muted">
                                {post.subtitle}
                            </p>
                        </div>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 md:py-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                    Simple & Transparent
                </h2>
                <p class="text-lg text-app-text-muted">
                    No hidden fees. No upsells. Choose the plan that fits your
                    kitchen.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <!-- Starter -->
                <div
                    class="bg-app-surface border border-app-border rounded-xl p-6"
                >
                    <div class="text-center mb-6">
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            Starter
                        </h3>
                        <div class="text-3xl font-bold text-app-text">Free</div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Weekly Grid Planning
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Up to 20 Recipes
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Basic Fridge Sync
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Community Support
                        </li>
                    </ul>
                    <a
                        href="/plan"
                        class="block w-full py-3 text-center border border-app-border rounded-lg text-app-text font-medium hover:bg-app-surface-hover transition-colors"
                    >
                        Get Started
                    </a>
                </div>

                <!-- Pro (Featured) -->
                <div
                    class="bg-app-surface border-2 border-app-primary rounded-xl p-6 relative"
                >
                    <div
                        class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-app-primary text-white text-xs font-bold rounded-full"
                    >
                        Most Popular
                    </div>
                    <div class="text-center mb-6">
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            Pro
                        </h3>
                        <div class="text-3xl font-bold text-app-text">
                            $8<span
                                class="text-lg text-app-text-muted font-normal"
                                >/mo</span
                            >
                        </div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Unlimited Planning
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Unlimited Recipes
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Advanced Fridge Logic
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Priority Support
                        </li>
                    </ul>
                    <a
                        href="/plan"
                        class="block w-full py-3 text-center bg-app-primary text-white rounded-lg font-bold hover:bg-app-primary/90 transition-colors"
                    >
                        Start Free Trial
                    </a>
                </div>

                <!-- Lifetime -->
                <div
                    class="bg-app-surface border border-app-border rounded-xl p-6"
                >
                    <div class="text-center mb-6">
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            Lifetime
                        </h3>
                        <div class="text-3xl font-bold text-app-text">$149</div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Everything in Pro
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            One-time Payment
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Lifetime Updates
                        </li>
                        <li
                            class="flex items-center gap-2 text-sm text-app-text-muted"
                        >
                            <div
                                class="w-1.5 h-1.5 rounded-full bg-app-primary"
                            ></div>
                            Priority Support
                        </li>
                    </ul>
                    <a
                        href="/plan"
                        class="block w-full py-3 text-center border border-app-border rounded-lg text-app-text font-medium hover:bg-app-surface-hover transition-colors"
                    >
                        Buy Lifetime
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-20 md:py-32 bg-app-surface">
        <div class="max-w-3xl mx-auto px-6 lg:px-12">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                    Frequently Asked Questions
                </h2>
            </div>
            <div class="space-y-4">
                {#each [{ q: "How does YumHero handle leftovers?", a: 'It treats them as "Ready-to-Eat" ingredients that can be scheduled just like a recipe, ensuring nothing goes to waste. When you finish cooking, mark any extras as leftovers and they\'ll appear in your fridge inventory.' }, { q: "Can I import recipes from websites?", a: "Yes! The system is designed to scrape and format recipes from any URL into our clean, standardized UI. Just paste the link and we'll extract ingredients, steps, and cooking times automatically." }, { q: "Is there a mobile app?", a: "YumHero is built as a Progressive Web App (PWA), meaning it works perfectly on your phone in the kitchen without a bulky download. Add it to your home screen for a native app experience." }, { q: "How does the shopping list work?", a: "When you plan your week, YumHero automatically generates a consolidated shopping list. It checks your fridge inventory first and only includes ingredients you actually need to buy." }] as faq, i}
                    <details
                        class="bg-app-bg border border-app-border rounded-xl group"
                    >
                        <summary
                            class="flex items-center justify-between p-5 cursor-pointer list-none"
                        >
                            <span class="font-bold text-app-text">{faq.q}</span>
                            <span
                                class="text-app-text-muted group-open:rotate-180 transition-transform"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M5 7.5L10 12.5L15 7.5"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>
                        </summary>
                        <div class="px-5 pb-5 text-app-text-muted">
                            {faq.a}
                        </div>
                    </details>
                {/each}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-16 border-t border-app-border">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="grid md:grid-cols-4 gap-12 mb-12">
                <!-- Brand -->
                <div class="md:col-span-1">
                    <a href="/" class="flex items-center gap-2 mb-4">
                        <div class="p-1.5 bg-app-primary/10 rounded-lg">
                            <ChefHat size={20} class="text-app-primary" />
                        </div>
                        <span class="text-lg font-bold text-app-text"
                            >YumHero</span
                        >
                    </a>
                    <p class="text-sm text-app-text-muted">
                        Built for the modern kitchen.
                    </p>
                </div>

                <!-- Product Links -->
                <div>
                    <h4 class="font-bold text-app-text mb-4">Product</h4>
                    <ul class="space-y-2">
                        <li>
                            <a
                                href="#features"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >Features</a
                            >
                        </li>
                        <li>
                            <a
                                href="/recipes"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >Recipes</a
                            >
                        </li>
                        <li>
                            <a
                                href="#pricing"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >Pricing</a
                            >
                        </li>
                    </ul>
                </div>

                <!-- Company Links -->
                <div>
                    <h4 class="font-bold text-app-text mb-4">Company</h4>
                    <ul class="space-y-2">
                        <li>
                            <a
                                href="/about"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >About</a
                            >
                        </li>
                        <li>
                            <a
                                href="#journal"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >Journal</a
                            >
                        </li>
                        <li>
                            <a
                                href="mailto:hello@yumhero.app"
                                class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                                >Contact</a
                            >
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div
                class="pt-8 border-t border-app-border flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <p class="text-sm text-app-text-muted">
                    © 2026 YumHero. All rights reserved.
                </p>
                <div class="flex gap-6">
                    <a
                        href="/privacy"
                        class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                        >Privacy Policy</a
                    >
                    <a
                        href="/terms"
                        class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                        >Terms of Service</a
                    >
                </div>
            </div>
        </div>
    </footer>
</div>

<style>
    /* Animation elements are now controlled via JavaScript */
    /* These styles provide base positioning */
</style>
