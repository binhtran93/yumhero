<script lang="ts">
    import { signOut, user } from "$lib/stores/auth";
    import {
        Trash2,
        LogOut,
        User,
        Sun,
        Moon,
        Star,
        Info,
        Mail,
        Shield,
        FileText,
        Cookie,
        Lock,
        ChevronRight,
        Zap,
    } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import Avatar from "$lib/components/Avatar.svelte";
    import { theme } from "$lib/stores/theme";
    import SEO from "$lib/components/SEO.svelte";
    import { toasts } from "$lib/stores/toasts";
    import {
        status,
        nextBilledAt,
        billingInterval,
        scheduledCancellation,
    } from "$lib/stores/subscription";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    const getStatusConfig = (s: string | null) => {
        switch (s) {
            case "active":
                return {
                    label: "ACTIVE",
                    classes: "bg-green-100 text-green-700",
                };
            case "trialing":
                return {
                    label: "FREE TRIAL",
                    classes: "bg-blue-100 text-blue-700",
                };
            case "past_due":
                return {
                    label: "PAST DUE",
                    classes: "bg-orange-100 text-orange-700",
                };
            case "canceled":
                return {
                    label: "CANCELED",
                    classes: "bg-gray-100 text-gray-700",
                };
            default:
                return { label: "FREE", classes: "bg-gray-100 text-gray-700" };
        }
    };

    const statusConfig = $derived(getStatusConfig($status));

    const handleSignOut = async () => {
        await signOut();
    };

    const handleDeleteAccount = () => {
        toasts.info("Delete account functionality coming soon.");
    };

    let isActivating = $state(false);
    let showConfirmModal = $state(false);

    const handleConfirmSubscription = async () => {
        if (!$user) return;
        showConfirmModal = false;
        isActivating = true;
        try {
            const token = await $user.getIdToken();
            const response = await fetch("/api/subscription/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            const result = await response.json();
            if (result.success) {
                toasts.success("Subscription confirmed successfully!");
            } else {
                toasts.error(result.error || "Failed to confirm subscription.");
            }
        } catch (e: any) {
            console.error(e);
            toasts.error("An error occurred. Please try again.");
        } finally {
            isActivating = false;
        }
    };

    let isSwitching = $state(false);
    let showSwitchModal = $state(false);

    const handleSwitchPlan = async () => {
        if (!$user || !$billingInterval) return;
        showSwitchModal = false;
        isSwitching = true;
        const targetInterval = $billingInterval === "month" ? "year" : "month";

        try {
            const token = await $user.getIdToken();
            const response = await fetch("/api/subscription/switch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetInterval,
                }),
            });

            const result = await response.json();
            if (result.success) {
                toasts.success(
                    `Successfully switched to ${targetInterval}ly plan!`,
                );
            } else {
                toasts.error(result.error || "Failed to switch plan.");
            }
        } catch (e: any) {
            console.error(e);
            toasts.error("An error occurred. Please try again.");
        } finally {
            isSwitching = false;
        }
    };

    let isCancelling = $state(false);
    let showCancelModal = $state(false);

    const handleCancelSubscription = async () => {
        if (!$user) return;
        showCancelModal = false;
        isCancelling = true;

        try {
            const token = await $user.getIdToken();
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            const result = await response.json();
            if (result.success) {
                toasts.success(
                    "Subscription cancelled. You will still have access until the end of your billing period.",
                );
            } else {
                toasts.error(result.error || "Failed to cancel subscription.");
            }
        } catch (e: any) {
            console.error(e);
            toasts.error("An error occurred. Please try again.");
        } finally {
            isCancelling = false;
        }
    };

    const menuItems = [
        {
            label: "About Us",
            icon: Info,
            color: "text-orange-500",
            bgColor: "bg-orange-50",
            href: "/about",
        },
        {
            label: "Contact",
            icon: Mail,
            color: "text-red-500",
            bgColor: "bg-red-50",
            href: "/about#contact",
        },
        {
            label: "Privacy Policy",
            icon: Shield,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            href: "/privacy",
        },
        {
            label: "Terms of Service",
            icon: FileText,
            color: "text-red-500",
            bgColor: "bg-red-50",
            href: "/terms",
        },
        {
            label: "Cookie Policy",
            icon: Cookie,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            href: "/cookie-policy",
        },
        {
            label: "Security",
            icon: Lock,
            color: "text-red-500",
            bgColor: "bg-red-50",
            href: "/security",
        },
    ];
</script>

<SEO
    title="Profile"
    description="Manage your YumHero account settings and preferences."
/>

<div
    class="flex-1 h-full overflow-y-auto bg-app-bg pb-24 md:pb-8 scrollbar-hide"
