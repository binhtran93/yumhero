<script lang="ts">
    import { loading as authLoading, signOut, user } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
        hasUsedTrial,
    } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { Check, LogOut, Zap } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import { onMount } from "svelte";
    import {
        PUBLIC_PADDLE_CLIENT_TOKEN,
        PUBLIC_PADDLE_PRICE_ID_MONTHLY,
        PUBLIC_PADDLE_PRICE_ID_YEARLY,
        PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL,
        PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL,
    } from "$env/static/public";
    import { initializePaddle, type Paddle } from "@paddle/paddle-js";

    // Protect this route: Must be logged in
    $effect(() => {
        if (!$authLoading && !$user) {
            goto("/login", { replaceState: true });
        } else if (
            !$authLoading &&
            !$subscriptionLoading &&
            $user &&
            $isSubscribed
        ) {
            goto("/plan", { replaceState: true }); // Already subscribed
        }
    });

    let isLoading = $state(false);
    let selectedPlan = $state<"monthly" | "yearly">("monthly");
    let paddleInstance = $state<Paddle | undefined>(undefined);

    onMount(async () => {
        if (PUBLIC_PADDLE_CLIENT_TOKEN) {
            const isSandbox = PUBLIC_PADDLE_CLIENT_TOKEN.startsWith("test_");
            const environment = isSandbox ? "sandbox" : "production";

            try {
                paddleInstance = await initializePaddle({
                    token: PUBLIC_PADDLE_CLIENT_TOKEN,
                    environment: environment,
                });
                console.log("Paddle v2 Initialized (" + environment + ")");
            } catch (err) {
                console.error("Failed to initialize Paddle:", err);
            }
        }
    });

    const handleSubscribe = () => {
        let priceId: string;

        if ($hasUsedTrial) {
            priceId =
                selectedPlan === "monthly"
                    ? PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL
                    : PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL;
        } else {
            priceId =
                selectedPlan === "monthly"
                    ? PUBLIC_PADDLE_PRICE_ID_MONTHLY
                    : PUBLIC_PADDLE_PRICE_ID_YEARLY;
        }

        if (!PUBLIC_PADDLE_CLIENT_TOKEN || !priceId) {
            // ... alert ...
            return;
        }

        if (!paddleInstance) {
            console.error("Paddle instance not ready");
            return;
        }

        isLoading = true;

        try {
            paddleInstance.Checkout.open({
                items: [{ priceId: priceId, quantity: 1 }],
                customData: { userId: $user?.uid },
                settings: {
                    successUrl: window.location.origin + "/plan",
                    displayMode: "overlay",
                    theme: "light",
                },
            });
        } catch (err) {
            console.error("Paddle Checkout Error:", err);
            isLoading = false;
        }
    };

    const handleSignOut = async () => {
        await signOut();
        goto("/login");
    };
</script>

<div
    class="min-h-screen bg-app-bg text-app-text font-display flex flex-col items-center justify-center p-6 relative overflow-hidden"
