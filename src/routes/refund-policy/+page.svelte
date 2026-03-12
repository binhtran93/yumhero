<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import { RotateCcw, Clock3, ReceiptText, Mail } from "lucide-svelte";
</script>

<SEO
    title="Refund Policy | YumHero"
    description="Learn about YumHero's 7-day refund policy for one-time purchases."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <header class="pt-32 pb-16 bg-app-surface border-b border-app-border">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-app-primary/10 rounded-2xl mb-6"
            >
                <RotateCcw size={32} class="text-app-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Refund Policy
            </h1>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                We want you to feel confident trying YumHero. If it is not the
                right fit, you can request a refund within 7 days of purchase.
            </p>
        </div>
    </header>

    <main class="flex-grow py-20 px-6 max-w-4xl mx-auto w-full">
        <div
            class="mb-12 p-6 bg-app-primary/5 border border-app-primary/10 rounded-2xl"
        >
            <p
                class="text-sm font-bold text-app-primary uppercase tracking-widest mb-2"
            >
                Quick Summary
            </p>
            <p class="text-app-text font-medium">
                Last updated: March 12, 2026
            </p>
        </div>

        <div class="space-y-16">
            <section id="window">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Clock3 size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">1. Refund Window</h2>
                </div>
                <div
                    class="prose prose-lg max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        You may request a refund within <strong>7 calendar days</strong>
                        from the date of your one-time YumHero purchase.
                    </p>
                    <p>
                        Requests submitted after the 7-day window may not be
                        eligible for a refund.
                    </p>
                </div>
            </section>

            <section id="eligibility">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <ReceiptText size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">2. Eligibility</h2>
                </div>
                <div
                    class="prose prose-lg max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        To help us process your request quickly, include the
                        email used for your YumHero account and your purchase
                        details.
                    </p>
                    <p>
                        Approved refunds are processed through our payment
                        provider, Paddle, and timing depends on your bank or
                        card issuer.
                    </p>
                </div>
            </section>

            <section id="request">
                <div
                    class="p-8 bg-app-surface border border-app-border rounded-3xl"
                >
                    <h2 class="text-2xl font-bold mb-4">3. How to Request</h2>
                    <p class="text-app-text-muted mb-6 leading-relaxed">
                        Contact us and mention your account email and purchase
                        date. We will review and respond as quickly as possible.
                    </p>
                    <a
                        href="mailto:support@yumhero.app?subject=Refund%20Request"
                        class="inline-flex items-center gap-2 font-bold text-app-primary hover:underline"
                    >
                        support@yumhero.app
                        <Mail size={16} />
                    </a>
                </div>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
