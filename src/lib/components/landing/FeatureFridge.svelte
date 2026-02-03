<script lang="ts">
    import { Refrigerator } from "lucide-svelte";
    import { fridgeItems } from "$lib/data/landingData";
</script>

<section id="features" class="py-20 md:py-32 bg-app-surface">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full text-app-primary text-sm font-medium mb-6"
                >
                    <Refrigerator size={16} />
                    Inventory Management
                </div>
                <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-6">
                    Your fridge, digitized.
                </h2>
                <p class="text-lg text-app-text-muted mb-8">
                    Stop wondering what's in the back of the shelf. YumHero
                    prioritizes what you already own, turning forgotten
                    ingredients into scheduled meals.
                </p>
                <ul class="space-y-4">
                    <li class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 rounded-full bg-accent-lunch-bg flex items-center justify-center shrink-0 mt-0.5"
                        >
                            <div
                                class="w-2 h-2 rounded-full bg-accent-lunch"
                            ></div>
                        </div>
                        <div>
                            <span class="font-bold text-app-text"
                                >Live Inventory</span
                            >
                            <span class="text-app-text-muted">
                                — Log ingredients as you buy them.</span
                            >
                        </div>
                    </li>
                    <li class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 rounded-full bg-accent-dinner-bg flex items-center justify-center shrink-0 mt-0.5"
                        >
                            <div
                                class="w-2 h-2 rounded-full bg-accent-dinner"
                            ></div>
                        </div>
                        <div>
                            <span class="font-bold text-app-text"
                                >Leftover Tracking</span
                            >
                            <span class="text-app-text-muted">
                                — Tuesday's dinner becomes Wednesday's lunch
                                with one click.</span
                            >
                        </div>
                    </li>
                </ul>
            </div>
            <!-- Fridge Mockup -->
            <div class="bg-app-bg border border-app-border rounded-xl p-6">
                <div class="flex items-center gap-2 mb-4">
                    <Refrigerator size={20} class="text-app-primary" />
                    <span class="font-bold text-app-text">Your Fridge</span>
                </div>
                <div class="space-y-3">
                    {#each fridgeItems as item}
                        <div
                            class="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border"
                        >
                            <span class="font-medium text-app-text"
                                >{item.name}</span
                            >
                            <span
                                class="text-xs px-2 py-1 rounded-full {item.tagColor}"
                                >{item.tag}</span
                            >
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</section>
