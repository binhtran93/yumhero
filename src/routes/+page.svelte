<script lang="ts">
    import {
        ArrowRight,
        Calendar,
        ChefHat,
        Refrigerator,
        Utensils,
        Search,
        Zap,
        Clock,
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
            day: "Mon",
            date: "2",
            meals: {
                breakfast: [{ name: "Avocado Toast" }],
                lunch: [{ name: "Quinoa Bowl" }],
                dinner: [{ name: "Baked Salmon" }],
                note: [{ name: "Buy fresh herbs" }],
            },
        },
        {
            day: "Tue",
            date: "3",
            meals: {
                breakfast: [{ name: "Greek Yogurt" }],
                lunch: [{ name: "Chicken Wrap" }],
                dinner: [{ name: "Beef Stir-fry" }],
                note: [],
            },
        },
        {
            day: "Wed",
            date: "4",
            meals: {
                breakfast: [{ name: "Oatmeal" }],
                lunch: [{ name: "Pasta Salad" }],
                dinner: [{ name: "Lentil Soup" }],
                note: [{ name: "Clean fridge" }],
            },
        },
        {
            day: "Thu",
            date: "5",
            meals: {
                breakfast: [{ name: "Smoothie" }],
                lunch: [{ name: "Turkey Club" }],
                dinner: [{ name: "Roasted Chicken" }],
                note: [],
            },
        },
        {
            day: "Fri",
            date: "6",
            meals: {
                breakfast: [{ name: "Pancakes" }],
                lunch: [{ name: "Miso Ramen" }],
                dinner: [{ name: "Homemade Pizza" }],
                note: [],
            },
        },
        {
            day: "Sat",
            date: "7",
            meals: {
                breakfast: [{ name: "Fruit Bowl" }],
                lunch: [{ name: "Burger" }],
                dinner: [{ name: "Carbonara" }],
                note: [],
            },
        },
        {
            day: "Sun",
            date: "8",
            meals: {
                breakfast: [{ name: "Omelette" }],
                lunch: [{ name: "Fish Tacos" }],
                dinner: [{ name: "Steak & Veg" }],
                note: [],
            },
        },
    ];

    const mealTypes = ["breakfast", "lunch", "dinner", "note"];

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
        {
            name: "Avocado Toast",
            calorie: "290 kcal",
            image: "/mockup/avocado.png",
        },
    ];

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
    <section class="pt-32 pb-20 md:pt-40 md:pb-32">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="max-w-3xl">
                <h1
                    class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-app-text mb-6"
                >
                    Plan with Precision.<br />
                    <span class="text-app-primary">Eat with Intent.</span>
                </h1>
                <p
                    class="text-lg md:text-xl text-app-text-muted mb-8 max-w-2xl"
                >
                    A meal planner designed for the organized home. Track your
                    fridge, log leftovers, and master your weekly menu in a
                    clean, high-performance interface.
                </p>
                <a
                    href="/plan"
                    class="inline-flex items-center gap-2 px-8 py-4 bg-app-primary text-white font-bold rounded-lg hover:bg-app-primary/90 transition-all active:scale-95 text-lg"
                >
                    Start Planning for Free
                    <ArrowRight size={20} />
                </a>
            </div>

            <!-- Hero Mockup -->
            <div class="mt-16 md:mt-20">
                <div class="relative">
                    <!-- Browser Frame -->
                    <div
                        class="bg-app-surface border border-app-border rounded-xl shadow-2xl overflow-hidden transform hover:translate-y-[-4px] transition-transform duration-300"
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
                        <!-- Mockup Content -->
                        <div
                            class="flex flex-col md:flex-row bg-app-bg min-h-[400px]"
                        >
                            <!-- Mock Sidebar -->
                            <div
                                class="hidden md:flex w-64 flex-col border-r border-app-border bg-app-surface/50 overflow-hidden shrink-0"
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
                                            {#each mockLeftovers as item}
                                                <div
                                                    class="flex items-center gap-3 p-2 bg-app-bg border border-app-border rounded-lg shadow-sm"
                                                >
                                                    {#if item.image}
                                                        <div
                                                            class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    {/if}
                                                    <div class="flex-1 min-w-0">
                                                        <p
                                                            class="text-[10px] font-bold text-app-text leading-tight truncate"
                                                        >
                                                            {item.name}
                                                        </p>
                                                        <div
                                                            class="flex items-center gap-1 mt-1"
                                                        >
                                                            <div
                                                                class="w-1.5 h-1.5 rounded-full bg-emerald-500"
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
                                            {#each mockQuickRecipes as item}
                                                <div
                                                    class="flex items-center gap-3 p-2 bg-app-bg border border-app-border rounded-lg shadow-sm hover:border-app-primary/50 transition-colors cursor-pointer group"
                                                >
                                                    {#if item.image}
                                                        <div
                                                            class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                class="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    {/if}
                                                    <div class="flex-1 min-w-0">
                                                        <p
                                                            class="text-[10px] font-bold text-app-text leading-tight group-hover:text-app-primary transition-colors truncate"
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
                            <div class="flex-1 p-4 md:p-6 overflow-hidden">
                                <!-- Simplified Week Grid Preview -->
                                <div
                                    class="grid grid-cols-7 gap-px bg-app-border border border-app-border rounded-lg overflow-hidden"
                                >
                                    {#each mockPlan as day}
                                        <div
                                            class="flex flex-col bg-app-bg min-w-0"
                                        >
                                            <!-- Day Header -->
                                            <div
                                                class="flex flex-col items-center justify-center py-2 bg-app-surface border-b border-app-border h-12"
                                            >
                                                <span
                                                    class="text-[10px] md:text-xs font-black text-app-text"
                                                    >{day.day}</span
                                                >
                                                <span
                                                    class="text-[8px] md:text-[10px] font-bold text-app-text/60"
                                                    >{day.date}</span
                                                >
                                            </div>

                                            <!-- Meal Slots -->
                                            {#each mealTypes as type}
                                                <div
                                                    class="flex flex-col border-b border-app-border last:border-0 bg-app-surface min-h-[60px] md:min-h-[100px]"
                                                >
                                                    <!-- Slot Header -->
                                                    <div
                                                        class="flex items-center p-1.5 md:p-2 bg-app-bg/10"
                                                    >
                                                        <div
                                                            class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1.5 md:mr-2 {getLabelColor(
                                                                type,
                                                            ).replace(
                                                                'text-',
                                                                'bg-',
                                                            )}"
                                                        ></div>
                                                        <span
                                                            class="text-[6px] md:text-[8px] font-bold uppercase tracking-widest text-app-text-muted truncate"
                                                            >{type}</span
                                                        >
                                                    </div>

                                                    <!-- Slot Content -->
                                                    <div
                                                        class="px-1.5 pb-1.5 md:px-2 md:pb-2 flex flex-col gap-1 md:gap-1.5"
                                                    >
                                                        {#each day.meals[type] as meal}
                                                            <div
                                                                class="px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border shadow-sm transition-all {getMealStyles(
                                                                    type,
                                                                )}"
                                                            >
                                                                <p
                                                                    class="text-[8px] md:text-[10px] font-bold leading-tight line-clamp-2"
                                                                >
                                                                    {meal.name}
                                                                </p>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Shadow/Glow Effect -->
                    <div
                        class="absolute -inset-4 bg-gradient-to-r from-app-primary/10 via-transparent to-app-primary/10 rounded-2xl -z-10 blur-xl"
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

                <!-- Newsletter -->
                <div>
                    <h4 class="font-bold text-app-text mb-4">Stay Updated</h4>
                    <p class="text-sm text-app-text-muted mb-3">
                        Get a weekly meal-prep logic breakdown.
                    </p>
                    <form class="flex gap-2">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            class="flex-1 px-3 py-2 text-sm bg-app-bg border border-app-border rounded-lg focus:outline-none focus:border-app-primary text-app-text placeholder:text-app-text-muted"
                        />
                        <button
                            type="submit"
                            class="px-4 py-2 bg-app-primary text-white text-sm font-bold rounded-lg hover:bg-app-primary/90 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
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
