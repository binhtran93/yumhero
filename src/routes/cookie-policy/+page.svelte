<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import {
        Cookie,
        Info,
        Settings,
        ShieldCheck,
        CheckCircle2,
    } from "lucide-svelte";
</script>

<SEO
    title="Cookie Policy | YumHero"
    description="Learn about how YumHero uses cookies and similar technologies to improve your experience."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <header class="pt-32 pb-16 bg-app-surface border-b border-app-border">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-app-primary/10 rounded-2xl mb-6"
            >
                <Cookie size={32} class="text-app-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Cookie Policy
            </h1>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                Transparency matters. We use cookies to make YumHero work better
                and to personalize your experience. No intrusive tracking, just
                useful tech.
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
                Policy Overview
            </p>
            <p class="text-app-text font-medium">
                Last updated: February 5, 2026
            </p>
        </div>

        <div class="space-y-16">
            <section id="what-are-cookies">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Info size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">1. What are Cookies?</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        Cookies are small text files that are placed on your
                        computer or mobile device when you visit a website. They
                        are widely used by website owners in order to make their
                        websites work, or to work more efficiently, as well as
                        to provide reporting information.
                    </p>
                </div>
            </section>

            <section id="why-we-use">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Settings size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">2. Why We Use Cookies</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We use first-party and third-party cookies for several
                        reasons. Some cookies are required for technical reasons
                        for our platform to operate, and we refer to these as
                        "essential" or "strictly necessary" cookies.
                    </p>
                    <p>
                        Other cookies enable us to track and target the
                        interests of our users to enhance the experience on our
                        platform.
                    </p>
                </div>
            </section>

            <section id="types-of-cookies">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Cookie size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">
                        3. Types of Cookies We Use
                    </h2>
                </div>
                <div class="space-y-6">
                    <div
                        class="p-6 bg-app-surface border border-app-border rounded-2xl border-l-4 border-l-emerald-500"
                    >
                        <h3
                            class="font-bold text-lg mb-2 flex items-center gap-2"
                        >
                            Essential Cookies
                            <span
                                class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase tracking-wider"
                                >Required</span
                            >
                        </h3>
                        <p class="text-app-text-muted">
                            These cookies are strictly necessary to provide you
                            with services available through our website and to
                            use some of its features, such as access to secure
                            areas.
                        </p>
                    </div>

                    <div
                        class="p-6 bg-app-surface border border-app-border rounded-2xl border-l-4 border-l-blue-500"
                    >
                        <h3
                            class="font-bold text-lg mb-2 flex items-center gap-2"
                        >
                            Performance & Analytics
                            <span
                                class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase tracking-wider"
                                >Optional</span
                            >
                        </h3>
                        <p class="text-app-text-muted">
                            These cookies are used to enhance the performance
                            and functionality of our website but are
                            non-essential to its use. However, without these
                            cookies, certain functionality (like videos) may
                            become unavailable.
                        </p>
                    </div>

                    <div
                        class="p-6 bg-app-surface border border-app-border rounded-2xl border-l-4 border-l-amber-500"
                    >
                        <h3
                            class="font-bold text-lg mb-2 flex items-center gap-2"
                        >
                            Personalization
                            <span
                                class="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold uppercase tracking-wider"
                                >Optional</span
                            >
                        </h3>
                        <p class="text-app-text-muted">
                            These cookies collect information that is used
                            either in aggregate form to help us understand how
                            our website is being used or how effective our
                            marketing campaigns are, or to help us customize our
                            website for you.
                        </p>
                    </div>
                </div>
            </section>

            <section id="managing-cookies">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <ShieldCheck size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">
                        4. How to Control Cookies
                    </h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        You have the right to decide whether to accept or reject
                        cookies. You can exercise your cookie rights by setting
                        your preferences in the Cookie Consent Manager. The
                        Cookie Consent Manager allows you to select which
                        categories of cookies you accept or reject.
                    </p>
                    <p>
                        You can also set or amend your web browser controls to
                        accept or refuse cookies. If you choose to reject
                        cookies, you may still use our website though your
                        access to some functionality and areas of our website
                        may be restricted.
                    </p>
                </div>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
