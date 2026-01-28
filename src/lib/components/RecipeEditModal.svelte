<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import {
        Loader2,
        Plus,
        Trash2,
        X,
        AlertCircle,
        Camera,
        Check,
        Link,
        ChevronDown,
        ChevronUp,
        Clock,
        Utensils,
        ChefHat,
        AlignLeft,
        Image as ImageIcon,
    } from "lucide-svelte";
    import { twMerge } from "tailwind-merge";
    import type { Recipe, Ingredient } from "$lib/types";
    import {
        addRecipe,
        userTags,
        userRecipes,
        addTag,
    } from "$lib/stores/userData";
    import { DEFAULT_UNITS } from "$lib/constants";
    import { fade, slide } from "svelte/transition";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        initialRecipe?: Partial<Recipe>; // For editing existing recipe
        initialShowAdvanced?: boolean;
    }

    let {
        isOpen,
        onClose,
        initialRecipe,
        initialShowAdvanced = false,
    }: Props = $props();

    // Form State
    let title = $state("");
    let url = $state("");
    let description = $state("");
    let image = $state("");

    // Times (in minutes internally, but UI splits to H/M)
    let prepHours = $state(0);
    let prepMinutes = $state(0);
    let cookHours = $state(0);
    let cookMinutes = $state(0);

    let servings = $state(4);
    let yields = $state("");

    let ingredients = $state<Ingredient[]>([]);
    let directions = $state(""); // Keeping as string for textarea simplicity, split by newline on save if needed
    let prepNotes = $state("");

    let selectedTags = $state<string[]>([]);
    let course = $state("");
    let cuisine = $state("");
    let mainIngredient = $state("");

    // UI State
    let showAdvanced = $state(false);
    let tagNameInput = $state("");

    // Helpers
    const ensureTagId = async (label: string): Promise<string> => {
        const normalized = label.trim();
        if (!normalized) return "";

        const existing = $userTags.data.find(
            (t) => t.label.toLowerCase() === normalized.toLowerCase(),
        );
        if (existing) return existing.id;

        return await addTag(normalized);
    };

    const handleTagKeydown = async (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!tagNameInput.trim()) return;

            try {
                const id = await ensureTagId(tagNameInput);
                if (!selectedTags.includes(id)) {
                    selectedTags = [...selectedTags, id];
                }
                tagNameInput = "";
            } catch (err) {
                console.error("Failed to add tag", err);
            }
        }
    };

    const removeTag = (id: string) => {
        selectedTags = selectedTags.filter((t) => t !== id);
    };

    function getTagName(tagId: string) {
        return $userTags.data.find((t) => t.id === tagId)?.label || tagId;
    }

    // Extraction State
    let isExtracting = $state(false);
    let extractionError = $state<string | null>(null);
    let extractionSuccess = $state(false);

    // Initializer
    $effect(() => {
        if (isOpen) {
            resetForm();
            if (initialRecipe) {
                // Populate if editing
                populateForm(initialRecipe);
            }
        }
    });

    const resetForm = () => {
        title = "";
        url = "";
        description = "";
        image = "";
        prepHours = 0;
        prepMinutes = 0;
        cookHours = 0;
        cookMinutes = 0;
        servings = 4;
        yields = "";
        ingredients = [];
        directions = "";
        prepNotes = "";
        selectedTags = [];
        course = "";
        cuisine = "";
        mainIngredient = "";
        showAdvanced = initialShowAdvanced;
        isExtracting = false;
        extractionError = null;
        extractionSuccess = false;
    };

    const populateForm = (data: Partial<Recipe>) => {
        title = data.title || "";
        url = data.sourceUrl || "";
        description = data.description || "";
        image = data.image || "";

        if (data.prepTime) {
            prepHours = Math.floor(data.prepTime / 60);
            prepMinutes = data.prepTime % 60;
        }
        if (data.cookTime) {
            cookHours = Math.floor(data.cookTime / 60);
            cookMinutes = data.cookTime % 60;
        }

        servings = data.servings || 4;
        yields = data.yields || "";
        ingredients = data.ingredients ? [...data.ingredients] : [];
        directions = Array.isArray(data.instructions)
            ? data.instructions.join("\n\n")
            : data.instructions || "";
        prepNotes = data.prepNotes || "";
        selectedTags = data.tags ? [...data.tags] : [];
        course = data.course || "";
        cuisine = data.cuisine || "";
        mainIngredient = data.mainIngredient || "";
    };

    const handleExtract = async () => {
        if (!url) return;

        isExtracting = true;
        extractionError = null;
        extractionSuccess = false;

        try {
            const res = await fetch("/api/extract-recipe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to extract recipe");
            }

            const { recipe } = await res.json();

            // Process tags from extraction
            const extractedTagIds: string[] = [];
            if (recipe.tags && Array.isArray(recipe.tags)) {
                for (const tagLabel of recipe.tags) {
                    try {
                        const id = await ensureTagId(tagLabel);
                        extractedTagIds.push(id);
                    } catch (e) {
                        console.error("Failed to create tag", tagLabel, e);
                    }
                }
            }
            recipe.tags = extractedTagIds;

            populateForm({ ...recipe, sourceUrl: url }); // Update form with extracted data
            extractionSuccess = true;
        } catch (e: any) {
            console.error(e);
            extractionError = e.message;
        } finally {
            isExtracting = false;
        }
    };

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            alert("Title is required");
            return;
        }

        const totalTime =
            prepHours * 60 + prepMinutes + (cookHours * 60 + cookMinutes);
        // Convert metadata to tags
        const extraTags = [course, cuisine, mainIngredient];
        const extraTagIds = [];
        for (const label of extraTags) {
            if (label && label.trim()) {
                extraTagIds.push(await ensureTagId(label));
            }
        }

        // Ensure all selectedTags are IDs (migrate legacy strings)
        const processedSelectedTags = [];
        for (const tag of selectedTags) {
            // Check if it's already a valid ID in our store
            const isId = $userTags.data.some((t) => t.id === tag);
            if (isId) {
                processedSelectedTags.push(tag);
            } else {
                // If not an ID, treat as label and ensure it exists
                processedSelectedTags.push(await ensureTagId(tag));
            }
        }

        const finalTags = [
            ...new Set([...processedSelectedTags, ...extraTagIds]),
        ];

        const newRecipe: Omit<Recipe, "id"> = {
            title,
            image: image || "/placeholder-recipe.jpg", // Default image if none
            description,
            sourceUrl: url,
            prepTime: prepHours * 60 + prepMinutes,
            cookTime: cookHours * 60 + cookMinutes,
            totalTime,
            servings,
            yields,
            ingredients,
            instructions: directions
                .split("\n")
                .filter((line) => line.trim().length > 0),
            prepNotes,
            tags: finalTags,
            course,
            cuisine,
            mainIngredient,
        };

        try {
            await addRecipe(newRecipe);
            onClose();
        } catch (e) {
            console.error("Failed to save recipe", e);
            alert("Failed to save recipe");
        }
    };

    // Ingredient Management
    const addIngredient = () => {
        ingredients = [
            ...ingredients,
            { amount: "", unit: "", name: "", notes: "" },
        ];
    };

    const removeIngredient = (index: number) => {
        ingredients = ingredients.filter((_, i) => i !== index);
    };
