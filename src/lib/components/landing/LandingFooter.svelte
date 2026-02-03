<script lang="ts">
    import { ChefHat } from "lucide-svelte";
</script>

<footer class="py-16 border-t border-app-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid md:grid-cols-4 gap-12 mb-12">
            <!-- Brand -->
            <div class="md:col-span-1">
                <a href="/" class="flex items-center gap-2 mb-4">
                    <div class="p-1.5 bg-app-primary/10 rounded-lg">
                        <ChefHat size={20} class="text-app-primary" />
                    </div>
                    <span class="text-lg font-bold text-app-text">YumHero</span>
                </a>
                <p class="text-sm text-app-text-muted">
                    Built for the modern kitchen.
                </p>
            </div>

            <!-- Product Links -->
            <div>
                <h4 class="font-bold text-app-text mb-4">Product</h4>
                <ul class="space-y-2">
                    <li>
                        <a
                            href="#features"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >Features</a
                        >
                    </li>
                    <li>
                        <a
                            href="/recipes"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >Recipes</a
                        >
                    </li>
                    <li>
                        <a
                            href="#pricing"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >Pricing</a
                        >
                    </li>
                </ul>
            </div>

            <!-- Company Links -->
            <div>
                <h4 class="font-bold text-app-text mb-4">Company</h4>
                <ul class="space-y-2">
                    <li>
                        <a
                            href="/about"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >About</a
                        >
                    </li>
                    <li>
                        <a
                            href="#journal"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >Journal</a
                        >
                    </li>
                    <li>
                        <a
                            href="mailto:hello@yumhero.app"
                            class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                            >Contact</a
                        >
                    </li>
                </ul>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div
            class="pt-8 border-t border-app-border flex flex-col md:flex-row justify-between items-center gap-4"
        >
            <p class="text-sm text-app-text-muted">
                © 2026 YumHero. All rights reserved.
            </p>
            <div class="flex gap-6">
                <a
                    href="/privacy"
                    class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                    >Privacy Policy</a
                >
                <a
                    href="/terms"
                    class="text-sm text-app-text-muted hover:text-app-text transition-colors"
                    >Terms of Service</a
                >
            </div>
        </div>
    </div>
</footer>
