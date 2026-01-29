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
    }

    let {
        type,
        items,
        onClick,
        onClear,
        onRemove,
        isLoading = false,
    }: Props = $props();

    const getLabel = (item: Recipe | Note) => {
        if ("title" in item) return item.title;
        return item.text;
    };
</script>

<div
    class="group relative flex flex-col bg-app-surface transition-all duration-200 h-full min-h-24 cursor-pointer"
    onclick={onClick}
    onkeydown={(e) => e.key === "Enter" && onClick(e as unknown as MouseEvent)}
    role="button"
    tabindex="0"
>
    <!-- Cell Header (Subtle Label) -->
    <div
        class="p-2 py-1.5 flex items-center justify-between bg-app-bg/10 hover:bg-app-bg/20 transition-colors"
    >
        <div class="flex items-center">
            <div
                class={twMerge(
                    "w-2 h-2 rounded-full mr-2",
                    type === "breakfast"
                        ? "bg-accent-breakfast"
                        : type === "lunch"
                          ? "bg-accent-lunch"
                          : type === "dinner"
                            ? "bg-accent-dinner"
                            : type === "snack"
                              ? "bg-accent-snack"
                              : "bg-accent-note",
                )}
            ></div>
            <span
                class="text-[10px] font-semibold capitalize tracking-widest text-app-text-muted transition-colors"
            >
                {type}
            </span>
        </div>
        <div
            class="flex items-center justify-center w-11 h-11 -mr-2 -my-2 cursor-pointer text-app-text-muted hover:text-app-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform hover:scale-105"
            title={`Add to ${type}`}
        >
            <Plus size={14} />
        </div>
    </div>

    <!-- Cell Content -->
    <div class="flex-1 p-1.5 flex flex-col gap-2 overflow-y-auto relative">
        {#each items as item, i}
            <div
                class={twMerge(
                    "group/item relative flex items-start gap-2 px-3 py-2 rounded-xl shadow-sm text-sm transition-all border",
                    type === "breakfast"
                        ? "bg-accent-breakfast-bg hover:bg-accent-breakfast-hover border-accent-breakfast-border"
                        : type === "lunch"
                          ? "bg-accent-lunch-bg hover:bg-accent-lunch-hover border-accent-lunch-border"
                          : type === "dinner"
                            ? "bg-accent-dinner-bg hover:bg-accent-dinner-hover border-accent-dinner-border"
                            : type === "snack"
                              ? "bg-accent-snack-bg hover:bg-accent-snack-hover border-accent-snack-border"
                              : "bg-accent-note-bg hover:bg-accent-note-hover border-accent-note-border",
                )}
                onclick={(e) => e.stopPropagation()}
                onkeydown={(e) => e.key === "Enter" && e.stopPropagation()}
                role="group"
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
                            <span class="opacity-60 font-medium ml-1 text-xs"
                                >x{item.servings}</span
                            >
                        {/if}
                    </p>
                </div>

                {#if onRemove}
                    <button
                        class={twMerge(
                            "flex items-center justify-center w-6 h-6 -mr-1 rounded-full opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-all hover:bg-black/5",
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
                        <X size={14} />
                    </button>
                {/if}
            </div>
        {/each}

        {#if items.length === 0}
            <div class="flex-1 flex items-center justify-center">
                <Plus
                    size={16}
                    class="text-app-text-muted/50 group-hover:text-app-text-muted/80 transition-colors"
                />
            </div>
        {:else}
            <!-- Filling the remaining space with a subtle interactive area -->
            <div class="flex-1 flex items-center justify-center min-h-8">
                <Plus
                    size={12}
                    class="text-app-text-muted/0 group-hover:text-app-text-muted/30 transition-all duration-200"
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
