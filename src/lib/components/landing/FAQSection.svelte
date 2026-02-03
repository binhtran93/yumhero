<script lang="ts">
    import { faqItems } from "$lib/data/landingData";
</script>

<section id="faq" class="py-20 md:py-32 bg-app-surface">
    <div class="max-w-3xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                Frequently Asked Questions
            </h2>
        </div>
        <div class="space-y-4">
            {#each faqItems as faq}
                <details
                    class="bg-app-bg border border-app-border rounded-xl group"
                >
                    <summary
                        class="flex items-center justify-between p-5 cursor-pointer list-none"
                    >
                        <span class="font-bold text-app-text"
                            >{faq.question}</span
                        >
                        <span
                            class="text-app-text-muted group-open:rotate-180 transition-transform"
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
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </span>
                    </summary>
                    <div class="px-5 pb-5 text-app-text-muted">
                        {faq.answer}
                    </div>
                </details>
            {/each}
        </div>
    </div>
</section>
