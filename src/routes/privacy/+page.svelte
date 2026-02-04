<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
    title="Privacy Policy"
    description="Read the Privacy Policy for YumHero."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <main class="flex-grow py-20 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <h1 class="text-3xl md:text-5xl font-black mb-8">Privacy Policy</h1>

        <div
            class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-app-text-muted"
        >
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    1. Information We Collect
                </h2>
                <p>
                    We collect information you provide directly to us, such as
                    when you create an account, update your profile, or use our
                    meal planning features. This may include your name, email
                    address, and recipe preferences.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    2. How We Use Your Information
                </h2>
                <p>
                    We use the information we collect to provide, maintain, and
                    improve our services, including to personalize your
                    experience, process transactions, and send you technical
                    notices and support messages.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    3. Data Security
                </h2>
                <p>
                    We take reasonable measures to help protect information
                    about you from loss, theft, misuse and unauthorized access,
                    disclosure, alteration and destruction.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">4. Cookies</h2>
                <p>
                    We use cookies and similar technologies to collect
                    information about your interactions with our service and to
                    improve your experience.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    5. Contact Us
                </h2>
                <p>
                    If you have any questions about this Privacy Policy, please
                    contact us.
                </p>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
