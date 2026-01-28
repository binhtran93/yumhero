<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import RecipeCard from "$lib/components/RecipeCard.svelte";
    import RecipeEditModal from "$lib/components/RecipeEditModal.svelte";
    import RecipeFilterDropdown from "$lib/components/RecipeFilterDropdown.svelte";
    import { Search, Plus, Loader2, ChevronDown, Link } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { userRecipes, userTags } from "$lib/stores/userData";

    let searchQuery = $state("");
    let activeFilter = $state("All");
    let showAddModal = $state(false);
    let showAddDropdown = $state(false);
    let initiallyShowAdvanced = $state(false);

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
</script>

<!-- Header -->
<Header title="Recipes">
    <div
        class="flex items-center gap-2 flex-1 justify-end md:justify-center w-full md:w-auto"
    >
        <!-- Search -->
        <div class="relative w-full max-w-[200px] md:max-w-xs hidden sm:block">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={16}
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search..."
                class="w-full pl-9 pr-3 py-1.5 text-sm bg-bg-default border border-border-default rounded-lg focus:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 text-text-primary placeholder:text-text-secondary/50 transition-all"
            />
        </div>

        <!-- Filter -->
        <RecipeFilterDropdown bind:activeFilter tags={$userTags.data} />

        <!-- Add Button & Dropdown -->
        <div class="relative">
            <button
                onclick={() => (showAddDropdown = !showAddDropdown)}
                class="flex items-center gap-2 p-2 md:px-4 bg-action-primary text-white rounded-lg shadow-sm hover:bg-action-primary/90 transition-all active:scale-95 shrink-0"
                aria-label="Add Recipe"
                title="Add Recipe"
            >
                <Plus size={20} />
                <span class="hidden md:inline font-bold whitespace-nowrap"
                    >Add Recipe</span
                >
                <ChevronDown size={16} class="hidden md:block opacity-70" />
            </button>

            {#if showAddDropdown}
                <div
                    transition:fade={{ duration: 100 }}
                    class="absolute right-0 top-full mt-2 w-48 bg-bg-surface rounded-xl border border-border-default shadow-lg overflow-hidden z-50 py-1"
                >
                    <button
                        onclick={() => {
                            showAddDropdown = false;
                            initiallyShowAdvanced = false;
                            showAddModal = true;
                        }}
                        class="w-full text-left px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-surface-hover flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} />
                        Add Manually
                    </button>
                    <button
                        onclick={() => {
                            showAddDropdown = false;
                            initiallyShowAdvanced = true;
                            showAddModal = true;
                        }}
                        class="w-full text-left px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-surface-hover flex items-center gap-2 transition-colors"
                    >
                        <Link size={16} />
                        Import from URL
                    </button>
                </div>

                <!-- Backdrop to close dropdown -->
                <div
                    class="fixed inset-0 z-40"
                    onclick={() => (showAddDropdown = false)}
                    aria-hidden="true"
                ></div>
            {/if}
        </div>
    </div>
</Header>

<RecipeEditModal
    isOpen={showAddModal}
    onClose={() => (showAddModal = false)}
    initialShowAdvanced={initiallyShowAdvanced}
/>

<div class="h-full flex flex-col overflow-hidden relative">
    <!-- Mobile Search (Visible only on small screens) -->
    <div
        class="px-4 py-2 sm:hidden bg-bg-surface border-b border-border-default"
    >
        <div class="relative">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={16}
            />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search recipes..."
                class="w-full pl-9 pr-3 py-2 text-sm bg-bg-default border border-border-default rounded-lg focus:outline-none focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 text-text-primary placeholder:text-text-secondary/50 transition-all"
            />
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-24">
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
                        <RecipeCard
                            id={recipe.id}
                            title={recipe.title}
                            image={recipe.image}
                            totalTime={recipe.totalTime}
                            servings={recipe.servings}
                            tags={recipe.tags}
                        />
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
