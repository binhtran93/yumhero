<script lang="ts">
    import { type PageData } from "./$types";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import {
        Clock,
        Users,
        Flame,
        ArrowLeft,
        Pencil,
        Share2,
        ChefHat,
        Utensils,
        ExternalLink,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    // Derived store to fetch the specific recipe once user and ID are available
    let recipeStore = derived(
        user,
        ($user, set) => {
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
</script>

<div class="h-full flex flex-col bg-bg-default">
    <!-- Mobile Header (Hidden on Desktop) -->
    <div class="lg:hidden">
        <Header title="Recipe Details" showBack={true} backUrl="/recipes" />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden">
        {#if loading}
            <div class="flex items-center justify-center h-full">
                <div
                    class="w-10 h-10 border-4 border-action-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if recipe}
            <div
                class="h-full overflow-y-auto lg:overflow-hidden lg:flex lg:p-6 lg:gap-8 max-w-7xl mx-auto"
                in:fade={{ duration: 300 }}
            >
                <!-- LEFT PANEL: Sticky Summary & Image (Desktop) / Top Section (Mobile) -->
                <aside
                    class="w-full lg:w-[420px] lg:flex-shrink-0 lg:h-full lg:overflow-y-auto no-scrollbar pb-6 lg:pb-0"
                >
                    <div class="lg:sticky lg:top-0 space-y-6">
                        <!-- Navigation (Desktop Only) -->
                        <div class="hidden lg:flex items-center gap-4 mb-2">
                            <a
                                href="/recipes"
                                class="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </a>
                            <span
                                class="text-sm font-semibold text-text-secondary uppercase tracking-wider"
                                >Back to Recipes</span
                            >
                        </div>

                        <!-- Main Recipe Card -->
                        <div
                            class="bg-bg-surface rounded-none lg:rounded-3xl shadow-sm border-b lg:border border-border-default overflow-hidden"
                        >
                            <!-- Image -->
                            <div
                                class="relative aspect-square lg:aspect-[4/3] bg-bg-accent-subtle group"
                            >
                                {#if recipe.image}
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                {:else}
                                    <div
                                        class="w-full h-full flex flex-col items-center justify-center text-text-secondary/40"
                                    >
                                        <ChefHat size={64} />
                                    </div>
                                {/if}
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 lg:opacity-40"
                                ></div>

                                <!-- Floating Actions -->
                                <div class="absolute top-4 right-4 flex gap-2">
                                    <button
                                        class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-text-primary transition-all active:scale-95"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-action-primary transition-all active:scale-95"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>

                            <!-- Header Content -->
                            <div class="p-6 space-y-4">
                                <div>
                                    <h1
                                        class="font-display text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-2"
                                    >
                                        {recipe.title}
                                    </h1>
                                    {#if recipe.tags && recipe.tags.length > 0}
                                        <div class="flex flex-wrap gap-2">
                                            {#each recipe.tags as tag}
                                                <span
                                                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-accent-subtle text-text-secondary border border-border-default"
                                                >
                                                    #{tag}
                                                </span>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>

                                <!-- Description -->
                                {#if recipe.description}
                                    <p
                                        class="text-text-secondary text-sm leading-relaxed line-clamp-4 hover:line-clamp-none transition-all"
                                    >
                                        {recipe.description}
                                    </p>
                                {/if}

                                <!-- Key Stats Grid -->
                                <div
                                    class="grid grid-cols-3 gap-2 py-4 border-t border-border-default md:border-none"
                                >
                                    <div
                                        class="flex flex-col items-center justify-center p-3 rounded-2xl bg-bg-accent-subtle border border-border-default/50"
                                    >
                                        <Clock
                                            size={20}
                                            class="text-action-primary mb-1"
                                        />
                                        <span
                                            class="text-[10px] uppercase font-bold text-text-secondary tracking-wide"
                                            >Time</span
                                        >
                                        <span
                                            class="font-bold text-text-primary"
                                            >{recipe.totalTime}m</span
                                        >
                                    </div>
                                    <div
                                        class="flex flex-col items-center justify-center p-3 rounded-2xl bg-bg-accent-subtle border border-border-default/50"
                                    >
                                        <Users
                                            size={20}
                                            class="text-accent-dinner mb-1"
                                        />
                                        <span
                                            class="text-[10px] uppercase font-bold text-text-secondary tracking-wide"
                                            >Serves</span
                                        >
                                        <span
                                            class="font-bold text-text-primary"
                                            >{recipe.servings}</span
                                        >
                                    </div>
                                    <div
                                        class="flex flex-col items-center justify-center p-3 rounded-2xl bg-bg-accent-subtle border border-border-default/50"
                                    >
                                        <Flame
                                            size={20}
                                            class="text-accent-breakfast mb-1"
                                        />
                                        <span
                                            class="text-[10px] uppercase font-bold text-text-secondary tracking-wide"
                                            >Cal</span
                                        >
                                        <span
                                            class="font-bold text-text-primary"
                                            >-</span
                                        >
                                    </div>
                                </div>

                                {#if recipe.sourceUrl}
                                    <a
                                        href={recipe.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-bg-surface-hover text-text-secondary text-sm font-medium hover:text-action-primary transition-colors border border-border-default/50"
                                    >
                                        <ExternalLink size={14} />
                                        Original Recipe
                                    </a>
                                {/if}
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- RIGHT PANEL: Scrollable Details -->
                <main
                    class="flex-1 lg:h-full lg:overflow-y-auto no-scrollbar lg:pr-2 pb-24 lg:pb-6 space-y-6 px-4 lg:px-0 mt-6 lg:mt-0"
                >
                    <!-- Ingredients Section -->
                    <section
                        class="bg-bg-surface rounded-3xl p-6 lg:p-8 shadow-sm border border-border-default"
                    >
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="p-2 rounded-xl bg-accent-lunch-bg text-accent-lunch"
                            >
                                <Utensils size={24} />
                            </div>
                            <h2
                                class="font-display text-xl font-bold text-text-primary"
                            >
                                Ingredients
                            </h2>
                            <span
                                class="ml-auto text-xs font-semibold text-text-secondary bg-bg-default px-3 py-1 rounded-full border border-border-default"
                            >
                                {recipe.ingredients.length} items
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {#each recipe.ingredients as ingredient, i}
                                <label
                                    class="group flex items-start p-3 -mx-2 rounded-xl hover:bg-bg-surface-hover transition-colors cursor-pointer select-none"
                                >
                                    <div
                                        class="relative flex items-center justify-center pt-1 pr-3"
                                    >
                                        <input
                                            type="checkbox"
                                            class="peer appearance-none w-5 h-5 border-2 border-border-strong rounded transition-colors checked:bg-action-primary checked:border-action-primary"
                                        />
                                        <svg
                                            class="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity top-[9px] left-[3px]"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                        >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div
                                            class="font-medium text-text-primary group-hover:text-action-primary transition-colors peer-checked:line-through peer-checked:text-text-secondary/60"
                                        >
                                            <span class="font-bold"
                                                >{ingredient.amount}
                                                {ingredient.unit}</span
                                            >
                                            {ingredient.name}
                                        </div>
                                        {#if ingredient.notes}
                                            <div
                                                class="text-xs text-text-secondary mt-0.5 italic"
                                            >
                                                {ingredient.notes}
                                            </div>
                                        {/if}
                                    </div>
                                </label>
                            {/each}
                        </div>
                    </section>

                    <!-- Instructions Section -->
                    <section
                        class="bg-bg-surface rounded-3xl p-6 lg:p-8 shadow-sm border border-border-default"
                    >
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="p-2 rounded-xl bg-action-primary/10 text-action-primary"
                            >
                                <ChefHat size={24} />
                            </div>
                            <h2
                                class="font-display text-xl font-bold text-text-primary"
                            >
                                Instructions
                            </h2>
                            <span
                                class="ml-auto text-xs font-semibold text-text-secondary bg-bg-default px-3 py-1 rounded-full border border-border-default"
                            >
                                {recipe.instructions.length} steps
                            </span>
                        </div>

                        <div class="space-y-8 pl-2">
                            {#each recipe.instructions as step, i}
                                <div class="relative flex gap-5 group">
                                    <!-- Step Number -->
                                    <div
                                        class="flex-shrink-0 flex flex-col items-center"
                                    >
                                        <div
                                            class="flex items-center justify-center w-8 h-8 rounded-full bg-bg-default border border-border-default text-sm font-bold text-text-secondary group-hover:border-action-primary group-hover:text-action-primary transition-colors shadow-sm z-10"
                                        >
                                            {i + 1}
                                        </div>
                                        {#if i !== recipe.instructions.length - 1}
                                            <div
                                                class="w-px flex-1 bg-border-default group-hover:bg-border-strong/50 my-2 transition-colors"
                                            ></div>
                                        {/if}
                                    </div>

                                    <!-- Step Content -->
                                    <div class="pb-2">
                                        <p
                                            class="text-text-primary leading-relaxed text-[15px] md:text-base group-hover:text-text-primary/90"
                                        >
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>
                </main>
            </div>
        {:else}
            <!-- Not Found State -->
            <div
                class="flex flex-col items-center justify-center h-full text-center px-4"
            >
                <div
                    class="w-24 h-24 bg-bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
                >
                    <span class="text-4xl">🍳</span>
                </div>
                <h2
                    class="text-2xl font-display font-bold text-text-primary mb-2"
                >
                    Recipe not found
                </h2>
                <p class="text-text-secondary max-w-xs mx-auto mb-8">
                    We couldn't serve up the recipe you were looking for. It
                    might have been deleted or moved.
                </p>
                <a
                    href="/recipes"
                    class="px-6 py-3 bg-action-primary text-white font-bold rounded-xl shadow-lg shadow-action-primary/20 hover:scale-105 active:scale-95 transition-all"
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
