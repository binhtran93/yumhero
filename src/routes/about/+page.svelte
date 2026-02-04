<script lang="ts">
    import { fly } from "svelte/transition";
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import { Heart, Sparkles, Coffee, ArrowRight } from "lucide-svelte";
</script>

<div class="min-h-screen bg-app-bg text-app-text font-display">
    <LandingNav />

    <main class="pt-24 pb-20">
        <!-- Hero Section -->
        <section class="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-24">
            <h1
                class="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
                in:fly={{ y: 20, duration: 600, delay: 100 }}
            >
                Made with <span class="text-app-primary">love</span>,<br />
                fueled by necessity.
            </h1>
            <p
                class="text-lg md:text-xl text-app-text-muted leading-relaxed max-w-2xl mx-auto"
                in:fly={{ y: 20, duration: 600, delay: 200 }}
            >
                YumHero wasn't born in a boardroom. It started in a chaotic
                kitchen, trying to bring peace to a growing family.
            </p>
        </section>

        <!-- The Story -->
        <section class="max-w-5xl mx-auto px-6 lg:px-8 mb-32">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div class="relative">
                    <div
                        class="absolute -inset-4 bg-app-primary/10 rounded-[32px] -rotate-2"
                    ></div>
                    <img
                        src="/team-binh.png"
                        alt="Binh Tran, Founder"
                        class="relative rounded-3xl shadow-xl w-full object-cover aspect-[4/5]"
                    />
                </div>
                <div class="space-y-6">
                    <h2 class="text-3xl font-bold text-app-text">
                        The "Aha!" Moment
                    </h2>
                    <div
                        class="space-y-4 text-lg text-app-text-muted leading-relaxed"
                    >
                        <p>
                            It all began when my wife was pregnant with our
                            first child. The joy was immense, but so was the
                            morning sickness. It hit her hard, and suddenly, the
                            kitchen became a no-go zone for her.
                        </p>
                        <p>
                            I stepped up to manage the cooking and grocery
                            shopping entirely. As a software engineer obsessed
                            with efficiency (and honestly, a bit overwhelmed), I
                            quickly realized how messy meal planning actually
                            was. Scattered recipes, forgotten ingredients, and
                            endless trips to the store—it was chaos.
                        </p>
                        <p>
                            I tried every app out there, but they felt generic
                            and clunky. I wanted something that felt like a
                            helpful friend, not a data entry job. So, I decided
                            to build it myself. YumHero is the result of late
                            nights, burnt dinners, and a desire to make family
                            life just a little bit e simpler.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Values -->
        <section class="bg-app-surface border-y border-app-border py-24 mb-32">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <!-- ... -->
                <div class="grid md:grid-cols-3 gap-8">
                    <!-- Family First -->
                    <div
                        class="p-8 rounded-2xl bg-app-bg border border-app-border"
                    >
                        <div
                            class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6"
                        >
                            <Heart size={24} />
                        </div>
                        <h3 class="text-xl font-bold mb-3">Family First</h3>
                        <p class="text-app-text-muted leading-relaxed">
                            Every feature is designed to save you time so you
                            can spend it with the people who matter most.
                        </p>
                    </div>

                    <!-- Simplicity -->
                    <div
                        class="p-8 rounded-2xl bg-app-bg border border-app-border"
                    >
                        <div
                            class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6"
                        >
                            <Coffee size={24} />
                        </div>
                        <h3 class="text-xl font-bold mb-3">Simplicity</h3>
                        <p class="text-app-text-muted leading-relaxed">
                            Life is complicated enough. Your meal planner
                            shouldn't be. We fight for every pixel of
                            simplicity.
                        </p>
                    </div>

                    <!-- Joy -->
                    <div
                        class="p-8 rounded-2xl bg-app-bg border border-app-border"
                    >
                        <div
                            class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6"
                        >
                            <Sparkles size={24} />
                        </div>
                        <h3 class="text-xl font-bold mb-3">Joy</h3>
                        <p class="text-app-text-muted leading-relaxed">
                            Cooking shouldn't be a chore. We want to bring the
                            joy back to your kitchen by removing the stress.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Team -->
        <section class="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
            <h2 class="text-3xl font-bold text-app-text text-center mb-16">
                Meet the Team
            </h2>
            <div class="grid md:grid-cols-3 gap-10">
                <!-- Binh -->
                <div class="text-center group">
                    <div class="relative mb-6 inline-block">
                        <div
                            class="absolute inset-0 bg-app-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        ></div>
                        <img
                            src="/team-binh.png"
                            alt="Binh Tran"
                            class="relative w-48 h-48 rounded-full object-cover border-4 border-app-surface shadow-xl"
                        />
                    </div>
                    <h3 class="text-xl font-bold text-app-text">Binh Tran</h3>
                    <p class="text-app-primary font-medium mb-3">
                        Founder & Engineer
                    </p>
                    <p class="text-sm text-app-text-muted max-w-xs mx-auto">
                        Coffee enthusiast, dad-to-be, and the guy who writes the
                        code (and occasionally burns the toast).
                    </p>
                </div>

                <!-- Sarah -->
                <div class="text-center group">
                    <div class="relative mb-6 inline-block">
                        <div
                            class="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        ></div>
                        <img
                            src="/team-sarah.png"
                            alt="Sarah Jenkins"
                            class="relative w-48 h-48 rounded-full object-cover border-4 border-app-surface shadow-xl"
                        />
                    </div>
                    <h3 class="text-xl font-bold text-app-text">
                        Sarah Jenkins
                    </h3>
                    <p class="text-purple-600 font-medium mb-3">
                        Lead Designer
                    </p>
                    <p class="text-sm text-app-text-muted max-w-xs mx-auto">
                        Making sure YumHero looks as good as your dinner tastes.
                        Loves classic typography and exotic spices.
                    </p>
                </div>

                <!-- David -->
                <div class="text-center group">
                    <div class="relative mb-6 inline-block">
                        <div
                            class="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        ></div>
                        <img
                            src="/team-david.png"
                            alt="David Chen"
                            class="relative w-48 h-48 rounded-full object-cover border-4 border-app-surface shadow-xl"
                        />
                    </div>
                    <h3 class="text-xl font-bold text-app-text">David Chen</h3>
                    <p class="text-orange-600 font-medium mb-3">
                        Community & Growth
                    </p>
                    <p class="text-sm text-app-text-muted max-w-xs mx-auto">
                        Here to tell the world our story. Believes that
                        "leftovers" is just a fancy word for "pre-made lunch."
                    </p>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div
                class="bg-app-surface border border-app-border rounded-[32px] p-12 md:p-16 relative overflow-hidden"
            >
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-app-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"
                ></div>
                <h2 class="text-3xl font-bold mb-6 relative z-10">
                    Ready to join our family?
                </h2>
                <p
                    class="text-lg text-app-text-muted mb-8 max-w-xl mx-auto relative z-10"
                >
                    We'd love to help you tame your kitchen chaos. Give YumHero
                    a try and let us know what you think.
                </p>
                <a
                    href="/plan"
                    class="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-app-primary text-white font-bold rounded-xl hover:bg-app-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-app-primary/20"
                >
                    Start Your Journey
                    <ArrowRight size={20} />
                </a>
            </div>
        </section>
    </main>

    <LandingFooter />
</div>
