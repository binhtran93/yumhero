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
    import SEO from "$lib/components/SEO.svelte";
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

    // Generate SEO description from recipe
    let seoDescription = $derived(
        recipe?.description ||
            (recipe
                ? `${recipe.title} - Ready in ${recipe.totalTime} minutes. Serves ${formatServings(recipe.servings)} people.`
                : ""),
    );

    // Generate JSON-LD structured data for Recipe schema
    let jsonLd = $derived(
        recipe
            ? {
                  "@context": "https://schema.org/",
                  "@type": "Recipe",
                  name: recipe.title,
                  description:
                      recipe.description ||
                      `A delicious ${recipe.title} recipe`,
                  image: recipe.image || undefined,
                  totalTime: `PT${recipe.totalTime}M`,
                  recipeYield: `${formatServings(recipe.servings)} servings`,
                  recipeIngredient: recipe.ingredients.map((i) =>
                      `${formatAmount(i.amount)} ${i.unit || ""} ${i.name}`.trim(),
                  ),
                  recipeInstructions: recipe.instructions.map(
                      (step, index) => ({
                          "@type": "HowToStep",
                          position: index + 1,
                          text: step,
                      }),
                  ),
                  ...(recipe.calories
                      ? {
                            nutrition: {
                                "@type": "NutritionInformation",
                                calories: `${recipe.calories} calories`,
                            },
                        }
                      : {}),
              }
            : null,
    );
</script>

<SEO
    title={recipe?.title || "Recipe Details"}
    description={seoDescription || "View recipe details on YumHero"}
    image={recipe?.image}
    type="article"
    {jsonLd}
/>

