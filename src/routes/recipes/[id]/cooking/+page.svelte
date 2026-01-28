<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import { ChefHat, Check } from "lucide-svelte";
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

    // Track completed steps
    let completedSteps = $state<boolean[]>([]);

    $effect(() => {
        if (recipe) {
            completedSteps = new Array(recipe.instructions.length).fill(false);
        }
    });

    function toggleStep(index: number) {
        completedSteps[index] = !completedSteps[index];
    }

    let completedCount = $derived(completedSteps.filter(Boolean).length);
</script>

<div class="h-full flex flex-col bg-app-bg overflow-hidden">
    <!-- Header with Toolbar -->
    <div class="shrink-0 z-20 bg-app-bg border-b border-app-border">
        <Header
            title="Cooking Mode"
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
                            <ChefHat size={24} class="text-app-primary" />
                        </div>
                        <div>
                            <h1
                                class="text-2xl font-display font-bold text-app-text"
                            >
                                {recipe.title}
                            </h1>
                            <p class="text-sm text-app-text-muted">
                                Step-by-step cooking instructions
                            </p>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <span
                                class="text-sm font-semibold text-app-text-muted"
                            >
                                Progress
                            </span>
                            <span class="text-sm font-semibold text-app-text">
                                {completedCount} / {recipe.instructions.length}
                            </span>
                        </div>
                        <div
                            class="w-full h-2 bg-app-surface-hover rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-app-primary transition-all duration-300"
                                style="width: {(completedCount /
                                    recipe.instructions.length) *
                                    100}%"
                            ></div>
                        </div>
                    </div>
                </div>

                <!-- Chef's Note -->
                {#if recipe.prepNotes}
                    <div
                        class="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 text-amber-900 mb-6"
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

                <!-- Instructions Grid -->
                <div
                    class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5"
                >
                    {#each recipe.instructions as step, i}
                        <button
                            onclick={() => toggleStep(i)}
                            class="bg-app-surface border-2 rounded-2xl p-5 md:p-6 text-left transition-all hover:shadow-lg {completedSteps[
                                i
                            ]
                                ? 'border-app-primary/50 bg-app-primary/5'
                                : 'border-app-border hover:border-app-primary/30'}"
                        >
                            <div class="flex items-start gap-4">
                                <!-- Step Number / Checkbox -->
                                <div class="shrink-0">
                                    {#if completedSteps[i]}
                                        <div
                                            class="w-10 h-10 rounded-full bg-app-primary flex items-center justify-center"
                                        >
                                            <Check
                                                size={20}
                                                class="text-white"
                                            />
                                        </div>
                                    {:else}
                                        <div
                                            class="w-10 h-10 rounded-full border-2 border-app-border bg-app-surface-hover flex items-center justify-center text-lg font-bold text-app-text-muted"
                                        >
                                            {i + 1}
                                        </div>
                                    {/if}
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0 pt-1">
                                    <p
                                        class="text-base md:text-lg text-app-text leading-relaxed {completedSteps[
                                            i
                                        ]
                                            ? 'line-through opacity-60'
                                            : ''}"
                                    >
                                        {step}
                                    </p>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>

                <!-- Completion Message -->
                {#if completedCount === recipe.instructions.length}
                    <div
                        class="mt-8 py-10 flex flex-col items-center justify-center text-center"
                    >
                        <div
                            class="w-20 h-20 rounded-full bg-app-primary/10 flex items-center justify-center mb-4"
                        >
                            <Check size={40} class="text-app-primary" />
                        </div>
                        <h3
                            class="text-2xl font-display font-bold text-app-text mb-2"
                        >
                            All Done!
                        </h3>
                        <p class="text-app-text-muted text-lg italic">
                            Bon Appétit!
                        </p>
                    </div>
                {/if}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center h-full text-center px-4"
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
</div>
