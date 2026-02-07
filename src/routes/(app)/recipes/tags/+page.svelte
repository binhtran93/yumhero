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
        Search,
    } from "lucide-svelte";
    import { toasts } from "$lib/stores/toasts";
    import { fade } from "svelte/transition";
    import Modal from "$lib/components/Modal.svelte";

    let newTagLabel = $state("");
    let editingId = $state<string | null>(null);
    let editLabel = $state("");
    let isLoading = $state(false);
    let isAddModalOpen = $state(false);
    let searchQuery = $state("");

    // Derived state for sorting and filtering tags
    let filteredTags = $derived(
        ($userTags.data || [])
            .filter((tag) =>
                tag.label.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .sort((a, b) => a.label.localeCompare(b.label)),
    );

    async function handleAddTag() {
        if (!newTagLabel.trim()) return;
        isLoading = true;
        try {
            await addTag(newTagLabel.trim());
            newTagLabel = "";
            return true;
        } catch (error) {
            console.error(error);
            toasts.error("Failed to add tag");
            return false;
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

    <div
        class="bg-app-bg border-b border-app-border shrink-0 transition-all px-4 md:px-6"
    >
        <div class="max-w-2xl mx-auto py-4 flex gap-2">
            <!-- Search Bar -->
            <div class="relative flex-1">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
                    size={18}
                />
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search tags..."
                    class="w-full bg-app-surface border border-app-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all font-medium placeholder:text-app-text-muted/60"
                />
                {#if searchQuery}
                    <button
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text transition-colors"
                        onclick={() => (searchQuery = "")}
                        aria-label="Clear search"
                    >
                        <X size={16} />
                    </button>
                {/if}
            </div>

            <button
                class="bg-app-primary text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md shadow-app-primary/20 hover:bg-app-primary-hover transition-all active:scale-95 shrink-0"
                onclick={() => (isAddModalOpen = true)}
            >
                <Plus size={18} />
                <span class="hidden sm:inline">Add</span>
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto bg-app-bg p-4">
        <div class="max-w-2xl mx-auto space-y-6">
            <!-- Tags List -->
            <div>
                <div class="space-y-2 pb-24">
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
                    {:else if filteredTags.length === 0}
                        <div
                            class="h-64 flex flex-col items-center justify-center text-app-text-muted gap-3 text-center"
                        >
                            <div
                                class="w-16 h-16 rounded-full bg-app-surface flex items-center justify-center border border-app-border"
                            >
                                <TagIcon size={32} class="opacity-20" />
                            </div>
                            <p>
                                {searchQuery
                                    ? "No matches found"
                                    : "No tags yet. Add one to get started!"}
                            </p>
                        </div>
                    {:else}
                        {#each filteredTags as tag (tag.id)}
                            <div
                                class="group flex items-center justify-between p-3 bg-app-surface rounded-xl border border-app-border hover:bg-app-surface-hover transition-all"
                                transition:fade={{ duration: 150 }}
                            >
                                {#if editingId === tag.id}
                                    <div
                                        class="flex items-center gap-3 w-full animate-in fade-in duration-200"
                                    >
                                        <input
                                            type="text"
                                            bind:value={editLabel}
                                            class="flex-1 bg-app-bg border border-app-primary rounded-lg px-3 py-2 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary/20"
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
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onclick={cancelEdit}
                                                class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <div
                                        class="flex items-center gap-3 overflow-hidden"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-lg bg-app-primary/10 flex items-center justify-center shrink-0 text-app-primary group-hover:bg-app-primary group-hover:text-white transition-colors border border-app-border"
                                        >
                                            <TagIcon size={16} />
                                        </div>
                                        <span
                                            class="text-app-text font-medium truncate text-sm"
                                        >
                                            {tag.label}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <button
                                            onclick={() => startEdit(tag)}
                                            class="p-2 text-app-text-muted hover:text-app-primary hover:bg-app-surface-deep rounded-lg transition-colors"
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

    <!-- FAB for mobile -->
    <button
        onclick={() => (isAddModalOpen = true)}
        class="fixed bottom-20 right-6 w-16 h-16 bg-app-primary text-white rounded-2xl shadow-xl shadow-app-primary/20 flex items-center justify-center sm:hidden active:scale-90 hover:scale-105 transition-all z-40"
        aria-label="Add Tag"
    >
        <Plus size={32} strokeWidth={2.5} />
    </button>

    <!-- Adaptive Modal -->
    <Modal
        isOpen={isAddModalOpen}
        onClose={() => (isAddModalOpen = false)}
        title="Add New Tag"
        adaptive={true}
    >
        <div class="p-6 pb-12 space-y-6">
            <div class="relative group">
                <TagIcon
                    size={20}
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-app-primary transition-colors"
                />
                <input
                    type="text"
                    bind:value={newTagLabel}
                    placeholder="Tag name (e.g., Breakfast, Spicy)..."
                    class="w-full pl-12 pr-4 py-4 bg-app-bg border border-app-border rounded-2xl focus:outline-none focus:border-app-primary focus:ring-4 focus:ring-app-primary/5 text-app-text text-lg transition-all"
                    onkeydown={async (e) => {
                        if (e.key === "Enter" && newTagLabel.trim()) {
                            const success = await handleAddTag();
                            if (success) isAddModalOpen = false;
                        }
                    }}
                    autofocus
                />
            </div>
            <button
                onclick={async () => {
                    const success = await handleAddTag();
                    if (success) isAddModalOpen = false;
                }}
                disabled={!newTagLabel.trim() || isLoading}
                class="w-full bg-app-primary text-white py-4 rounded-2xl hover:bg-app-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-app-primary/20 active:scale-95 flex items-center justify-center gap-2 font-bold text-lg"
            >
                {#if isLoading}
                    <Loader2 size={24} class="animate-spin" />
                {:else}
                    <Plus size={24} strokeWidth={2.5} />
                {/if}
                Add Tag
            </button>
        </div>
    </Modal>
</div>
