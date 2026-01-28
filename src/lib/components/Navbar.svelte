<script lang="ts">
    import { page } from "$app/stores";
    import {
        Calendar,
        Book,
        Sliders,
        ChefHat,
        User,
        PanelLeftClose,
        PanelLeftOpen,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";

    // Navigation Items
    const navItems = [
        { href: "/", label: "Plan", icon: Calendar },
        { href: "/recipes", label: "Recipes", icon: Book },
        { href: "/profile", label: "Profile", icon: User },
    ];

    // Check if a link is active
    const isActive = (path: string) => {
        if (path === "/" && $page.url.pathname === "/") return true;
        if (path !== "/" && $page.url.pathname.startsWith(path)) return true;
        return false;
    };

    let isExpanded = true;
    let mounted = false;

    onMount(() => {
        const stored = localStorage.getItem("sidebarExpanded");
        if (stored !== null) {
            isExpanded = stored === "true";
        }
        mounted = true;
    });

    const toggleSidebar = () => {
        isExpanded = !isExpanded;
        localStorage.setItem("sidebarExpanded", String(isExpanded));
    };
</script>

<aside
    class="
    flex shrink-0 z-30 bg-app-surface border-app-border transition-all duration-300
    w-full h-16 border-t border-r-0 flex-row justify-around order-last
    md:h-full md:border-r md:border-t-0 md:flex-col md:justify-start md:pt-6 md:order-first
    {isExpanded ? 'md:w-64 lg:w-64' : 'md:w-20 lg:w-20'}
    lg:pt-6
    {!mounted ? 'invisible' : ''}
    "
>
    <!-- Logo / Brand -->
    <div
        class="hidden md:flex flex-col lg:flex-row items-center justify-center {isExpanded
            ? 'md:justify-start md:px-6 lg:justify-start lg:px-6'
            : 'md:justify-center lg:justify-center'} mb-8 lg:gap-3"
    >
        <div
            class="p-2 bg-app-primary/10 rounded-xl text-app-primary shrink-0"
        >
            <ChefHat size={28} strokeWidth={2.5} />
        </div>
        {#if isExpanded}
            <span
                class="text-xl font-bold tracking-tight text-app-text font-display hidden md:block lg:block"
                transition:fade={{ duration: 100 }}
            >
                YumHero
            </span>
        {/if}
    </div>

    <!-- Navigation Links -->
    <nav
        class="flex-1 px-2 md:px-2 {isExpanded
            ? 'md:px-4 lg:px-4'
            : 'md:px-2 lg:px-2'} flex flex-row md:flex-col items-center justify-around md:justify-start md:space-y-2 w-full"
    >
        {#each navItems as item}
            {@const active = isActive(item.href)}
            <a
                href={item.href}
                class="flex flex-col md:flex-row items-center justify-center {isExpanded
                    ? 'md:justify-start md:gap-3 lg:justify-start lg:gap-3'
                    : 'md:justify-center lg:justify-center'} px-1 py-1 md:px-2 md:py-3 rounded-xl transition-all duration-200 group relative overflow-hidden w-full
        {active
                    ? 'text-app-primary font-bold bg-transparent md:bg-app-surface-hover shadow-none md:shadow-sm'
                    : 'text-app-text-muted hover:text-app-text hover:bg-app-surface-hover/50'}"
            >
                {#if active}
                    <div
                        class="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-app-primary"
                        in:fade={{ duration: 200 }}
                    ></div>
                {/if}

                <item.icon
                    size={24}
                    class="{active
                        ? 'text-app-primary'
                        : 'text-app-text-muted group-hover:text-app-text transition-colors'} md:w-5 md:h-5 lg:w-5 lg:h-5"
                />
                {#if isExpanded}
                    <span
                        class="text-[10px] md:block lg:block lg:text-sm whitespace-nowrap"
                        transition:fade={{ duration: 100 }}>{item.label}</span
                    >
                {/if}
            </a>
        {/each}
    </nav>

    <!-- Collapse Toggle -->
    <div
        class="hidden md:flex flex-col pb-4 mt-auto w-full {isExpanded
            ? 'items-start px-6'
            : 'items-center justify-center'}"
    >
        <button
            on:click={toggleSidebar}
            class="p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-colors"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
            {#if isExpanded}
                <PanelLeftClose size={20} />
            {:else}
                <PanelLeftOpen size={20} />
            {/if}
        </button>
    </div>
</aside>
