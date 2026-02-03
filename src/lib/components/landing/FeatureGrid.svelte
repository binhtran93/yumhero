<script lang="ts">
    import { ArrowRight, Calendar, Utensils } from "lucide-svelte";
</script>

<section class="py-20 md:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <!-- 3-Step Diagram -->
            <div class="order-2 md:order-1">
                <div class="flex flex-col md:flex-row items-center gap-4">
                    <!-- Step 1 -->
                    <div
                        class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                    >
                        <div
                            class="w-10 h-10 rounded-full bg-app-primary/10 text-app-primary font-bold flex items-center justify-center mx-auto mb-3"
                        >
                            1
                        </div>
                        <div class="text-sm font-medium text-app-text">
                            Browse Recipes
                        </div>
                        <div
                            class="mt-2 h-12 bg-app-surface-hover rounded-lg flex items-center justify-center"
                        >
                            <Utensils size={20} class="text-app-text-muted" />
                        </div>
                    </div>
                    <!-- Arrow -->
                    <ArrowRight
                        size={24}
                        class="text-app-text-muted shrink-0 rotate-90 md:rotate-0"
                    />
                    <!-- Step 2 -->
                    <div
                        class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                    >
                        <div
                            class="w-10 h-10 rounded-full bg-app-primary/10 text-app-primary font-bold flex items-center justify-center mx-auto mb-3"
                        >
                            2
                        </div>
                        <div class="text-sm font-medium text-app-text">
                            Drag to Calendar
                        </div>
                        <div
                            class="mt-2 h-12 bg-accent-dinner-bg rounded-lg flex items-center justify-center"
                        >
                            <Calendar size={20} class="text-accent-dinner" />
                        </div>
                    </div>
                    <!-- Arrow -->
                    <ArrowRight
                        size={24}
                        class="text-app-text-muted shrink-0 rotate-90 md:rotate-0"
                    />
                    <!-- Step 3 -->
                    <div
                        class="flex-1 bg-app-surface border border-app-border rounded-xl p-4 text-center"
                    >
                        <div
                            class="w-10 h-10 rounded-full bg-accent-lunch/20 text-accent-lunch font-bold flex items-center justify-center mx-auto mb-3"
                        >
                            ✓
                        </div>
                        <div class="text-sm font-medium text-app-text">
                            Week Planned!
                        </div>
                        <div
                            class="mt-2 h-12 bg-accent-lunch-bg rounded-lg flex items-center justify-center text-sm text-accent-lunch font-medium"
                        >
                            Done in 2 min
                        </div>
                    </div>
                </div>
            </div>
            <div class="order-1 md:order-2">
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full text-app-primary text-sm font-medium mb-6"
                >
                    <Calendar size={16} />
                    Speed & Efficiency
                </div>
                <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-6">
                    A UI built for speed.
                </h2>
                <p class="text-lg text-app-text-muted">
                    No fluff, just functionality. Our drag-and-drop grid allows
                    you to map out an entire week in under two minutes. Every
                    pixel is designed for rapid meal planning.
                </p>
            </div>
        </div>
    </div>
</section>
