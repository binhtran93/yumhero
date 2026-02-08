<script lang="ts">
    import { Clock, Users } from "lucide-svelte";
    import { formatServings } from "$lib/utils/recipe";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";
    import { userTags } from "$lib/stores/tags";
    import { goto } from "$app/navigation";
    import { EllipsisVertical } from "lucide-svelte";

    interface Props {
        id: string;
        title: string;
        image: string;
        totalTime: number;
        servings: number | null;
        tags?: string[];
        mealTypes?: string[];
        onShowOptions?: (e: MouseEvent) => void;
    }

    let { id, title, image, totalTime, servings, tags = [], mealTypes = [], onShowOptions }: Props =
        $props();

    const mealTypeLabel = $derived(
        mealTypes.length > 0
            ? mealTypes
                  .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
                  .join(" • ")
            : "",
    );

    function getTagName(tagId: string) {
        return $userTags.data.find((t) => t.id === tagId)?.label || tagId;
    }

    function handleCardClick(e: MouseEvent) {
        // Prevent navigation if selecting text
        if (window.getSelection()?.toString().length) return;

        // Prevent if clicking on interactive elements (though stopPropagation should handle this)
        if ((e.target as HTMLElement).closest("button")) return;

        goto(`/recipes/${id}`);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="group relative bg-app-surface rounded-xl border border-app-border shadow hover:shadow-md transition-all duration-200 overflow-visible cursor-pointer flex flex-row items-start gap-3 p-2 md:gap-4 md:p-3 h-full"
    onclick={handleCardClick}
>
    <!-- Image -->
    <RecipeThumbnail
        src={image}
        alt={title}
        class="w-20 h-20 md:w-24 md:h-24 rounded-lg group-hover:scale-105 transition-transform duration-500 shrink-0"
    />

    <div class="flex-1 flex flex-col justify-center min-w-0 py-1">
        <div class="flex items-start justify-between gap-4 mb-1">
            <!-- Title -->
            <h3
                class="text-sm md:text-base font-bold text-app-text line-clamp-2 group-hover:text-app-primary transition-colors pr-8"
            >
                {title}
            </h3>
        </div>

        {#if mealTypeLabel}
            <p class="text-[11px] text-app-text-muted mb-1.5 line-clamp-1">
                {mealTypeLabel}
            </p>
        {/if}

        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-1.5 md:mb-2">
            {#each tags.slice(0, 3) as tag}
                <span
                    class="px-1.5 py-0.5 bg-app-bg border border-app-border text-app-text-muted text-[10px] font-medium rounded-md"
                >
                    {getTagName(tag)}
                </span>
            {/each}
            {#if tags.length > 3}
                <span
                    class="px-1.5 py-0.5 text-app-text-muted text-[10px] font-medium"
                >
                    +{tags.length - 3}
                </span>
            {/if}
        </div>

        <!-- Meta -->
        <div
            class="flex items-center gap-3 md:gap-4 text-xs font-medium text-app-text-muted"
        >
            <div class="flex items-center gap-1">
                <Clock size={12} class="md:w-3.5 md:h-3.5 text-accent-lunch" />
                <span>{totalTime} min</span>
            </div>
            <div class="flex items-center gap-1">
                <Users size={12} class="md:w-3.5 md:h-3.5 text-accent-dinner" />
                <span>{formatServings(servings)} ppl</span>
            </div>
        </div>
    </div>

    <!-- Action Menu (Top Right) -->
    {#if onShowOptions}
        <div class="absolute top-2 right-2">
            <button
                onclick={(e) => {
                    e.stopPropagation();
                    onShowOptions(e);
                }}
                class="p-1 text-app-text-muted hover:text-app-text hover:bg-app-surface-deep rounded-lg transition-colors"
                aria-label="Options"
            >
                <EllipsisVertical size={20} />
            </button>
        </div>
    {/if}
</div>
