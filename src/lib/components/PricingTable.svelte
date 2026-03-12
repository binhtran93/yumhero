<script lang="ts">
    import { user } from "$lib/stores/auth";
    import { isSubscribed } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { openCheckout } from "$lib/paddle";

    let { isLoading = $bindable(false) } = $props<{
        isLoading?: boolean;
    }>();

    const oneTimePrice = 9.99;

    const features = [
        "Ad-free recipe imports from any blog",
        "Rapid 2-minute weekly meal planning",
        "Organized recipe library & tagging",
        "Smart shopping list consolidation",
        "Printable week plan & grocery list",
        "Hands-free focused cooking mode",
        "Universal cloud sync across all devices",
    ];

    async function handleAction(e: Event) {
        if (!$user) {
            e.preventDefault();
            goto("/login");
            return;
        }

        if ($isSubscribed) {
            e.preventDefault();
            goto("/plan");
            return;
        }

        e.preventDefault();

        isLoading = true;
        try {
            await openCheckout($user.uid);
            setTimeout(() => (isLoading = false), 5000);
        } catch (err) {
            console.error("Checkout failed:", err);
            isLoading = false;
        }
    }
</script>

<div class="flex flex-col items-center gap-12">
    <div class="w-full max-w-md">
        <div
            class="bg-app-surface rounded-3xl p-8 md:p-10 border-2 border-app-primary shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all hover:shadow-[0_20px_60px_rgba(194,65,12,0.15)] group"
        >
            <div
                class="absolute top-0 right-0 w-32 h-32 bg-app-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>

            <div class="text-center mb-10">
                <h3 class="text-2xl font-bold text-app-text mb-4">YumHero Pro</h3>
                <div class="flex items-baseline justify-center gap-1">
                    <span
                        class="text-5xl md:text-6xl font-black text-app-text tracking-tight transition-all"
                    >
                        ${oneTimePrice}
                    </span>
                    <span class="text-xl text-app-text-muted font-medium">
                        once
                    </span>
                </div>
                <p class="text-sm text-app-text-muted mt-3">
                    One-time purchase. Lifetime access.
                </p>
            </div>

            <ul class="space-y-4 mb-10">
                {#each features as feature}
                    <li class="flex items-start gap-4 text-app-text group/item">
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
                        <span class="font-medium text-base md:text-lg"
                            >{feature}</span
                        >
                    </li>
                {/each}
            </ul>

            <a
                href={$user
                    ? $isSubscribed
                        ? "/plan"
                        : "/subscribe"
                    : "/login"}
                onclick={handleAction}
                class="block w-full py-4 text-center rounded-2xl font-bold transition-all bg-app-primary text-white text-lg shadow-xl shadow-app-primary/25 hover:shadow-app-primary/40 hover:-translate-y-1 active:scale-[0.98] {isLoading
                    ? 'opacity-70 cursor-not-allowed pointer-events-none'
                    : ''}"
            >
                {#if isLoading}
                    Processing...
                {:else if $isSubscribed}
                    Open YumHero
                {:else}
                    Buy Now for ${oneTimePrice}
                {/if}
            </a>

            <p class="text-center text-xs text-app-text-muted mt-5">
                Secured by Paddle. One payment, lifetime access.
            </p>
        </div>
    </div>
</div>
