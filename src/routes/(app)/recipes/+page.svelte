<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import RecipeCard from "$lib/components/RecipeCard.svelte";
    import RecipeEditModal from "$lib/components/RecipeEditModal.svelte";

    import SEO from "$lib/components/SEO.svelte";
    import {
        Search,
        Plus,
        Loader2,
        ChevronDown,
        Link,
        FileText,
        EllipsisVertical,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import { userRecipes } from "$lib/stores/recipes";

    import RecipeMenu from "$lib/components/RecipeMenu.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { deleteDoc, doc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { user } from "$lib/stores/auth";
    import { toasts } from "$lib/stores/toasts";

    let searchQuery = $state("");

    let showAddModal = $state(false);
    let showAddDropdown = $state(false);
    let showMenuDropdown = $state(false);
    let creationAction = $state<"import" | "paste" | null>(null);

    // Filter & Menu State
    let activeTriggerRect = $state<DOMRect | null>(null);
    let selectedRecipeId = $state<string | null>(null);

    // Delete State
    let showDeleteConfirm = $state(false);
    let isDeleting = $state(false);

    // Edit State
    let editingRecipe = $state<any | null>(null);

    // Reactive filtering
    function normalizeText(text: string) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase();
    }

    let filteredRecipes = $derived(
        ($userRecipes.data || []).filter((recipe) => {
            const query = normalizeText(searchQuery);
            return (
                normalizeText(recipe.title).includes(query) ||
                (recipe.tags &&
                    recipe.tags.some((tag: string) =>
                        normalizeText(tag).includes(query),
                    ))
            );
        }),
    );

    function handleShowOptions(e: MouseEvent, recipeId: string) {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        activeTriggerRect = rect;
        selectedRecipeId = recipeId;
    }

    function handleCloseOptions() {
        activeTriggerRect = null;
        selectedRecipeId = null;
    }

    function handleEditRecipe() {
        if (!selectedRecipeId) return;
        const recipe = $userRecipes.data.find((r) => r.id === selectedRecipeId);
        if (recipe) {
            editingRecipe = recipe;
            showAddModal = true;
        }
        handleCloseOptions();
    }

    function handleDeleteClick() {
        showDeleteConfirm = true;
        handleCloseOptions(); // Close menu but keep ID for deletion
    }

    async function confirmDelete() {
        if (!$user || !selectedRecipeId) return;
        isDeleting = true;
        try {
            await deleteDoc(
                doc(db, `users/${$user.uid}/recipes/${selectedRecipeId}`),
            );
            toasts.success("Recipe deleted");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toasts.error("Failed to delete recipe");
        } finally {
            isDeleting = false;
            showDeleteConfirm = false;
            selectedRecipeId = null;
        }
    }
</script>

<SEO
    title="Recipes"
    description="Browse your saved recipes. Search, filter, and add recipes to your meal plan."
/>

