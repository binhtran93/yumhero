<script lang="ts">
    import { user } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";

    let isAnnual = $state(true);

    const planLink = $derived(
        !$user
            ? "/login"
            : $subscriptionLoading
              ? "/plan"
              : !$isSubscribed
                ? "/subscribe"
                : "/plan",
    );

    const monthlyPrice = 4.99;
    const yearlyPrice = 39.99;
    const savingsPercent = Math.round(
        (1 - yearlyPrice / (monthlyPrice * 12)) * 100,
    );
</script>

<section id="pricing" class="py-20 md:py-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-bold text-app-text mb-6">
                Simple & Transparent
            </h2>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                No hidden fees. No upsells. One plan for all your kitchen needs.
            </p>
        </div>

        <div class="flex flex-col items-center gap-12">
            <!-- Billing Toggle -->
            <div class="relative flex items-center">
                <div
                    class="bg-app-surface-deep p-1.5 rounded-full flex items-center border border-app-border relative"
                >
                    <div
                        class="absolute h-[calc(100%-12px)] top-[6px] transition-all duration-300 ease-out bg-app-primary rounded-full shadow-md"
                        style="width: {isAnnual
                            ? 'calc(50% - 6px)'
                            : 'calc(50% - 6px)'}; left: {isAnnual
                            ? 'calc(50%)'
                            : '6px'}"
                    ></div>

                    <button
                        onclick={() => (isAnnual = false)}
                        class="px-8 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 {!isAnnual
                            ? 'text-white'
                            : 'text-app-text-muted hover:text-app-text'}"
                    >
                        Monthly
                    </button>
                    <button
                        onclick={() => (isAnnual = true)}
                        class="px-8 py-2.5 text-sm font-bold relative z-10 transition-colors duration-300 {isAnnual
                            ? 'text-white'
                            : 'text-app-text-muted hover:text-app-text'}"
                    >
                        Annually
                    </button>
                </div>

                <!-- Save Label & Arrow -->
                <div
                    class="absolute -right-12 -top-16 md:-right-24 md:-top-16 flex flex-col items-center pointer-events-none select-none"
                >
                    <span
                        class="font-['Caveat'] text-2xl md:text-3xl text-app-text-muted transform rotate-[8deg] -translate-x-2"
                    >
                        Save {savingsPercent}%
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="60"
                        height="40"
                        viewBox="0 0 60 40"
                        fill="none"
                        class="text-app-text-muted transform -translate-x-2 -translate-y-1"
                    >
                        <!-- Main Curve -->
                        <path
                            d="M50 8C40 8 18 12 12 28"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <!-- Arrowhead (Single path for perfect join) -->
                        <path
                            d="M21 23L12 28L10 18"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>

            <!-- Single Pricing Card -->
            <div class="w-full max-w-md">
                <div
                    class="bg-app-surface rounded-3xl p-8 md:p-10 border-2 border-app-primary shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all hover:shadow-[0_20px_60px_rgba(194,65,12,0.15)] group"
                >
                    <!-- Decorative background element -->
                    <div
                        class="absolute top-0 right-0 w-32 h-32 bg-app-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
                    ></div>

                    <div class="text-center mb-10">
                        <h3 class="text-2xl font-bold text-app-text mb-4">
                            Pro Plan
                        </h3>
                        <div class="flex items-baseline justify-center gap-1">
                            <span
                                class="text-5xl md:text-6xl font-black text-app-text tracking-tight transition-all"
                            >
                                ${isAnnual ? yearlyPrice : monthlyPrice}
                            </span>
                            <span
                                class="text-xl text-app-text-muted font-medium"
                            >
                                /{isAnnual ? "yr" : "mo"}
                            </span>
                        </div>
                        <p class="text-sm text-app-text-muted mt-3">
                            {isAnnual
                                ? `Billed yearly ($${(yearlyPrice / 12).toFixed(2)}/mo)`
                                : "Billed monthly. Cancel anytime."}
                        </p>
                    </div>

                    <ul class="space-y-4 mb-10">
                        {#each ["Ad-free recipe imports from any blog", "Rapid 2-minute weekly meal planning", "Visual fridge inventory & tracking", "Smart shopping lists sorted by aisle", "Hands-free focused cooking mode", "Universal cloud sync across all devices"] as feature}
                            <li
                                class="flex items-start gap-4 text-app-text group/item"
                            >
                                <div
                                    class="shrink-0 p-1.5 rounded-full bg-green-200 text-green-800 group-hover/item:scale-110 transition-transform"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="3"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        ><polyline points="20 6 9 17 4 12"
                                        ></polyline></svg
                                    >
                                </div>
                                <span class="font-medium text-lg"
                                    >{feature}</span
                                >
                            </li>
                        {/each}
                    </ul>

                    <a
                        href={planLink}
                        class="block w-full py-5 text-center rounded-2xl font-bold transition-all bg-app-primary text-white text-lg shadow-xl shadow-app-primary/25 hover:shadow-app-primary/40 hover:-translate-y-1 active:scale-[0.98]"
                    >
                        Start 7-Day Free Trial
                    </a>

                    <p class="text-center text-xs text-app-text-muted mt-5">
                        Start your free trial. No charge today
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>
