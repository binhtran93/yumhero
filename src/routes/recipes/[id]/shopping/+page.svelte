<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import { ShoppingCart } from "lucide-svelte";
    import { fade } from "svelte/transition";

    let recipeId = $derived($page.params.id);

    // Derived store to fetch the specific recipe
    let recipeStore = derived(
        user,
        ($user, set) => {
            if (!$user) {
                set({ data: null, loading: false });
                return;
            }
            const store = documentStore<Recipe>(
                `users/${$user.uid}/recipes/${recipeId}`,
            );
            return store.subscribe(set);
        },
        { data: null, loading: true } as DocumentState<Recipe>,
    );

    let recipe = $derived($recipeStore.data);
    let loading = $derived($recipeStore.loading);

    // Track checked items
    let checkedItems = $state<boolean[]>([]);

    $effect(() => {
        if (recipe) {
            checkedItems = new Array(recipe.ingredients.length).fill(false);
        }
    });

    function toggleItem(index: number) {
        checkedItems[index] = !checkedItems[index];
    }

    let checkedCount = $derived(checkedItems.filter(Boolean).length);
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden">
    <!-- Header with Toolbar -->
    <div class="shrink-0 z-20 bg-app-bg border-b border-app-border">
        <Header
            title="Shopping List"
            showBack={true}
            backUrl="/recipes/{recipeId}"
        />
    </div>

    <!-- Main Content -->
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
                class="max-w-7xl mx-auto p-4 lg:p-8"
            >
                <!-- Recipe Info -->
                <div class="mb-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div
                            class="w-12 h-12 rounded-full bg-app-primary/10 flex items-center justify-center"
                        >
                            <ShoppingCart size={24} class="text-app-primary" />
                        </div>
                        <div>
                            <h1
                                class="text-2xl font-display font-bold text-app-text"
                            >
                                {recipe.title}
                            </h1>
                            <p class="text-sm text-app-text-muted">
                                Shopping list for {recipe.servings} servings
                            </p>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div
                        class="flex items-center gap-4 text-sm text-app-text-muted"
                    >
                        <span class="font-semibold">
                            {recipe.ingredients.length} items
                        </span>
                        <span class="w-px h-4 bg-app-border"></span>
                        <span>
                            {checkedCount} checked
                        </span>
                    </div>
                </div>

                <!-- Ingredients Grid -->
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                >
                    {#each recipe.ingredients as ingredient, i}
                        <button
                            onclick={() => toggleItem(i)}
                            class="bg-app-surface border border-app-border rounded-2xl p-4 text-left transition-all hover:shadow-md hover:border-app-primary/30 {checkedItems[
                                i
                            ]
                                ? 'opacity-50 bg-app-surface-hover'
                                : ''}"
                        >
                            <div class="flex items-start gap-3">
                                <!-- Checkbox -->
                                <div
                                    class="mt-0.5 w-5 h-5 rounded-md border-2 {checkedItems[
                                        i
                                    ]
                                        ? 'bg-app-primary border-app-primary'
                                        : 'border-app-border'} flex items-center justify-center shrink-0 transition-all"
                                >
                                    {#if checkedItems[i]}
                                        <svg
                                            class="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="3"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    {/if}
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <div
                                        class="text-base text-app-text {checkedItems[
                                            i
                                        ]
                                            ? 'line-through opacity-50'
                                            : ''}"
                                    >
                                        <span class="font-bold"
                                            >{ingredient.amount}
                                            {ingredient.unit}</span
                                        >
                                        <span class="ml-1"
                                            >{ingredient.name}</span
                                        >
                                    </div>
                                    {#if ingredient.notes}
                                        <div
                                            class="text-xs text-app-text-muted italic mt-1"
                                        >
                                            {ingredient.notes}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center h-full text-center px-4"
            >
                <div
                    class="w-24 h-24 bg-app-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
                >
                    <span class="text-4xl">🛒</span>
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
