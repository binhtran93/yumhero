<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import {
        userUnits,
        userTags,
        addUnit as addUnitAction,
        deleteUnit as deleteUnitAction,
        addCategory as addCategoryAction,
        deleteCategory as deleteCategoryAction,
        updateUnit as updateUnitAction,
        updateCategory as updateCategoryAction,
        resetUnitsToDefaults,
        resetCategoriesToDefaults,
    } from "$lib/stores/userData";
    import {
        Plus,
        Trash2,
        Scale,
        ShoppingBasket,
        RotateCcw,
        Loader2,
        Pencil,
        Check,
        X,
    } from "lucide-svelte";
    import { slide, fade } from "svelte/transition";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    let activeTab = $state("units"); // 'units' | 'categories'
    let newUnit = $state("");
    let newCategory = $state("");

    // Edit State
    let editingId = $state<string | null>(null);
    let editValue = $state("");

    const startEdit = (id: string, label: string) => {
        editingId = id;
        editValue = label;
    };

    const cancelEdit = () => {
        editingId = null;
        editValue = "";
    };

    const saveEdit = async (type: "unit" | "category") => {
        if (!editingId || !editValue.trim()) return;

        try {
            if (type === "unit") {
                await updateUnitAction(editingId, editValue.trim());
            } else {
                await updateCategoryAction(editingId, editValue.trim());
            }
            cancelEdit();
        } catch (error) {
            console.error("Failed to update:", error);
            alert("Failed to update. Item might already exist.");
        }
    };

    // Confirm Modal State
    let confirmModal = $state({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        isDestructive: false,
    });

    const openConfirm = (
        title: string,
        message: string,
        action: () => void | Promise<void>,
        destructive = false,
    ) => {
        confirmModal.title = title;
        confirmModal.message = message;
        confirmModal.onConfirm = async () => {
            await action();
            confirmModal.isOpen = false;
        };
        confirmModal.isDestructive = destructive;
        confirmModal.isOpen = true;
    };

    // Actions with Confirmation
    const addUnit = async () => {
        if (newUnit.trim()) {
            await addUnitAction(newUnit.trim());
            newUnit = "";
        }
    };

    const deleteUnit = (id: string) => {
        openConfirm(
            "Delete Unit",
            "Are you sure you want to delete this unit?",
            async () => {
                await deleteUnitAction(id);
            },
            true,
        );
    };

    const resetUnits = () => {
        openConfirm(
            "Reset Units",
            "This will delete all current units and restore the defaults. This cannot be undone.",
            resetUnitsToDefaults,
            true,
        );
    };

    const addCategory = async () => {
        if (newCategory.trim()) {
            await addCategoryAction(newCategory.trim());
            newCategory = "";
        }
    };

    const deleteCategory = (id: string) => {
        openConfirm(
            "Delete Category",
            "Are you sure you want to delete this category?",
            async () => {
                await deleteCategoryAction(id);
            },
            true,
        );
    };

    const resetCategories = () => {
        openConfirm(
            "Reset Categories",
            "This will delete all current categories and restore the defaults. This cannot be undone.",
            resetCategoriesToDefaults,
            true,
        );
    };
</script>

<!-- Header -->
<Header title="Setup" />

<div
    class="p-3 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col overflow-hidden"
