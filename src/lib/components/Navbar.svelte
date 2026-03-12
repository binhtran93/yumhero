<script lang="ts">
    import { page } from "$app/stores";
    import { Calendar, Book, User } from "lucide-svelte";
    import { headerActions } from "$lib/stores/ui";
    import { accessLoading, isPaid, status, trialEndsAt } from "$lib/stores/access";

    type NavItem = {
        href: string;
        label: string;
        icon: any;
    };

    let navItems = $derived<NavItem[]>([
        { href: "/plan", label: "Plan", icon: Calendar },
        { href: "/recipes", label: "Recipes", icon: Book },
        { href: "/profile", label: "Profile", icon: User },
    ]);

    const isActive = (path: string) => {
        if (path === "/plan" && $page.url.pathname === "/plan") return true;
        if (path !== "/plan" && $page.url.pathname.startsWith(path))
            return true;
        return false;
    };

    const showTrialBanner = $derived(
        !$accessLoading &&
            !$isPaid &&
            $status === "trial" &&
            Boolean($trialEndsAt),
    );

    const trialEndLabel = $derived.by(() => {
        if (!$trialEndsAt) return "";
        const trialEndDate = new Date($trialEndsAt);
        if (Number.isNaN(trialEndDate.getTime())) return "";
        return trialEndDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    });
</script>

{#if showTrialBanner}
    <div class="h-8 w-full bg-black text-white">
        <div
            class="h-full w-full px-3 md:px-6 flex items-center justify-between md:justify-center gap-2 md:gap-3 text-[11px] md:text-xs"
        >
            <p class="truncate font-semibold">
                14-day trial active. Ends {trialEndLabel}.
            </p>
            <a
                href="/pay"
                class="shrink-0 px-2.5 py-0.5 rounded bg-white text-black text-[10px] font-bold hover:bg-gray-100 transition-colors"
            >
                Unlock now
            </a>
        </div>
    </div>
{/if}

<nav
    class="
    fixed z-50 w-full bg-app-surface/95 backdrop-blur-md border-t border-app-border
    bottom-0 h-16 shrink-0 transition-all duration-300

    md:sticky md:top-0 md:border-t-0 md:border-b md:border-app-border-strong md:h-16 md:flex-row md:justify-start md:gap-8 md:px-6 md:shadow

    flex flex-row items-center justify-around px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]
"
>
    <div class="hidden md:flex items-center gap-3 w-48">
        <div class="w-8 h-8 flex items-center justify-center shrink-0">
            <img
                src="/logo.png"
                alt="YumHero Logo"
                class="w-full h-full object-contain"
            />
        </div>
        <span
            class="text-xl font-bold tracking-tight text-app-text font-display"
        >
            YumHero
        </span>
    </div>

    <div
        class="flex flex-row items-center justify-around w-full md:w-auto md:gap-2"
    >
        {#each navItems as item}
            {@const active = isActive(item.href)}
            <a
                href={item.href}
                class="
                    relative flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1.5 md:py-2 md:px-4 rounded-xl transition-all duration-200 group
                    {active
                    ? 'text-app-primary font-bold'
                    : 'text-app-text/90 hover:text-app-text hover:bg-app-surface-hover font-semibold'}
                "
            >
                <div class="relative flex items-center justify-center">
                    <item.icon
                        size={24}
                        class="w-6 h-6 md:w-5 md:h-5 transition-transform duration-200 {active
                            ? 'scale-110'
                            : 'group-hover:scale-110'}"
                        strokeWidth={active ? 2.5 : 2}
                    />
                </div>

                <span class="text-[10px] md:text-sm">
                    {item.label}
                </span>
            </a>
        {/each}
    </div>

    <div
        class="hidden md:flex items-center justify-end min-w-48 gap-4 md:ml-auto"
    >
        {#if $headerActions}
            {@render $headerActions()}
        {/if}
    </div>
</nav>
