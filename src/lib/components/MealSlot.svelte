<script lang="ts">
    import { Plus, X } from "lucide-svelte";
    import type { Recipe, MealType } from "$lib/types";
    import { twMerge } from "tailwind-merge";

    interface Props {
        type: MealType;
        recipes: Recipe[];
        onClick: () => void;
        onClear?: (e: MouseEvent) => void;
    }

    let { type, recipes, onClick, onClear }: Props = $props();

    // "Warm Family" Theme Colors
    // Friendly, soft, natural tones.
    const colorMap = {
        breakfast: {
            label: "text-amber-700",
            card: "bg-amber-50 hover:bg-amber-100", // Warm yellow tones
            border: "border-amber-100",
            accent: "bg-amber-400",
            emptyBg: "bg-amber-50/50 hover:bg-amber-100",
            emptyIcon: "text-amber-400",
        },
        lunch: {
            label: "text-lime-700",
            card: "bg-lime-50 hover:bg-lime-100", // Fresh green tones
            border: "border-lime-100",
            accent: "bg-lime-500",
            emptyBg: "bg-lime-50/50 hover:bg-lime-100",
            emptyIcon: "text-lime-500",
        },
        dinner: {
            label: "text-orange-700",
            card: "bg-orange-50 hover:bg-orange-100", // Warm terracotta tones
            border: "border-orange-100",
            accent: "bg-orange-400",
            emptyBg: "bg-orange-50/50 hover:bg-orange-100",
            emptyIcon: "text-orange-400",
        },
    };

    const colors = colorMap[type];
</script>

<!-- The Slot Container -->
<div class="flex flex-col gap-2 w-full">
    {#if recipes.length > 0}
        <!-- Header is now handled by DayColumn for better structure -->
        <!-- Just Clean Cards -->

        <div class="flex items-center justify-end px-1 -mt-8 mb-2">
            {#if onClear}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onClear(e);
                    }}
                    class="text-gray-300 hover:text-red-500 transition-colors"
                    title="Clear"
                >
                    <X size={12} />
                </button>
            {/if}
        </div>

        <div
            class="flex flex-col gap-2"
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
        >
            {#each recipes as recipe}
                <!-- Clean Pro Card -->
                <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 relative group cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                    <!-- Type Accent Bar -->
                    <div
                        class={twMerge(
                            "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                            type === "breakfast"
                                ? "bg-orange-400"
                                : type === "lunch"
                                  ? "bg-teal-400"
                                  : "bg-indigo-400",
                        )}
                    ></div>

                    <h4
                        class="text-sm font-bold text-slate-800 mb-2 pl-2 leading-snug"
                    >
                        {recipe.title}
                    </h4>

                    <div class="flex flex-wrap gap-1.5 pl-2">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[10px] text-slate-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 font-medium"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Clean Add Button -->
            <button
                class="w-full py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-white text-[10px] uppercase font-bold transition-all flex items-center justify-center gap-1"
            >
                <Plus size={12} /> Add Item
            </button>
        </div>
    {:else}
        <!-- Empty State: Clean Minimal -->
        <div
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
            class="w-full py-6 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 group bg-gray-50/50"
        >
            <div
                class="text-gray-300 group-hover:text-gray-400 transition-colors"
            >
                <Plus size={16} strokeWidth={2} />
            </div>
            <span
                class="text-[10px] font-bold text-gray-300 group-hover:text-gray-500 uppercase tracking-widest transition-colors"
            >
                Add {type}
            </span>
        </div>
    {/if}
</div>
