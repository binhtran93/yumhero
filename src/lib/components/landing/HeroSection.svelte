<script lang="ts">
    import { ArrowRight, ChevronDown } from "lucide-svelte";
    import { user } from "$lib/stores/auth";

    interface Props {
        onSeeItInAction?: () => void;
    }

    let { onSeeItInAction }: Props = $props();

    const planLink = $derived($user ? "/plan" : "/login");
</script>

<section class="relative pt-20 pb-6 md:pt-28 md:pb-10 overflow-hidden">
    <!-- Premium Glow Effects -->
    <div
        class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
    >
        <!-- Main amber glow (top-left) -->
        <div
            class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12)_0%,transparent_70%)] blur-[100px]"
        ></div>
        <!-- Secondary subtle glow (middle-right) -->
        <div
            class="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(194,65,12,0.08)_0%,transparent_70%)] blur-[80px]"
        ></div>
    </div>

    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
            class="max-w-4xl mx-auto text-center flex flex-col items-center relative"
        >
            <!-- Concentrated Heading Glow -->
            <div
                class="absolute top-[20%] left-1/2 -translate-x-1/2 w-[150%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.15)_0%,transparent_60%)] blur-[120px] -z-10 pointer-events-none"
            ></div>

            <h1
                class="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-app-text mb-4 tracking-tight relative"
            >
                Plan with Precision.<br />
                <span class="text-app-primary">Eat with Intent.</span>
            </h1>
            <p
                class="text-base md:text-xl text-app-text-muted mb-6 max-w-4xl mx-auto leading-relaxed"
            >
                Precision meal planning for the organized home. Track your
                fridge, log leftovers, and master your menu in a clean,
                high-performance interface.
            </p>
            <div class="flex items-center justify-center gap-3">
                <button
                    onclick={onSeeItInAction}
                    class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-app-surface text-app-text font-bold rounded-full border border-app-border hover:bg-app-surface-hover transition-all active:scale-95 text-sm md:text-lg md:px-6 md:py-3 shadow-sm whitespace-nowrap"
                >
                    Demo
                    <ChevronDown size={16} class="md:w-5 md:h-5" />
                </button>
                <a
                    href={planLink}
                    class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-app-primary text-white font-bold rounded-full hover:bg-app-primary/90 transition-all active:scale-95 text-sm md:text-lg md:px-6 md:py-3 shadow-lg hover:shadow-app-primary/25 whitespace-nowrap"
                >
                    Start Planning
                    <ArrowRight size={16} class="md:w-5 md:h-5" />
                </a>
            </div>
        </div>
    </div>
</section>