</script>

<Modal {isOpen} {onClose} class="max-w-4xl h-[90vh]" showCloseButton={false}>
    <!-- Header -->
    {#snippet header()}
        <div
            class="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-surface sticky top-0 z-20 shadow-sm"
        >
            <div class="flex items-center gap-3">
                <div class="bg-primary-100 p-2 rounded-xl text-primary-600">
                    <ChefHat size={24} />
                </div>
                <h2
                    class="text-xl font-display font-bold text-text-primary tracking-tight"
                >
                    {initialRecipe ? "Edit Recipe" : "Create New Recipe"}
                </h2>
            </div>
            <div class="flex items-center gap-3">
                <button
                    onclick={onClose}
                    class="px-5 py-2.5 text-text-secondary font-bold hover:bg-bg-surface-hover rounded-xl transition-all text-sm"
                >
                    Cancel
                </button>
                <button
                    onclick={handleSave}
                    class="px-6 py-2.5 bg-action-primary text-white font-bold rounded-xl hover:bg-action-primary/90 transition-all text-sm shadow-md hover:shadow-lg active:scale-95"
                >
                    Save Recipe
                </button>
            </div>
        </div>
    {/snippet}

    <!-- Content -->
    <div class="p-6 md:p-8 space-y-10 bg-bg-default/30 min-h-full">
        <!-- Alerts -->
        {#if isExtracting}
            <div
                class="p-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl flex items-center gap-3 shadow-sm"
                in:slide
            >
                <Loader2 class="animate-spin" size={20} />
                <span class="font-medium"
                    >Clipping recipe details from URL...</span
                >
            </div>
        {/if}

        {#if extractionSuccess}
            <div
                class="p-4 bg-green-50 text-green-800 border border-green-100 rounded-2xl flex items-start gap-3 shadow-sm"
                in:slide
            >
                <Check class="shrink-0 mt-0.5 text-green-600" size={20} />
                <div class="text-sm">
                    <p class="font-bold text-base">
                        Recipe clipped successfully!
                    </p>
                    <p>Review the details below before saving.</p>
                </div>
                <button
                    onclick={() => (extractionSuccess = false)}
                    class="ml-auto text-green-600 hover:text-green-800"
                    ><X size={18} /></button
                >
            </div>
        {/if}

        {#if extractionError}
            <div
                class="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm"
                in:slide
            >
                <AlertCircle class="shrink-0 mt-0.5" size={20} />
                <div class="text-sm">
                    <p class="font-bold text-base">Extraction failed</p>
                    <p>{extractionError}</p>
                </div>
                <button
                    onclick={() => (extractionError = null)}
                    class="ml-auto text-red-600 hover:text-red-800"
                    ><X size={18} /></button
                >
            </div>
        {/if}

        <!-- MAIN SECTION: Essential Info -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left: Photo Upload -->
            <div class="lg:col-span-4 space-y-4">
                <div
                    class="aspect-square w-full rounded-3xl bg-bg-surface border-2 border-dashed border-border-default flex flex-col items-center justify-center relative overflow-hidden group hover:border-action-primary/50 transition-all shadow-sm"
                >
                    {#if image}
                        <img
                            src={image}
                            alt="Recipe Preview"
                            class="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                        >
                            <button
                                onclick={() => {
                                    /* TODO: File Upload logic */
                                }}
                                class="px-5 py-2.5 bg-white text-text-primary rounded-xl shadow-lg font-bold text-xs uppercase tracking-wide transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                >Change Photo</button
                            >
                        </div>
                    {:else}
                        <div
                            class="w-20 h-20 rounded-full bg-bg-accent-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-text-secondary/50 group-hover:text-action-primary/50"
                        >
                            <ImageIcon size={40} />
                        </div>
                        <span
                            class="text-sm text-text-secondary font-bold group-hover:text-action-primary transition-colors"
                            >Upload Photo</span
                        >
                        <span class="text-xs text-text-secondary/50 mt-1"
                            >or drag and drop</span
                        >
                    {/if}
                </div>
                <!-- Quick URL Input used to import image (as placeholder logic) -->
                <div class="relative">
                    <Link
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
                        size={14}
                    />
                    <input
                        type="text"
                        bind:value={image}
                        placeholder="Or paste image URL"
                        class="w-full pl-9 pr-3 py-2 bg-bg-surface border border-border-default rounded-lg text-xs focus:border-action-primary outline-none transition-all"
                    />
                </div>
            </div>

            <!-- Right: Core Fields -->
            <div class="lg:col-span-8 space-y-6">
                <!-- Title -->
                <div class="space-y-1.5">
                    <label
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                        for="title"
                        >Title <span class="text-red-500">*</span></label
                    >
                    <input
                        id="title"
                        type="text"
                        bind:value={title}
                        class="w-full px-5 py-3.5 bg-bg-surface border border-border-default rounded-2xl focus:border-action-primary focus:ring-4 focus:ring-action-primary/10 outline-none transition-all font-display font-bold text-xl placeholder:text-text-secondary/30 shadow-sm"
                        placeholder="e.g. Grandma's Famous Apple Pie"
                        autoFocus
                    />
                </div>

                <!-- Description -->
                <div class="space-y-1.5">
                    <label
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                        for="desc">Description</label
                    >
                    <textarea
                        id="desc"
                        rows="3"
                        bind:value={description}
                        class="w-full px-5 py-3.5 bg-bg-surface border border-border-default rounded-2xl focus:border-action-primary focus:ring-4 focus:ring-action-primary/10 outline-none transition-all resize-none text-sm placeholder:text-text-secondary/30 shadow-sm leading-relaxed"
                        placeholder="Briefly describe what makes this dish special..."
                    ></textarea>
                </div>

                <!-- Servings & Yields (Row) -->
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-1.5">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                            for="servings">Servings</label
                        >
                        <div class="relative">
                            <Utensils
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50"
                                size={16}
                            />
                            <input
                                id="servings"
                                type="number"
                                bind:value={servings}
                                class="w-full pl-11 pr-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 outline-none transition-all font-bold text-sm shadow-sm"
                                placeholder="4"
                            />
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                            for="yields"
                            >Yields <span
                                class="font-normal text-text-secondary/50 lowercase"
                                >(optional)</span
                            ></label
                        >
                        <input
                            id="yields"
                            type="text"
                            bind:value={yields}
                            class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 outline-none transition-all font-medium text-sm shadow-sm"
                            placeholder="e.g. 12 cookies"
                        />
                    </div>
                </div>
            </div>
        </div>

        <hr class="border-border-default/50" />

        <!-- Ingredients Section -->
        <div class="space-y-5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-green-100 text-green-700 rounded-lg">
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <h3
                        class="text-lg font-display font-bold text-text-primary"
                    >
                        Ingredients
                    </h3>
                </div>
            </div>

            <!-- List Header -->
            <div
                class="hidden md:flex items-center gap-4 px-4 py-2 bg-bg-accent-subtle rounded-lg border border-border-default/50 text-[10px] uppercase font-bold text-text-secondary tracking-wider"
            >
                <span class="w-16">Qty</span>
                <span class="w-20">Unit</span>
                <span class="flex-1">Ingredient</span>
                <span class="w-1/3">Notes</span>
                <span class="w-6"></span>
            </div>

            <div class="space-y-3">
                {#each ingredients as ing, i}
                    <div
                        class="flex flex-col md:flex-row items-start md:items-center gap-2 group bg-bg-surface md:bg-transparent p-3 md:p-0 rounded-xl border border-border-default md:border-none shadow-sm md:shadow-none hover:bg-bg-surface/50 transition-colors"
                    >
                        <div class="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                bind:value={ing.amount}
                                class="w-full md:w-16 px-3 py-2.5 bg-bg-surface border border-border-default rounded-xl md:rounded-lg text-sm font-bold focus:border-action-primary outline-none shadow-sm focus:ring-2 focus:ring-action-primary/10 placeholder:font-normal"
                                placeholder="1"
                            />
                            <input
                                type="text"
                                list="units"
                                bind:value={ing.unit}
                                class="w-full md:w-20 px-3 py-2.5 bg-bg-surface border border-border-default rounded-xl md:rounded-lg text-sm focus:border-action-primary outline-none shadow-sm focus:ring-2 focus:ring-action-primary/10"
                                placeholder="cup"
                            />
                            <datalist id="units">
                                {#each DEFAULT_UNITS as u}
                                    <option value={u}>{u}</option>
                                {/each}
                            </datalist>
                        </div>

                        <input
                            type="text"
                            bind:value={ing.name}
                            class="w-full flex-1 px-3 py-2.5 bg-bg-surface border border-border-default rounded-xl md:rounded-lg text-sm font-medium focus:border-action-primary outline-none shadow-sm focus:ring-2 focus:ring-action-primary/10"
                            placeholder="Ingredient name (e.g. Flour)"
                        />

                        <div class="flex gap-2 w-full md:w-1/3">
                            <input
                                type="text"
                                bind:value={ing.notes}
                                class="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-xl md:rounded-lg text-sm text-text-secondary focus:text-text-primary focus:border-action-primary outline-none shadow-sm focus:ring-2 focus:ring-action-primary/10"
                                placeholder="Notes (e.g. sifted)"
                            />

                            <button
                                onclick={() => removeIngredient(i)}
                                class="w-10 md:w-6 flex items-center justify-center text-text-secondary hover:text-red-500 bg-bg-accent-subtle md:bg-transparent rounded-lg md:rounded-none h-10 md:h-auto transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>

            <button
                onclick={addIngredient}
                class="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-border-default hover:border-action-primary/50 hover:bg-bg-surface-hover text-text-primary hover:text-action-primary font-bold text-sm rounded-xl border-dashed transition-all shadow-sm"
            >
                <Plus size={16} /> Add Ingredient
            </button>
        </div>

        <hr class="border-border-default/50" />

        <!-- Instructions Section -->
        <div class="space-y-4">
            <div class="flex items-center gap-2">
                <div class="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <AlignLeft size={18} strokeWidth={3} />
                </div>
                <h3 class="text-lg font-display font-bold text-text-primary">
                    Instructions
                </h3>
            </div>

            <div class="relative group">
                <textarea
                    bind:value={directions}
                    rows="8"
                    class="w-full px-6 py-5 bg-bg-surface border border-border-default rounded-2xl focus:border-action-primary focus:ring-4 focus:ring-action-primary/10 outline-none transition-all text-sm leading-relaxed shadow-sm font-medium text-text-primary placeholder:text-text-secondary/30 resize-y"
                    placeholder="Step 1: Preheat your oven to 350°F...&#10;&#10;Step 2: Mix the dry ingredients..."
                ></textarea>
                <div
                    class="absolute right-4 bottom-4 text-[10px] font-bold uppercase tracking-wider text-text-secondary/30 pointer-events-none group-focus-within:text-action-primary/50 transition-colors"
                >
                    Markdown Supported
                </div>
            </div>
        </div>

        <!-- ADVANCED SECTION: Collapsible -->
        <div
            class="rounded-2xl border border-border-default overflow-hidden bg-bg-surface/50"
        >
            <button
                onclick={() => (showAdvanced = !showAdvanced)}
                class="w-full flex items-center justify-between px-6 py-4 bg-bg-surface hover:bg-bg-surface-hover transition-colors text-left"
            >
                <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                        {#if showAdvanced}<ChevronUp
                                size={18}
                                strokeWidth={3}
                            />{:else}<ChevronDown
                                size={18}
                                strokeWidth={3}
                            />{/if}
                    </div>
                    <div>
                        <h3
                            class="font-display font-bold text-text-primary text-base"
                        >
                            Advanced Options
                        </h3>
                        <p class="text-xs text-text-secondary font-medium">
                            Import from URL, detailed times, categories, and
                            prep notes
                        </p>
                    </div>
                </div>

                <span
                    class="text-xs font-bold text-action-primary uppercase tracking-wider bg-action-primary/10 px-3 py-1 rounded-full"
                >
                    {showAdvanced ? "Hide" : "Show"}
                </span>
            </button>

            {#if showAdvanced}
                <div
                    class="p-6 md:p-8 space-y-8 border-t border-border-default bg-bg-surface/30"
                    transition:slide
                >
                    <!-- Import from URL -->
                    <div class="space-y-2">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                            for="url">Import from Web</label
                        >
                        <div class="relative flex gap-2">
                            <div class="relative flex-1">
                                <Link
                                    class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50"
                                    size={16}
                                />
                                <input
                                    id="url"
                                    type="text"
                                    bind:value={url}
                                    class="w-full pl-11 pr-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 outline-none transition-all text-sm shadow-sm"
                                    placeholder="Paste a recipe URL to automatically extract details..."
                                    onkeydown={(e) =>
                                        e.key === "Enter" && handleExtract()}
                                />
                            </div>
                            <button
                                onclick={handleExtract}
                                disabled={isExtracting || !url}
                                class="px-6 py-3 bg-text-primary text-bg-surface font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity whitespace-nowrap shadow-md"
                            >
                                {isExtracting ? "Importing..." : "Import"}
                            </button>
                        </div>
                        <p class="text-xs text-text-secondary ml-1">
                            Paste a URL from a recipe site to autofill the form.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Left Col -->
                        <div class="space-y-8">
                            <!-- Time -->
                            <div class="space-y-3">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1 flex items-center gap-1.5"
                                    ><Clock size={12} /> Time Estimates</label
                                >

                                <div class="grid grid-cols-2 gap-4">
                                    <!-- Prep -->
                                    <div class="space-y-2">
                                        <span
                                            class="text-xs font-bold text-text-secondary"
                                            >Prep Time</span
                                        >
                                        <div class="flex gap-2">
                                            <div class="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    bind:value={prepHours}
                                                    placeholder="0"
                                                    class="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-lg text-center font-bold text-sm focus:border-action-primary outline-none"
                                                />
                                                <span
                                                    class="absolute right-1 top-1 text-[10px] text-text-secondary font-medium"
                                                    >hr</span
                                                >
                                            </div>
                                            <div class="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    bind:value={prepMinutes}
                                                    placeholder="0"
                                                    class="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-lg text-center font-bold text-sm focus:border-action-primary outline-none"
                                                />
                                                <span
                                                    class="absolute right-1 top-1 text-[10px] text-text-secondary font-medium"
                                                    >min</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Cook -->
                                    <div class="space-y-2">
                                        <span
                                            class="text-xs font-bold text-text-secondary"
                                            >Cook Time</span
                                        >
                                        <div class="flex gap-2">
                                            <div class="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    bind:value={cookHours}
                                                    placeholder="0"
                                                    class="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-lg text-center font-bold text-sm focus:border-action-primary outline-none"
                                                />
                                                <span
                                                    class="absolute right-1 top-1 text-[10px] text-text-secondary font-medium"
                                                    >hr</span
                                                >
                                            </div>
                                            <div class="relative flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    bind:value={cookMinutes}
                                                    placeholder="0"
                                                    class="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-lg text-center font-bold text-sm focus:border-action-primary outline-none"
                                                />
                                                <span
                                                    class="absolute right-1 top-1 text-[10px] text-text-secondary font-medium"
                                                    >min</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Prep Notes -->
                            <div class="space-y-2">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                                    for="prep">Prep Notes</label
                                >
                                <textarea
                                    id="prep"
                                    bind:value={prepNotes}
                                    rows="3"
                                    class="w-full px-4 py-3 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 outline-none transition-all text-sm leading-relaxed shadow-sm"
                                    placeholder="e.g. Marinate chicken overnight..."
                                ></textarea>
                            </div>
                        </div>

                        <!-- Right Col -->
                        <div class="space-y-6">
                            <div class="space-y-2">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                                    for="course">Course</label
                                >
                                <input
                                    id="course"
                                    type="text"
                                    bind:value={course}
                                    list="courses"
                                    placeholder="Breakfast, Dinner..."
                                    class="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 outline-none transition-all text-sm shadow-sm"
                                />
                                <datalist id="courses">
                                    <option value="Breakfast"></option>
                                    <option value="Lunch"></option>
                                    <option value="Dinner"></option>
                                    <option value="Snack"></option>
                                    <option value="Dessert"></option>
                                </datalist>
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                                    for="cuisine">Cuisine</label
                                >
                                <input
                                    id="cuisine"
                                    type="text"
                                    bind:value={cuisine}
                                    placeholder="Italian, Mexican..."
                                    class="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 outline-none transition-all text-sm shadow-sm"
                                />
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                                    for="main">Main Ingredient</label
                                >
                                <input
                                    id="main"
                                    type="text"
                                    bind:value={mainIngredient}
                                    placeholder="Chicken, Beef..."
                                    class="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl focus:border-action-primary focus:ring-1 focus:ring-action-primary/10 outline-none transition-all text-sm shadow-sm"
                                />
                            </div>

                            <div class="space-y-2">
                                <label
                                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                                    for="tags">Tags</label
                                >
                                <div
                                    class="w-full px-4 py-2.5 bg-bg-surface border border-border-default rounded-xl focus-within:border-action-primary focus-within:ring-1 focus-within:ring-action-primary/10 transition-all text-sm shadow-sm flex flex-wrap gap-2 min-h-[46px] items-center"
                                >
                                    {#each selectedTags as tagId}
                                        <span
                                            class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold"
                                        >
                                            {getTagName(tagId)}
                                            <button
                                                onclick={() => removeTag(tagId)}
                                                class="hover:text-primary-900"
                                                ><X size={12} /></button
                                            >
                                        </span>
                                    {/each}
                                    <input
                                        id="tags"
                                        type="text"
                                        bind:value={tagNameInput}
                                        onkeydown={handleTagKeydown}
                                        list="existing-tags"
                                        placeholder={selectedTags.length === 0
                                            ? "Healthy, Quick..."
                                            : "Add tag..."}
                                        class="flex-1 bg-transparent outline-none min-w-[80px]"
                                    />
                                    <datalist id="existing-tags">
                                        {#each $userTags.data as tag}
                                            <option value={tag.label}
                                                >{tag.label}</option
                                            >
                                        {/each}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="h-12"></div>
    </div>
</Modal>
