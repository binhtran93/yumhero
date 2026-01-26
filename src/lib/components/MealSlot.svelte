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

    // Vibrant Functional Colors
    const colorMap = {
        breakfast: {
            slotBg: "bg-amber-50/80",
            headerText: "text-amber-700",
            accentBorder: "border-amber-400",
            cardBorder: "border-l-amber-500",
            iconBg: "bg-amber-100",
            iconText: "text-amber-700",
        },
        lunch: {
            slotBg: "bg-emerald-50/80",
            headerText: "text-emerald-700",
            accentBorder: "border-emerald-400",
            cardBorder: "border-l-emerald-500",
            iconBg: "bg-emerald-100",
            iconText: "text-emerald-700",
        },
        dinner: {
            slotBg: "bg-indigo-50/80",
            headerText: "text-indigo-700",
            accentBorder: "border-indigo-400",
            cardBorder: "border-l-indigo-500",
            iconBg: "bg-indigo-100",
            iconText: "text-indigo-700",
        },
    };

    const colors = colorMap[type];
</script>

<div
    onclick={onClick}
    onkeydown={(e) => e.key === "Enter" && onClick()}
    role="button"
    tabindex="0"
    class={twMerge(
        "group relative flex flex-col w-full min-h-[140px] transition-all duration-200 cursor-pointer border-b border-border-subtle last:border-b-0 p-2",
        colors.slotBg,
        "hover:brightness-95",
    )}
>
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
        <span
            class={twMerge(
                "text-[10px] uppercase font-bold tracking-widest opacity-80",
                colors.headerText,
            )}
        >
            {type}
        </span>
        {#if recipes.length > 0 && onClear}
            <button
                onclick={(e) => {
                    e.stopPropagation();
                    onClear(e);
                }}
                class="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-600 transition-all rounded hover:bg-white/50"
                title="Clear All"
            >
                <X size={12} />
            </button>
        {/if}
    </div>

    <!-- Content Area -->
    <div class="flex-1 flex flex-col gap-2">
        {#if recipes.length > 0}
            {#each recipes as recipe}
                <div
                    class={twMerge(
                        "bg-white shadow-sm rounded-md p-2 border-l-4 animate-in fade-in slide-in-from-bottom-1 duration-200",
                        colors.cardBorder,
                    )}
                >
                    <h4
                        class="text-xs font-bold text-text-primary leading-snug line-clamp-2"
                    >
                        {recipe.title}
                    </h4>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                        {#each recipe.tags.slice(0, 2) as tag}
                            <span
                                class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium uppercase tracking-wide"
                            >
                                {tag}
                            </span>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else}
            <!-- Empty State -->
            <div
                class="flex-1 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity"
            >
                <div
                    class={twMerge(
                        "flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/60 shadow-sm",
                        colors.iconText,
                    )}
                >
                    <Plus size={12} strokeWidth={3} />
                    <span class="text-[10px] font-bold">ADD</span>
                </div>
            </div>
        {/if}
    </div>
</div>
