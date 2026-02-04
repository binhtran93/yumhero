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

    <div class="max-w-3xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                Frequently Asked Questions
            </h2>
            <p class="text-lg text-app-text-muted">
                Everything you need to know about the product and billing.
            </p>
        </div>
        <div class="space-y-4">
            {#each faqItems as faq}
                <details
                    class="bg-app-surface border border-app-border rounded-2xl group overflow-hidden transition-all duration-300 hover:border-app-border-strong hover:shadow-sm"
                >
                    <summary
                        class="flex items-center justify-between p-6 cursor-pointer list-none select-none"
                    >
                        <span class="font-bold text-app-text text-lg"
                            >{faq.question}</span
                        >
                        <span
                            class="text-app-primary bg-app-primary/10 w-8 h-8 rounded-full flex items-center justify-center group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    d="M5 7.5L10 12.5L15 7.5"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </span>
                    </summary>
                    <div
                        class="px-6 pb-6 pt-0 text-app-text-muted leading-relaxed"
                    >
                        {faq.answer}
                    </div>
                </details>
            {/each}
        </div>
    </div>
</section>
