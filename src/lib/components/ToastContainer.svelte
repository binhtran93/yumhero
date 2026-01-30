<script lang="ts">
    import { toasts } from "$lib/stores/toasts";
    import { fly, fade } from "svelte/transition";
    import { flip } from "svelte/animate";
    import {
        X,
        CheckCircle2,
        AlertCircle,
        Info,
        AlertTriangle,
    } from "lucide-svelte";

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return CheckCircle2;
            case "error":
                return AlertCircle;
            case "warning":
                return AlertTriangle;
            default:
                return Info;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case "success":
                return "text-green-500 bg-green-500/10 border-green-500/20";
            case "error":
                return "text-red-500 bg-red-500/10 border-red-500/20";
            case "warning":
                return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default:
                return "text-app-primary bg-app-primary/10 border-app-primary/20";
        }
    };
</script>

<div
    class="fixed top-safe right-0 md:right-4 z-[10000] w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none mt-4 md:mt-2"
>
    {#each $toasts as toast (toast.id)}
        {@const Icon = getIcon(toast.type)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, duration: 400, opacity: 0 }}
            out:fade={{ duration: 200 }}
            class="flex items-center gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md pointer-events-auto bg-white dark:bg-stone-900 {getColorClass(
                toast.type,
            )}"
        >
            <div class="shrink-0">
                <Icon size={20} />
            </div>

            <p class="flex-1 text-sm font-bold text-app-text leading-tight">
                {toast.message}
            </p>

            <button
                onclick={() => toasts.remove(toast.id)}
                class="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <X size={16} class="opacity-50" />
            </button>
        </div>
    {/each}
</div>

<style>
    .top-safe {
        top: env(safe-area-inset-top, 1rem);
    }
</style>