>
    <!-- Tab Navigation -->
    <div
        class="flex items-center gap-2 mb-4 md:mb-6 p-1 bg-bg-surface border border-border-default rounded-xl shrink-0"
    >
        <button
            class="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg text-sm font-bold transition-all {activeTab ===
            'units'
                ? 'bg-action-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-default/50'}"
            onclick={() => (activeTab = "units")}
        >
            <Scale size={18} />
            Units
        </button>
        <button
            class="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg text-sm font-bold transition-all {activeTab ===
            'categories'
                ? 'bg-action-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-default/50'}"
            onclick={() => (activeTab = "categories")}
        >
            <ShoppingBasket size={18} />
            Food Categories
        </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden relative">
        {#if activeTab === "units"}
            <div
                class="absolute inset-0 flex flex-col bg-bg-surface rounded-2xl border border-border-default shadow-sm overflow-hidden"
                in:fade={{ duration: 200, delay: 100 }}
                out:fade={{ duration: 100 }}
            >
                <div
                    class="flex items-center justify-between px-4 py-2 bg-bg-default/50 border-b border-border-default"
                >
                    <span
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider"
                        >My Units</span
                    >
                    <button
                        onclick={resetUnits}
                        class="text-xs flex items-center gap-1 text-action-primary hover:underline font-medium"
                    >
                        <RotateCcw size={12} />
                        Reset Default
                    </button>
                </div>
                <!-- List -->
                <div class="flex-1 overflow-y-auto p-0 relative">
                    {#if $userUnits.loading}
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-bg-surface/50 z-10"
                        >
                            <Loader2
                                class="w-8 h-8 text-action-primary animate-spin"
                            />
                        </div>
                    {:else}
                        {#each $userUnits.data as unit (unit.id)}
                            <div
                                class="group flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 border-b border-border-default/50 last:border-b-0 hover:bg-bg-surface-hover/50 transition-colors h-[60px]"
                            >
                                {#if editingId === unit.id}
                                    <form
                                        class="flex-1 flex gap-2 items-center mr-2"
                                        onsubmit={(e) => {
                                            e.preventDefault();
                                            saveEdit("unit");
                                        }}
                                    >
                                        <input
                                            type="text"
                                            bind:value={editValue}
                                            class="flex-1 px-3 py-1.5 rounded-lg border border-action-primary bg-bg-surface text-text-primary text-sm font-medium focus:outline-none"
                                            autofocus
                                            onkeydown={(e) => {
                                                if (e.key === "Escape")
                                                    cancelEdit();
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            class="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="Save"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onclick={cancelEdit}
                                            class="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </form>
                                {:else}
                                    <span class="text-text-primary font-medium"
                                        >{unit.label}</span
                                    >
                                    <div class="flex items-center gap-1">
                                        <button
                                            onclick={() =>
                                                startEdit(unit.id, unit.label)}
                                            class="p-2 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onclick={() => deleteUnit(unit.id)}
                                            class="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>

                <!-- Add Item -->
                <div
                    class="p-4 border-t border-border-default bg-bg-default/50 shrink-0"
                >
                    <form
                        onsubmit={(e) => {
                            e.preventDefault();
                            addUnit();
                        }}
                        class="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            bind:value={newUnit}
                            placeholder="Add new unit..."
                            class="flex-1 px-4 py-2.5 rounded-xl border border-border-default focus:outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 bg-bg-surface text-text-primary placeholder:text-text-secondary/50 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newUnit.trim()}
                            class="w-11 h-11 p-0 bg-action-primary text-white rounded-xl shadow-lg shadow-action-primary/20 hover:bg-action-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center shrink-0"
                            aria-label="Add unit"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </div>
        {:else}
            <div
                class="absolute inset-0 flex flex-col bg-bg-surface rounded-2xl border border-border-default shadow-sm overflow-hidden"
                in:fade={{ duration: 200, delay: 100 }}
                out:fade={{ duration: 100 }}
            >
                <div
                    class="flex items-center justify-between px-4 py-2 bg-bg-default/50 border-b border-border-default"
                >
                    <span
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider"
                        >My Categories</span
                    >
                    <button
                        onclick={resetCategories}
                        class="text-xs flex items-center gap-1 text-action-primary hover:underline font-medium"
                    >
                        <RotateCcw size={12} />
                        Reset Default
                    </button>
                </div>
                <!-- List -->
                <div class="flex-1 overflow-y-auto p-0 relative">
                    {#if $userTags.loading}
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-bg-surface/50 z-10"
                        >
                            <Loader2
                                class="w-8 h-8 text-action-primary animate-spin"
                            />
                        </div>
                    {:else}
                        {#each $userTags.data as category (category.id)}
                            <div
                                class="group flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 border-b border-border-default/50 last:border-b-0 hover:bg-bg-surface-hover/50 transition-colors h-[60px]"
                            >
                                {#if editingId === category.id}
                                    <form
                                        class="flex-1 flex gap-2 items-center mr-2"
                                        onsubmit={(e) => {
                                            e.preventDefault();
                                            saveEdit("category");
                                        }}
                                    >
                                        <input
                                            type="text"
                                            bind:value={editValue}
                                            class="flex-1 px-3 py-1.5 rounded-lg border border-action-primary bg-bg-surface text-text-primary text-sm font-medium focus:outline-none"
                                            autofocus
                                            onkeydown={(e) => {
                                                if (e.key === "Escape")
                                                    cancelEdit();
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            class="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                            title="Save"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onclick={cancelEdit}
                                            class="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </form>
                                {:else}
                                    <span class="text-text-primary font-medium"
                                        >{category.label}</span
                                    >
                                    <div class="flex items-center gap-1">
                                        <button
                                            onclick={() =>
                                                startEdit(
                                                    category.id,
                                                    category.label,
                                                )}
                                            class="p-2 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onclick={() =>
                                                deleteCategory(category.id)}
                                            class="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>

                <!-- Add Item -->
                <div
                    class="p-4 border-t border-border-default bg-bg-default/50 shrink-0"
                >
                    <form
                        onsubmit={(e) => {
                            e.preventDefault();
                            addCategory();
                        }}
                        class="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            bind:value={newCategory}
                            placeholder="Add new category..."
                            class="flex-1 px-4 py-2.5 rounded-xl border border-border-default focus:outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 bg-bg-surface text-text-primary placeholder:text-text-secondary/50 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newCategory.trim()}
                            class="w-11 h-11 p-0 bg-action-primary text-white rounded-xl shadow-lg shadow-action-primary/20 hover:bg-action-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center shrink-0"
                            aria-label="Add category"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    </div>
    <!-- Confirm Modal -->
    <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => (confirmModal.isOpen = false)}
        isDestructive={confirmModal.isDestructive}
    />
</div>
