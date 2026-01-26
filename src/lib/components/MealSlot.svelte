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
        <!-- Populated State -->
        <div class="flex items-center justify-between px-2">
            <span
                class={twMerge(
                    "text-[10px] uppercase font-bold tracking-widest opacity-70",
                    colors.label,
                )}>{type}</span
            >
            {#if onClear}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onClear(e);
                    }}
                    class="text-stone-400 hover:text-red-500 transition-colors"
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
                <!-- Card: Friendly rounded, soft color -->
                <div
                    class={twMerge(
                        "rounded-2xl shadow-sm border p-3 relative group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
                        "bg-white border-stone-100", // Cards stay white for cleanliness, canvas provides warmth
                    )}
                >
                    <!-- Color Pill -->
                    <div
                        class={twMerge(
                            "absolute left-3 top-3 bottom-3 w-1.5 rounded-full opacity-80",
                            colors.accent,
                        )}
                    ></div>

                    <h4
                        class="text-sm font-bold text-stone-800 mb-2 pl-3 leading-snug"
                    >
                        {recipe.title}
                    </h4>

                    <div class="flex flex-wrap gap-1.5 pl-3">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200 font-bold"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Subtle Add Button -->
            <button
                class={twMerge(
                    "w-full py-2 rounded-xl border border-dashed text-[11px] uppercase font-bold transition-all flex items-center justify-center gap-1",
                    "border-stone-200 text-stone-400 hover:bg-white hover:text-stone-600 hover:border-stone-300",
                )}
            >
                <Plus size={12} /> Add Item
            </button>
        </div>
    {:else}
        <!-- Empty State: Compact Button -->
        <div
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
            class={twMerge(
                "w-full py-4 rounded-2xl border border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 group",
                "border-stone-300 bg-white/40 hover:bg-white",
                colors.emptyBg.replace("/50", "/30"),
            )}
        >
            <span
                class={twMerge(
                    "text-[10px] uppercase font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity",
                    colors.label,
                )}
            >
                {type}
            </span>
            <div
                class={twMerge(
                    "opacity-50 group-hover:opacity-100 transition-transform group-hover:scale-110 duration-200",
                    colors.emptyIcon,
                )}
            >
                <Plus size={16} strokeWidth={3} />
            </div>
        </div>
    {/if}
</div>
