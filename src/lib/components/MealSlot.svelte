<script lang="ts">
    import { Plus, X, Loader } from "lucide-svelte";
    import type { Recipe, MealType } from "$lib/types";
    import { twMerge } from "tailwind-merge";

    interface Props {
        type: MealType;
        recipes: Recipe[];
        onClick: () => void;
        onClear?: (e: MouseEvent) => void;
        onRemove?: (index: number) => void;
        isLoading?: boolean;
        isCompact?: boolean;
    }

    let {
        type,
        recipes,
        onClick,
        onClear,
        onRemove,
        isLoading = false,
        isCompact = false,
    }: Props = $props();
</script>

<div
    class={twMerge(
        "group relative flex flex-col bg-app-surface transition-all duration-200",
        "hover:z-10 hover:shadow-sm hover:bg-app-primary/[0.02]",
        isCompact ? "min-h-[80px]" : "min-h-[140px]",
    )}
>
    <!-- Cell Header (Subtle Label) -->
    <div
        class="px-2 py-1.5 flex items-center justify-between border-b border-app-border/30 bg-app-bg/10"
    >
        <span
            class="text-[9px] font-bold uppercase tracking-widest text-app-text-muted/60 group-hover:text-app-primary/70 transition-colors"
        >
            {type}
        </span>
        <button
            onclick={onClick}
            class="p-0.5 text-app-text-muted hover:text-app-primary opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
            title={`Add to ${type}`}
        >
            <Plus size={12} />
        </button>
    </div>

    <!-- Cell Content -->
    <div
        class="flex-1 p-1.5 flex flex-col gap-1 overflow-y-auto"
        onclick={() => recipes.length === 0 && onClick()}
        onkeydown={(e) =>
            e.key === "Enter" && recipes.length === 0 && onClick()}
        role="button"
        tabindex="0"
    >
        {#each recipes as recipe, i}
            <div
                class={twMerge(
                    "group/item relative flex items-start gap-2 px-2 py-1.5 rounded shadow-sm text-xs transition-all",
                    type === "breakfast"
                        ? "bg-accent-breakfast-bg dark:bg-accent-breakfast/10 border border-accent-breakfast/20 hover:bg-accent-breakfast/10"
                        : type === "lunch"
                          ? "bg-accent-lunch-bg dark:bg-accent-lunch/10 border border-accent-lunch/20 hover:bg-accent-lunch/10"
                          : "bg-accent-dinner-bg dark:bg-accent-dinner/10 border border-accent-dinner/20 hover:bg-accent-dinner/10",
                )}
            >
                <div class="flex-1 min-w-0 pt-0.5">
                    <p
                        class={twMerge(
                            "font-medium leading-tight",
                            type === "breakfast"
                                ? "text-amber-900 dark:text-amber-100"
                                : type === "lunch"
                                  ? "text-green-900 dark:text-green-100"
                                  : "text-rose-900 dark:text-rose-100",
                        )}
                    >
                        {recipe.title}
                    </p>
                    {#if !isCompact && recipe.servings}
                        <p
                            class={twMerge(
                                "text-[9px] mt-0.5 opacity-60",
                                type === "breakfast"
                                    ? "text-amber-700 dark:text-amber-400"
                                    : type === "lunch"
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-rose-700 dark:text-rose-400",
                            )}
                        >
                            {recipe.servings}
                            {recipe.servings === 1 ? "serving" : "servings"}
                        </p>
                    {/if}
                </div>

                {#if onRemove}
                    <button
                        class={twMerge(
                            "p-0.5 opacity-0 group-hover/item:opacity-100 transition-all hover:text-red-500",
                            type === "breakfast"
                                ? "text-amber-600/50"
                                : type === "lunch"
                                  ? "text-green-600/50"
                                  : "text-rose-600/50",
                        )}
                        onclick={(e) => {
                            e.stopPropagation();
                            onRemove(i);
                        }}
                    >
                        <X size={10} />
                    </button>
                {/if}
            </div>
        {/each}

        {#if recipes.length === 0}
            <div class="flex-1 flex items-center justify-center">
                <Plus
                    size={14}
                    class="text-app-text-muted/10 group-hover:text-app-text-muted/30 transition-colors"
                />
            </div>
        {/if}
    </div>

    <!-- Loading Overlay -->
    {#if isLoading}
        <div
            class="absolute inset-0 bg-white/60 dark:bg-app-surface/60 backdrop-blur-[1px] flex items-center justify-center z-20"
        >
            <Loader size={16} class="animate-spin text-app-primary/50" />
        </div>
    {/if}
</div>
