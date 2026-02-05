<script lang="ts">
    import {
        Link as LinkIcon,
        ArrowRight,
        Loader2,
        CheckCircle2,
        ChefHat,
        Clock,
        Users,
    } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";
    import { fade, slide, fly } from "svelte/transition";

    // --- Animation State ---
    let step = $state<"idle" | "pasting" | "importing" | "success">("idle");
    let inputValue = $state("");

    // Animation constants
    const TARGET_URL = "https://example.com/spicy-tacos";
    const ANIMATION_LOOP_DURATION = 8000;

    let animationFrameId: number;
    let startTime: number | null = null;

    function resetDemo() {
        step = "idle";
        inputValue = "";
    }

    function animate(timestamp: number) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) % ANIMATION_LOOP_DURATION;

        // Timeline logic
        if (elapsed < 1000) {
            // Wait / Idle
            if (step !== "idle") resetDemo();
        } else if (elapsed < 2500) {
            // Pasting phase
            if (step === "idle") step = "pasting";
            const pasteProgress = (elapsed - 1000) / 1500;
            const charCount = Math.floor(pasteProgress * TARGET_URL.length);
            inputValue = TARGET_URL.slice(0, charCount);
        } else if (elapsed < 4000) {
            // Click Import
            inputValue = TARGET_URL; // Verify full text
            if (step === "pasting") step = "importing"; // Trigger loading
        } else if (elapsed < 7000) {
            // Show Success
            if (step === "importing" && elapsed > 4800) step = "success";
        } else {
            // Fade out / Reset
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    onMount(() => {
        animationFrameId = requestAnimationFrame(animate);
    });

    onDestroy(() => {
        cancelAnimationFrame(animationFrameId);
    });
</script>

<div class="w-full max-w-4xl mx-auto">
    <div
        class="bg-app-surface border border-app-border rounded-2xl shadow-md overflow-hidden relative h-[460px] flex flex-col"
    >
        <!-- Header / Browser Bar -->
        <div
            class="bg-white border-b border-app-border px-4 py-3 flex items-center gap-3"
        >
            <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-red-400/20"></div>
                <div class="w-3 h-3 rounded-full bg-amber-400/20"></div>
                <div class="w-3 h-3 rounded-full bg-green-400/20"></div>
            </div>
            <div
                class="flex-1 bg-gray-50 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-app-text-muted"
            >
                <LinkIcon size={12} />
                <span class="truncate">yumhero.com/recipes/import</span>
            </div>
        </div>

        <!-- Main Content area -->
        <div
            class="p-6 md:p-8 flex-1 flex flex-col items-center justify-center relative"
        >
            {#if step !== "success"}
                <div
                    class="w-full max-w-md mx-auto space-y-6"
                    out:fade={{ duration: 200 }}
                >
                    <div class="text-center space-y-2">
                        <h3 class="text-xl font-black text-app-text">
                            Import a Recipe
                        </h3>
                        <p class="text-sm text-app-text-muted">
                            Paste a URL to magically extract ingredients.
                        </p>
                    </div>

                    <div class="flex gap-2">
                        <div class="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                placeholder="Paste URL here..."
                                readonly
                                class="w-full px-4 py-3 bg-white border border-app-border rounded-xl text-sm font-medium text-app-text shadow-sm focus:outline-none focus:ring-2 focus:ring-app-primary/20 transition-all {step ===
                                'pasting'
                                    ? 'ring-2 ring-app-primary/20 border-app-primary'
                                    : ''}"
                            />
                            <!-- Text Cursor -->
                            {#if step === "pasting"}
                                <div
                                    class="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-app-primary animate-pulse"
                                ></div>
                            {/if}
                        </div>
                        <button
                            class="px-5 py-3 bg-app-primary text-white font-bold rounded-xl shadow-lg shadow-app-primary/20 flex items-center gap-2 transition-all active:scale-95 {step ===
                            'importing'
                                ? 'opacity-80'
                                : ''}"
                        >
                            {#if step === "importing"}
                                <Loader2 size={18} class="animate-spin" />
                            {:else}
                                <ArrowRight size={18} />
                            {/if}
                        </button>
                    </div>
                </div>
            {:else}
                <!-- Success Result Card -->
                <div
                    class="w-full max-w-sm mx-auto bg-white border border-app-border rounded-2xl shadow-lg overflow-hidden"
                    in:slide={{ duration: 400, axis: "y" }}
                >
                    <div class="h-40 relative overflow-hidden">
                        <img
                            src="/mockup/bolognese.png"
                            alt="Spicy Tacos"
                            class="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] scale-110 group-hover:scale-100"
                        />
                        <!-- Overlay Gradient (Deeper for better contrast) -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                        ></div>
                        <div class="absolute bottom-4 left-5 text-white">
                            <div
                                class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1"
                            >
                                New Recipe
                            </div>
                            <h3
                                class="font-black text-2xl drop-shadow-lg leading-tight uppercase tracking-tight"
                            >
                                Spicy Tacos
                            </h3>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div
                            class="flex items-center gap-4 text-xs font-bold text-app-text-muted"
                        >
                            <div class="flex items-center gap-1">
                                <Clock size={14} /> 20m
                            </div>
                            <div class="flex items-center gap-1">
                                <Users size={14} /> 2 servings
                            </div>
                            <div
                                class="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"
                            >
                                <CheckCircle2 size={12} /> Imported
                            </div>
                        </div>

                        <div class="space-y-3 pt-2">
                            <div>
                                <h4
                                    class="text-[10px] uppercase font-bold text-app-text-muted mb-2"
                                >
                                    Ingredients
                                </h4>
                                <ul class="space-y-1.5">
                                    <li
                                        class="flex items-center gap-2 text-xs font-medium text-app-text"
                                    >
                                        <div
                                            class="w-1 h-1 rounded-full bg-app-primary"
                                        ></div>
                                        1lb Ground beef
                                    </li>
                                    <li
                                        class="flex items-center gap-2 text-xs font-medium text-app-text"
                                    >
                                        <div
                                            class="w-1 h-1 rounded-full bg-app-primary"
                                        ></div>
                                        8 Corn tortillas
                                    </li>
                                    <li
                                        class="flex items-center gap-2 text-xs font-medium text-app-text"
                                    >
                                        <div
                                            class="w-1 h-1 rounded-full bg-app-primary"
                                        ></div>
                                        Taco seasoning
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