>
    {#if $user}
        <!-- Hero Section with Gradient -->
        <div class="relative pt-12 pb-8 px-4 text-center overflow-hidden">
            <!-- Background Gradient -->
            <div
                class="absolute inset-0 bg-gradient-to-b from-orange-100/60 to-transparent dark:from-orange-950/20 -z-10"
            ></div>

            <div
                class="flex flex-col items-center gap-4 relative z-10"
                in:fly={{ y: -20, duration: 500 }}
            >
                <div class="relative">
                    <div
                        class="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse"
                    ></div>
                    <Avatar
                        src={$user.photoURL}
                        name={$user.displayName || $user.email}
                        size="xl"
                        className="relative w-32 h-32 text-4xl border-4 border-white dark:border-app-surface shadow-2xl"
                    />
                </div>
                <div>
                    <h2
                        class="text-2xl md:text-3xl font-black text-app-text tracking-tight"
                    >
                        {$user.displayName || "User"}
                    </h2>
                    <p
                        class="text-sm md:text-base text-app-text-muted font-medium opacity-80"
                    >
                        {$user.email}
                    </p>
                </div>
            </div>
        </div>

        <div
            class="max-w-xl mx-auto px-4 space-y-4 mb-12"
            in:fly={{ y: 20, duration: 500, delay: 200 }}
        >
            <!-- Subscription Card -->
            <!-- Subscription Card -->
            <div
                class="bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm flex justify-between items-start"
            >
                <div class="flex gap-4">
                    <div
                        class="w-12 h-12 flex items-center justify-center bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-2xl shrink-0"
                    >
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <p class="font-black text-app-text">Premium Plan</p>
                        <p class="text-xs text-app-text-muted font-bold">
                            {#if $scheduledCancellation}
                                Ends {new Date(
                                    $scheduledCancellation,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            {:else if $nextBilledAt}
                                Renews {new Date(
                                    $nextBilledAt,
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                                {#if $status === "active" && !$scheduledCancellation}
                                    <button
                                        onclick={() => (showCancelModal = true)}
                                        class="ml-2 text-[10px] text-app-text-muted hover:text-red-500 underline cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                {/if}
                            {:else}
                                Free Account
                            {/if}
                        </p>
                        {#if ($status === "trialing" || $status === "past_due") && !isActivating}
                            <button
                                onclick={() => (showConfirmModal = true)}
                                class="mt-1 px-4 py-2.5 bg-app-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-app-primary-hover transition-colors w-fit flex items-center gap-1.5 cursor-pointer"
                            >
                                <Zap size={12} fill="currentColor" />
                                Confirm Subscription
                            </button>
                        {:else if $status === "active" && !$scheduledCancellation && $billingInterval === "month"}
                            <button
                                onclick={() => (showSwitchModal = true)}
                                class="mt-1 px-4 py-2.5 bg-app-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-app-primary-hover transition-colors w-fit flex items-center gap-1.5 cursor-pointer"
                            >
                                <Zap size={12} fill="currentColor" />
                                Save 30% w/ Yearly
                            </button>
                        {/if}
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span
                        class="px-3 py-1.5 {statusConfig.classes} text-[10px] font-black rounded-full tracking-wider shadow-sm"
                    >
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            <!-- Menu Items -->
            <div class="space-y-3">
                {#each menuItems as item}
                    <a
                        href={item.href}
                        class="w-full bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm flex items-center justify-between hover:bg-app-surface-hover transition-all group"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 flex items-center justify-center {item.bgColor} dark:bg-opacity-10 {item.color} rounded-2xl transition-transform group-hover:scale-105"
                            >
                                <item.icon size={24} />
                            </div>
                            <span class="font-bold text-app-text"
                                >{item.label}</span
                            >
                        </div>
                        <ChevronRight
                            size={20}
                            class="text-app-text-muted group-hover:text-app-text group-hover:translate-x-1 transition-all"
                        />
                    </a>
                {/each}
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4 pt-4">
                <button
                    onclick={handleSignOut}
                    class="flex items-center justify-center gap-3 p-4 rounded-2xl border border-app-border bg-app-surface text-app-text font-black text-sm hover:bg-app-surface-hover transition-all shadow-sm group"
                >
                    <LogOut
                        size={20}
                        class="text-app-text-muted group-hover:text-app-text"
                    />
                    Sign Out
                </button>
                <button
                    onclick={handleDeleteAccount}
                    class="flex items-center justify-center gap-3 p-4 rounded-2xl border border-red-100 bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 transition-all shadow-sm group"
                >
                    <Trash2
                        size={20}
                        class="group-hover:scale-110 transition-transform"
                    />
                    Remove Account
                </button>
            </div>

            {#if $status === "active" && !$scheduledCancellation}
                <button
                    onclick={() => (showCancelModal = true)}
                    class="w-full text-center text-xs text-app-text-muted hover:text-red-500 font-bold py-4 transition-colors cursor-pointer"
                >
                    Cancel Subscription
                </button>
            {/if}
        </div>
    {/if}
</div>

<ConfirmModal
    isOpen={showConfirmModal}
    title="Confirm Subscription"
    message="By confirming, you will end your trial period and start your paid subscription immediately."
    confirmText="Confirm"
    cancelText="Maybe Later"
    onConfirm={handleConfirmSubscription}
    onClose={() => (showConfirmModal = false)}
    isLoading={isActivating}
/>

<ConfirmModal
    isOpen={showSwitchModal}
    title="Switch Billing Cycle"
    message="Switching to Yearly will charge you immediately with a pro-rated amount. You'll save 30% per year!"
    confirmText="Confirm Switch"
    cancelText="Keep Current"
    onConfirm={handleSwitchPlan}
    onClose={() => (showSwitchModal = false)}
    isLoading={isSwitching}
/>

<ConfirmModal
    isOpen={showCancelModal}
    title="Cancel Subscription"
    message="Are you sure you want to cancel? You will continue to have access to pro features until the end of your current billing period."
    confirmText="Cancel Subscription"
    cancelText="Keep My Plan"
    isDestructive={true}
    onConfirm={handleCancelSubscription}
    onClose={() => (showCancelModal = false)}
    isLoading={isCancelling}
/>

<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
