<script lang="ts">
    import { CheckSquare, Square, Info } from "lucide-svelte";
    import { scale } from "svelte/transition";
    import { Fraction } from "$lib/utils/fraction";
    import type { Fraction as FractionType } from "$lib/utils/fraction";

    interface Props {
        name: string;
        amount?: FractionType | null;
        unit?: string | null;
        note?: string | null;
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
        note,
        checked = false,
        showCheckbox = true,
        showInfo = false,
        isExpanded = false,
        onToggle,
        onInfoClick,
    }: Props = $props();

    let numericAmount = $derived(Fraction.toNumber(amount));
</script>

<div
    class="relative group w-full flex items-start gap-2.5 p-1.5 sm:p-2.5 transition-all duration-200 text-left {checked
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
        <div class="shrink-0 mt-1">
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
                    class="text-app-text-muted/70 group-hover:text-app-primary transition-colors"
                />
            {/if}
        </div>
    {/if}

    <!-- Content -->
    <div class="flex-1 min-w-0">
        <div class="relative max-w-full">
            <div
                class="leading-tight transition-all {checked
                    ? 'opacity-50'
                    : ''}"
            >
                {#if numericAmount && numericAmount > 0}
                    <span
                        class="font-semibold text-app-primary tabular-nums align-baseline mr-1"
                    >
                        {Fraction.format(amount)}
                    </span>
                {/if}
                {#if unit}
                    <span
                        class="text-sm font-semibold text-app-primary/80 align-baseline mr-1"
                    >
                        {unit}
                    </span>
                {/if}
                <span
                    class="text-base font-semibold text-app-text align-baseline"
                >
                    {name}
                </span>
            </div>

            {#if checked}
                <div
                    class="absolute top-[55%] left-0 right-0 h-[1.5px] bg-app-text-muted/60 pointer-events-none"
                    transition:scale={{ duration: 200, start: 0 }}
                ></div>
            {/if}
        </div>

        {#if note && !checked}
            <p
                class="text-sm font-bold text-app-text-muted mt-1 pl-3 border-l-2 border-app-primary/20"
            >
                {note}
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
