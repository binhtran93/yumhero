<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import {
        Shield,
        Lock,
        Eye,
        FileText,
        CheckCircle2,
        Mail,
    } from "lucide-svelte";
</script>

<SEO
    title="Privacy Policy | YumHero"
    description="Your privacy is our priority. Learn how YumHero protects and manages your personal data."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <header class="pt-32 pb-16 bg-app-surface border-b border-app-border">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-app-primary/10 rounded-2xl mb-6"
            >
                <Shield size={32} class="text-app-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Privacy Policy
            </h1>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                At YumHero, we handle your data with the same care we use for
                our own families. Your trust is our most valuable asset.
            </p>
            <div
                class="mt-8 flex items-center justify-center gap-4 text-sm text-app-text-muted"
            >
                <span class="flex items-center gap-1"
                    ><CheckCircle2 size={16} class="text-emerald-500" /> GDPR Compliant</span
                >
                <span class="flex items-center gap-1"
                    ><CheckCircle2 size={16} class="text-emerald-500" /> Secure Processing</span
                >
            </div>
        </div>
    </header>

    <main class="flex-grow py-20 px-6 max-w-4xl mx-auto w-full">
        <div
            class="mb-12 p-6 bg-app-primary/5 border border-app-primary/10 rounded-2xl"
        >
            <p
                class="text-sm font-bold text-app-primary uppercase tracking-widest mb-2"
            >
                Effective Date
            </p>
            <p class="text-app-text font-medium">
                Last updated: February 5, 2026
            </p>
        </div>

        <div class="space-y-16">
            <section id="introduction">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <FileText size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">1. Introduction</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        YumHero ("we," "us," or "our") respects your privacy and
                        is committed to protecting your personal data. This
                        privacy policy informs you how we look after your
                        personal data when you visit our website (regardless of
                        where you visit it from) and tells you about your
                        privacy rights and how the law protects you.
                    </p>
                    <p>
                        This policy applies to all users of our web application,
                        website, and related services (collectively, the
                        "Platform").
                    </p>
                </div>
            </section>

            <section id="data-collection">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Eye size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">2. Data We Collect</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        Personal data, or personal information, means any
                        information about an individual from which that person
                        can be identified.
                    </p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Identity Data:</strong> Name, username, or similar
                            identifier.
                        </li>
                        <li><strong>Contact Data:</strong> Email address.</li>
                        <li>
                            <strong>Financial Data:</strong> We use third-party payment
                            processors (Paddle) to handle subscriptions. We do not
                            store your full card details.
                        </li>
                        <li>
                            <strong>Technical Data:</strong> IP address, login data,
                            browser type and version, time zone setting, and location.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information about how you
                            use our website and services (e.g., recipe preferences,
                            meal plans).
                        </li>
                    </ul>
                </div>
            </section>

            <section id="how-we-use">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <CheckCircle2 size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">3. How We Use Your Data</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We will only use your personal data when the law allows
                        us to. Most commonly, we will use your personal data in
                        the following circumstances:
                    </p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>To register you as a new customer.</li>
                        <li>To provide and manage your subscription.</li>
                        <li>To personalize your meal planning experience.</li>
                        <li>To notify you about changes to our service.</li>
                        <li>
                            To improve our website, product, and customer
                            experience.
                        </li>
                    </ul>
                </div>
            </section>

            <section id="data-security">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Lock size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">4. Data Security</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We have put in place appropriate security measures to
                        prevent your personal data from being accidentally lost,
                        used or accessed in an unauthorized way, altered or
                        disclosed.
                    </p>
                    <p>
                        In addition, we limit access to your personal data to
                        those employees, agents, contractors, and other third
                        parties who have a business need to know. They will only
                        process your personal data on our instructions and they
                        are subject to a duty of confidentiality.
                    </p>
                </div>
            </section>

            <section id="your-rights">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Shield size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">5. Your Legal Rights</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        Under certain circumstances, you have rights under data
                        protection laws in relation to your personal data:
                    </p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Request access</strong> to your personal data.
                        </li>
                        <li>
                            <strong>Request correction</strong> of your personal
                            data.
                        </li>
                        <li>
                            <strong>Request erasure</strong> of your personal data.
                        </li>
                        <li>
                            <strong>Object to processing</strong> of your personal
                            data.
                        </li>
                        <li>
                            <strong>Request restriction of processing</strong> of
                            your personal data.
                        </li>
                        <li>
                            <strong>Request transfer</strong> of your personal data.
                        </li>
                        <li><strong>Right to withdraw consent</strong>.</li>
                    </ul>
                </div>
            </section>

            <section id="contact">
                <div
                    class="p-8 bg-app-surface border border-app-border rounded-3xl"
                >
                    <h2 class="text-2xl font-bold mb-4">Questions?</h2>
                    <p class="text-app-text-muted mb-6 leading-relaxed">
                        If you have any questions about this privacy policy or
                        our privacy practices, please contact our data
                        protection manager.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-6">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 bg-app-primary/10 rounded-full flex items-center justify-center text-app-primary"
                            >
                                <Mail size={20} />
                            </div>
                            <div>
                                <p
                                    class="text-xs font-bold text-app-text uppercase tracking-wider"
                                >
                                    Email
                                </p>
                                <p class="font-medium">support@yumhero.app</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
