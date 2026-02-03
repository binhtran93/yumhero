<script lang="ts">
    import { Utensils } from "lucide-svelte";

    const posts = [
        {
            title: "The Engineering of a Weekly Prep",
            subtitle: "How to save 4 hours a week with systematic planning.",
            color: "bg-amber-100",
        },
        {
            title: "Why 'Fridge-First' Planning Works",
            subtitle: "The secret to reducing food waste by 60%.",
            color: "bg-emerald-100",
        },
        {
            title: "5 Pantry Essentials",
            subtitle: "Building a high-performance kitchen from scratch.",
            color: "bg-sky-100",
        },
    ];
</script>

<section id="journal" class="py-20 md:py-32 bg-app-surface">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                The YumHero Journal
            </h2>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                Insights and strategies for the modern kitchen. Expert advice to
                maximize your meal prep.
            </p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
            {#each posts as post}
                <article
                    class="bg-app-bg border border-app-border rounded-xl overflow-hidden hover:border-app-border-strong transition-colors group cursor-pointer"
                >
                    <div
                        class="h-40 {post.color} flex items-center justify-center"
                    >
                        <Utensils size={32} class="text-app-text-muted/30" />
                    </div>
                    <div class="p-5">
                        <h3
                            class="font-bold text-app-text group-hover:text-app-primary transition-colors mb-2"
                        >
                            {post.title}
                        </h3>
                        <p class="text-sm text-app-text-muted">
                            {post.subtitle}
                        </p>
                    </div>
                </article>
            {/each}
        </div>
    </div>
</section>
