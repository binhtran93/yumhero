<script lang="ts">
    import { page } from "$app/stores";
    import { Calendar, Book, User, Refrigerator } from "lucide-svelte";
    import { totalLeftoversCount } from "$lib/stores/leftovers";
    import { fridgeIngredientsCount } from "$lib/stores/fridgeIngredients";
    import { headerActions } from "$lib/stores/ui";

    // Navigation Items
    type NavItem = {
        href: string;
        label: string;
        icon: any;
        badge?: number;
    };

    let navItems = $derived<NavItem[]>([
        { href: "/plan", label: "Plan", icon: Calendar },
        {
            href: "/fridge",
            label: "Fridge",
            icon: Refrigerator,
            // Only show badge if there are items
            badge:
                $totalLeftoversCount + $fridgeIngredientsCount > 0
                    ? $totalLeftoversCount + $fridgeIngredientsCount
                    : undefined,
        },
        { href: "/recipes", label: "Recipes", icon: Book },
        { href: "/profile", label: "Profile", icon: User },
    ]);

    const isActive = (path: string) => {
        if (path === "/plan" && $page.url.pathname === "/plan") return true;
        if (path !== "/plan" && $page.url.pathname.startsWith(path))
            return true;
        return false;
    };
</script>

<nav
    class="
    fixed z-50 w-full bg-app-surface/95 backdrop-blur-md border-t border-app-border
    bottom-0 h-16 shrink-0 transition-all duration-300
    
    md:sticky md:top-0 md:border-t-0 md:border-b md:border-app-border-strong md:h-16 md:flex-row md:justify-start md:gap-8 md:px-6 md:shadow
    
    flex flex-row items-center justify-around px-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]
"
>
    <!-- Logo (Desktop Only) -->
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

    <!-- Navigation Links -->
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
                    {#if item.badge}
                        <span
                            class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-app-primary rounded-full ring-2 ring-app-surface"
                        >
                            {item.badge > 99 ? "99+" : item.badge}
                        </span>
                    {/if}
                </div>

                <span class="text-[10px] md:text-sm">
                    {item.label}
                </span>
            </a>
        {/each}
    </div>

    <!-- Right Side Actions (Desktop) -->
    <div
        class="hidden md:flex items-center justify-end min-w-48 gap-4 md:ml-auto"
    >
        {#if $headerActions}
            {@render $headerActions()}
        {/if}
    </div>
</nav>
