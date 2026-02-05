<script lang="ts">
    import { loading as authLoading, signOut, user } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
        hasUsedTrial,
    } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { LogOut } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import { openCheckout } from "$lib/paddle";
    import PricingTable from "$lib/components/PricingTable.svelte";

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
        class="w-full max-w-xl bg-app-surface border border-app-border rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
        in:fly={{ y: 20, duration: 600 }}
    >
        <!-- Header -->
        <div
            class="bg-app-primary/5 p-8 text-center border-b border-app-border"
        >
            <h1 class="text-3xl md:text-4xl font-black mb-3 text-app-text">
                Unlock YumHero
            </h1>
            <p class="text-lg text-app-text-muted">
                {#if $hasUsedTrial}
                    Choose the plan that fits your kitchen.
                {:else}
                    Start your 7-day free trial. Cancel anytime.
                {/if}
            </p>
        </div>

        <div class="p-8 md:p-12">
            <PricingTable bind:isLoading />
        </div>

        <!-- User Info / Logout -->
        <div
            class="bg-app-surface-deep p-6 border-t border-app-border flex items-center justify-between"
        >
            <div class="flex items-center gap-4">
                {#if $user?.photoURL}
                    <img
                        src={$user.photoURL}
                        alt="User"
                        class="w-10 h-10 rounded-full border-2 border-app-border shadow-sm"
                    />
                {:else}
                    <div
                        class="w-10 h-10 rounded-full bg-app-surface border-2 border-app-border"
                    />
                {/if}
                <div class="text-sm">
                    <p class="font-bold text-app-text">
                        {$user?.displayName || "User"}
                    </p>
                    <p class="text-app-text-muted">{$user?.email}</p>
                </div>
            </div>
            <button
                onclick={handleSignOut}
                class="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl text-app-text-muted hover:text-red-500 transition-all font-bold border border-transparent hover:border-red-100"
                title="Sign Out"
            >
                <span class="text-sm">Log out</span>
                <LogOut size={18} />
            </button>
        </div>
    </div>
</div>
