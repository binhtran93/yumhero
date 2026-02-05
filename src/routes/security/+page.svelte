<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import {
        ShieldAlert,
        Server,
        Activity,
        Lock,
        CheckCircle2,
    } from "lucide-svelte";
</script>

<SEO
    title="Security | YumHero"
    description="Learn about the enterprise-grade security measures YumHero takes to protect your data and privacy."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <header class="pt-32 pb-16 bg-app-surface border-b border-app-border">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-app-primary/10 rounded-2xl mb-6"
            >
                <ShieldAlert size={32} class="text-app-primary" />
            </div>
            <h1 class="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Security at YumHero
            </h1>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                Security is built into our DNA. We use industry-standard
                encryption and security protocols to ensure your data stays
                private and protected.
            </p>
        </div>
    </header>

    <main class="flex-grow py-20 px-6 max-w-4xl mx-auto w-full">
        <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div
                class="p-8 bg-app-surface border border-app-border rounded-3xl shadow-sm"
            >
                <div
                    class="w-12 h-12 bg-app-primary/10 rounded-xl flex items-center justify-center text-app-primary mb-6"
                >
                    <Lock size={24} />
                </div>
                <h3 class="text-xl font-bold mb-4">Encryption</h3>
                <p class="text-app-text-muted leading-relaxed">
                    All data is encrypted in transit using industry-standard TLS
                    1.3 protocols. At rest, sensitive data is protected using
                    AES-256 encryption.
                </p>
            </div>

            <div
                class="p-8 bg-app-surface border border-app-border rounded-3xl shadow-sm"
            >
                <div
                    class="w-12 h-12 bg-app-primary/10 rounded-xl flex items-center justify-center text-app-primary mb-6"
                >
                    <Server size={24} />
                </div>
                <h3 class="text-xl font-bold mb-4">Cloud Security</h3>
                <p class="text-app-text-muted leading-relaxed">
                    Our infrastructure is hosted on world-class, ISO 27001 and
                    SOC 2 Type II compliant data centers provided by Google
                    Cloud and Vercel.
                </p>
            </div>
        </div>

        <div class="space-y-16">
            <section id="data-protection">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <CheckCircle2 size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">Data Protection</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We follow the principle of least privilege. Access to
                        production data is strictly limited to essential
                        personnel only and is protected by multi-factor
                        authentication (MFA).
                    </p>
                    <p>
                        We do not store plain-text passwords. All authentication
                        is handled through secure, hashed tokens and third-party
                        authentication providers like Firebase Auth.
                    </p>
                </div>
            </section>

            <section id="payment-security">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Lock size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">Payment Security</h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        YumHero is PCI-DSS compliant by proxy. We never see or
                        store your credit card information. All payments are
                        processed by <strong>Paddle</strong>, an
                        industry-leading merchant of record that handles
                        billions of dollars in transactions securely.
                    </p>
                </div>
            </section>

            <section id="monitoring">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-app-surface border border-app-border rounded-xl flex items-center justify-center text-app-primary"
                    >
                        <Activity size={20} />
                    </div>
                    <h2 class="text-2xl font-bold">
                        Monitoring & Incident Response
                    </h2>
                </div>
                <div
                    class="prose prose-lg dark:prose-invert max-w-none text-app-text-muted leading-relaxed space-y-4"
                >
                    <p>
                        We utilize continuous monitoring and alerting systems to
                        detect and respond to any anomalies or potential threats
                        in real-time. Our team has a documented incident
                        response plan to handle potential security events
                        quickly and effectively.
                    </p>
                </div>
            </section>

            <section id="vulnerability-disclosure">
                <div
                    class="p-8 bg-app-surface border border-app-border rounded-3xl"
                >
                    <h2 class="text-2xl font-bold mb-4">
                        Responsible Disclosure
                    </h2>
                    <p class="text-app-text-muted mb-6 leading-relaxed">
                        Found a security vulnerability? We appreciate the help
                        of the security research community. Please report any
                        findings to us immediately.
                    </p>
                    <a
                        href="mailto:security@yumhero.app"
                        class="inline-flex items-center gap-2 font-bold text-app-primary hover:underline"
                    >
                        Contact our Security Team
                        <Lock size={16} />
                    </a>
                </div>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
