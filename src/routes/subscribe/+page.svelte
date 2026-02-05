<script lang="ts">
    import { loading as authLoading, signOut, user } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
        hasUsedTrial,
    } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { LogOut, ChevronDown } from "lucide-svelte";
    import { fly, fade } from "svelte/transition";
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
    let isUserMenuOpen = $state(false);

    const handleSignOut = async () => {
        await signOut();
        goto("/login");
    };
</script>

<div
    class="min-h-screen bg-app-bg text-app-text font-display flex flex-col items-center p-6 md:p-12 relative overflow-x-hidden"
>
    <!-- Top Right Profile Dropdown Page-Level -->
    <div class="fixed top-6 right-6 z-50">
        <div class="relative">
            <button
                onclick={() => (isUserMenuOpen = !isUserMenuOpen)}
                class="flex items-center gap-2 p-1 pr-2 rounded-full border border-stone-200 dark:border-app-border bg-white/80 dark:bg-app-surface/80 backdrop-blur-md hover:bg-app-surface-hover shadow-sm transition-all"
            >
                {#if $user?.photoURL}
                    <img
                        src={$user.photoURL}
                        alt="User"
                        class="w-8 h-8 rounded-full shadow-sm"
                    />
                {:else}
                    <div
                        class="w-8 h-8 rounded-full bg-app-surface border border-stone-200 dark:border-app-border flex items-center justify-center"
                    >
                        <LogOut size={14} class="text-app-text-muted" />
                    </div>
                {/if}
                <ChevronDown
                    size={16}
                    class="text-app-text-muted transition-transform duration-200 {isUserMenuOpen
                        ? 'rotate-180'
                        : ''}"
                />
            </button>

            {#if isUserMenuOpen}
                <div
                    transition:fade={{ duration: 100 }}
                    class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-app-surface rounded-2xl border border-stone-200 dark:border-app-border shadow-xl overflow-hidden py-2 z-50"
                >
                    <div
                        class="px-4 py-3 border-b border-stone-100 dark:border-app-border mb-1"
                    >
                        <p class="text-sm font-bold text-app-text line-clamp-1">
                            {$user?.displayName || "User"}
                        </p>
                        <p class="text-xs text-app-text-muted line-clamp-1">
                            {$user?.email}
                        </p>
                    </div>
                    <button
                        onclick={handleSignOut}
                        class="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>
                </div>

                <!-- Backdrop to close dropdown -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="fixed inset-0 z-40"
                    onclick={() => (isUserMenuOpen = false)}
                ></div>
            {/if}
        </div>
    </div>

    <!-- Background Elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-app-primary/10 blur-[120px] rounded-full"
        ></div>
        <div
            class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full"
        ></div>
    </div>

    <!-- Header Section -->
    <div
        class="text-center mb-12 md:mb-16 mt-12 md:mt-20 relative z-10"
        in:fly={{ y: -20, duration: 600 }}
    >
        <h1
            class="text-4xl md:text-6xl font-black mb-2 text-app-text tracking-tight"
        >
            Unlock <span class="text-app-primary">YumHero</span>
        </h1>
        <p
            class="text-lg md:text-2xl text-app-text-muted max-w-2xl mx-auto leading-relaxed"
        >
            {#if $hasUsedTrial}
                Choose the plan that fits your kitchen.
            {:else}
                Start your 7-day free trial today. <br
                    class="hidden md:block"
                />
            {/if}
        </p>
    </div>

    <!-- Pricing Section -->
    <div
        class="w-full max-w-7xl mx-auto relative z-10"
        in:fly={{ y: 20, duration: 600, delay: 100 }}
    >
        <PricingTable bind:isLoading />
    </div>
</div>
