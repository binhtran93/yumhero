<script lang="ts">
    import { ChefHat, Menu, X } from "lucide-svelte";
    import { slide } from "svelte/transition";

    let isMenuOpen = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }
</script>

<nav
    class="fixed top-0 left-0 right-0 z-50 bg-app-bg/80 backdrop-blur-md border-b border-app-border"
>
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a
                href="/"
                class="flex items-center gap-2 z-50"
                onclick={closeMenu}
            >
                <div class="p-1.5 bg-app-primary/10 rounded-lg">
                    <ChefHat size={24} class="text-app-primary" />
                </div>
                <span class="text-xl font-bold text-app-text">YumHero</span>
            </a>

            <!-- Desktop Nav -->
            <div class="hidden md:flex items-center gap-8">
                <a
                    href="#preview"
                    class="text-sm font-medium text-app-text-muted hover:text-app-text transition-colors"
                    >How it works</a
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

            <!-- CTA Desktop -->
            <div class="hidden md:block">
                <a
                    href="/plan"
                    class="px-5 py-2.5 bg-app-primary text-white text-sm font-bold rounded-lg hover:bg-app-primary/90 transition-all active:scale-95"
                >
                    Start Planning
                </a>
            </div>

            <!-- Mobile Menu Toggle -->
            <button
                class="md:hidden z-50 p-2 text-app-text"
                onclick={toggleMenu}
                aria-label="Toggle menu"
            >
                {#if isMenuOpen}
                    <X size={24} />
                {:else}
                    <Menu size={24} />
                {/if}
            </button>
        </div>
    </div>

    <!-- Mobile Menu Overlay -->
    {#if isMenuOpen}
        <div
            class="fixed top-0 left-0 w-full h-screen bg-white dark:bg-[#161412] z-40 flex flex-col pt-24 px-6 md:hidden overflow-y-auto"
            transition:slide={{ duration: 300, axis: "y" }}
        >
            <div class="flex flex-col gap-6 text-lg font-medium">
                <a
                    href="#preview"
                    class="py-2 border-b border-app-border text-app-text"
                    onclick={closeMenu}>How it works</a
                >
                <a
                    href="#pricing"
                    class="py-2 border-b border-app-border text-app-text"
                    onclick={closeMenu}>Pricing</a
                >
                <a
                    href="#faq"
                    class="py-2 border-b border-app-border text-app-text"
                    onclick={closeMenu}>FAQ</a
                >
                <a
                    href="/plan"
                    class="mt-4 w-full py-4 bg-app-primary text-white text-center font-bold rounded-xl"
                    onclick={closeMenu}
                >
                    Start Planning
                </a>
            </div>
        </div>
    {/if}
</nav>
