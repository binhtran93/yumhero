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
    class="min-h-screen bg-app-bg text-app-text font-display flex flex-col items-center justify-center p-6 relative overflow-hidden"
>
    <!-- Top Right Profile Dropdown Page-Level -->
    <div class="fixed top-6 right-6 z-50">
        <div class="relative">
            <button
                onclick={() => (isUserMenuOpen = !isUserMenuOpen)}
                class="flex items-center gap-2 p-1 pr-2 rounded-full border border-stone-200 dark:border-app-border bg-white dark:bg-app-surface hover:bg-app-surface-hover shadow-sm transition-all"
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
                    class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-app-surface rounded-2xl border border-stone-200 dark:border-app-border shadow-xl overflow-hidden py-2"
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
                    class="fixed inset-0 z-[-1]"
                    onclick={() => (isUserMenuOpen = false)}
                ></div>
            {/if}
        </div>
    </div>

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
        class="w-full max-w-xl bg-app-surface border border-app-border rounded-[2.5rem] shadow-lg relative z-10 overflow-hidden"
        in:fly={{ y: 20, duration: 600 }}
    >
        <!-- Header -->
        <div
            class="bg-app-primary/5 p-10 text-center border-b border-app-border flex flex-col items-center justify-center"
        >
            <h1 class="text-3xl md:text-5xl font-black mb-4 text-app-text">
                Unlock YumHero
            </h1>
            <p class="text-lg md:text-xl text-app-text-muted">
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
    </div>
</div>
