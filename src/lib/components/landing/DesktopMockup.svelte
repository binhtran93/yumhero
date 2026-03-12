<script lang="ts">
    import { Zap, Clock } from "lucide-svelte";
    import {
        mockPlan,
        mealTypes,
        mockQuickRecipes,
        getMealStyles,
        getLabelColor,
    } from "$lib/data/landingData";

    interface Props {
        forceShow?: boolean;
    }

    let { forceShow = false }: Props = $props();
</script>

<div
    class="{forceShow
        ? 'block'
        : 'hidden md:block'} bg-app-surface border border-app-border rounded-xl shadow-md overflow-hidden"
    style="contain: layout paint;"
>
    <div
        class="flex items-center gap-2 px-4 py-3 bg-app-surface-hover border-b border-app-border"
    >
        <div class="flex gap-1.5">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div class="flex-1 mx-4">
            <div
                class="bg-app-bg rounded-md px-3 py-1.5 text-xs text-app-text-muted max-w-md mx-auto"
            >
                yumhero.app/plan
            </div>
        </div>
    </div>

    <div class="relative">
        <div class="flex flex-row bg-app-bg min-h-100 overflow-hidden">
            <div
                class="flex w-64 flex-col border-r border-app-border bg-app-surface/50 overflow-hidden shrink-0"
            >
                <div class="p-4 space-y-3 border-t border-app-border">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Zap size={14} class="text-amber-500" />
                            <span
                                class="text-[10px] font-bold uppercase tracking-wider text-app-text"
                                >Quick Recipes</span
                            >
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        {#each mockQuickRecipes as item}
                            <div
                                class="flex items-center gap-3 p-2 bg-app-surface border border-app-border/40 rounded-xl shadow-sm"
                            >
                                {#if item.image}
                                    <div
                                        class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-app-border/30 shadow-inner"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                {/if}
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-xs font-bold text-app-text leading-tight truncate"
                                    >
                                        {item.name}
                                    </p>
                                    <div
                                        class="flex items-center gap-2 mt-1"
                                    >
                                        <div
                                            class="flex items-center gap-1"
                                        >
                                            <Clock
                                                size={8}
                                                class="text-app-text-muted"
                                            />
                                            <span
                                                class="text-[8px] font-medium text-app-text-muted"
                                                >15m</span
                                            >
                                        </div>
                                        <span
                                            class="text-[8px] font-medium text-app-text-muted"
                                            >• {item.calorie}</span
                                        >
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="flex-1 min-w-0 p-4 md:p-6 overflow-x-auto">
                <div
                    class="grid bg-app-border border border-app-border rounded-lg overflow-hidden"
                    style="grid-template-columns: repeat(7, minmax(140px, 1fr)); width: max-content; min-width: 100%;"
                >
                    {#each mockPlan as day}
                        <div
                            class="flex flex-col bg-app-bg border-r border-app-border last:border-r-0"
                        >
                            <div
                                class="flex flex-col items-center justify-center py-2 bg-app-surface border-b border-app-border h-12"
                            >
                                <span class="text-xs font-black text-app-text"
                                    >{day.day}</span
                                >
                            </div>

                            {#each mealTypes as type}
                                <div
                                    class="flex flex-col border-b border-app-border last:border-0 bg-app-surface min-h-25"
                                >
                                    <div
                                        class="flex items-center p-2 bg-app-bg/10"
                                    >
                                        <div
                                            class="w-2 h-2 rounded-full mr-2 {getLabelColor(
                                                type,
                                            ).replace('text-', 'bg-')}"
                                        ></div>
                                        <span
                                            class="text-[8px] font-bold uppercase tracking-widest text-app-text-muted truncate"
                                            >{type}</span
                                        >
                                    </div>
                                    <div
                                        class="px-2 pb-2 flex flex-col gap-1.5"
                                    >
                                        {#each day.meals[type] as meal}
                                            <div
                                                class="px-3 py-1.5 rounded-xl border shadow-sm {getMealStyles(
                                                    type,
                                                )}"
                                            >
                                                <p
                                                    class="text-xs font-bold leading-tight line-clamp-2"
                                                >
                                                    {meal.name}
                                                </p>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
