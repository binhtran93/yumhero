<script lang="ts">
    import { ChefHat } from "lucide-svelte";
</script>

<footer class="py-20 bg-app-surface border-t border-app-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <!-- Brand Column (2 cols wide on desktop) -->
            <div class="col-span-2 md:col-span-2">
                <a href="/" class="flex items-center gap-2 mb-6">
                    <div class="p-1.5 bg-app-primary/10 rounded-lg">
                        <ChefHat size={24} class="text-app-primary" />
                    </div>
                    <span class="text-xl font-bold text-app-text">YumHero</span>
                </a>
                <p class="text-app-text-muted mb-6 leading-relaxed max-w-sm">
                    The intelligent meal planning platform for the modern home.
                    Reduce waste, save money, and eat better with precision
                    planning.
                </p>
            </div>

            <!-- Product -->
            <div>
                <h4 class="font-bold text-app-text mb-6">Product</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="/#planning"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Features</a
                        >
                    </li>
                    <li>
                        <a
                            href="/#pricing"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Pricing</a
                        >
                    </li>
                    <li>
                        <a
                            href="/#faq"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >FAQ</a
                        >
                    </li>
                </ul>
            </div>

            <div>
                <h4 class="font-bold text-app-text mb-6">About</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="/about"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >About Us</a
                        >
                    </li>
                    <li>
                        <a
                            href="/about#contact"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Contact</a
                        >
                    </li>
                </ul>
            </div>

            <!-- Legal -->
            <div>
                <h4 class="font-bold text-app-text mb-6">Legal</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Privacy Policy</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Terms of Service</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Cookie Policy</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Security</a
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
                © {new Date().getFullYear()} YumHero. All rights reserved.
            </p>
            <div class="flex items-center gap-6">
                <!-- Status Dot -->
                <div class="flex items-center gap-2">
                    <div
                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                    ></div>
                    <span class="text-sm text-app-text-muted"
                        >All systems normal</span
                    >
                </div>
            </div>
        </div>
    </div>
</footer>
