<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import CookingView from "$lib/components/CookingView.svelte";
    import Header from "$lib/components/Header.svelte";

    let recipeId = $derived($page.params.id);

    // Derived store to fetch the specific recipe
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
                `users/${$user.uid}/recipes/${recipeId}`,
            );
            return store.subscribe(set);
        },
        { data: null, loading: true } as DocumentState<Recipe>,
    );

    let recipe = $derived($recipeStore.data);
    let loading = $derived($recipeStore.loading);
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden select-none">
    <Header
        title="Cooking Mode"
        showBack={true}
        onBack={() => goto(`/recipes/${recipeId}`)}
    />
    {#if loading}
        <div class="flex items-center justify-center h-full">
            <div
                class="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin"
            ></div>
        </div>
    {:else if recipe}
        <CookingView {recipe} onDone={() => goto(`/recipes/${recipeId}`)} />
    {:else}
        <div
            class="flex-1 flex flex-col items-center justify-center text-center px-4"
        >
            <div
                class="w-24 h-24 bg-app-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
            >
                <span class="text-4xl">👨‍🍳</span>
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

<style>
    /* Ensure the absolute container used for transitions fills its parent */
    .stepper-transition-container {
        position: absolute;
        width: 100%;
    }
</style>
