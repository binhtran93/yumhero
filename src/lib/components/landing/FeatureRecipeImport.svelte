<script lang="ts">
    import { Globe, Wand2 } from "lucide-svelte";
    import RecipeImportMockup from "./RecipeImportMockup.svelte";
</script>

<section
    id="features-import"
    class="py-24 md:py-32 bg-[#f9fafc] relative overflow-hidden"
>
    <!-- Atmosphere Glow -->
    <div
        class="absolute inset-0 pointer-events-none overflow-hidden opacity-50"
    >
        <div
            class="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-orange-500/5 blur-[100px] rounded-full"
        ></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 relative z-10">
        <div
            class="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-x-24 lg:gap-y-12 lg:grid-rows-[auto_1fr] lg:items-start"
        >
            <!-- Header Text -->
            <div class="text-center lg:text-left lg:col-start-2 lg:row-start-1">
                <h2
                    class="text-3xl lg:text-5xl font-black text-app-text mb-6 tracking-tight leading-[1.1] text-center lg:text-left"
                >
                    Import recipes in <span class="text-app-primary"
                        >seconds.</span
                    >
                </h2>
                <p
                    class="text-base md:text-lg text-app-text-muted leading-relaxed font-medium text-center lg:text-left"
                >
                    Stop scrolling through life stories. Paste a URL and get
                    just the ingredients and instructions, instantly cleaned and
                    formatted.
                </p>
            </div>

            <!-- Mockup Demo -->
            <div class="relative lg:col-start-1 lg:row-start-1 lg:row-span-2">
                <!-- Decorative Glow behind mockup -->
                <div
                    class="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full scale-110"
                ></div>
                <RecipeImportMockup />
            </div>

            <!-- Feature Cards -->
            <div
                class="grid sm:grid-cols-2 gap-6 lg:col-start-2 lg:row-start-2"
            >
                <!-- Universal Import Card -->
                <div
                    class="group p-8 bg-app-surface border border-app-border rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 active:scale-[0.98]"
                >
                    <div class="flex items-center gap-4 mb-5">
                        <div
                            class="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 transition-transform duration-500 group-hover:scale-110"
                        >
                            <Globe size={20} strokeWidth={2.5} />
                        </div>
                        <h3
                            class="text-lg font-black text-app-text tracking-tight"
                        >
                            Universal Import
                        </h3>
                    </div>
                    <p
                        class="text-[14px] text-app-text-muted leading-relaxed font-medium"
                    >
                        Works with thousands of food blogs. No integration
                        needed.
                    </p>
                </div>

                <!-- Smart Parsing Card -->
                <div
                    class="group p-8 bg-app-surface border border-app-border rounded-[32px] shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 active:scale-[0.98]"
                >
                    <div class="flex items-center gap-4 mb-5">
                        <div
                            class="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 transition-transform duration-500 group-hover:scale-110"
                        >
                            <Wand2 size={20} strokeWidth={2.5} />
                        </div>
                        <h3
                            class="text-lg font-black text-app-text tracking-tight"
                        >
                            Smart Parsing
                        </h3>
                    </div>
                    <p
                        class="text-[14px] text-app-text-muted leading-relaxed font-medium"
                    >
                        Automatically detects servings, prep time, and
                        categorizes ingredients for easy shopping.
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>
