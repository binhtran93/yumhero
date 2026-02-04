<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";
    import SEO from "$lib/components/SEO.svelte";
</script>

<SEO
    title="Terms of Service"
    description="Read the Terms of Service for YumHero."
/>

<div class="min-h-screen bg-app-bg text-app-text font-display flex flex-col">
    <LandingNav />

    <main class="flex-grow py-20 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <h1 class="text-3xl md:text-5xl font-black mb-8">Terms of Service</h1>

        <div
            class="prose prose-lg dark:prose-invert max-w-none space-y-6 text-app-text-muted"
        >
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    1. Introduction
                </h2>
                <p>
                    Welcome to YumHero. By accessing or using our website and
                    services, you agree to be bound by these Terms of Service
                    and our Privacy Policy.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    2. Use of Service
                </h2>
                <p>
                    YumHero provides meal planning and inventory management
                    tools. You agree to use the service only for lawful purposes
                    and in accordance with these Terms.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">
                    3. User Accounts
                </h2>
                <p>
                    To access certain features, you must create an account. You
                    are responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under
                    your account.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">4. Content</h2>
                <p>
                    Users may input data such as recipes and inventory items.
                    You retain ownership of your data, but grant YumHero a
                    license to use it to provide and improve the service.
                </p>
            </section>

            <section>
                <h2 class="text-xl font-bold text-app-text mb-2">5. Contact</h2>
                <p>
                    If you have any questions about these Terms, please contact
                    us.
                </p>
            </section>
        </div>
    </main>

    <LandingFooter />
</div>
