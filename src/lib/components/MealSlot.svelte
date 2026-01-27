<script lang="ts">
    import { Plus, X, Loader2 } from "lucide-svelte";
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

    // "Warm Family" Theme Colors
    // Friendly, soft, natural tones.
    const colorMap = {
        breakfast: {
            label: "text-amber-800",
            card: "bg-amber-50 hover:bg-amber-100",
            border: "border-amber-200",
            accent: "bg-amber-600",
            emptyBg: "bg-amber-50/50 hover:bg-amber-100",
            emptyIcon: "text-amber-600",
        },
        lunch: {
            label: "text-lime-800",
            card: "bg-lime-50 hover:bg-lime-100",
            border: "border-lime-200",
            accent: "bg-lime-600",
            emptyBg: "bg-lime-50/50 hover:bg-lime-100",
            emptyIcon: "text-lime-600",
        },
        dinner: {
            label: "text-orange-800",
            card: "bg-orange-50 hover:bg-orange-100",
            border: "border-orange-200",
            accent: "bg-orange-600",
            emptyBg: "bg-orange-50/50 hover:bg-orange-100",
            emptyIcon: "text-orange-600",
        },
    };

    const colors = $derived(colorMap[type]);
</script>

<!-- The Slot Container -->
<!-- The Slot Container -->
<div class="flex flex-col gap-2 w-full">
    {#if recipes.length > 0}
        <!-- Header is now handled by DayColumn for better structure -->

        {#if !isCompact}
            <div class="flex items-center justify-end px-1 -mt-8 mb-2">
                {#if onClear}
                    <button
                        onclick={(e) => {
                            e.stopPropagation();
                            onClear(e);
                        }}
                        class="text-text-secondary hover:text-red-600 transition-colors"
                        title="Clear"
                    >
                        <X size={14} />
                    </button>
                {/if}
            </div>
        {/if}

        <div class="flex flex-col gap-2">
            {#each recipes as recipe, i}
                <!-- Friendly Card -->
                <div
                    class={twMerge(
                        "bg-bg-surface border border-border-default shadow-sm relative group cursor-pointer hover:border-action-primary transition-all hover:-translate-y-0.5",
                        isCompact
                            ? "px-2 py-1.5 rounded-md"
                            : "px-3 py-2 md:px-4 rounded-xl",
                    )}
                >
                    <!-- Type Accent Bar -->
                    <div
                        class={twMerge(
                            "absolute left-0 top-3 bottom-3 w-1 rounded-r-full",
                            type === "breakfast"
                                ? "bg-accent-breakfast"
                                : type === "lunch"
                                  ? "bg-accent-lunch"
                                  : "bg-accent-dinner",
                            isCompact && "w-0.5 top-1 bottom-1",
                        )}
                    ></div>

                    <!-- Remove Button (Top Right) -->
                    {#if onRemove}
                        <button
                            class={twMerge(
                                "absolute text-text-secondary hover:text-red-600 bg-white/60 hover:bg-white rounded-full transition-all shadow-sm",
                                isCompact
                                    ? "top-0.5 right-0.5 p-0.5 opacity-0 group-hover:opacity-100"
                                    : "top-2 right-2 p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100",
                            )}
                            onclick={(e) => {
                                e.stopPropagation();
                                onRemove(i);
                            }}
                            title="Remove"
                        >
                            <X size={isCompact ? 12 : 14} />
                        </button>
                    {/if}

                    <h4
                        class={twMerge(
                            "font-bold text-text-primary leading-snug font-display",
                            isCompact
                                ? "text-[10px] pl-1.5"
                                : "text-xs md:text-sm",
                        )}
                    >
                        {recipe.title}
                    </h4>

                    {#if !isCompact}
                        <div class="">
                            <span
                                class="text-[10px] md:text-[11px] text-text-secondary font-medium"
                            >
                                Servings: <span
                                    class="font-bold text-text-primary"
                                    >{recipe.servings || 1}</span
                                >
                            </span>
                        </div>
                    {/if}
                </div>
            {/each}

            <!-- Friendly Add Button -->
            <button
                class={twMerge(
                    "w-full rounded-xl border border-dashed border-border-strong text-text-secondary hover:border-action-primary hover:bg-bg-surface-hover hover:text-action-primary font-bold transition-all flex items-center justify-center gap-2",
                    isCompact ? "py-1.5 text-[10px]" : "py-2.5 md:py-3 text-xs",
                )}
                onclick={(e) => {
                    e.stopPropagation();
                    if (!isLoading) onClick();
                }}
                disabled={isLoading}
            >
                {#if isLoading}
                    <div class="flex items-center justify-center h-[14px]">
                        <Loader2
                            size={14}
                            class="animate-spin text-text-secondary/50"
                        />
                    </div>
                {:else}
                    <Plus size={isCompact ? 12 : 14} />
                    {#if !isCompact}Add Item{/if}
                {/if}
            </button>
        </div>
    {:else}
        <!-- Empty State: Friendly -->
        <div
            role="button"
            tabindex="0"
            onclick={() => !isLoading && onClick()}
            onkeydown={(e) => e.key === "Enter" && !isLoading && onClick()}
            class={twMerge(
                "w-full rounded-xl border border-dashed border-border-strong hover:border-action-primary hover:bg-bg-surface-hover transition-all cursor-pointer flex items-center justify-center group bg-bg-surface",
                isCompact ? "py-3" : "py-8",
            )}
        >
            <div
                class="text-text-secondary group-hover:text-action-primary group-hover:scale-110 transition-all"
            >
                {#if isLoading}
                    <div class="flex items-center justify-center">
                        <Loader2
                            size={isCompact ? 16 : 24}
                            class="animate-spin text-text-secondary/50"
                        />
                    </div>
                {:else}
                    <Plus size={isCompact ? 16 : 20} />
                {/if}
            </div>
        </div>
    {/if}
</div>
