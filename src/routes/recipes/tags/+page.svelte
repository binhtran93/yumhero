<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { userTags, addTag, updateTag, deleteTag } from "$lib/stores/tags";
    import {
        Plus,
        Pencil,
        Trash2,
        X,
        Check,
        Tag as TagIcon,
        Loader2,
    } from "lucide-svelte";
    import { toasts } from "$lib/stores/toasts";
    import { fade } from "svelte/transition";

    let newTagLabel = $state("");
    let editingId = $state<string | null>(null);
    let editLabel = $state("");
    let isLoading = $state(false);

    // Derived state for sorting tags
    let sortedTags = $derived(
        [...($userTags.data || [])].sort((a, b) =>
            a.label.localeCompare(b.label),
        ),
    );

    async function handleAddTag() {
        if (!newTagLabel.trim()) return;
        isLoading = true;
        try {
            await addTag(newTagLabel.trim());
            newTagLabel = "";
        } catch (error) {
            console.error(error);
            toasts.error("Failed to add tag");
        } finally {
            isLoading = false;
        }
    }

    function startEdit(tag: any) {
        editingId = tag.id;
        editLabel = tag.label;
    }

    function cancelEdit() {
        editingId = null;
        editLabel = "";
    }

    async function handleUpdateTag(id: string) {
        if (!editLabel.trim()) return;
        try {
            await updateTag(id, editLabel.trim());
            editingId = null;
            editLabel = "";
        } catch (error) {
            console.error(error);
            toasts.error("Failed to update tag");
        }
    }

    async function handleDeleteTag(id: string) {
        if (!confirm("Are you sure you want to delete this tag?")) return;
        try {
            await deleteTag(id);
        } catch (error) {
            console.error(error);
            toasts.error("Failed to delete tag");
        }
    }
</script>

<div class="h-full flex flex-col overflow-hidden">
    <Header title="Manage Tags" showBack={true} backUrl="/recipes" />

    <div class="flex-1 overflow-hidden bg-app-bg">
        <div class="max-w-3xl mx-auto p-4 md:p-6 h-full flex flex-col gap-6">
            <!-- Add Tag Section -->
            <div
                class="bg-app-surface p-4 rounded-xl border border-app-border shadow-sm"
            >
                <h2
                    class="text-sm font-semibold text-app-text-muted uppercase tracking-wider mb-3"
                >
                    Add New Tag
                </h2>
                <div class="flex gap-3">
                    <div class="relative flex-1">
                        <TagIcon
                            size={18}
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
                        />
                        <input
                            type="text"
                            bind:value={newTagLabel}
                            placeholder="Tag name (e.g., Breakfast, Spicy, Quick)..."
                            class="w-full pl-10 pr-4 py-3 bg-app-bg border border-app-border rounded-lg focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary/10 text-app-text transition-all"
                            onkeydown={(e) =>
                                e.key === "Enter" && handleAddTag()}
                        />
                    </div>
                    <button
                        onclick={handleAddTag}
                        disabled={!newTagLabel.trim() || isLoading}
                        class="bg-app-primary text-white px-4 py-2 rounded-lg hover:bg-app-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95 flex items-center gap-2 font-medium"
                        aria-label="Add Tag"
                    >
                        {#if isLoading}
                            <Loader2 size={20} class="animate-spin" />
                        {:else}
                            <Plus size={20} />
                        {/if}
                        <span class="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>

            <!-- Tags List -->
            <div
                class="flex-1 flex flex-col min-h-0 bg-app-surface rounded-xl border border-app-border shadow-sm overflow-hidden"
            >
                <div
                    class="p-4 border-b border-app-border flex justify-between items-center"
                >
                    <h2
                        class="text-sm font-semibold text-app-text-muted uppercase tracking-wider"
                    >
                        Your Tags
                    </h2>
                    <span
                        class="text-xs font-medium px-2 py-0.5 bg-app-bg rounded-md text-app-text-muted"
                    >
                        {sortedTags.length} tags
                    </span>
                </div>

                <div
                    class="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 custom-scrollbar pb-20"
                >
                    {#if $userTags.loading}
                        <div
                            class="h-64 flex flex-col items-center justify-center text-app-text-muted gap-3"
                        >
                            <Loader2
                                class="animate-spin text-app-primary"
                                size={32}
                            />
                            <p>Loading tags...</p>
                        </div>
                    {:else if sortedTags.length === 0}
                        <div
                            class="h-64 flex flex-col items-center justify-center text-app-text-muted gap-3"
                        >
                            <div
                                class="w-16 h-16 rounded-full bg-app-bg flex items-center justify-center"
                            >
                                <TagIcon size={32} class="opacity-20" />
                            </div>
                            <p>No tags yet. Add one above to get started!</p>
                        </div>
                    {:else}
                        {#each sortedTags as tag (tag.id)}
                            <div
                                class="group flex items-center justify-between p-3 bg-app-bg/50 border border-transparent hover:border-app-border hover:bg-app-bg rounded-lg transition-all"
                                transition:fade={{ duration: 150 }}
                            >
                                {#if editingId === tag.id}
                                    <div
                                        class="flex items-center gap-3 w-full animate-in fade-in duration-200"
                                    >
                                        <input
                                            type="text"
                                            bind:value={editLabel}
                                            class="flex-1 bg-app-surface border border-app-primary rounded px-3 py-2 text-app-text focus:outline-none focus:ring-1 focus:ring-app-primary/20"
                                            autofocus
                                            onkeydown={(e) => {
                                                if (e.key === "Enter")
                                                    handleUpdateTag(tag.id);
                                                if (e.key === "Escape")
                                                    cancelEdit();
                                            }}
                                        />
                                        <div
                                            class="flex items-center gap-1 shrink-0"
                                        >
                                            <button
                                                onclick={() =>
                                                    handleUpdateTag(tag.id)}
                                                class="p-2 text-green-600 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Save"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onclick={cancelEdit}
                                                class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <div
                                        class="flex items-center gap-4 overflow-hidden"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-lg bg-app-primary/10 flex items-center justify-center shrink-0 text-app-primary group-hover:bg-app-primary group-hover:text-white transition-colors"
                                        >
                                            <TagIcon size={18} />
                                        </div>
                                        <span
                                            class="text-app-text font-medium truncate text-lg"
                                            >{tag.label}</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100"
                                    >
                                        <button
                                            onclick={() => startEdit(tag)}
                                            class="p-2 text-app-text-muted hover:text-app-primary hover:bg-app-surface-hover rounded-lg transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onclick={() =>
                                                handleDeleteTag(tag.id)}
                                            class="p-2 text-app-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
