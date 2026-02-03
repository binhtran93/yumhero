<script lang="ts">
    import {
        ArrowRight,
        Calendar,
        ChefHat,
        Refrigerator,
        Utensils,
    } from "lucide-svelte";
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
                            class="p-6 bg-app-bg min-h-[300px] md:min-h-[400px]"
                        >
                            <!-- Simplified Week Grid Preview -->
                            <div class="grid grid-cols-7 gap-2">
                                {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as day}
                                    <div class="text-center">
                                        <div
                                            class="text-xs font-bold text-app-text-muted mb-2"
                                        >
                                            {day}
                                        </div>
                                        <div
                                            class="bg-app-surface border border-app-border rounded-lg p-2 min-h-[120px] md:min-h-[200px] space-y-2"
                                        >
                                            <div
                                                class="h-4 md:h-6 bg-accent-breakfast-bg rounded"
                                            ></div>
                                            <div
                                                class="h-4 md:h-6 bg-accent-lunch-bg rounded"
                                            ></div>
                                            <div
                                                class="h-4 md:h-6 bg-accent-dinner-bg rounded"
                                            ></div>
                                        </div>
                                    </div>
                                {/each}
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
