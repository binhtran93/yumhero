<script lang="ts">
    import { type PageData } from "./$types";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { userTags } from "$lib/stores/tags";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import { formatAmount } from "$lib/utils/shopping";
    import { formatServings } from "$lib/utils/recipe";
    import Header from "$lib/components/Header.svelte";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";
    import {
        Clock,
        Users,
        Flame,
        ChefHat,
        Utensils,
        ExternalLink,
        ShoppingCart,
        Square,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import RecipeActionMenu from "$lib/components/RecipeActionMenu.svelte";
    import IngredientItem from "$lib/components/IngredientItem.svelte";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    // Derived store to fetch the specific recipe once user and ID are available
    let recipeStore = derived(
        [user, authLoading],
        ([$user, $authLoading], set) => {
            if ($authLoading) {
                set({ data: null, loading: true });
                return;
            }
            if (!$user) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<Recipe>(
                `users/${$user.uid}/recipes/${data.id}`,
            );
            return store.subscribe(set);
        },
        { data: null, loading: true } as DocumentState<Recipe>,
    );

    let recipe = $derived($recipeStore.data);
    let loading = $derived($recipeStore.loading);

    function getTagName(tagId: string) {
        return $userTags.data.find((t) => t.id === tagId)?.label || tagId;
    }
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden">
    <!-- Header (Visible on all screens) -->
    <div class="shrink-0 z-20 bg-app-bg border-b border-app-border">
        <Header title="Recipe Details" showBack={true} backUrl="/recipes">
            <RecipeActionMenu recipeId={data.id} />
        </Header>
    </div>

    <!-- Main Content Scrollable Area -->
    <div class="flex-1 overflow-y-auto w-full">
        {#if loading}
            <div class="flex items-center justify-center h-full min-h-[50vh]">
                <div
                    class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if recipe}
            <div
                in:fade={{ duration: 300 }}
                class="max-w-6xl mx-auto p-4 lg:p-8"
            >
                <!-- COMPACT HEADER SECTION -->
                <div
                    class="flex flex-col md:flex-row gap-6 md:gap-8 bg-app-surface rounded-3xl p-6 shadow-sm border border-app-border mb-4 md:mb-8"
                >
                    <!-- Image (Compact & Rounded) -->
                    <div class="w-full md:w-[320px] shrink-0">
                        <div
                            class="h-48 md:h-auto aspect-video md:aspect-4/3 relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-app-border/50 group"
                        >
                            <RecipeThumbnail
                                src={recipe.image}
                                alt={recipe.title}
                                class="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <!-- Info (Title, Desc, Stats) -->
                    <div class="flex-1 flex flex-col justify-center space-y-4">
                        <!-- Tags -->
                        {#if recipe.tags && recipe.tags.length > 0}
                            <div
                                class="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted"
                            >
                                {#each recipe.tags as tag}
                                    <span
                                        class="px-2 py-1 rounded-md bg-app-surface-hover border border-app-border"
                                    >
                                        {getTagName(tag)}
                                    </span>
                                {/each}
                            </div>
                        {/if}

                        <h1
                            class="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-app-text leading-tight"
                        >
                            {recipe.title}
                        </h1>

                        <!-- Quick Stats -->
                        <div
                            class="flex items-center gap-6 text-app-text-muted text-sm md:text-base font-medium py-2 border-y border-app-border/50 w-fit"
                        >
                            <div class="flex items-center gap-2">
                                <Clock size={18} class="text-app-primary" />
                                <span>{recipe.totalTime} mins</span>
                            </div>
                            <div class="w-px h-4 bg-border-default"></div>
                            <div class="flex items-center gap-2">
                                <Users size={18} class="text-accent-dinner" />
                                <span>
                                    {formatServings(recipe.servings)} servings
                                </span>
                            </div>
                            <div class="w-px h-4 bg-border-default"></div>
                            <div class="flex items-center gap-2">
                                <Flame
                                    size={18}
                                    class="text-accent-breakfast"
                                />
                                <span>{recipe.calories || "-"} cal</span>
                            </div>
                        </div>

                        {#if recipe.description}
                            <p
                                class="text-app-text-muted text-base leading-relaxed line-clamp-3 md:line-clamp-4 hover:line-clamp-none transition-all cursor-pointer"
                            >
                                {recipe.description}
                            </p>
                        {/if}

                        {#if recipe.sourceUrl}
                            <a
                                href={recipe.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1.5 text-sm font-bold text-app-primary hover:underline w-fit"
                            >
                                <ExternalLink size={14} /> Source Recipe
                            </a>
                        {/if}

                        <!-- Mode Buttons -->
                        <div class="flex flex-wrap gap-3 pt-2">
                            <a
                                href="/recipes/{data.id}/shopping"
                                class="flex items-center gap-2 px-4 py-2.5 bg-app-primary text-white font-semibold rounded-xl hover:bg-app-primary/90 transition-colors shadow-sm"
                            >
                                <ShoppingCart size={18} />
                                <span>Shopping</span>
                            </a>
                            <a
                                href="/recipes/{data.id}/cooking"
                                class="flex items-center gap-2 px-4 py-2.5 bg-accent-lunch text-white font-semibold rounded-xl hover:bg-accent-lunch/90 transition-colors shadow-sm"
                            >
                                <ChefHat size={18} />
                                <span>Cooking</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- CONTENT GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <!-- LEFT: Ingredients (4 cols) - Sticky -->
                    <div class="lg:col-span-4">
                        <div
                            class="bg-app-surface rounded-3xl p-6 shadow-sm border border-app-border lg:sticky lg:top-4"
                        >
                            <div
                                class="flex items-center justify-between mb-6 pb-4 border-b border-app-border/50"
                            >
                                <h2
                                    class="font-display text-xl font-bold text-app-text flex items-center gap-2"
                                >
                                    <Utensils
                                        size={20}
                                        class="text-accent-lunch"
                                    />
                                    Ingredients
                                </h2>
                                <span
                                    class="text-xs font-semibold text-app-text-muted bg-app-bg px-2 py-1 rounded-full border border-app-border"
                                >
                                    {recipe.ingredients.length}
                                </span>
                            </div>

                            <ul class="space-y-3">
                                {#each recipe.ingredients as ingredient}
                                    <IngredientItem
                                        name={ingredient.name}
                                        amount={ingredient.amount}
                                        unit={ingredient.unit}
                                        notes={ingredient.notes}
                                        showCheckbox={false}
                                    />
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <!-- RIGHT: Instructions (8 cols) -->
                    <div class="lg:col-span-8">
                        <div
                            class="bg-app-surface rounded-3xl p-6 shadow-sm border border-app-border space-y-8"
                        >
                            {#if recipe.prepNotes}
                                <div
                                    class="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 text-amber-900"
                                >
                                    <ChefHat
                                        size={20}
                                        class="shrink-0 mt-0.5 text-amber-600"
                                    />
                                    <div
                                        class="text-sm md:text-base leading-relaxed font-medium"
                                    >
                                        <span
                                            class="block font-bold text-xs uppercase tracking-wide text-amber-700 mb-1"
                                            >Chef's Note</span
                                        >
                                        {recipe.prepNotes}
                                    </div>
                                </div>
                            {/if}

                            <div>
                                <h2
                                    class="font-display text-2xl font-bold text-app-text mb-6 flex items-center gap-2"
                                >
                                    <ChefHat
                                        size={24}
                                        class="text-app-primary"
                                    />
                                    Instructions
                                </h2>
                                <div class="space-y-0">
                                    {#each recipe.instructions as step, i}
                                        <div
                                            class="relative pl-10 md:pl-12 py-2 group"
                                        >
                                            <!-- Timeline Line (connects to next, hidden on last) -->
                                            {#if i !== recipe.instructions.length - 1}
                                                <div
                                                    class="absolute left-[15.5px] md:left-[19.5px] top-10 -bottom-2 w-px bg-app-border group-hover:bg-app-primary/30 transition-colors"
                                                ></div>
                                            {/if}

                                            <!-- Timeline Node -->
                                            <div
                                                class="absolute left-0 md:left-1 top-2 w-8 h-8 rounded-full bg-app-surface border border-app-border text-sm font-bold flex items-center justify-center text-app-text-muted group-hover:border-app-primary group-hover:text-app-primary group-hover:bg-app-primary/5 transition-all z-10"
                                            >
                                                {i + 1}
                                            </div>

                                            <!-- Content -->
                                            <div class="pb-2">
                                                <p
                                                    class="text-lg text-app-text leading-relaxed pt-0.5 group-hover:text-app-text/80 transition-colors"
                                                >
                                                    {step}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <div
                                class="py-10 flex flex-col items-center justify-center text-center opacity-40"
                            >
                                <div class="w-16 h-px bg-app-border mb-4"></div>
                                <span
                                    class="font-display font-medium text-lg italic"
                                    >Bon Appétit!</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Not Found State -->
            <div
                class="flex flex-col items-center justify-center h-full text-center px-4"
            >
                <div
                    class="w-24 h-24 bg-app-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
                >
                    <span class="text-4xl">🍳</span>
                </div>
                <h2 class="text-2xl font-display font-bold text-app-text mb-2">
                    Recipe not found
                </h2>
                <a
                    href="/recipes"
                    class="px-6 py-3 bg-app-primary text-white font-bold rounded-xl shadow-lg mt-6"
                >
                    Back to Cookbook
                </a>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Custom scrollbar hiding utility */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
