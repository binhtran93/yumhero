<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import {
        Scale,
        FileText,
        AlertCircle,
        HelpCircle,
        CheckCircle2,
    } from "lucide-svelte";
</script>

<SEO
    title="Terms of Service | YumHero"
    description="Read our Terms of Service to understand your rights and responsibilities when using YumHero."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <header class="pt-32 pb-16 bg-app-surface border-b border-app-border">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-app-primary/10 rounded-2xl mb-6"
            >
                <Scale size={32} class="text-app-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Terms of Service
            </h1>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                Clear rules for a better community. By using YumHero, you agree
                to follow these guidelines designed to protect everyone.
            </p>
        </div>
    </header>

    <main class="flex-grow py-20 px-6 max-w-4xl mx-auto w-full">
        <div
            class="mb-12 p-6 bg-app-primary/5 border border-app-primary/10 rounded-2xl flex items-center justify-between"
        >
            <div>
                <p
                    class="text-sm font-bold text-app-primary uppercase tracking-widest mb-1"
                >
                    Last Updated
                </p>
                <p class="text-app-text font-medium">February 5, 2026</p>
            </div>
            <div class="hidden sm:block">
                <p class="text-xs text-app-text-muted">
                    Reading time: ~8 minutes
                </p>
            </div>
        </div>

        <div class="space-y-16">
            <section id="agreement">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <CheckCircle2 size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">1. Agreement to Terms</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        These Terms of Service constitute a legally binding
                        agreement made between you, whether personally or on
                        behalf of an entity ("you") and YumHero ("we," "us," or
                        "our"), concerning your access to and use of the YumHero
                        platform.
                    </p>
                    <p>
                        By accessing the platform, you acknowledge that you have
                        read, understood, and agreed to be bound by all of these
                        terms. If you do not agree with all of these terms, you
                        are expressly prohibited from using the platform and
                        must discontinue use immediately.
                    </p>
                </div>
            </section>

            <section id="user-accounts">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <FileText size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">2. User Accounts</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        When you create an account with us, you must provide
                        information that is accurate, complete, and current at
                        all times. Failure to do so constitutes a breach of the
                        Terms, which may result in immediate termination of your
                        account.
                    </p>
                    <p>
                        You are responsible for safeguarding the password that
                        you use to access the platform and for any activities or
                        actions under your password. You agree not to disclose
                        your password to any third party.
                    </p>
                </div>
            </section>

            <section id="subscriptions">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <AlertCircle size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">
                        3. Subscriptions & Billing
                    </h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        Some parts of the service are billed on a subscription
                        basis. You will be billed in advance on a recurring and
                        periodic basis (monthly or annually). At the end of each
                        period, your subscription will automatically renew under
                        the exact same conditions unless you cancel it or
                        YumHero cancels it.
                    </p>
                    <p>
                        All payments are handled by our third-party processor, <strong
                            >Paddle</strong
                        >. You agree to provide a valid payment method and
                        authorize Paddle to charge all subscription fees to such
                        payment method.
                    </p>
                </div>
            </section>

            <section id="content">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <HelpCircle size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">4. User Content</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        Our platform allows you to post recipes, schedules, and
                        other information ("Content"). You retain all of your
                        ownership rights in your Content. By posting Content,
                        you grant us a non-exclusive, worldwide, royalty-free
                        license to use, display, and distribute that content
                        solely for the purpose of providing the service to you.
                    </p>
                    <p>
                        You are solely responsible for the Content that you post
                        and its legality.
                    </p>
                </div>
            </section>

            <section id="termination">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <AlertCircle size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">5. Termination</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We may terminate or suspend your account immediately,
                        without prior notice or liability, for any reason
                        whatsoever, including without limitation if you breach
                        the Terms.
                    </p>
                    <p>
                        Upon termination, your right to use the platform will
                        immediately cease. If you wish to terminate your
                        account, you may simply discontinue using the platform
                        or contact us to delete your data.
                    </p>
                </div>
            </section>

            <section id="disclaimer">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <AlertCircle size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">
                        6. Limitation of Liability
                    </h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4 font-medium italic"
                >
                    <p>
                        In no event shall YumHero, nor its directors, employees,
                        or partners, be liable for any indirect, incidental,
                        special, consequential or punitive damages, including
                        without limitation, loss of profits, data, use,
                        goodwill, or other intangible losses, resulting from
                        your access to or use of or inability to access or use
                        the platform.
                    </p>
                </div>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
