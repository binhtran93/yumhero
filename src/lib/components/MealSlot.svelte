<script lang="ts">
    import { Plus, X, Loader } from "lucide-svelte";
    import type { Recipe, MealType, Note } from "$lib/types";
    import { twMerge } from "tailwind-merge";

    interface Props {
        type: MealType;
        items: (Recipe | Note)[];
        onClick: (e: MouseEvent) => void;
        onClear?: (e: MouseEvent) => void;
        onRemove?: (index: number) => void;
        isLoading?: boolean;
        isCompact?: boolean;
    }

    let {
        type,
        items,
        onClick,
        onClear,
        onRemove,
        isLoading = false,
        isCompact = false,
    }: Props = $props();

    const getLabel = (item: Recipe | Note) => {
        if ("title" in item) return item.title;
        return item.text;
    };
</script>

<div
    class={twMerge(
        "group relative flex flex-col bg-app-surface transition-all duration-200",
        isCompact ? "min-h-[80px]" : "min-h-[140px]",
    )}
>
    <!-- Cell Header (Subtle Label) -->
    <div
        class="px-2 py-1.5 flex items-center justify-between border-b border-app-border bg-app-bg/10"
    >
        <span
            class="text-[10px] font-bold uppercase tracking-widest text-app-text-muted transition-colors"
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
        class="flex-1 p-1.5 flex flex-col gap-1 overflow-y-auto relative"
        onclick={(e) => items.length === 0 && onClick(e)}
        onkeydown={(e) => {
            if (e.key === "Enter" && items.length === 0) {
                // @ts-ignore
                onClick(e as unknown as MouseEvent);
            }
        }}
        role="button"
        tabindex="0"
    >
        {#each items as item, i}
            <div
                class={twMerge(
                    "group/item relative flex items-start gap-2 px-2 py-1.5 rounded shadow-sm text-sm transition-all",
                    type === "breakfast"
                        ? "bg-accent-breakfast-bg hover:bg-accent-breakfast-hover"
                        : type === "lunch"
                          ? "bg-accent-lunch-bg hover:bg-accent-lunch-hover"
                          : type === "dinner"
                            ? "bg-accent-dinner-bg hover:bg-accent-dinner-hover"
                            : type === "snack"
                              ? "bg-accent-snack-bg hover:bg-accent-snack-hover"
                              : "bg-accent-note-bg hover:bg-accent-note-hover",
                )}
            >
                <div class="flex-1 min-w-0 pt-0.5">
                    <p
                        class={twMerge(
                            "font-bold leading-tight",
                            type === "breakfast"
                                ? "text-accent-breakfast-text"
                                : type === "lunch"
                                  ? "text-accent-lunch-text"
                                  : type === "dinner"
                                    ? "text-accent-dinner-text"
                                    : type === "snack"
                                      ? "text-accent-snack-text"
                                      : "text-accent-note-text",
                        )}
                    >
                        {getLabel(item)}
                        {#if "servings" in item && item.servings}
                            <span class="opacity-40 font-medium ml-1 text-xs"
                                >x{item.servings}</span
                            >
                        {/if}
                    </p>
                </div>

                {#if onRemove}
                    <button
                        class={twMerge(
                            "p-0.5 opacity-0 group-hover/item:opacity-100 transition-all hover:text-red-600",
                            type === "breakfast"
                                ? "text-accent-breakfast-text"
                                : type === "lunch"
                                  ? "text-accent-lunch-text"
                                  : type === "dinner"
                                    ? "text-accent-dinner-text"
                                    : type === "snack"
                                      ? "text-accent-snack-text"
                                      : "text-accent-note-text",
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

        {#if items.length === 0}
            <div class="flex-1 flex items-center justify-center">
                <Plus
                    size={14}
                    class="text-app-text-muted/10 group-hover:text-app-text-muted/30 transition-colors"
                />
            </div>
        {/if}

        <!-- Loading Overlay -->
        {#if isLoading}
            <div
                class="absolute inset-0 bg-white/60 dark:bg-app-surface/60 flex items-center justify-center z-20"
            >
                <Loader size={16} class="animate-spin text-app-primary/50" />
            </div>
        {/if}
    </div>
</div>
