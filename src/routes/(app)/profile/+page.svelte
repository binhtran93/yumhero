<script lang="ts">
    import { signOut, user } from "$lib/stores/auth";
    import { Trash2, LogOut, User, Sun, Moon } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import Avatar from "$lib/components/Avatar.svelte";
    import { theme } from "$lib/stores/theme";
    import SEO from "$lib/components/SEO.svelte";
    import Header from "$lib/components/Header.svelte";
    import { toasts } from "$lib/stores/toasts";
    import { status, nextBilledAt } from "$lib/stores/subscription";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    const getStatusConfig = (s: string | null) => {
        switch (s) {
            case "active":
                return {
                    label: "Active",
                    classes: "bg-green-100 text-green-700",
                };
            case "trialing":
                return {
                    label: "Free Trial",
                    classes: "bg-blue-100 text-blue-700",
                };
            case "past_due":
                return {
                    label: "Past Due",
                    classes: "bg-orange-100 text-orange-700",
                };
            case "canceled":
                return {
                    label: "Canceled",
                    classes: "bg-gray-100 text-gray-700",
                };
            default:
                return { label: "Free", classes: "bg-gray-100 text-gray-700" };
        }
    };

    const statusConfig = $derived(getStatusConfig($status));

    const handleSignOut = async () => {
        await signOut();
    };

    const handleDeleteAccount = () => {
        // Placeholder for delete account logic
        toasts.info("Delete account functionality coming soon.");
    };

    let isActivating = $state(false);
    let showConfirmModal = $state(false);

    const handleConfirmSubscription = async () => {
        if (!$user) return;
        showConfirmModal = false;
        isActivating = true;
        try {
            const response = await fetch("/api/subscription/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: $user.uid }),
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
</script>

<SEO
    title="Profile"
    description="Manage your YumHero account settings and preferences."
/>

<!-- Header -->
<Header title="Profile" />

<div class="p-4 md:p-8 max-w-2xl mx-auto">
    {#if $user}
        <!-- User Authenticated View -->
        <div
            class="bg-app-surface p-5 md:p-8 rounded-2xl border border-app-border shadow-sm space-y-6 md:space-y-8"
            transition:fade
        >
            <div
                class="flex flex-col items-center justify-center text-center gap-3 md:gap-4"
            >
                <Avatar
                    src={$user.photoURL}
                    name={$user.displayName || $user.email}
                    size="lg"
                />
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-app-text">
                        {$user.displayName || "User"}
                    </h2>
                    <p class="text-sm md:text-base text-app-text-muted">
                        {$user.email}
                    </p>
                </div>
            </div>

            <div class="border-t border-app-border my-4 md:my-6"></div>

            <!-- Settings Section -->
            <div class="space-y-6">
                <div class="flex items-center gap-2 px-1">
                    <h3
                        class="text-sm font-bold text-app-text-muted uppercase tracking-wider"
                    >
                        Settings
                    </h3>
                </div>

                <div class="space-y-3">
                    <!-- Current Plan -->
                    <div
                        class="flex items-center justify-between p-3 md:p-4 bg-app-bg rounded-xl border border-app-border/50"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 bg-app-primary/10 rounded-lg text-app-primary"
                            >
                                <User size={20} />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-app-text">
                                    Current Plan
                                </p>
                                {#if $nextBilledAt}
                                    <p class="text-[10px] text-app-text-muted">
                                        Next billing: {new Date(
                                            $nextBilledAt,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                {/if}
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span
                                class="px-3 py-1 {statusConfig.classes} text-xs font-bold rounded-full"
                            >
                                {statusConfig.label}
                            </span>
                            {#if ($status === "trialing" || $status === "past_due") && !isActivating}
                                <button
                                    onclick={() => (showConfirmModal = true)}
                                    class="text-xs font-bold text-app-primary hover:underline"
                                >
                                    Confirm Subscription
                                </button>
                            {:else}
                                <div class="w-2 h-2"></div>
                            {/if}
                        </div>
                    </div>

                    <!-- Appearance / Theme Toggle -->
                    <div
                        class="flex items-center justify-between p-3 md:p-4 bg-app-bg rounded-xl border border-app-border/50"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 bg-app-primary/10 rounded-lg text-app-primary"
                            >
                                {#if $theme === "dark"}
                                    <Sun size={20} />
                                {:else}
                                    <Moon size={20} />
                                {/if}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-app-text">
                                    Appearance
                                </p>
                                <p class="text-xs text-app-text-muted">
                                    {$theme === "dark"
                                        ? "Dark Mode"
                                        : "Light Mode"}
                                </p>
                            </div>
                        </div>
                        <button
                            onclick={() =>
                                ($theme = $theme === "dark" ? "light" : "dark")}
                            class="px-4 py-1.5 bg-app-surface border border-app-border text-app-text text-sm font-bold rounded-lg hover:bg-app-surface-hover transition-colors shadow-sm"
                        >
                            Switch to {$theme === "dark" ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>
            </div>

            <div class="border-t border-app-border my-4 md:my-6"></div>

            <!-- Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <button
                    onclick={handleSignOut}
                    class="flex items-center justify-center gap-2 p-3 rounded-xl border border-app-border text-app-text-muted hover:bg-app-surface-hover hover:text-app-text transition-colors font-medium text-sm md:text-base"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
                <button
                    onclick={handleDeleteAccount}
                    class="flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm md:text-base"
                >
                    <Trash2 size={18} />
                    Delete Account
                </button>
            </div>
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
