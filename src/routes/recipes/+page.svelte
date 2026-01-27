<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import RecipeCard from "$lib/components/RecipeCard.svelte";
    import { Search, Filter, Plus } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import { categories } from "$lib/stores/settings";

    let searchQuery = $state("");
    let activeFilter = $state("All");
    let isScrolled = $state(false);

    // Mock Data for demonstration
    const recipes = [
        {
            id: 1,
            title: "Avocado Toast with Poached Egg",
            image: "https://images.unsplash.com/photo-1525351484163-7529414395d8?auto=format&fit=crop&q=80&w=800",
            time: 15,
            servings: 1,
            tags: [
                "Breakfast",
                "Healthy",
                "Quick",
                "Dairy & Eggs",
                "Bakery & Deli",
            ],
        },
        {
            id: 2,
            title: "Grilled Salmon with Asparagus",
            image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=800",
            time: 30,
            servings: 2,
            tags: ["Dinner", "Keto", "Gluten-Free", "Meat & Seafood"],
        },
        {
            id: 3,
            title: "Berry Smoothie Bowl",
            image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=800",
            time: 10,
            servings: 1,
            tags: ["Breakfast", "Vegan", "Sweet", "Fruits & Vegetables"],
        },
        {
            id: 4,
            title: "Chicken Caesar Salad",
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=800",
            time: 20,
            servings: 2,
            tags: [
                "Lunch",
                "Salad",
                "Classic",
                "Meat & Seafood",
                "Fruits & Vegetables",
            ],
        },
        {
            id: 5,
            title: "Classic Beef Burger",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
            time: 45,
            servings: 4,
            tags: [
                "Dinner",
                "Comfort",
                "Grill",
                "Meat & Seafood",
                "Bakery & Deli",
            ],
        },
        {
            id: 6,
            title: "Chocolate Chip Cookies",
            image: "https://images.unsplash.com/photo-1499636138143-e64b7913f3ae?auto=format&fit=crop&q=80&w=800",
            time: 60,
            servings: 12,
            tags: ["Dessert", "Baking", "Sweet", "Baking Goods", "Pantry"],
        },
    ];

    // Reactive filtering
    let filteredRecipes = $derived(
        recipes.filter((recipe) => {
            const matchesSearch = recipe.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesFilter =
                activeFilter === "All" || recipe.tags.includes(activeFilter);
            return matchesSearch && matchesFilter;
        }),
    );

    const handleScroll = (e: Event) => {
        const target = e.target as HTMLDivElement;
        isScrolled = target.scrollTop > 10;
    };
</script>

<!-- Header -->
<Header title="Recipes" />

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
                class="flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-action-primary text-white rounded-xl shadow-md hover:bg-action-primary/90 transition-all active:scale-95 shrink-0 font-bold"
            >
                <Plus size={20} />
                <span class="hidden sm:inline">Add Recipe</span>
            </button>
        </div>

        <!-- Filter Chips -->
        <div
            class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6"
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
            {#each $categories as category}
                <button
                    onclick={() => (activeFilter = category)}
                    class="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border {activeFilter ===
                    category
                        ? 'bg-text-primary text-bg-surface border-text-primary shadow-md'
                        : 'bg-bg-surface text-text-secondary border-border-default hover:border-text-primary/30 hover:text-text-primary'}"
                >
                    {category}
                </button>
            {/each}
        </div>
    </div>

    <!-- Scrollable Content -->
    <div
        class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-24"
        onscroll={handleScroll}
    >
        {#if filteredRecipes.length > 0}
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto"
            >
                {#each filteredRecipes as recipe (recipe.id)}
                    <div in:fade={{ duration: 300 }}>
                        <RecipeCard
                            title={recipe.title}
                            image={recipe.image}
                            time={recipe.time}
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
