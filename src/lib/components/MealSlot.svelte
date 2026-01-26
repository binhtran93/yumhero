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
<!-- The Slot Container -->
<div class="flex flex-col gap-2 w-full">
    {#if recipes.length > 0}
        <!-- Header is now handled by DayColumn for better structure -->

        <div class="flex items-center justify-end px-1 -mt-8 mb-2">
            {#if onClear}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onClear(e);
                    }}
                    class="text-gray-500 hover:text-red-600 transition-colors"
                    title="Clear"
                >
                    <X size={14} />
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
                <!-- High Contrast Card -->
                <div
                    class="bg-white rounded border border-gray-300 shadow-sm p-3 relative group cursor-pointer hover:border-black transition-all hover:-translate-y-0.5"
                >
                    <!-- Type Accent Bar -->
                    <div
                        class={twMerge(
                            "absolute left-0 top-0 bottom-0 w-1.5 rounded-l",
                            type === "breakfast"
                                ? "bg-orange-600"
                                : type === "lunch"
                                  ? "bg-teal-700"
                                  : "bg-indigo-700",
                        )}
                    ></div>

                    <h4
                        class="text-sm font-black text-black mb-2 pl-2 leading-snug"
                    >
                        {recipe.title}
                    </h4>

                    <div class="flex flex-wrap gap-1.5 pl-2">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[10px] text-black bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 font-bold"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Clean Add Button -->
            <button
                class="w-full py-2 rounded border border-dashed border-gray-400 text-gray-700 hover:border-black hover:bg-gray-50 text-[10px] uppercase font-bold transition-all flex items-center justify-center gap-1"
            >
                <Plus size={12} /> Add Item
            </button>
        </div>
    {:else}
        <!-- Empty State: High Contrast -->
        <div
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
            class="w-full py-6 rounded border border-dashed border-gray-400 hover:border-black hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2 group bg-white"
        >
            <div class="text-black group-hover:scale-110 transition-transform">
                <Plus size={18} strokeWidth={2.5} />
            </div>
            <span
                class="text-[11px] font-black text-black uppercase tracking-widest"
            >
                Add {type}
            </span>
        </div>
    {/if}
</div>
