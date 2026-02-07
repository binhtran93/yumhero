<script lang="ts">
    import { EllipsisVertical, Pencil, Share2, Trash2 } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import { deleteDoc, doc } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { user } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    interface Props {
        recipeId: string;
        class?: string;
    }

    let { recipeId, class: className }: Props = $props();

    let isMenuOpen = $state(false);
    let isDeleteModalOpen = $state(false);
    let isDeleting = $state(false);

    function toggleMenu(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
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

    async function handleDelete(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!$user) return;
        isDeleting = true;

        try {
            await deleteDoc(doc(db, `users/${$user.uid}/recipes/${recipeId}`));

            // Check if we are on the detail page for this recipe
            if (
                $page.route.id === "/(app)/recipes/[id]" &&
                $page.params.id === recipeId
            ) {
                await goto("/recipes");
            }

            isDeleteModalOpen = false;
        } catch (error) {
            console.error("Error deleting recipe:", error);
        } finally {
            isDeleting = false;
        }
    }
</script>

<div class="relative {className}" use:clickOutside>
    <button
        onclick={toggleMenu}
        class="p-2 -mr-2 text-app-text-muted hover:text-app-text hover:bg-app-bg rounded-full transition-colors"
    >
        <EllipsisVertical size={20} />
    </button>

    {#if isMenuOpen}
        <div
            transition:fade={{ duration: 100 }}
            class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-app-border py-1 z-50 overflow-hidden"
        >
            <button
                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    // TODO: Implement share
                }}
            >
                <Share2 size={16} />
                Share Recipe
            </button>
            <button
                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                    // TODO: Implement edit
                }}
            >
                <Pencil size={16} />
                Edit Recipe
            </button>
            <button
                class="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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

<!-- Delete Confirmation Modal -->
{#if isDeleteModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-default"
        onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        transition:fade={{ duration: 200 }}
    >
        <div
            class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-app-border"
            in:scale={{ start: 0.95, duration: 200 }}
            out:scale={{ start: 0.95, duration: 150 }}
        >
            <div class="p-6">
                <h3 class="text-xl font-bold text-app-text mb-2">
                    Delete Recipe
                </h3>
                <p class="text-app-text-muted">
                    Are you sure you want to delete this recipe? This action
                    cannot be undone.
                </p>
            </div>
            <div class="bg-app-surface px-6 py-4 flex justify-end gap-3">
                <button
                    class="px-4 py-2 rounded-lg text-sm font-medium text-app-text-muted hover:bg-app-surface-hover transition-colors"
                    onclick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isDeleteModalOpen = false;
                    }}
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
