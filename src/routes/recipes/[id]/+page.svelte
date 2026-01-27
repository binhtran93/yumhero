<script lang="ts">
    import { type PageData } from "./$types";
    import { documentStore, type DocumentState } from "$lib/stores/firestore";
    import { user } from "$lib/stores/auth";
    import type { Recipe } from "$lib/types";
    import { derived } from "svelte/store";
    import Header from "$lib/components/Header.svelte";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";
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
        Check,
        EllipsisVertical,
        Trash2,
    } from "lucide-svelte";
    import { fade, fly, slide, scale } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { deleteDoc, doc } from "firebase/firestore";
    import { db } from "$lib/firebase";

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

    let isMenuOpen = $state(false);
    let isDeleteModalOpen = $state(false);
    let isDeleting = $state(false);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }

    // Handle clicking outside of menu
    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (node && !node.contains(event.target as Node) && isMenuOpen) {
                closeMenu();
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }

    async function handleDelete() {
        if (!$user) return;
        isDeleting = true;
        try {
            await deleteDoc(doc(db, `users/${$user.uid}/recipes/${data.id}`));
            await goto("/recipes");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            isDeleting = false;
        }
    }
</script>

<div class="h-full flex flex-col bg-bg-default overflow-hidden">
    <!-- Header (Visible on all screens) -->
    <div class="shrink-0 z-20 bg-bg-default border-b border-border-default">
        <Header title="Recipe Details" showBack={true} backUrl="/recipes">
            <div class="relative" use:clickOutside>
                <button
                    onclick={toggleMenu}
                    class="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-default rounded-full transition-colors"
                >
                    <EllipsisVertical size={24} />
                </button>

                {#if isMenuOpen}
                    <div
                        transition:fade={{ duration: 100 }}
                        class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border-default py-1 z-50 overflow-hidden"
                    >
                        <button
                            class="w-full text-left px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-surface-hover flex items-center gap-3 transition-colors"
                            onclick={() => {
                                closeMenu();
                                // TODO: Implement share
                            }}
                        >
                            <Share2 size={16} />
                            Share Recipe
                        </button>
                        <button
                            class="w-full text-left px-4 py-3 text-sm font-medium text-text-primary hover:bg-bg-surface-hover flex items-center gap-3 transition-colors"
                            onclick={() => {
                                closeMenu();
                                // TODO: Implement edit
                            }}
                        >
                            <Pencil size={16} />
                            Edit Recipe
                        </button>
                        <button
                            class="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            onclick={() => {
                                closeMenu();
                                isDeleteModalOpen = true;
                            }}
                        >
                            <Trash2 size={16} />
                            Delete Recipe
                        </button>
                    </div>
                {/if}
            </div>
        </Header>
    </div>

    <!-- Delete Confirmation Modal -->
    <!-- Delete Confirmation Modal -->
    {#if isDeleteModalOpen}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            transition:fade={{ duration: 200 }}
        >
            <div
                class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-border-default"
                in:scale={{ start: 0.95, duration: 200 }}
                out:scale={{ start: 0.95, duration: 150 }}
            >
                <div class="p-6">
                    <h3 class="text-xl font-bold text-text-primary mb-2">
                        Delete Recipe
                    </h3>
                    <p class="text-text-secondary">
                        Are you sure you want to delete this recipe? This action
                        cannot be undone.
                    </p>
                </div>
                <div class="bg-bg-surface px-6 py-4 flex justify-end gap-3">
                    <button
                        class="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-surface-hover transition-colors"
                        onclick={() => (isDeleteModalOpen = false)}
                    >
                        Cancel
                    </button>
                    <button
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        onclick={handleDelete}
                        disabled={isDeleting}
                    >
                        {#if isDeleting}
                            Deleting...
                        {:else}
                            Delete
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main Content Scrollable Area -->
    <div class="flex-1 overflow-y-auto w-full">
        {#if loading}
            <div class="flex items-center justify-center h-full min-h-[50vh]">
                <div
                    class="w-10 h-10 border-4 border-action-primary border-t-transparent rounded-full animate-spin"
                ></div>
            </div>
        {:else if recipe}
            <div
                in:fade={{ duration: 300 }}
                class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
            >
                <!-- COMPACT HEADER SECTION -->
                <div class="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
                    <!-- Image (Compact & Rounded) -->
                    <div class="w-full md:w-[320px] shrink-0">
                        <div
                            class="h-48 md:h-auto aspect-video md:aspect-[4/3] relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-border-default/50 group"
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
                                class="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary"
                            >
                                {#each recipe.tags as tag}
                                    <span
                                        class="px-2 py-1 rounded-md bg-bg-surface border border-border-default"
                                    >
                                        {tag}
                                    </span>
                                {/each}
                            </div>
                        {/if}

                        <h1
                            class="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-text-primary leading-tight"
                        >
                            {recipe.title}
                        </h1>

                        <!-- Quick Stats -->
                        <div
                            class="flex items-center gap-6 text-text-secondary text-sm md:text-base font-medium py-2 border-y border-border-default/50 w-fit"
                        >
                            <div class="flex items-center gap-2">
                                <Clock size={18} class="text-action-primary" />
                                <span>{recipe.totalTime} mins</span>
                            </div>
                            <div class="w-px h-4 bg-border-default"></div>
                            <div class="flex items-center gap-2">
                                <Users size={18} class="text-accent-dinner" />
                                <span>{recipe.servings} servings</span>
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
                                class="text-text-secondary text-base leading-relaxed line-clamp-3 md:line-clamp-4 hover:line-clamp-none transition-all cursor-pointer"
                            >
                                {recipe.description}
                            </p>
                        {/if}

                        {#if recipe.sourceUrl}
                            <a
                                href={recipe.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1.5 text-sm font-bold text-action-primary hover:underline w-fit"
                            >
                                <ExternalLink size={14} /> Source Recipe
                            </a>
                        {/if}
                    </div>
                </div>

                <!-- CONTENT GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <!-- LEFT: Ingredients (4 cols) - Sticky -->
                    <div class="lg:col-span-4">
                        <div
                            class="bg-bg-surface rounded-3xl p-6 shadow-sm border border-border-default lg:sticky lg:top-4"
                        >
                            <div
                                class="flex items-center justify-between mb-6 pb-4 border-b border-border-default/50"
                            >
                                <h2
                                    class="font-display text-xl font-bold text-text-primary flex items-center gap-2"
                                >
                                    <Utensils
                                        size={20}
                                        class="text-accent-lunch"
                                    />
                                    Ingredients
                                </h2>
                                <span
                                    class="text-xs font-semibold text-text-secondary bg-bg-default px-2 py-1 rounded-full border border-border-default"
                                >
                                    {recipe.ingredients.length}
                                </span>
                            </div>

                            <div class="space-y-3">
                                {#each recipe.ingredients as ingredient}
                                    <label
                                        class="flex items-start gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-bg-surface-hover transition-colors"
                                    >
                                        <div
                                            class="relative flex items-center pt-1"
                                        >
                                            <input
                                                type="checkbox"
                                                class="peer appearance-none w-5 h-5 border-2 border-border-strong rounded transition-colors checked:bg-action-primary checked:border-action-primary"
                                            />
                                            <Check
                                                size={14}
                                                class="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-[6px] left-[3px] transition-opacity"
                                                strokeWidth={3}
                                            />
                                        </div>
                                        <div
                                            class="text-[15px] text-text-primary leading-snug flex-1 peer-checked:line-through peer-checked:text-text-secondary/60"
                                        >
                                            <span class="font-bold"
                                                >{ingredient.amount}
                                                {ingredient.unit}</span
                                            >
                                            <span>{ingredient.name}</span>
                                            {#if ingredient.notes}
                                                <span
                                                    class="block text-xs text-text-secondary italic mt-0.5"
                                                    >{ingredient.notes}</span
                                                >
                                            {/if}
                                        </div>
                                    </label>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: Instructions (8 cols) -->
                    <div class="lg:col-span-8 space-y-8">
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
                                class="font-display text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"
                            >
                                <ChefHat
                                    size={24}
                                    class="text-action-primary"
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
                                                class="absolute left-[15.5px] md:left-[19.5px] top-10 bottom-[-8px] w-px bg-border-default group-hover:bg-action-primary/30 transition-colors"
                                            ></div>
                                        {/if}

                                        <!-- Timeline Node -->
                                        <div
                                            class="absolute left-0 md:left-[4px] top-2 w-8 h-8 rounded-full bg-bg-surface border border-border-default text-sm font-bold flex items-center justify-center text-text-secondary group-hover:border-action-primary group-hover:text-action-primary group-hover:bg-action-primary/5 transition-all z-10"
                                        >
                                            {i + 1}
                                        </div>

                                        <!-- Content -->
                                        <div class="pb-8">
                                            <p
                                                class="text-lg text-text-primary leading-relaxed pt-0.5 group-hover:text-text-primary/80 transition-colors"
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
                            <div class="w-16 h-px bg-border-strong mb-4"></div>
                            <span
                                class="font-display font-medium text-lg italic"
                                >Bon Appétit!</span
                            >
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
                    class="w-24 h-24 bg-bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm"
                >
                    <span class="text-4xl">🍳</span>
                </div>
                <h2
                    class="text-2xl font-display font-bold text-text-primary mb-2"
                >
                    Recipe not found
                </h2>
                <a
                    href="/recipes"
                    class="px-6 py-3 bg-action-primary text-white font-bold rounded-xl shadow-lg mt-6"
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
