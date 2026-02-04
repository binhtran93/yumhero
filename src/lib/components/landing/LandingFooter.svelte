<script lang="ts">
    import { ChefHat } from "lucide-svelte";
</script>

<footer class="py-20 bg-app-surface border-t border-app-border">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
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
                <div class="flex items-center gap-4">
                    <a
                        href="#"
                        class="text-app-text-muted hover:text-app-primary transition-colors"
                        aria-label="Twitter"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 12.5S.2 5.3 7.8 4.5c2.1-.1 3.2.4 3.2.4l.9 10s3.5-3.8 3.5-3.8l-1.3-4.5s.4-.4 1.1-.4 1.3.1 1.3.1l1.5-1.9"
                            /></svg
                        >
                    </a>
                    <a
                        href="#"
                        class="text-app-text-muted hover:text-app-primary transition-colors"
                        aria-label="GitHub"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
                            /><path d="M9 18c-4.51 2-5-2-7-2" /></svg
                        >
                    </a>
                    <a
                        href="#"
                        class="text-app-text-muted hover:text-app-primary transition-colors"
                        aria-label="LinkedIn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                            /><rect width="4" height="12" x="2" y="9" /><circle
                                cx="4"
                                cy="4"
                                r="2"
                            /></svg
                        >
                    </a>
                </div>
            </div>

            <!-- Product -->
            <div>
                <h4 class="font-bold text-app-text mb-6">Product</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Features</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Pricing</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Integrations</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Changelog</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Documentation</a
                        >
                    </li>
                </ul>
            </div>

            <!-- Resources -->
            <div>
                <h4 class="font-bold text-app-text mb-6">Resources</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Blog</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Community</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Help Center</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Status</a
                        >
                    </li>
                </ul>
            </div>

            <!-- Company -->
            <div>
                <h4 class="font-bold text-app-text mb-6">Company</h4>
                <ul class="space-y-4">
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >About</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Careers</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="text-sm text-app-text-muted hover:text-app-primary transition-colors"
                            >Legal</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
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
                © {new Date().getFullYear()} YumHero Inc. All rights reserved.
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
