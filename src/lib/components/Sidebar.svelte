<script lang="ts">
    import { page } from "$app/stores";
    import { Search, PanelLeftClose, PanelLeftOpen } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { sidebarExpanded } from "$lib/stores/ui";
    import { userRecipes } from "$lib/stores/recipes";
    import {
        availableLeftovers,
        totalLeftoversCount,
    } from "$lib/stores/leftovers";
    import { fridgeIngredientsCount } from "$lib/stores/fridgeIngredients";
    import type { Recipe, LeftoverItem } from "$lib/types";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";

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

    const handleLeftoverDragStart = (e: DragEvent, leftover: LeftoverItem) => {
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "all";
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                type: "sidebar-leftover",
                leftoverId: leftover.id,
            }),
        );
    };
</script>

{#if $page.url.pathname === "/plan"}
    <aside
        class="
        hidden md:flex flex-col shrink-0 z-20 bg-app-surface border-r border-app-border transition-all duration-300 h-full
        {$sidebarExpanded ? 'w-64' : 'w-12'}
        "
    >
        <div class="flex-1 overflow-hidden flex flex-col pt-4">
            {#if $sidebarExpanded}
                <div
                    class="flex flex-col flex-1 min-h-0 px-4 pb-2"
                    in:fade={{ duration: 150 }}
                >
                    {#if $availableLeftovers.length > 0}
                        <div class="flex flex-col mb-6">
                            <h3
                                class="text-xs font-bold text-app-text-muted uppercase mb-3 pl-1 tracking-wider"
                            >
                                Leftovers
                            </h3>
                            <div
                                class="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 -mx-2 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent"
                            >
                                {#each $availableLeftovers as leftover}
                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                    <div
                                        class="flex items-center gap-3 p-2 rounded-xl bg-app-surface cursor-grab active:cursor-grabbing transition-all duration-200 group border border-transparent hover:border-app-border"
                                        draggable="true"
                                        ondragstart={(e) =>
                                            handleLeftoverDragStart(
                                                e,
                                                leftover,
                                            )}
                                    >
                                        <RecipeThumbnail
                                            src={leftover.imageUrl || undefined}
                                            alt={leftover.title}
                                            class="w-8 h-8 rounded-lg shadow-sm"
                                        />
                                        <div class="flex flex-col min-w-0">
                                            <span
                                                class="text-xs font-semibold text-app-text line-clamp-1 group-hover:text-app-primary transition-colors"
                                            >
                                                {leftover.title}
                                            </span>
                                            <span
                                                class="text-[10px] text-app-text-muted"
                                            >
                                                {new Date(
                                                    leftover.createdAt,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <h3
                        class="text-xs font-bold text-app-text-muted uppercase mb-3 pl-1 tracking-wider"
                    >
                        Quick Recipes
                    </h3>
                    <div
                        class="flex items-center gap-2 mb-3 bg-app-surface-hover/50 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-app-primary/20 transition-all border border-app-border focus-within:border-app-primary/50"
                    >
                        <Search
                            size={14}
                            class="text-app-text-muted shrink-0"
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            bind:value={searchQuery}
                            class="bg-transparent border-0 outline-none text-xs w-full text-app-text placeholder:text-app-text-muted/70 p-0"
                        />
                    </div>

                    <div
                        class="flex-1 overflow-y-auto pr-1 pb-3 -mx-2 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent"
                    >
                        {#each filteredRecipes as recipe}
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div
                                class="flex items-center gap-3 p-2 rounded-xl bg-app-surface cursor-grab active:cursor-grabbing transition-all duration-200 group border border-transparent hover:border-app-border"
                                draggable="true"
                                ondragstart={(e) => handleDragStart(e, recipe)}
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
        </div>

        <!-- Toggle Button (Bottom) -->
        <div
            class="p-2 border-t border-app-border flex {$sidebarExpanded
                ? 'justify-start'
                : 'justify-center'}"
        >
            <button
                onclick={() => ($sidebarExpanded = !$sidebarExpanded)}
                class="p-2 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-hover transition-all duration-200"
                aria-label={$sidebarExpanded
                    ? "Collapse Sidebar"
                    : "Expand Sidebar"}
            >
                {#if $sidebarExpanded}
                    <PanelLeftClose size={18} strokeWidth={2} />
                {:else}
                    <PanelLeftOpen size={18} strokeWidth={2} />
                {/if}
            </button>
        </div>
    </aside>
{/if}
