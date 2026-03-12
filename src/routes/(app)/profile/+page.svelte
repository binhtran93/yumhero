<script lang="ts">
    import { signOut, user } from "$lib/stores/auth";
    import {
        Trash2,
        LogOut,
        Star,
        Info,
        Mail,
        Shield,
        FileText,
        Cookie,
        Lock,
        RotateCcw,
        ChevronRight,
        Zap,
    } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import Avatar from "$lib/components/Avatar.svelte";
    import SEO from "$lib/components/SEO.svelte";
    import { toasts } from "$lib/stores/toasts";
    import {
        status,
        purchasedAt,
        isPaid,
        trialDaysLeft,
    } from "$lib/stores/access";
    import { openCheckout } from "$lib/paddle";

    const getStatusConfig = (s: string | null) => {
        switch (s) {
            case "active":
                return {
                    label: "PURCHASED",
                    classes: "bg-green-100 text-green-700",
                };
            case "trial":
                return {
                    label: "TRIAL",
                    classes: "bg-amber-100 text-amber-700",
                };
            case "expired":
                return {
                    label: "EXPIRED",
                    classes: "bg-red-100 text-red-700",
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

    let isPurchasing = $state(false);

    const handlePurchase = async () => {
        if (!$user || $isPaid || isPurchasing) return;

        isPurchasing = true;
        try {
            await openCheckout($user.uid);
            setTimeout(() => {
                isPurchasing = false;
            }, 5000);
        } catch (error) {
            console.error("Checkout failed:", error);
            toasts.error("Unable to open checkout. Please try again.");
            isPurchasing = false;
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
        {
            label: "Refund Policy",
            icon: RotateCcw,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            href: "/refund-policy",
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
        <div class="relative pt-12 pb-8 px-4 text-center overflow-hidden">
            <div
                class="absolute inset-0 bg-gradient-to-b from-orange-100/60 to-transparent -z-10"
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
                        className="relative w-24 h-24 text-4xl border-4 border-white shadow-2xl"
                    />
                </div>
                <div>
                    <h2
                        class="text-2xl font-black text-app-text tracking-tight"
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
            <div
                class="bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm flex justify-between items-start"
            >
                <div class="flex gap-4">
                    <div
                        class="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-500 rounded-2xl shrink-0"
                    >
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <p class="font-black text-app-text">YumHero Pro</p>
                        <p class="text-xs text-app-text-muted font-bold">
                            {#if $isPaid && $purchasedAt}
                                Purchased {new Date($purchasedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            {:else if $isPaid}
                                Lifetime access unlocked
                            {:else if $status === "trial"}
                                Free trial active • {$trialDaysLeft} day{$trialDaysLeft ===
                                1
                                    ? ""
                                    : "s"} left
                            {:else if $status === "expired"}
                                Trial ended. Unlock lifetime access
                            {:else}
                                One-time purchase for lifetime access
                            {/if}
                        </p>

                        {#if !$isPaid}
                            <button
                                onclick={handlePurchase}
                                disabled={isPurchasing}
                                class="mt-1 px-4 py-2.5 bg-app-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-app-primary-hover transition-colors w-fit flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Zap size={12} fill="currentColor" />
                                {#if isPurchasing}
                                    Opening Checkout...
                                {:else}
                                    Unlock Pro for $9.99
                                {/if}
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

            <div class="space-y-3">
                {#each menuItems as item}
                    <a
                        href={item.href}
                        class="w-full bg-app-surface p-4 rounded-2xl border border-app-border shadow-sm flex items-center justify-between hover:bg-app-surface-hover transition-all group"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 flex items-center justify-center {item.bgColor} {item.color} rounded-2xl transition-transform group-hover:scale-105"
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
        </div>
    {/if}
</div>

<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
