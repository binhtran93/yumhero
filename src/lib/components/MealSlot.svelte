<script lang="ts">
    import { Plus, X } from "lucide-svelte";
    import type { Recipe, MealType } from "$lib/types";
    import { twMerge } from "tailwind-merge";

    interface Props {
        type: MealType;
        recipe: Recipe | null;
        onClick: () => void;
        onClear?: (e: MouseEvent) => void;
    }

    let { type, recipe, onClick, onClear }: Props = $props();

    // Functional Color Mapping
    const colorMap = {
        breakfast: {
            border: "border-amber-400",
            bg: "bg-amber-50",
            text: "text-amber-700",
            textLight: "text-amber-600/70",
            hoverBorder: "hover:border-amber-500",
            iconBg: "bg-amber-100",
            indicator: "bg-amber-500",
        },
        lunch: {
            border: "border-emerald-400",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            textLight: "text-emerald-600/70",
            hoverBorder: "hover:border-emerald-500",
            iconBg: "bg-emerald-100",
            indicator: "bg-emerald-500",
        },
        dinner: {
            border: "border-indigo-400",
            bg: "bg-indigo-50",
            text: "text-indigo-700",
            textLight: "text-indigo-600/70",
            hoverBorder: "hover:border-indigo-500",
            iconBg: "bg-indigo-100",
            indicator: "bg-indigo-500",
        },
    };

    const colors = colorMap[type];

    // Tag Colors (Deterministic-ish)
    const getTagColor = (tag: string) => {
        const char = tag.charCodeAt(0);
        if (char % 4 === 0) return "bg-rose-100 text-rose-700 border-rose-200";
        if (char % 4 === 1) return "bg-sky-100 text-sky-700 border-sky-200";
        if (char % 4 === 2)
            return "bg-violet-100 text-violet-700 border-violet-200";
        return "bg-lime-100 text-lime-700 border-lime-200";
    };
</script>

<div
    onclick={onClick}
    onkeydown={(e) => e.key === "Enter" && onClick()}
    role="button"
    tabindex="0"
    class={twMerge(
        "group relative flex flex-col w-full h-[120px] transition-all duration-200 cursor-pointer border-b border-border-subtle last:border-b-0",
        "hover:bg-white hover:pl-0.5", // Reset padding shift
        recipe
            ? `${colors.bg} border-l-4 ${colors.border}`
            : "bg-transparent text-text-secondary/40 hover:text-text-primary hover:border-l-4 hover:border-l-border-strong",
    )}
>
    <div class="flex-1 p-3 flex flex-col justify-start">
        <div class="flex items-center justify-between mb-1.5">
            <span
                class={twMerge(
                    "text-[11px] uppercase font-bold tracking-widest",
                    recipe ? colors.textLight : "text-text-secondary/50",
                )}
            >
                {type}
            </span>
        </div>

        {#if recipe}
            <div class="animate-in fade-in duration-200">
                <h4 class="text-sm font-bold text-text-primary leading-tight">
                    {recipe.title}
                </h4>
                <div class="flex gap-2 mt-2 flex-wrap">
                    {#each recipe.tags.slice(0, 2) as tag}
                        <span
                            class={twMerge(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border",
                                getTagColor(tag),
                            )}
                        >
                            {tag}
                        </span>
                    {/each}
                </div>

                {#if onClear}
                    <button
                        onclick={(e) => {
                            e.stopPropagation();
                            onClear(e);
                        }}
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                {/if}
            </div>
        {:else}
            <div
                class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity delay-75"
            >
                <div
                    class={twMerge(
                        "flex items-center gap-2 px-3 py-1.5 border border-transparent rounded-full shadow-sm bg-white",
                        colors.text,
                    )}
                >
                    <Plus size={14} />
                    <span class="text-xs font-bold">Add</span>
                </div>
            </div>
        {/if}
    </div>
</div>
