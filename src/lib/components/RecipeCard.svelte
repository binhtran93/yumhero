<script lang="ts">
    import { Clock, Users } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import RecipeThumbnail from "$lib/components/RecipeThumbnail.svelte";

    interface Props {
        title: string;
        image: string;
        totalTime: number;
        servings: number;
        tags: string[];
    }

    let { title, image, totalTime, servings, tags }: Props = $props();
</script>

<div
    class="group relative bg-white rounded-xl border border-border-default shadow-sm hover:shadow-md transition-all duration-200 hover:bg-bg-surface-hover overflow-hidden cursor-pointer flex flex-row items-center gap-3 p-2 md:gap-4 md:p-3"
>
    <!-- Image -->
    <RecipeThumbnail
        src={image}
        alt={title}
        class="w-20 h-20 md:w-24 md:h-24 rounded-lg group-hover:scale-105 transition-transform duration-500"
    />

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center min-w-0 py-1">
        <div class="flex items-start justify-between gap-4 mb-1">
            <!-- Title -->
            <h3
                class="text-sm md:text-base font-bold text-text-primary line-clamp-1 group-hover:text-action-primary transition-colors"
            >
                {title}
            </h3>
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-1.5 md:mb-2">
            {#each tags.slice(0, 3) as tag}
                <span
                    class="px-1.5 py-0.5 bg-bg-default border border-border-default text-text-secondary text-[10px] font-medium rounded-md"
                >
                    {tag}
                </span>
            {/each}
            {#if tags.length > 3}
                <span
                    class="px-1.5 py-0.5 text-text-secondary text-[10px] font-medium"
                >
                    +{tags.length - 3}
                </span>
            {/if}
        </div>

        <!-- Meta -->
        <div
            class="flex items-center gap-3 md:gap-4 text-xs font-medium text-text-secondary"
        >
            <div class="flex items-center gap-1">
                <Clock size={12} class="md:w-3.5 md:h-3.5 text-accent-lunch" />
                <span>{totalTime} min</span>
            </div>
            <div class="flex items-center gap-1">
                <Users size={12} class="md:w-3.5 md:h-3.5 text-accent-dinner" />
                <span>{servings} ppl</span>
            </div>
        </div>
    </div>
</div>
