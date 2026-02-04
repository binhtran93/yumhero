<script lang="ts">
    import { ChefHat } from "lucide-svelte";
</script>

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
