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
        <div class="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 bg-app-primary/10 rounded-full text-app-primary text-xs font-bold uppercase tracking-widest mb-6"
                >
                    <Refrigerator size={14} />
                    <span>Real-time Inventory</span>
                </div>
                <h2
                    class="text-4xl md:text-5xl font-black text-app-text mb-6 tracking-tight leading-[1.1]"
                >
                    Stop wondering what's in the <span class="text-app-primary"
                        >back of the shelf.</span
                    >
                </h2>
                <p
                    class="text-lg text-app-text-muted mb-8 leading-relaxed font-medium"
                >
                    YumHero digitizes your kitchen, making sure every leftover
                    and ingredient has a purpose. No more forgotten chicken or
                    wasted veggies.
                </p>

                <div class="grid sm:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"
                            >
                                <History size={20} />
                            </div>
                            <h4 class="font-black text-app-text tracking-tight">
                                Leftover Tracking
                            </h4>
                        </div>
                        <p
                            class="text-[14px] text-app-text-muted leading-relaxed"
                        >
                            Tuesday's dinner becomes Wednesday's lunch with one
                            click. Smart alerts remind you before things expire.
                        </p>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"
                            >
                                <Zap size={20} />
                            </div>
                            <h4 class="font-black text-app-text tracking-tight">
                                Zero Waste Cleanup
                            </h4>
                        </div>
                        <p
                            class="text-[14px] text-app-text-muted leading-relaxed"
                        >
                            Quickly purge your digital fridge as you use or
                            discard items. One tap maintains a perfect digital
                            twin.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Fridge Mockup Demo -->
            <div class="relative">
                <!-- Decorative Glow behind mockup -->
                <div
                    class="absolute inset-0 bg-blue-400/5 blur-3xl -z-10 rounded-full scale-110"
                ></div>
                <FridgeMockup />
            </div>
        </div>
    </div>
</section>
