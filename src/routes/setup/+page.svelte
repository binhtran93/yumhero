<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import {
        userUnits,
        userTags,
        addUnit as addUnitAction,
        deleteUnit as deleteUnitAction,
        addCategory as addCategoryAction,
        deleteCategory as deleteCategoryAction,
    } from "$lib/stores/userData";
    import { Plus, Trash2, Scale, ShoppingBasket } from "lucide-svelte";
    import { slide, fade } from "svelte/transition";

    let activeTab = $state("units"); // 'units' | 'categories'
    let newUnit = $state("");
    let newCategory = $state("");

    const addUnit = async () => {
        if (newUnit.trim()) {
            await addUnitAction(newUnit.trim());
            newUnit = "";
        }
    };

    const deleteUnit = async (id: string) => {
        await deleteUnitAction(id);
    };

    const addCategory = async () => {
        if (newCategory.trim()) {
            await addCategoryAction(newCategory.trim());
            newCategory = "";
        }
    };

    const deleteCategory = async (id: string) => {
        await deleteCategoryAction(id);
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
                <!-- Header (Hidden / Optional since tab explains it) -->
                <!-- List -->
                <div class="flex-1 overflow-y-auto p-0">
                    {#each $userUnits as unit (unit.id)}
                        <div
                            class="group flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 border-b border-border-default/50 last:border-b-0 hover:bg-bg-surface-hover/50 transition-colors"
                            transition:slide|local
                        >
                            <span class="text-text-primary font-medium"
                                >{unit.label}</span
                            >
                            <button
                                onclick={() => deleteUnit(unit.id)}
                                class="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                                title="Delete"
                                aria-label="Delete unit"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    {/each}
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
                        class="flex gap-2"
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
                            class="p-2.5 bg-action-primary text-white rounded-xl shadow-lg shadow-action-primary/20 hover:bg-action-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center aspect-square"
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
                <!-- List -->
                <div class="flex-1 overflow-y-auto p-0">
                    {#each $userTags as category (category.id)}
                        <div
                            class="group flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 border-b border-border-default/50 last:border-b-0 hover:bg-bg-surface-hover/50 transition-colors"
                            transition:slide|local
                        >
                            <span class="text-text-primary font-medium"
                                >{category.label}</span
                            >
                            <button
                                onclick={() => deleteCategory(category.id)}
                                class="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                                title="Delete"
                                aria-label="Delete category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    {/each}
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
                        class="flex gap-2"
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
                            class="p-2.5 bg-action-primary text-white rounded-xl shadow-lg shadow-action-primary/20 hover:bg-action-primary/90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center aspect-square"
                            aria-label="Add category"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</div>
