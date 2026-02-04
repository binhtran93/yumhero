<script lang="ts">
    import { Refrigerator, History, Zap, Trash2 } from "lucide-svelte";
    import FridgeMockup from "./FridgeMockup.svelte";
</script>

<section id="features" class="py-24 md:py-32 bg-white relative overflow-hidden">
    <!-- Atmosphere Glow -->
    <div
        class="absolute inset-0 pointer-events-none overflow-hidden opacity-50"
    >
        <div
            class="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full"
        ></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <!-- Header Text -->
            <div class="text-center lg:text-left order-1">
                <h2
                    class="text-3xl lg:text-5xl font-black text-app-text mb-6 tracking-tight leading-[1.1] text-center lg:text-left"
                >
                    Stop wondering what's in the <span class="text-app-primary"
                        >back of the shelf.</span
                    >
                </h2>
                <p
                    class="text-base md:text-lg text-app-text-muted mb-8 leading-relaxed font-medium text-center lg:text-left"
                >
                    YumHero digitizes your kitchen, making sure every leftover
                    and ingredient has a purpose. No more forgotten chicken or
                    wasted veggies.
                </p>
            </div>

            <!-- Fridge Mockup Demo (Between Desc and Cards on mobile) -->
            <div class="relative order-2 lg:order-3 lg:row-span-2">
                <!-- Decorative Glow behind mockup -->
                <div
                    class="absolute inset-0 bg-blue-400/5 blur-3xl -z-10 rounded-full scale-110"
                ></div>
                <FridgeMockup />
            </div>

            <!-- Feature Cards (Below demo on mobile, Below desc on desktop) -->
            <div class="order-3 lg:order-2">
                <div class="grid sm:grid-cols-2 gap-6">
                    <!-- Leftover Tracking Card -->
                    <div
                        class="group p-6 md:p-8 bg-app-surface border border-app-border rounded-2xl md:rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.98]"
                    >
                        <div
                            class="flex flex-col lg:flex-row items-center lg:items-center gap-4 mb-4 md:mb-5 lg:justify-start"
                        >
                            <div
                                class="w-10 h-10 md:w-11 md:h-11 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 transition-transform duration-500 group-hover:scale-110"
                            >
                                <History size={20} strokeWidth={2.5} />
                            </div>
                            <h4
                                class="text-base md:text-lg font-black text-app-text tracking-tight text-center lg:text-left"
                            >
                                Leftover Tracking
                            </h4>
                        </div>
                        <p
                            class="text-[13px] md:text-[14px] text-app-text-muted leading-relaxed font-medium text-center lg:text-left"
                        >
                            Tuesday's dinner becomes Wednesday's lunch with one
                            click. Smart alerts remind you before things expire.
                        </p>
                    </div>

                    <!-- Zero Waste Cleanup Card -->
                    <div
                        class="group p-6 md:p-8 bg-app-surface border border-app-border rounded-2xl md:rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
                    >
                        <div
                            class="flex flex-col lg:flex-row items-center lg:items-center gap-4 mb-4 md:mb-5 lg:justify-start"
                        >
                            <div
                                class="w-10 h-10 md:w-11 md:h-11 bg-emerald-50 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 transition-transform duration-500 group-hover:scale-110"
                            >
                                <Zap size={20} strokeWidth={2.5} />
                            </div>
                            <h4
                                class="text-base md:text-lg font-black text-app-text tracking-tight text-center lg:text-left"
                            >
                                Zero Waste Cleanup
                            </h4>
                        </div>
                        <p
                            class="text-[13px] md:text-[14px] text-app-text-muted leading-relaxed font-medium text-center lg:text-left"
                        >
                            Quickly purge your digital fridge as you use or
                            discard items. One tap maintains a perfect digital
                            twin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
