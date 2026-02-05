<script lang="ts">
    import { faqItems } from "$lib/data/landingData";
</script>

<section
    id="faq"
    class="py-24 md:py-32 bg-app-surface-accent relative overflow-hidden"
>
    <!-- Decorative Background -->
    <div
        class="absolute inset-0 pointer-events-none overflow-hidden opacity-50"
    >
        <div
            class="absolute top-[20%] left-[5%] w-[30%] h-[30%] bg-app-primary/5 blur-[100px] rounded-full"
        ></div>
        <div
            class="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-orange-500/5 blur-[100px] rounded-full"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="text-center mb-16 md:mb-24">
            <h2
                class="text-4xl md:text-6xl font-black text-app-text mb-6 tracking-tight"
            >
                Got questions?
            </h2>
            <p
                class="text-xl text-app-text-muted max-w-2xl mx-auto font-medium"
            >
                Everything you need to know about YumHero, from billing to
                kitchen magic.
            </p>
        </div>

        <div class="space-y-4">
            {#each faqItems as faq}
                <details
                    class="group bg-app-surface/50 backdrop-blur-sm border border-app-border rounded-[24px] overflow-hidden transition-all duration-500 hover:bg-app-surface hover:border-app-primary/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                    <summary
                        class="flex items-center justify-between p-7 cursor-pointer list-none select-none"
                    >
                        <h3
                            class="font-bold text-app-text text-xl md:text-2xl tracking-tight group-hover:text-app-primary transition-colors duration-300"
                        >
                            {faq.question}
                        </h3>
                        <div
                            class="relative w-10 h-10 flex items-center justify-center rounded-full bg-app-primary/5 text-app-primary group-hover:bg-app-primary group-hover:text-white transition-all duration-500 shrink-0 ml-6"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="transform transition-transform duration-500 group-open:rotate-180"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </summary>
                    <div
                        class="px-7 pb-8 pt-0 text-app-text-muted text-lg leading-relaxed font-medium max-w-3xl"
                    >
                        {faq.answer}
                    </div>
                </details>
            {/each}
        </div>
    </div>
</section>
