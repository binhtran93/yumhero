<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import RecipeCard from "$lib/components/RecipeCard.svelte";
    import RecipeEditModal from "$lib/components/RecipeEditModal.svelte";
    import { Search, Filter, Plus, Loader2 } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import { userRecipes, userTags } from "$lib/stores/userData";

    let searchQuery = $state("");
    let activeFilter = $state("All");
    let isScrolled = $state(false);
    let showAddModal = $state(false);

    // Reactive filtering
    let filteredRecipes = $derived(
        ($userRecipes.data || []).filter(
            (recipe) =>
                recipe.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) &&
                (activeFilter === "All" ||
                    (recipe.tags && recipe.tags.includes(activeFilter))),
        ),
    );

    const handleScroll = (e: Event) => {
        if (e.target instanceof HTMLDivElement) {
            isScrolled = e.target.scrollTop > 10;
        }
    };
</script>

<!-- Header -->
<Header title="Recipes" />

<RecipeEditModal isOpen={showAddModal} onClose={() => (showAddModal = false)} />

<div class="h-full flex flex-col overflow-hidden relative">
    <!-- Sticky Search & Filter Bar -->
    <div
        class="px-4 md:px-6 pb-2 pt-4 bg-bg-default/95 backdrop-blur-sm z-10 shrink-0 border-b border-border-default/50 transition-shadow {isScrolled
            ? 'shadow-sm'
            : ''}"
    >
        <!-- Search & Add -->
        <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div class="relative flex-1">
                <Search
                    class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                    size={18}
                />
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search recipes..."
                    class="w-full pl-10 md:pl-11 pr-4 py-2.5 md:py-3 text-sm bg-bg-surface border border-border-default rounded-xl focus:outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 text-text-primary placeholder:text-text-secondary/50 transition-all font-medium shadow-sm"
                />
            </div>

            <button
                onclick={() => (showAddModal = true)}
                class="flex items-center gap-2 p-2.5 md:px-4 md:py-3 bg-action-primary text-white rounded-xl shadow-md hover:bg-action-primary/90 transition-all active:scale-95 shrink-0 font-bold"
            >
                <Plus size={20} />
                <span class="hidden sm:inline">Add Recipe</span>
            </button>
        </div>

        <!-- Filter Chips -->
        <div
            class="flex items-start flex-wrap gap-2 max-h-28 overflow-y-auto pr-1"
        >
            <button
                onclick={() => (activeFilter = "All")}
                class="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border {activeFilter ===
                'All'
                    ? 'bg-text-primary text-bg-surface border-text-primary shadow-md'
                    : 'bg-bg-surface text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary'}"
            >
                All
            </button>
            {#each $userTags.data as category}
                <button
                    onclick={() => (activeFilter = category.label)}
                    class="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border {activeFilter ===
                    category.label
                        ? 'bg-text-primary text-bg-surface border-text-primary shadow-md'
                        : 'bg-bg-surface text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary'}"
                >
                    {category.label}
                </button>
            {/each}
        </div>
    </div>

    <!-- Scrollable Content -->
    <div
        class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-24"
        onscroll={handleScroll}
    >
        {#if $userRecipes.loading}
            <div class="flex items-center justify-center h-64">
                <Loader2 class="w-8 h-8 text-action-primary animate-spin" />
            </div>
        {:else if filteredRecipes.length > 0}
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto"
            >
                {#each filteredRecipes as recipe (recipe.id)}
                    <div in:fade={{ duration: 300 }}>
                        <a href="/recipes/{recipe.id}" class="block h-full">
                            <RecipeCard
                                title={recipe.title}
                                image={recipe.image}
                                totalTime={recipe.totalTime}
                                servings={recipe.servings}
                                tags={recipe.tags}
                            />
                        </a>
                    </div>
                {/each}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center h-64 text-center"
            >
                <div
                    class="p-4 bg-bg-surface rounded-full mb-4 text-text-secondary/50"
                >
                    <Search size={32} />
                </div>
                <p class="text-lg font-bold text-text-primary">
                    No recipes found
                </p>
                <p class="text-text-secondary">
                    Try adjusting your search or filters.
                </p>
                <button
                    onclick={() => {
                        searchQuery = "";
                        activeFilter = "All";
                    }}
                    class="mt-4 text-action-primary font-bold hover:underline"
                >
                    Clear All
                </button>
            </div>
        {/if}
    </div>
</div>
