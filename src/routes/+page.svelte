<script lang="ts">
    import LandingNav from "$lib/components/landing/LandingNav.svelte";
    import HeroSection from "$lib/components/landing/HeroSection.svelte";
    import DesktopMockup from "$lib/components/landing/DesktopMockup.svelte";
    import MobileMockup from "$lib/components/landing/MobileMockup.svelte";
    import FeatureFridge from "$lib/components/landing/FeatureFridge.svelte";
    import FeatureGrid from "$lib/components/landing/FeatureGrid.svelte";
    import JournalSection from "$lib/components/landing/JournalSection.svelte";
    import PricingSection from "$lib/components/landing/PricingSection.svelte";
    import FAQSection from "$lib/components/landing/FAQSection.svelte";
    import LandingFooter from "$lib/components/landing/LandingFooter.svelte";

    import { Monitor, Smartphone, Maximize2, X } from "lucide-svelte";
    import { fade, scale as svelteScale } from "svelte/transition";
    import { tick } from "svelte";

    let restartKey = $state(0);
    let activeMockup = $state("desktop");
    let isFullscreen = $state(false);

    let containerWidth = $state(0);
    const DESKTOP_BASE_WIDTH = 1400;
    let scale = $derived(
        containerWidth > 0 && containerWidth < DESKTOP_BASE_WIDTH
            ? containerWidth / DESKTOP_BASE_WIDTH
            : 1,
    );
    let mockupWidth = $derived(
        containerWidth > DESKTOP_BASE_WIDTH
            ? "100%"
            : `${DESKTOP_BASE_WIDTH}px`,
    );

    const switchMockup = (view: string) => {
        activeMockup = view;
        setTimeout(() => {
            document.getElementById("preview")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 50);
    };

    const handleSeeItInAction = () => {
        restartKey += 1;
        switchMockup("desktop");
    };
</script>

<div class="min-h-screen bg-app-bg text-app-text font-display">
    <LandingNav />
    <HeroSection onSeeItInAction={handleSeeItInAction} />

    <!-- Hero Mockup Section -->
    <section class="relative pb-10 md:pb-20 overflow-hidden">
        <!-- Persistent Atmosphere -->
        <div
            class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10"
        >
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_20%,rgba(251,146,60,0.08)_0%,transparent_60%)] blur-[100px]"
            ></div>
        </div>
        <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div id="preview" class="scroll-mt-20">
                <div
                    bind:clientWidth={containerWidth}
                    class="flex flex-col items-center w-full"
                >
                    <div
                        class="relative w-full flex items-start justify-center overflow-hidden"
                        style="height: {activeMockup === 'desktop'
                            ? 820 * scale
                            : 760}px; min-height: {activeMockup === 'desktop'
                            ? 0
                            : '720px'}; transition: height 0.4s ease-out;"
                    >
                        {#if activeMockup === "desktop"}
                            <button
                                class="absolute top-0 left-1/2 -translate-x-1/2 origin-top text-left {scale <
                                0.9
                                    ? 'cursor-zoom-in hover:opacity-95'
                                    : ''}"
                                style="width: {mockupWidth}; transform: scale({scale});"
                                in:fade={{ duration: 400 }}
                                onclick={() => {
                                    if (scale < 0.9) isFullscreen = true;
                                }}
                            >
                                <DesktopMockup
                                    {restartKey}
                                    forceShow={true}
                                    {scale}
                                />
                            </button>
                        {:else}
                            <div
                                class="absolute top-0 left-1/2 -translate-x-1/2"
                                in:fade={{ duration: 400 }}
                            >
                                <MobileMockup forceShow={true} />
                            </div>
                        {/if}

                        <!-- Shadow/Glow Effect -->
                        <div
                            class="absolute {activeMockup === 'desktop'
                                ? '-inset-4'
                                : 'inset-x-[20%] -inset-y-4'} bg-gradient-to-r from-app-primary/5 via-transparent to-app-primary/5 rounded-2xl -z-10 blur-xl opacity-50 transition-all duration-500"
                        ></div>
                    </div>

                    <!-- Mockup Switcher -->
                    <div
                        class="mt-12 inline-flex p-1 bg-app-surface border border-app-border rounded-full shadow-lg relative z-20"
                    >
                        <button
                            onclick={() => switchMockup("desktop")}
                            class="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 {activeMockup ===
                            'desktop'
                                ? 'bg-app-primary text-white shadow-md'
                                : 'text-app-text-muted hover:bg-app-primary/10 hover:text-app-primary'}"
                        >
                            <Monitor size={18} />
                            <span class="text-sm font-bold">Desktop View</span>
                        </button>
                        <button
                            onclick={() => switchMockup("mobile")}
                            class="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 {activeMockup ===
                            'mobile'
                                ? 'bg-app-primary text-white shadow-md'
                                : 'text-app-text-muted hover:bg-app-primary/10 hover:text-app-primary'}"
                        >
                            <Smartphone size={18} />
                            <span class="text-sm font-bold">Mobile View</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {#if isFullscreen}
        {@const landscapeScale = Math.min(
            1,
            ((typeof window !== "undefined" ? window.innerHeight : 1000) *
                0.95) /
                DESKTOP_BASE_WIDTH,
        )}
        <div
            class="fixed inset-0 z-[100] bg-app-bg flex items-center justify-center overflow-hidden"
            in:fade={{ duration: 300 }}
            out:fade={{ duration: 300 }}
        >
            <!-- Background Atmosphere -->
            <div class="absolute inset-0 pointer-events-none">
                <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15)_0%,transparent_70%)] blur-[120px]"
                ></div>
            </div>

            <!-- Close Button -->
            <button
                onclick={() => (isFullscreen = false)}
                class="absolute bottom-6 left-6 p-3 bg-app-surface border border-app-border text-app-text rounded-full shadow-2xl z-[110] hover:scale-110 active:scale-90 transition-all md:bottom-10 md:left-10"
            >
                <X size={24} />
            </button>

            <!-- Landscape Mockup -->
            <div
                class="landscape-mockup-wrapper w-screen h-screen flex items-center justify-center p-4"
                style="transform: rotate(90deg); width: 100vh; height: 100vw;"
            >
                <div
                    class="origin-center"
                    style="width: {DESKTOP_BASE_WIDTH}px; transform: scale({landscapeScale});"
                >
                    <DesktopMockup
                        {restartKey}
                        forceShow={true}
                        scale={landscapeScale}
                    />
                </div>
            </div>
        </div>
    {/if}

    <FeatureFridge />
    <FeatureGrid />
    <JournalSection />
    <PricingSection />
    <FAQSection />
    <LandingFooter />
</div>