<div class="h-full flex flex-col bg-app-bg overflow-hidden">
    <!-- Header (Visible on all screens) -->
    <div
        class="shrink-0 z-20 bg-app-bg border-b border-app-border md:block hidden"
    >
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
            <div in:fade={{ duration: 300 }} class="pb-24 md:pb-8">
                <!-- MOBILE HERO SECTION -->
                <div class="md:hidden">
                    <!-- Hero Image with Gradient Overlay -->
                    <div class="relative w-full h-56">
                        <RecipeThumbnail
                            src={recipe.image}
                            alt={recipe.title}
                            class="w-full h-full object-cover"
                        />
                        <!-- Gradient overlay for text readability -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-overlay-gradient-from via-overlay-gradient-via to-transparent"
                        ></div>

                        <!-- Back button overlay -->
                        <a
                            href="/recipes"
                            class="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-overlay-bg hover:bg-overlay-bg-hover backdrop-blur-sm rounded-full text-overlay-text transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ><path d="m15 18-6-6 6-6" /></svg
                            >
                        </a>

                        <!-- Action menu overlay -->
                        <div class="absolute top-3 right-3">
                            <RecipeActionMenu
                                recipeId={data.id}
                                class="[&>button]:bg-overlay-bg [&>button]:backdrop-blur-sm [&>button]:text-overlay-text [&>button]:hover:bg-overlay-bg-hover [&>button]:mr-0"
                            />
                        </div>

                        <!-- Title overlay at bottom -->
                        <div class="absolute bottom-0 left-0 right-0 p-4">
                            <!-- Meal type badges -->
                            {#if recipe.mealTypes && recipe.mealTypes.length > 0}
                                <div class="flex flex-wrap gap-1.5 mb-2">
                                    {#each [...new Set(recipe.mealTypes)] as type}
                                        <span
                                            class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide
                                            {type === 'breakfast'
                                                ? 'bg-accent-breakfast text-white'
                                                : type === 'lunch'
                                                  ? 'bg-accent-lunch text-white'
                                                  : type === 'dinner'
                                                    ? 'bg-accent-dinner text-white'
                                                    : type === 'snack'
                                                      ? 'bg-accent-snack text-white'
                                                      : 'bg-app-primary text-white'}"
                                        >
                                            {type}
                                        </span>
                                    {/each}
                                </div>
                            {/if}
                            <h1
                                class="text-xl font-display font-bold text-white leading-tight line-clamp-2 drop-shadow-lg"
                            >
                                {recipe.title}
                            </h1>
                        </div>
                    </div>

                    <!-- Quick Stats Bar -->
                    <div
                        class="flex items-center justify-center gap-4 py-2.5 px-4 bg-app-surface border-b border-app-border"
                    >
                        <div class="flex items-center gap-1.5 text-app-text">
                            <Clock size={14} class="text-app-primary" />
                            <span class="text-sm font-semibold"
                                >{recipe.totalTime} min</span
                            >
                        </div>
                        <div class="w-1 h-1 rounded-full bg-app-border"></div>
                        <div class="flex items-center gap-1.5 text-app-text">
                            <Users size={14} class="text-accent-dinner" />
                            <span class="text-sm font-semibold"
                                >{formatServings(recipe.servings)} ppl</span
                            >
                        </div>
                        {#if recipe.calories}
                            <div
                                class="w-1 h-1 rounded-full bg-app-border"
                            ></div>
                            <div
                                class="flex items-center gap-1.5 text-app-text"
                            >
                                <Flame
                                    size={14}
                                    class="text-accent-breakfast"
                                />
                                <span class="text-sm font-semibold"
                                    >{recipe.calories} cal</span
                                >
                            </div>
                        {/if}
                    </div>

                    <!-- Tags (if any) -->
                    {#if recipe.tags && recipe.tags.length > 0}
                        <div
                            class="flex flex-wrap gap-1.5 px-4 py-2 bg-app-surface border-b border-app-border"
                        >
                            {#each recipe.tags as tag}
                                <span
                                    class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide text-app-text-muted bg-app-bg border border-app-border"
                                >
                                    {getTagName(tag)}
                                </span>
                            {/each}
                        </div>
                    {/if}

                    <!-- Description & Source -->
                    {#if recipe.description || recipe.sourceUrl}
                        <div
                            class="px-4 py-3 bg-app-surface border-b border-app-border space-y-2"
                        >
                            {#if recipe.description}
                                <p
                                    class="text-sm text-app-text-muted leading-relaxed"
                                >
                                    {recipe.description}
                                </p>
                            {/if}
                            {#if recipe.sourceUrl}
                                <a
                                    href={recipe.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center gap-1 text-xs font-bold text-app-primary"
                                >
                                    <ExternalLink size={12} /> View source
                                </a>
                            {/if}
                        </div>
                    {/if}

                    <!-- Ingredients Section -->
                    <div class="px-4 py-4 bg-app-bg">
                        <div class="flex items-center justify-between mb-3">
                            <h2
                                class="font-display text-lg font-bold text-app-text flex items-center gap-2"
                            >
                                <Utensils size={18} class="text-accent-lunch" />
                                Ingredients
                            </h2>
                            <span
                                class="text-[10px] font-bold text-app-text-muted bg-app-surface px-2 py-0.5 rounded-full border border-app-border"
                            >
                                {recipe.ingredients.length} items
                            </span>
                        </div>
                        <ul class="space-y-2">
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

                    <!-- Chef's Note (if any) -->
                    {#if recipe.prepNotes}
                        <div
                            class="mx-4 mb-4 bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-3 text-amber-900"
                        >
                            <ChefHat
                                size={16}
                                class="shrink-0 mt-0.5 text-amber-600"
                            />
                            <div class="text-sm leading-relaxed">
                                <span
                                    class="block font-bold text-[10px] uppercase tracking-wide text-amber-700 mb-0.5"
                                    >Chef's Note</span
                                >
                                {recipe.prepNotes}
                            </div>
                        </div>
                    {/if}

                    <!-- Instructions Section -->
                    <div class="px-4 py-4 bg-app-bg">
                        <h2
                            class="font-display text-lg font-bold text-app-text mb-4 flex items-center gap-2"
                        >
                            <ChefHat size={18} class="text-app-primary" />
                            Instructions
                        </h2>
                        <div class="space-y-0">
                            {#each recipe.instructions as step, i}
                                <div class="relative pl-9 py-2 group">
                                    {#if i !== recipe.instructions.length - 1}
                                        <div
                                            class="absolute left-[13px] top-9 -bottom-2 w-px bg-app-border"
                                        ></div>
                                    {/if}
                                    <div
                                        class="absolute left-0 top-2 w-7 h-7 rounded-full bg-app-surface border border-app-border text-xs font-bold flex items-center justify-center text-app-text-muted z-10"
                                    >
                                        {i + 1}
                                    </div>
                                    <p
                                        class="text-sm text-app-text leading-relaxed"
                                    >
                                        {step}
                                    </p>
                                </div>
                            {/each}
                        </div>
                        <div
                            class="py-6 flex flex-col items-center justify-center text-center opacity-40"
                        >
                            <div class="w-12 h-px bg-app-border mb-3"></div>
                            <span
                                class="font-display font-medium text-sm italic"
                                >Bon Appétit!</span
                            >
                        </div>
                    </div>
                </div>

                <!-- DESKTOP LAYOUT (unchanged structure, improved) -->
                <div class="hidden md:block max-w-6xl mx-auto p-4 lg:p-8">
                    <!-- COMPACT HEADER SECTION -->
                    <div
                        class="flex flex-col md:flex-row bg-app-surface rounded-3xl shadow-sm border border-app-border mb-6 md:mb-10 overflow-hidden"
                    >
                        <!-- Image -->
                        <div class="w-full md:w-1/3 max-w-md shrink-0 relative">
                            <div class="h-64 md:h-full md:p-4 lg:p-6">
                                <div
                                    class="w-full h-full relative overflow-hidden md:rounded-2xl group md:border border-app-border/50"
                                >
                                    <RecipeThumbnail
                                        src={recipe.image}
                                        alt={recipe.title}
                                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Info -->
                        <div
                            class="flex-1 flex flex-col justify-center space-y-4 p-6 md:p-8 md:pl-2"
                        >
                            <div class="flex flex-col gap-3">
                                {#if recipe.mealTypes && recipe.mealTypes.length > 0}
                                    <div class="flex flex-wrap gap-2">
                                        {#each [...new Set(recipe.mealTypes)] as type}
                                            <span
                                                class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border
                                                {type === 'breakfast'
                                                    ? 'bg-accent-breakfast text-white border-accent-breakfast'
                                                    : type === 'lunch'
                                                      ? 'bg-accent-lunch text-white border-accent-lunch'
                                                      : type === 'dinner'
                                                        ? 'bg-accent-dinner text-white border-accent-dinner'
                                                        : type === 'snack'
                                                          ? 'bg-accent-snack text-white border-accent-snack'
                                                          : 'bg-app-primary text-white border-app-primary'}"
                                            >
                                                {type}
                                            </span>
                                        {/each}
                                    </div>
                                {/if}

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
                            </div>

                            <h1
                                class="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-app-text leading-tight"
                            >
                                {recipe.title}
                            </h1>

                            <div
                                class="flex items-center gap-6 text-app-text-muted text-sm md:text-base font-medium py-2 border-y border-app-border/50 w-fit"
                            >
                                <div class="flex items-center gap-2">
                                    <Clock size={18} class="text-app-primary" />
                                    <span>{recipe.totalTime} mins</span>
                                </div>
                                <div class="w-px h-4 bg-border-default"></div>
                                <div class="flex items-center gap-2">
                                    <Users
                                        size={18}
                                        class="text-accent-dinner"
                                    />
                                    <span
                                        >{formatServings(recipe.servings)} servings</span
                                    >
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
                        <div class="lg:col-span-4">
                            <div
                                class="bg-app-surface rounded-3xl p-6 shadow-sm border border-app-border lg:sticky lg:top-4"
                            >
                                <div
                                    class="flex items-center justify-between mb-2 pb-4 border-b border-app-border/50"
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
                                <ul>
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
                                                {#if i !== recipe.instructions.length - 1}
                                                    <div
                                                        class="absolute left-[15.5px] md:left-[19.5px] top-10 -bottom-2 w-px bg-app-border group-hover:bg-app-primary/30 transition-colors"
                                                    ></div>
                                                {/if}
                                                <div
                                                    class="absolute left-0 md:left-1 top-2 w-8 h-8 rounded-full bg-app-surface border border-app-border text-sm font-bold flex items-center justify-center text-app-text-muted group-hover:border-app-primary group-hover:text-app-primary group-hover:bg-app-primary/5 transition-all z-10"
                                                >
                                                    {i + 1}
                                                </div>
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
                                    <div
                                        class="w-16 h-px bg-app-border mb-4"
                                    ></div>
                                    <span
                                        class="font-display font-medium text-lg italic"
                                        >Bon Appétit!</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MOBILE STICKY ACTION BAR -->
                <div
                    class="md:hidden fixed bottom-0 left-0 right-0 bg-app-surface/95 backdrop-blur-md border-t border-app-border p-3 flex gap-3 z-50"
                >
                    <a
                        href="/recipes/{data.id}/shopping"
                        class="flex-1 flex items-center justify-center gap-2 py-3 bg-app-primary text-white font-bold rounded-xl shadow-sm"
                    >
                        <ShoppingCart size={18} />
                        <span>Shopping</span>
                    </a>
                    <a
                        href="/recipes/{data.id}/cooking"
                        class="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-lunch text-white font-bold rounded-xl shadow-sm"
                    >
                        <ChefHat size={18} />
                        <span>Cooking</span>
                    </a>
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
