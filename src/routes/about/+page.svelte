<script lang="ts">
    import { fly } from "svelte/transition";
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import { Heart, Sparkles, Coffee, ArrowRight } from "lucide-svelte";
    import { user } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";
    import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-svelte";

    const planLink = $derived(
        !$user
            ? "/login"
            : $subscriptionLoading
              ? "/plan"
              : !$isSubscribed
                ? "/subscribe"
                : "/plan",
    );

    let formState = $state({
        email: "",
        message: "",
    });

    let isSubmitting = $state(false);
    let isSuccess = $state(false);
    let errorMessage = $state("");

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        isSubmitting = true;
        errorMessage = "";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to send message");
            }

            isSuccess = true;
            formState = {
                email: "",
                message: "",
            };
        } catch (err: any) {
            errorMessage = err.message;
        } finally {
            isSubmitting = false;
        }
    }
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

        <!-- CTA -->
        <section class="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-32">
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
                    href={planLink}
                    class="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-app-primary text-white font-bold rounded-xl hover:bg-app-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-app-primary/20"
                >
                    Start Your Journey
                    <ArrowRight size={20} />
                </a>
            </div>
        </section>

        <hr class="border-app-border" />

        <!-- Contact Section -->
        <section
            id="contact"
            class="max-w-2xl mx-auto px-6 lg:px-8 py-16 mb-16"
        >
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-black text-app-text mb-4">
                    Get in touch
                </h2>
                <p class="text-app-text-muted">
                    Have questions? Send us a message and we'll get back to you
                    soon.
                </p>
            </div>

            <div
                class="bg-app-surface border border-app-border rounded-3xl p-8 md:p-12 shadow-sm"
            >
                {#if isSuccess}
                    <div class="text-center py-8" in:fly={{ y: 20 }}>
                        <div
                            class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 class="text-xl font-bold text-app-text mb-2">
                            Message Sent!
                        </h3>
                        <p class="text-app-text-muted mb-8">
                            Thanks for reaching out! We'll be in touch.
                        </p>
                        <button
                            onclick={() => (isSuccess = false)}
                            class="text-app-primary font-bold hover:underline"
                        >
                            Send another message
                        </button>
                    </div>
                {:else}
                    <form onsubmit={handleSubmit} class="space-y-6">
                        <div class="space-y-2">
                            <label
                                for="email"
                                class="text-sm font-bold text-app-text ml-1"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                bind:value={formState.email}
                                required
                                placeholder="name@email.com"
                                class="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-primary/10 focus:border-app-primary transition-all text-app-text"
                            />
                        </div>

                        <div class="space-y-2">
                            <label
                                for="message"
                                class="text-sm font-bold text-app-text ml-1"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows="8"
                                bind:value={formState.message}
                                required
                                placeholder="How can we help?"
                                class="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-primary/10 focus:border-app-primary transition-all text-app-text resize-none"
                            ></textarea>
                        </div>

                        {#if errorMessage}
                            <p
                                class="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
                            >
                                {errorMessage}
                            </p>
                        {/if}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            class="w-full py-4 bg-app-primary text-white font-bold rounded-xl hover:bg-app-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {#if isSubmitting}
                                <div
                                    class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
                                ></div>
                                Sending...
                            {:else}
                                <Send size={18} />
                                Send Message
                            {/if}
                        </button>
                    </form>
                {/if}
            </div>

            <div class="mt-12 text-center">
                <div
                    class="mt-4 pt-4 flex items-center justify-center gap-4 text-left max-w-sm mx-auto"
                >
                    <img
                        src="/team-binh.png"
                        alt="Binh"
                        class="w-12 h-12 rounded-full border border-app-border object-cover"
                    />
                    <div>
                        <p
                            class="text-sm italic text-app-text-muted leading-tight"
                        >
                            "We're here to help. Every message comes straight to
                            my inbox."
                        </p>
                        <p class="text-xs font-bold mt-1">
                            — Binh Tran, Founder
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <LandingFooter />
</div>
