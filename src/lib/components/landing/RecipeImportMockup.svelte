<script lang="ts">
    import {
        Link as LinkIcon,
        ArrowRight,
        Loader2,
        CheckCircle2,
        Pointer,
        ChefHat,
        Clock,
        Users,
    } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";
    import { fade, slide, fly } from "svelte/transition";

    // --- Animation State ---
    let step = $state<"idle" | "pasting" | "importing" | "success">("idle");
    let inputValue = $state("");
    let handCursor: HTMLElement | undefined = $state();
    let container: HTMLElement | undefined = $state();

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

        // Hand Cursor Logic
        if (handCursor && container) {
            // Simplified cursor movement for this demo
            // Move to input -> Move to Button -> Move Away
            let x = 0;
            let y = 0;
            let scale = 1;
            let opacity = 0;

            const inputRect = { x: 200, y: 100 }; // rough positions relative to container
            const btnRect = { x: 340, y: 100 };

            // We can calculate cleaner positions if we had DOM refs to elements,
            // but fixed relative offsets work for a predictable mockup size.
            // Let's assume container is roughly 400-500px wide.
            // Input is on left, Button on right.

            if (elapsed > 500 && elapsed < 4500) {
                opacity = 1;
                if (elapsed < 1500) {
                    // Moving to input
                    const t = (elapsed - 500) / 1000;
                    x = 40 + t * 50; // Approaching input
                    y = 120 + t * 20;
                } else if (elapsed < 2500) {
                    // At input (typing)
                    x = 90;
                    y = 140;
                } else if (elapsed < 3500) {
                    // Move to button
                    const t = (elapsed - 2500) / 1000;
                    x = 90 + t * 240;
                    y = 140;
                } else {
                    // Click button
                    x = 330;
                    y = 140;
                    scale = elapsed > 3500 && elapsed < 3700 ? 0.85 : 1;
                }
            }

            handCursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            handCursor.style.opacity = String(opacity);
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
        bind:this={container}
        class="bg-app-surface border border-app-border rounded-2xl shadow-md overflow-hidden relative min-h-[320px] flex flex-col"
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
                    <div class="h-32 bg-orange-50 relative overflow-hidden">
                        <!-- Placeholder Food Art -->
                        <div
                            class="absolute inset-0 flex items-center justify-center text-orange-200"
                        >
                            <ChefHat size={48} />
                        </div>
                        <!-- Overlay Gradient -->
                        <div
                            class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent"
                        ></div>
                        <div
                            class="absolute bottom-3 left-4 text-white font-black text-lg drop-shadow-md"
                        >
                            Spicy Tacos
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

                            <div>
                                <h4
                                    class="text-[10px] uppercase font-bold text-app-text-muted mb-2"
                                >
                                    Instructions
                                </h4>
                                <div class="space-y-1.5">
                                    <div class="flex gap-2">
                                        <span
                                            class="text-[10px] font-bold text-app-primary bg-app-primary/10 w-4 h-4 rounded flex items-center justify-center shrink-0"
                                            >1</span
                                        >
                                        <p
                                            class="text-[10px] leading-relaxed text-app-text-muted"
                                        >
                                            Brown the beef in a skillet over
                                            medium-high heat...
                                        </p>
                                    </div>
                                    <div class="flex gap-2">
                                        <span
                                            class="text-[10px] font-bold text-app-primary bg-app-primary/10 w-4 h-4 rounded flex items-center justify-center shrink-0"
                                            >2</span
                                        >
                                        <p
                                            class="text-[10px] leading-relaxed text-app-text-muted"
                                        >
                                            Warm tortillas and serve with
                                            toppings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Hand Cursor -->
            <div
                bind:this={handCursor}
                class="absolute top-0 left-0 pointer-events-none z-[100] opacity-0 will-change-transform hidden md:block"
            >
                <Pointer
                    size={28}
                    fill="#fff"
                    strokeWidth={1.5}
                    class="drop-shadow-2xl -translate-x-1 -translate-y-1 text-black"
                />
            </div>
        </div>
    </div>
</div>
