<script lang="ts">
    const pricingTiers = [
        {
            name: "Starter",
            price: "Free",
            features: [
                "Weekly Grid Planning",
                "Up to 20 Recipes",
                "Basic Fridge Sync",
                "Community Support",
            ],
            cta: "Get Started",
            highlighted: false,
        },
        {
            name: "Pro",
            price: "$8",
            period: "/mo",
            features: [
                "Unlimited Planning",
                "Unlimited Recipes",
                "Advanced Fridge Logic",
                "Priority Support",
            ],
            cta: "Start Free Trial",
            highlighted: true,
        },
        {
            name: "Lifetime",
            price: "$149",
            features: [
                "Everything in Pro",
                "One-time Payment",
                "Lifetime Updates",
                "Priority Support",
            ],
            cta: "Buy Lifetime",
            highlighted: false,
        },
    ];
</script>

<section id="pricing" class="py-20 md:py-32">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-app-text mb-4">
                Simple & Transparent
            </h2>
            <p class="text-lg text-app-text-muted">
                No hidden fees. No upsells. Choose the plan that fits your
                kitchen.
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {#each pricingTiers as tier}
                <div
                    class="bg-app-surface rounded-xl p-6 relative {tier.highlighted
                        ? 'border-2 border-app-primary'
                        : 'border border-app-border'}"
                >
                    {#if tier.highlighted}
                        <div
                            class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-app-primary text-white text-xs font-bold rounded-full"
                        >
                            Most Popular
                        </div>
                    {/if}
                    <div class="text-center mb-6">
                        <h3 class="text-lg font-bold text-app-text mb-2">
                            {tier.name}
                        </h3>
                        <div class="text-3xl font-bold text-app-text">
                            {tier.price}{#if tier.period}<span
                                    class="text-lg text-app-text-muted font-normal"
                                    >{tier.period}</span
                                >{/if}
                        </div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        {#each tier.features as feature}
                            <li
                                class="flex items-center gap-2 text-sm text-app-text-muted"
                            >
                                <div
                                    class="w-1.5 h-1.5 rounded-full bg-app-primary"
                                ></div>
                                {feature}
                            </li>
                        {/each}
                    </ul>
                    <a
                        href="/plan"
                        class="block w-full py-3 text-center rounded-lg font-medium transition-colors {tier.highlighted
                            ? 'bg-app-primary text-white font-bold hover:bg-app-primary/90'
                            : 'border border-app-border text-app-text hover:bg-app-surface-hover'}"
                    >
                        {tier.cta}
                    </a>
                </div>
            {/each}
        </div>
    </div>
</section>
