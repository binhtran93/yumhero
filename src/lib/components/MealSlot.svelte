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

    // V3 Modern Accents
    const colorMap = {
        breakfast: {
            accentText: "text-orange-600",
            accentBg: "bg-orange-50",
            border: "border-orange-200",
        },
        lunch: {
            accentText: "text-teal-600",
            accentBg: "bg-teal-50",
            border: "border-teal-200",
        },
        dinner: {
            accentText: "text-violet-600",
            accentBg: "bg-violet-50",
            border: "border-violet-200",
        },
    };

    const colors = colorMap[type];
</script>

<!-- The Slot Container -->
<div class="flex flex-col gap-2 h-full">
    <!-- Conditional Rendering: If recipes exist, show cards. If not, show placeholder. -->

    {#if recipes.length > 0}
        <!-- Populated State: Header + Cards -->
        <div class="flex items-center justify-between px-1">
            <span
                class={twMerge(
                    "text-[9px] uppercase font-bold tracking-widest opacity-60",
                    colors.accentText,
                )}>{type}</span
            >
            {#if onClear}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        onClear(e);
                    }}
                    class="text-text-secondary hover:text-red-500 transition-colors"
                >
                    <X size={10} />
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
                <div
                    class="bg-white rounded-md shadow-sm border border-border-subtle p-2.5 relative group cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                    <div
                        class={twMerge(
                            "absolute left-0 top-1 bottom-1 w-0.5 rounded-full",
                            colors.accentBg
                                .replace("bg-", "bg-")
                                .replace("50", "500"),
                        )}
                    ></div>

                    <h4
                        class="text-xs font-semibold text-text-primary mb-1.5 pl-2 leading-snug"
                    >
                        {recipe.title}
                    </h4>

                    <div class="flex flex-wrap gap-1 pl-2">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[9px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded-sm border border-border-subtle"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Subtle Add Button bellow list -->
            <button
                class="w-full py-1.5 rounded border border-dashed border-border-subtle text-text-secondary/50 hover:text-text-primary hover:border-border-strong hover:bg-white text-[10px] uppercase font-bold transition-all flex items-center justify-center gap-1"
            >
                <Plus size={10} /> Add
            </button>
        </div>
    {:else}
        <!-- Empty State: Minimal Placeholder -->
        <div
            role="button"
            tabindex="0"
            onclick={onClick}
            onkeydown={(e) => e.key === "Enter" && onClick()}
            class={twMerge(
                "h-full min-h-[80px] rounded-lg border border-dashed border-border-subtle hover:border-border-strong hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group",
                colors.accentBg.replace("50", "50/30"), // Very subtle tint
            )}
        >
            <span
                class={twMerge(
                    "text-[9px] uppercase font-bold tracking-widest opacity-40 group-hover:opacity-100 transition-opacity",
                    colors.accentText,
                )}
            >
                {type}
            </span>
            <div
                class="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary"
            >
                <Plus size={14} />
            </div>
        </div>
    {/if}
</div>
