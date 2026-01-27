<script lang="ts">
    import { type PageData } from "./$types";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import { ChevronLeft, Clock, Users, Flame, Tag } from "lucide-svelte";
    import { fade } from "svelte/transition";

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

<Header title="Recipe Details" showBack={true} backUrl="/recipes" />

<div class="h-full overflow-y-auto pb-24 bg-bg-default">
    {#if loading}
        <div class="flex items-center justify-center h-64">
            <div
                class="w-8 h-8 border-4 border-action-primary border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if recipe}
        <div in:fade={{ duration: 300 }}>
            <!-- Hero Image -->
            <div class="w-full h-64 md:h-80 relative bg-gray-100">
                {#if recipe.image}
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        class="w-full h-full object-cover"
                    />
                {:else}
                    <div
                        class="w-full h-full flex items-center justify-center bg-bg-surface-hover text-text-secondary"
                    >
                        <span class="text-4xl">🍳</span>
                    </div>
                {/if}
                <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                ></div>
                <div class="absolute bottom-4 left-4 right-4 text-white">
                    <h1 class="text-2xl md:text-3xl font-bold mb-2 shadow-sm">
                        {recipe.title}
                    </h1>
                    <div class="flex flex-wrap gap-2">
                        {#if recipe.tags}
                            {#each recipe.tags as tag}
                                <span
                                    class="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30"
                                >
                                    {tag}
                                </span>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <div class="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-8">
                <!-- Meta Info -->
                <div
                    class="flex justify-between items-center bg-bg-surface p-4 rounded-xl shadow-sm border border-border-default"
                >
                    <div class="flex flex-col items-center">
                        <Clock size={20} class="text-action-primary mb-1" />
                        <span class="text-xs text-text-secondary font-medium"
                            >Total Time</span
                        >
                        <span class="font-bold text-text-primary"
                            >{recipe.totalTime} min</span
                        >
                    </div>
                    <div class="w-px h-8 bg-border-default"></div>
                    <div class="flex flex-col items-center">
                        <Users size={20} class="text-accent-dinner mb-1" />
                        <span class="text-xs text-text-secondary font-medium"
                            >Servings</span
                        >
                        <span class="font-bold text-text-primary"
                            >{recipe.servings} ppl</span
                        >
                    </div>
                    <div class="w-px h-8 bg-border-default"></div>
                    <!-- Placeholder for Calories if available, or just prep time -->
                    <div class="flex flex-col items-center">
                        <div
                            class="flex items-center gap-1 text-accent-lunch mb-1"
                        >
                            <span class="text-sm font-bold">Prep</span>
                        </div>
                        <span class="text-xs text-text-secondary font-medium"
                            >Time</span
                        >
                        <span class="font-bold text-text-primary"
                            >{recipe.prepTime} min</span
                        >
                    </div>
                </div>

                <!-- Description -->
                {#if recipe.description}
                    <div
                        class="bg-bg-surface p-5 rounded-xl border border-border-default/50"
                    >
                        <p class="text-text-secondary leading-relaxed italic">
                            "{recipe.description}"
                        </p>
                    </div>
                {/if}

                <div class="grid md:grid-cols-2 gap-8">
                    <!-- Ingredients -->
                    <div class="space-y-4">
                        <h2
                            class="text-xl font-bold text-text-primary flex items-center gap-2"
                        >
                            <span>🥕</span> Ingredients
                        </h2>
                        <div
                            class="bg-bg-surface rounded-xl border border-border-default overflow-hidden"
                        >
                            <div class="divide-y divide-border-default">
                                {#each recipe.ingredients as ingredient, i}
                                    <label
                                        class="flex items-start gap-3 p-3 hover:bg-bg-surface-hover transition-colors cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            class="mt-1 w-4 h-4 rounded border-gray-300 text-action-primary focus:ring-action-primary/20"
                                        />
                                        <div class="flex-1 text-sm">
                                            <span
                                                class="font-bold text-text-primary group-hover:text-action-primary transition-colors"
                                                >{ingredient.amount}
                                                {ingredient.unit}</span
                                            >
                                            <span class="text-text-primary">
                                                {ingredient.name}</span
                                            >
                                            {#if ingredient.notes}
                                                <span
                                                    class="text-text-secondary text-xs block mt-0.5"
                                                    >({ingredient.notes})</span
                                                >
                                            {/if}
                                        </div>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- Instructions -->
                    <div class="space-y-4">
                        <h2
                            class="text-xl font-bold text-text-primary flex items-center gap-2"
                        >
                            <span>📝</span> Instructions
                        </h2>
                        <div class="space-y-4">
                            {#each recipe.instructions as step, i}
                                <div class="flex gap-4">
                                    <div
                                        class="flex-shrink-0 w-8 h-8 rounded-full bg-action-primary/10 text-action-primary flex items-center justify-center font-bold text-sm border border-action-primary/20"
                                    >
                                        {i + 1}
                                    </div>
                                    <div class="flex-1 pt-1">
                                        <p
                                            class="text-text-primary leading-relaxed text-sm md:text-base"
                                        >
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Source Link if available -->
                {#if recipe.sourceUrl}
                    <div
                        class="pt-6 border-t border-border-default text-center"
                    >
                        <a
                            href={recipe.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-xs text-text-secondary hover:text-action-primary hover:underline transition-colors"
                        >
                            View original source
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div
            class="flex flex-col items-center justify-center h-64 text-center px-4"
        >
            <span class="text-4xl mb-4">😕</span>
            <p class="text-lg font-bold text-text-primary">Recipe not found</p>
            <a
                href="/recipes"
                class="mt-4 text-action-primary font-bold hover:underline"
            >
                Go back to recipes
            </a>
        </div>
    {/if}
</div>
