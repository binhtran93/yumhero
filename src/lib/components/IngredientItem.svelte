<script lang="ts">
    import { CheckSquare, Square, Info } from "lucide-svelte";
    import { scale } from "svelte/transition";
    import { formatAmount } from "$lib/utils/shopping";

    interface Props {
        name: string;
        amount?: number | null;
        unit?: string | null;
        notes?: string | null;
        checked?: boolean;
        showCheckbox?: boolean;
        showInfo?: boolean;
        isExpanded?: boolean;
        onToggle?: () => void;
        onInfoClick?: () => void;
    }

    let {
        name,
        amount,
        unit,
        notes,
        checked = false,
        showCheckbox = true,
        showInfo = false,
        isExpanded = false,
        onToggle,
        onInfoClick,
    }: Props = $props();
</script>

<div
    class="relative group w-full flex items-start gap-3 p-3 transition-all duration-200 text-left {checked
        ? 'opacity-80'
        : 'hover:bg-app-surface-hover/80'}"
    role="button"
    tabindex="0"
    onclick={onToggle}
    onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle?.();
        }
    }}
>
    <!-- Checkbox (Optional) -->
    {#if showCheckbox}
        <div class="shrink-0 mt-0.5">
            {#if checked}
                <div
                    in:scale={{ duration: 200, start: 0.8 }}
                    class="text-app-primary"
                >
                    <CheckSquare
                        size={22}
                        fill="currentColor"
                        class="fill-app-primary/10"
                    />
                </div>
            {:else}
                <Square
                    size={22}
                    class="text-app-border-strong group-hover:text-app-primary transition-colors"
                />
            {/if}
        </div>
    {/if}

    <!-- Content -->
    <div class="flex-1 min-w-0">
        <div
            class="leading-none {checked
                ? 'line-through opacity-80'
                : ''} transition-all"
        >
            {#if amount && amount > 0}
                <span
                    class="text-lg font-black text-app-primary tabular-nums align-baseline"
                >
                    {formatAmount(amount)}
                </span>
            {/if}
            {#if unit}
                <span
                    class="text-sm font-black text-app-primary/80 ml-0.5 mr-1 align-baseline"
                >
                    {unit}
                </span>
            {/if}
            <span
                class="text-base font-bold text-app-text capitalize align-baseline"
            >
                {name}
            </span>
        </div>

        {#if notes && !checked}
            <p
                class="text-sm font-bold text-app-text-muted mt-1 pl-3 border-l-2 border-app-primary/20"
            >
                {notes}
            </p>
        {/if}
    </div>

    <!-- Info/Expand Button (Optional) -->
    {#if showInfo}
        <button
            class="shrink-0 p-1.5 text-app-text-muted hover:text-app-primary hover:bg-app-primary/10 rounded-lg transition-all {isExpanded
                ? 'bg-app-primary/10 text-app-primary'
                : ''}"
            onclick={(e) => {
                e.stopPropagation();
                onInfoClick?.();
            }}
            aria-label="View details"
        >
            <Info size={18} strokeWidth={2.5} />
        </button>
    {/if}
</div>