<!-- Header -->
<Header title="Recipes">
    <div class="relative z-30">
        <button
            onclick={() => (showMenuDropdown = !showMenuDropdown)}
            class="p-2 text-app-text-muted hover:text-app-text hover:bg-app-bg rounded-full transition-colors"
            aria-label="More options"
        >
            <EllipsisVertical size={24} />
        </button>

        {#if showMenuDropdown}
            <div
                transition:fade={{ duration: 100 }}
                class="absolute right-0 top-full mt-2 w-48 bg-app-surface rounded-xl border border-app-border shadow-lg overflow-hidden z-50 py-1"
            >
                <a
                    href="/recipes/tags"
                    class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
                >
                    <FileText size={16} />
                    Manage Tags
                </a>
            </div>

            <!-- Backdrop to close dropdown -->
            <div
                class="fixed inset-0 z-40"
                onclick={() => (showMenuDropdown = false)}
                aria-hidden="true"
            ></div>
        {/if}
    </div>
</Header>

<RecipeEditModal
    isOpen={showAddModal}
    onClose={() => {
        showAddModal = false;
        editingRecipe = null;
    }}
    initialAction={creationAction}
    initialRecipe={editingRecipe}
/>

<div class="h-full flex flex-col overflow-hidden relative">
    <div class="bg-app-surface border-b border-app-border px-4 py-4 md:px-6">
        <div
            class="max-w-7xl mx-auto flex flex-row gap-3 justify-between items-center w-full"
        >
            <!-- Search -->
            <div class="relative flex-1 min-w-0">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
                    size={16}
                />
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search..."
                    class="w-full pl-9 pr-3 py-3 text-sm bg-app-bg border border-app-border rounded-lg focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary/10 text-app-text placeholder:text-app-text-muted/50 transition-all"
                />
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <!-- Add Button & Dropdown -->
                <div class="relative z-10">
                    <div
                        class="flex items-center bg-app-primary rounded-lg shadow-sm hover:bg-app-primary/90 transition-all active:scale-95 shrink-0 text-white group"
                    >
                        <!-- Main Action: Add Manually -->
                        <button
                            onclick={() => {
                                showAddModal = true;
                                creationAction = null;
                                showAddDropdown = false;
                            }}
                            class="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-black/20 hover:bg-black/10 transition-colors rounded-l-lg font-bold"
                            aria-label="Add Recipe Manually"
                        >
                            <Plus size={20} />
                            <span
                                class="hidden md:inline font-bold whitespace-nowrap"
                                >Add Recipe</span
                            >
                        </button>

                        <!-- Dropdown Trigger -->
                        <button
                            onclick={() => (showAddDropdown = !showAddDropdown)}
                            class="px-3 flex items-center self-stretch hover:bg-black/10 transition-colors rounded-r-lg"
                            aria-label="More Options"
                        >
                            <ChevronDown size={16} class="opacity-70" />
                        </button>
                    </div>

                    {#if showAddDropdown}
                        <div
                            transition:fade={{ duration: 100 }}
                            class="absolute right-0 top-full mt-2 w-48 bg-app-surface rounded-xl border border-app-border shadow-lg overflow-hidden z-50 py-1"
                        >
                            <button
                                onclick={() => {
                                    showAddDropdown = false;
                                    creationAction = "import";
                                    showAddModal = true;
                                }}
                                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
                            >
                                <Link size={16} />
                                Import from URL
                            </button>
                            <button
                                onclick={() => {
                                    showAddDropdown = false;
                                    creationAction = "paste";
                                    showAddModal = true;
                                }}
                                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
                            >
                                <FileText size={16} />
                                Paste Recipe Text
                            </button>
                            <button
                                onclick={() => {
                                    showAddDropdown = false;
                                    creationAction = null;
                                    showAddModal = true;
                                }}
                                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} />
                                Add Manually
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
        </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-24">
        {#if $userRecipes.loading}
            <div class="flex items-center justify-center h-64">
                <Loader2 class="w-8 h-8 text-app-primary animate-spin" />
            </div>
        {:else if filteredRecipes.length > 0}
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto"
            >
                {#each filteredRecipes as recipe (recipe.id)}
                    <div in:fade={{ duration: 300 }} class="h-full">
                        <RecipeCard
                            id={recipe.id}
                            title={recipe.title}
                            image={recipe.image}
                            totalTime={recipe.totalTime}
                            servings={recipe.servings || 1}
                            tags={recipe.tags}
                            onShowOptions={(e) =>
                                handleShowOptions(e, recipe.id)}
                        />
                    </div>
                {/each}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center h-64 text-center"
            >
                <div
                    class="p-4 bg-app-surface rounded-full mb-4 text-app-text-muted/50"
                >
                    <Search size={32} />
                </div>
                <p class="text-lg font-bold text-app-text">No recipes found</p>
                <p class="text-app-text-muted">Try adjusting your search.</p>
                <button
                    onclick={() => {
                        searchQuery = "";
                    }}
                    class="mt-4 text-app-primary font-bold hover:underline"
                >
                    Clear All
                </button>
            </div>
        {/if}
    </div>
</div>

{#if activeTriggerRect && selectedRecipeId}
    <RecipeMenu
        triggerRect={activeTriggerRect}
        onClose={handleCloseOptions}
        onEdit={handleEditRecipe}
        onDelete={handleDeleteClick}
        onShare={() => {
            // TODO: Share logic
            toasts.success("Share functionality coming soon!");
            handleCloseOptions();
        }}
    />
{/if}

<ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Recipe"
    message="Are you sure you want to delete this recipe? This cannot be undone."
    confirmText="Delete"
    isDestructive={true}
    onConfirm={confirmDelete}
    onClose={() => {
        showDeleteConfirm = false;
        selectedRecipeId = null;
    }}
    isLoading={isDeleting}
/>
