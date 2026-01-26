<script lang="ts">
    import { page } from "$app/stores";
    import { Calendar, Book, Sliders, ChefHat, User } from "lucide-svelte";
    import { fade } from "svelte/transition";

    // Navigation Items
    const navItems = [
        { href: "/", label: "Plan", icon: Calendar },
        { href: "/recipes", label: "Recipes", icon: Book },
        { href: "/setup", label: "Setup", icon: Sliders },
        { href: "/profile", label: "Profile", icon: User },
    ];

    // Check if a link is active
    const isActive = (path: string) => {
        if (path === "/" && $page.url.pathname === "/") return true;
        if (path !== "/" && $page.url.pathname.startsWith(path)) return true;
        return false;
    };
</script>

<aside
    class="
    flex shrink-0 z-30 bg-bg-surface border-border-default transition-all duration-300
    w-full h-16 border-t border-r-0 flex-row justify-around order-last
    md:w-20 md:h-full md:border-r md:border-t-0 md:flex-col md:justify-start md:pt-6 md:order-first
    lg:w-64 lg:pt-6
    "
>
    <!-- Logo / Brand -->
    <div
        class="hidden md:flex flex-col lg:flex-row items-center justify-center lg:justify-start lg:px-6 mb-8 lg:gap-3"
    >
        <div
            class="p-2 bg-action-primary/10 rounded-xl text-action-primary shrink-0"
        >
            <ChefHat size={28} strokeWidth={2.5} />
        </div>
        <span
            class="text-xl font-bold tracking-tight text-text-primary font-display hidden lg:block"
        >
            YumHero
        </span>
    </div>

    <!-- Navigation Links -->
    <nav
        class="flex-1 px-2 md:px-2 lg:px-4 flex flex-row md:flex-col items-center justify-around md:justify-start md:space-y-2 w-full"
    >
        {#each navItems as item}
            {@const active = isActive(item.href)}
            <a
                href={item.href}
                class="flex flex-col md:flex-row items-center justify-center lg:justify-start lg:gap-3 px-1 py-1 md:px-2 md:py-3 rounded-xl transition-all duration-200 group relative overflow-hidden w-full
        {active
                    ? 'text-action-primary font-bold bg-transparent md:bg-bg-surface-hover shadow-none md:shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/50'}"
            >
                {#if active}
                    <div
                        class="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-action-primary"
                        in:fade={{ duration: 200 }}
                    ></div>
                {/if}

                <item.icon
                    size={24}
                    class="{active
                        ? 'text-action-primary'
                        : 'text-text-secondary group-hover:text-text-primary transition-colors'} md:w-5 md:h-5 lg:w-5 lg:h-5"
                />
                <span class="text-[10px] md:hidden lg:block lg:text-sm"
                    >{item.label}</span
                >
            </a>
        {/each}
    </nav>

    <!-- Footer / Version -->
    <div class="hidden lg:block px-6 mt-auto pb-4">
        <div
            class="p-4 rounded-2xl bg-bg-default border border-border-default flex flex-col gap-2"
        >
            <p class="text-xs font-medium text-text-secondary">YumHero Beta</p>
            <p class="text-[10px] text-text-secondary/70">
                Crafted for families.
            </p>
        </div>
    </div>
</aside>