>
    <!-- Background Elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-app-primary/5 blur-[100px] rounded-full"
        ></div>
        <div
            class="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full"
        ></div>
    </div>

    <div
        class="w-full max-w-lg bg-app-surface border border-app-border rounded-3xl shadow-2xl relative z-10 overflow-hidden"
        in:fly={{ y: 20, duration: 600 }}
    >
        <!-- Header -->
        <div
            class="bg-app-primary/5 p-8 text-center border-b border-app-border"
        >
            <h1 class="text-2xl md:text-3xl font-black mb-2">Unlock YumHero</h1>
            <p class="text-app-text-muted">
                {#if $hasUsedTrial}
                    Choose the plan that fits your kitchen.
                {:else}
                    Start your 7-day free trial. Cancel anytime.
                {/if}
            </p>
        </div>

        <div class="p-8 space-y-8">
            <!-- Plan Switcher -->
            <div
                class="flex p-1 bg-app-surface-deep rounded-xl border border-app-border"
            >
                <button
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {selectedPlan ===
                    'monthly'
                        ? 'bg-app-surface shadow-sm text-app-text'
                        : 'text-app-text-muted hover:text-app-text'}"
                    onclick={() => (selectedPlan = "monthly")}
                >
                    Monthly
                </button>
                <button
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {selectedPlan ===
                    'yearly'
                        ? 'bg-app-surface shadow-sm text-app-text'
                        : 'text-app-text-muted hover:text-app-text'}"
                    onclick={() => (selectedPlan = "yearly")}
                >
                    Yearly <span class="text-xs text-green-600 ml-1">-30%</span>
                </button>
            </div>

            <!-- Price -->
            <div class="text-center">
                {#if selectedPlan === "monthly"}
                    <div
                        class="flex items-end justify-center gap-1 mb-1"
                        in:fade
                    >
                        <span class="text-5xl font-black text-app-text"
                            >$5.45</span
                        >
                        <span
                            class="text-lg text-app-text-muted mb-2 font-medium"
                            >/mo</span
                        >
                    </div>
                    <p
                        class="text-xs text-app-text-muted uppercase tracking-wider font-bold"
                        in:fade
                    >
                        Billed Monthly
                    </p>
                {:else}
                    <div
                        class="flex items-end justify-center gap-1 mb-1"
                        in:fade
                    >
                        <span class="text-5xl font-black text-app-text"
                            >$45</span
                        >
                        <span
                            class="text-lg text-app-text-muted mb-2 font-medium"
                            >/yr</span
                        >
                    </div>
                    <p
                        class="text-xs text-app-text-muted uppercase tracking-wider font-bold"
                        in:fade
                    >
                        Billed Yearly ($3.75/mo)
                    </p>
                {/if}
            </div>

            <!-- Features -->
            <ul class="space-y-4 max-w-xs mx-auto">
                <li class="flex items-center gap-3">
                    <div class="p-1 rounded-full bg-green-100 text-green-600">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span class="font-medium text-app-text"
                        >Unlimited Meal Planning</span
                    >
                </li>
                <li class="flex items-center gap-3">
                    <div class="p-1 rounded-full bg-green-100 text-green-600">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span class="font-medium text-app-text"
                        >Smart Fridge Inventory</span
                    >
                </li>
                <li class="flex items-center gap-3">
                    <div class="p-1 rounded-full bg-green-100 text-green-600">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span class="font-medium text-app-text"
                        >Universal Recipe Import</span
                    >
                </li>
                <li class="flex items-center gap-3">
                    <div class="p-1 rounded-full bg-green-100 text-green-600">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span class="font-medium text-app-text"
                        >Print Week Plan & Grocery List</span
                    >
                </li>
            </ul>

            <!-- Action -->
            <div class="space-y-4">
                <button
                    onclick={handleSubscribe}
                    disabled={isLoading}
                    class="w-full py-4 text-center rounded-xl font-bold text-lg transition-all bg-app-primary text-white shadow-xl shadow-app-primary/20 hover:shadow-app-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {#if isLoading}
                        Processing...
                    {:else if $hasUsedTrial}
                        Subscribe {selectedPlan === "monthly"
                            ? "Monthly"
                            : "Yearly"}
                    {:else}
                        Start {selectedPlan === "monthly"
                            ? "Monthly"
                            : "Yearly"} Free Trial
                    {/if}
                </button>

                <p class="text-xs text-center text-app-text-muted">
                    Secured by Paddle. {#if !$hasUsedTrial}You won't be charged
                        until your trial ends.{:else}Cancel anytime.{/if}
                </p>
            </div>
        </div>

        <!-- User Info / Logout -->
        <div
            class="bg-app-surface-deep p-4 border-t border-app-border flex items-center justify-between"
        >
            <div class="flex items-center gap-3">
                {#if $user?.photoURL}
                    <img
                        src={$user.photoURL}
                        alt="User"
                        class="w-8 h-8 rounded-full border border-app-border"
                    />
                {:else}
                    <div
                        class="w-8 h-8 rounded-full bg-app-surface border border-app-border"
                    />
                {/if}
                <div class="text-xs">
                    <p class="font-bold text-app-text">
                        {$user?.displayName || "User"}
                    </p>
                    <p class="text-app-text-muted">{$user?.email}</p>
                </div>
            </div>
            <button
                onclick={handleSignOut}
                class="p-2 hover:bg-app-surface rounded-lg text-app-text-muted hover:text-red-500 transition-colors"
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
        </div>
    </div>
</div>
