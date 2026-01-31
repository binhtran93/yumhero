<script lang="ts">
    import { page } from "$app/stores";
    import { Calendar, Book, ChefHat, User, Search } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { sidebarExpanded } from "$lib/stores/ui";

    import { userRecipes } from "$lib/stores/recipes";
    import type { Recipe } from "$lib/types";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";

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

    let availableRecipes = $state<Recipe[]>([]);
    let searchQuery = $state("");

    let filteredRecipes = $derived(
        availableRecipes.filter((r) =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    $effect(() => {
        const unsubscribe = userRecipes.subscribe((state) => {
            availableRecipes = state.data;
        });
        return unsubscribe;
    });

    const handleDragStart = (e: DragEvent, recipe: Recipe) => {
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "all";
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                type: "sidebar-recipe",
                recipeId: recipe.id,
            }),
        );
    };
</script>

<aside
    class="
    flex shrink-0 z-30 bg-app-surface border-app-border transition-all duration-300
    w-full h-16 border-t border-r-0 flex-row justify-around order-last
    md:h-full md:border-r md:border-t-0 md:flex-col md:justify-start md:pt-6 md:order-first
    {$sidebarExpanded ? 'md:w-64 lg:w-64' : 'md:w-20 lg:w-20'}
    lg:pt-6
    "
>
    <!-- Logo / Brand -->
    <div
        class="hidden md:flex flex-col lg:flex-row items-center justify-center {$sidebarExpanded
            ? 'md:justify-start md:px-6 lg:justify-start lg:px-6'
            : 'md:justify-center lg:justify-center'} mb-8 lg:gap-3"
    >
        <div class="p-2 bg-app-primary/10 rounded-xl text-app-primary shrink-0">
            <ChefHat size={28} strokeWidth={2.5} />
        </div>
        {#if $sidebarExpanded}
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
        class="flex-none px-2 md:px-2 {$sidebarExpanded
            ? 'md:px-4 lg:px-4'
            : 'md:px-2 lg:px-2'} flex flex-row md:flex-col items-center justify-around md:justify-start md:space-y-2 w-full"
    >
        {#each navItems as item}
            {@const active = isActive(item.href)}
            <a
                href={item.href}
                class="flex flex-col md:flex-row items-center justify-center {$sidebarExpanded
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
                {#if $sidebarExpanded}
                    <span
                        class="text-[10px] md:block lg:block lg:text-sm whitespace-nowrap"
                        transition:fade={{ duration: 100 }}>{item.label}</span
                    >
                {/if}
            </a>
        {/each}
    </nav>

    <!-- Draggable Recipes List (Only when expanded AND on Plan page) -->
    {#if $sidebarExpanded && $page.url.pathname === "/"}
        <div
            class="hidden md:flex flex-col flex-1 min-h-0 mt-4 px-4 pb-2 border-t border-app-border pt-4"
        >
            <h3
                transition:fade={{ duration: 200 }}
                class="text-xs font-bold text-app-text-muted uppercase mb-3 pl-1 tracking-wider"
            >
                Quick Recipes
            </h3>
            <div
                class="flex items-center gap-2 mb-3 bg-app-surface-hover/50 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-app-primary/20 transition-all border border-app-border focus-within:border-app-primary/50"
                transition:fade={{ duration: 200 }}
            >
                <Search size={14} class="text-app-text-muted shrink-0" />
                <input
                    type="text"
                    placeholder="Search..."
                    bind:value={searchQuery}
                    class="bg-transparent border-0 outline-none text-xs w-full text-app-text placeholder:text-app-text-muted/70 p-0"
                />
            </div>

            <div
                class="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent"
            >
                {#each filteredRecipes as recipe}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="flex items-center gap-3 p-2 rounded-xl bg-app-surface cursor-grab active:cursor-grabbing transition-all duration-200 group"
                        draggable="true"
                        ondragstart={(e) => handleDragStart(e, recipe)}
                        transition:fade={{ duration: 100 }}
                    >
                        <RecipeThumbnail
                            src={recipe.image}
                            alt={recipe.title}
                            class="w-8 h-8 rounded-lg shadow-sm"
                        />
                        <span
                            class="text-xs font-medium text-app-text line-clamp-2 group-hover:text-app-primary transition-colors"
                        >
                            {recipe.title}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</aside>
