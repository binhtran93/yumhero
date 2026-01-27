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
    } from "lucide-svelte";
    import { twMerge } from "tailwind-merge";
    import type { Recipe, Ingredient } from "$lib/types";
    import { addRecipe, userTags, userUnits } from "$lib/stores/userData";
    import { DEFAULT_CATEGORIES, DEFAULT_UNITS } from "$lib/constants";
    import { fade, slide } from "svelte/transition";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        initialRecipe?: Partial<Recipe>; // For editing existing recipe
    }

    let { isOpen, onClose, initialRecipe }: Props = $props();

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
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to extract recipe");
            }

            const { recipe } = await res.json();
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
            // Combine course, cuisine, and main ingredient into tags + selectedTags
            tags: [...selectedTags, course, cuisine, mainIngredient].filter(
                (t) => t && t.trim().length > 0,
            ),
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
            class="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-surface sticky top-0 z-20"
        >
            <h2
                class="text-xl font-display font-bold text-text-primary uppercase tracking-wide"
            >
                {initialRecipe ? "Edit Recipe" : "New Recipe"}
            </h2>
            <div class="flex items-center gap-2">
                <button
                    onclick={handleSave}
                    class="px-4 py-2 bg-text-primary text-bg-surface font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                    Save Recipe
                </button>
                <button
                    onclick={onClose}
                    class="px-4 py-2 bg-bg-accent-subtle text-text-primary font-medium rounded-lg hover:bg-bg-surface-hover transition-colors text-sm border border-border-default"
                >
                    Cancel
                </button>
            </div>
        </div>
    {/snippet}

    <!-- Content -->
    <div class="p-6 space-y-8 bg-bg-default/30 min-h-full">
        <!-- Alerts -->
        {#if isExtracting}
            <div
                class="p-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center gap-2"
                in:slide
            >
                <Loader2 class="animate-spin" size={18} />
                <span class="text-sm font-medium"
                    >Clipping recipe from URL... this may take a few seconds.</span
                >
            </div>
        {/if}

        {#if extractionSuccess}
            <div
                class="p-4 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg flex items-start gap-3"
                in:slide
            >
                <Check class="shrink-0 mt-0.5 text-amber-600" size={18} />
                <div class="text-sm">
                    <p class="font-bold">
                        A draft recipe was successfully clipped!
                    </p>
                    <p>
                        Please review the clipped recipe before saving it to
                        your recipe book.
                    </p>
                </div>
                <button
                    onclick={() => (extractionSuccess = false)}
                    class="ml-auto text-amber-600 hover:text-amber-800"
                    ><X size={16} /></button
                >
            </div>
        {/if}

        {#if extractionError}
            <div
                class="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-start gap-3"
                in:slide
            >
                <AlertCircle class="shrink-0 mt-0.5" size={18} />
                <div class="text-sm">
                    <p class="font-bold">Recipe extraction failed</p>
                    <p>{extractionError}</p>
                </div>
                <button
                    onclick={() => (extractionError = null)}
                    class="ml-auto text-red-600 hover:text-red-800"
                    ><X size={16} /></button
                >
            </div>
        {/if}

        <!-- Top Section: Basic Info & Image -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Inputs -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Title -->
                <div class="space-y-1">
                    <label
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                        for="title">Title</label
                    >
                    <input
                        id="title"
                        type="text"
                        bind:value={title}
                        class="w-full px-4 py-3 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all font-display font-medium text-lg placeholder:text-text-secondary/30 shadow-sm"
                        placeholder="e.g. Grandma's Apple Pie"
                    />
                </div>

                <!-- Source URL -->
                <div class="space-y-1">
                    <label
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                        for="url">Source</label
                    >
                    <div class="relative flex gap-2">
                        <div class="relative flex-1">
                            <Link
                                class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
                                size={16}
                            />
                            <input
                                id="url"
                                type="text"
                                bind:value={url}
                                class="w-full pl-10 pr-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm text-text-secondary"
                                placeholder="Paste a recipe URL to import..."
                                onkeydown={(e) =>
                                    e.key === "Enter" && handleExtract()}
                            />
                        </div>
                        <button
                            onclick={handleExtract}
                            disabled={isExtracting || !url}
                            class="px-4 py-2 bg-text-primary text-bg-surface font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            {isExtracting ? "Importing..." : "Import"}
                        </button>
                    </div>
                </div>

                <!-- Description -->
                <div class="space-y-1">
                    <label
                        class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                        for="desc">Description</label
                    >
                    <textarea
                        id="desc"
                        rows="3"
                        bind:value={description}
                        class="w-full px-4 py-3 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all resize-none text-sm placeholder:text-text-secondary/30 shadow-sm leading-relaxed"
                        placeholder="Write a brief description about this dish..."
                    ></textarea>
                </div>

                <!-- Time & Servings Row -->
                <div class="grid grid-cols-2 gap-6">
                    <!-- Prep Time -->
                    <div class="space-y-2">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block"
                            >Prep Time</label
                        >
                        <div class="flex gap-2">
                            <div class="flex-1 space-y-1">
                                <input
                                    type="number"
                                    bind:value={prepHours}
                                    min="0"
                                    class="w-full px-3 py-2 bg-white border border-border-default rounded-lg text-center text-sm font-medium focus:border-text-primary outline-none"
                                    placeholder="0"
                                />
                                <span
                                    class="text-[10px] text-text-secondary block text-center uppercase"
                                    >Hours</span
                                >
                            </div>
                            <div class="flex-1 space-y-1">
                                <input
                                    type="number"
                                    bind:value={prepMinutes}
                                    min="0"
                                    class="w-full px-3 py-2 bg-white border border-border-default rounded-lg text-center text-sm font-medium focus:border-text-primary outline-none"
                                    placeholder="0"
                                />
                                <span
                                    class="text-[10px] text-text-secondary block text-center uppercase"
                                    >Minutes</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Cook Time -->
                    <div class="space-y-2">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block"
                            >Cook Time</label
                        >
                        <div class="flex gap-2">
                            <div class="flex-1 space-y-1">
                                <input
                                    type="number"
                                    bind:value={cookHours}
                                    min="0"
                                    class="w-full px-3 py-2 bg-white border border-border-default rounded-lg text-center text-sm font-medium focus:border-text-primary outline-none"
                                    placeholder="0"
                                />
                                <span
                                    class="text-[10px] text-text-secondary block text-center uppercase"
                                    >Hours</span
                                >
                            </div>
                            <div class="flex-1 space-y-1">
                                <input
                                    type="number"
                                    bind:value={cookMinutes}
                                    min="0"
                                    class="w-full px-3 py-2 bg-white border border-border-default rounded-lg text-center text-sm font-medium focus:border-text-primary outline-none"
                                    placeholder="0"
                                />
                                <span
                                    class="text-[10px] text-text-secondary block text-center uppercase"
                                    >Minutes</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Servings & Yields -->
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                            for="servings">Serves</label
                        >
                        <input
                            id="servings"
                            type="number"
                            bind:value={servings}
                            class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                    <div class="space-y-1">
                        <label
                            class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                            for="yields">Yields</label
                        >
                        <input
                            id="yields"
                            type="text"
                            bind:value={yields}
                            class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all font-medium text-sm shadow-sm"
                            placeholder="e.g. 1 dozen"
                        />
                    </div>
                </div>
            </div>

            <!-- Right: Image Upload Preview -->
            <div class="lg:col-span-1">
                <div class="sticky top-24 space-y-2">
                    <div
                        class="aspect-square w-full rounded-2xl bg-bg-accent-subtle border-2 border-dashed border-border-default flex flex-col items-center justify-center relative overflow-hidden group hover:border-text-primary/50 transition-colors"
                    >
                        {#if image}
                            <img
                                src={image}
                                alt="Recipe Preview"
                                class="absolute inset-0 w-full h-full object-cover rounded-xl"
                            />
                            <div
                                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <button
                                    onclick={() => {
                                        /* TODO: File Upload logic */
                                    }}
                                    class="px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-xs uppercase tracking-wide"
                                    >Change Photo</button
                                >
                            </div>
                        {:else}
                            <Camera
                                size={32}
                                class="text-text-secondary/50 mb-2"
                            />
                            <span
                                class="text-xs text-text-secondary font-medium"
                                >Add Photo</span
                            >
                        {/if}
                    </div>
                    <button
                        class="w-full py-2 flex items-center justify-center gap-2 text-action-primary font-bold text-xs bg-white border border-border-default rounded-xl hover:bg-bg-surface-hover shadow-sm transition-all"
                    >
                        <Camera size={14} /> Update Photo
                    </button>
                </div>
            </div>
        </div>

        <hr class="border-border-default/50" />

        <!-- Ingredients Section -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-display font-bold text-text-primary">
                    Ingredients
                </h3>
                <div class="flex gap-2 text-sm font-medium text-text-secondary">
                    <button
                        class="px-3 py-1 rounded-full bg-bg-accent-subtle text-text-primary font-bold shadow-sm"
                        >Line-item Input</button
                    >
                    <button
                        class="px-3 py-1 rounded-full hover:bg-bg-surface-hover transition-colors"
                        >Bulk Input</button
                    >
                </div>
            </div>

            <div
                class="flex items-center gap-2 px-2 py-1 text-[10px] uppercase font-bold text-text-secondary tracking-wider"
            >
                <span class="w-[80px]">Amount</span>
                <span class="w-[100px]">Unit</span>
                <span class="flex-1">Ingredient</span>
                <span class="w-[150px]">Notes</span>
                <span class="w-8"></span>
            </div>

            <div class="space-y-2">
                {#each ingredients as ing, i}
                    <div class="flex items-center gap-2 group">
                        <div
                            class="w-4 flex items-center justify-center text-text-secondary cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100"
                        >
                            <!-- Drag Handle Icon proxy -->
                            <div
                                class="w-1 h-3 border-l border-r border-current"
                            ></div>
                        </div>
                        <input
                            type="text"
                            bind:value={ing.amount}
                            class="w-[80px] px-3 py-2 bg-white border border-border-default rounded-lg text-sm focus:border-text-primary outline-none shadow-sm"
                            placeholder="1"
                        />
                        <input
                            type="text"
                            list="units"
                            bind:value={ing.unit}
                            class="w-[100px] px-3 py-2 bg-white border border-border-default rounded-lg text-sm focus:border-text-primary outline-none shadow-sm"
                            placeholder="cup"
                        />
                        <datalist id="units">
                            {#each DEFAULT_UNITS as u}
                                <option value={u}>{u}</option>
                            {/each}
                        </datalist>

                        <input
                            type="text"
                            bind:value={ing.name}
                            class="flex-1 px-3 py-2 bg-white border border-border-default rounded-lg text-sm focus:border-text-primary outline-none shadow-sm font-medium"
                            placeholder="Ingredient name"
                        />
                        <input
                            type="text"
                            bind:value={ing.notes}
                            class="w-[150px] px-3 py-2 bg-white border border-border-default rounded-lg text-sm focus:border-text-primary outline-none shadow-sm text-text-secondary"
                            placeholder="chopped"
                        />

                        <button
                            onclick={() => removeIngredient(i)}
                            class="text-text-secondary hover:text-red-500 w-8 flex justify-center transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                {/each}
            </div>

            <button
                onclick={addIngredient}
                class="flex items-center gap-2 text-action-primary font-bold text-sm hover:underline mt-2 px-6"
            >
                <Plus size={16} /> Add Ingredient
            </button>
        </div>

        <hr class="border-border-default/50" />

        <!-- Directions Section -->
        <div class="space-y-4">
            <h3 class="text-lg font-display font-bold text-text-primary">
                Directions
            </h3>
            <div class="relative">
                <textarea
                    bind:value={directions}
                    rows="10"
                    class="w-full px-4 py-4 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm leading-relaxed shadow-sm font-medium text-text-primary placeholder:text-text-secondary/30"
                    placeholder="Step 1: Preheat the oven..."
                ></textarea>
                <div
                    class="absolute right-4 bottom-4 text-xs text-text-secondary/50 pointer-events-none italic"
                >
                    Markdown supported
                </div>
            </div>
        </div>

        <hr class="border-border-default/50" />

        <!-- Prep Notes -->
        <div class="space-y-4">
            <h3 class="text-lg font-display font-bold text-text-primary">
                Prep Notes
            </h3>
            <p class="text-sm text-text-secondary">
                Prep notes are automatically included on the meal planner in the
                notes section.
            </p>
            <button
                class="px-4 py-2 bg-white border border-border-default rounded-lg text-sm font-bold text-text-secondary hover:text-action-primary hover:border-action-primary/30 transition-all shadow-sm flex items-center gap-2"
            >
                <Plus size={14} /> Add Prep Note
            </button>
            {#if prepNotes}
                <textarea
                    bind:value={prepNotes}
                    rows="3"
                    class="w-full px-4 py-3 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm leading-relaxed shadow-sm"
                ></textarea>
            {/if}
        </div>

        <hr class="border-border-default/50" />

        <!-- Metadata Buttons -->
        <div class="grid grid-cols-3 gap-6">
            <div class="space-y-1">
                <label
                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                    for="course">Course</label
                >
                <input
                    id="course"
                    type="text"
                    bind:value={course}
                    list="courses"
                    class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm shadow-sm"
                    placeholder="Main Course"
                />
                <datalist id="courses">
                    <option value="Breakfast"></option>
                    <option value="Lunch"></option>
                    <option value="Dinner"></option>
                    <option value="Snack"></option>
                    <option value="Dessert"></option>
                </datalist>
            </div>
            <div class="space-y-1">
                <label
                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                    for="cuisine">Cuisine</label
                >
                <input
                    id="cuisine"
                    type="text"
                    bind:value={cuisine}
                    class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm shadow-sm"
                    placeholder="Italian"
                />
            </div>
            <div class="space-y-1">
                <label
                    class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                    for="main">Main Ingredient</label
                >
                <input
                    id="main"
                    type="text"
                    bind:value={mainIngredient}
                    class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm shadow-sm"
                    placeholder="Chicken"
                />
            </div>
        </div>

        <div class="space-y-1">
            <label
                class="text-xs font-bold text-text-secondary uppercase tracking-wider block ml-1"
                for="tags">Tags</label
            >
            <input
                id="tags"
                type="text"
                placeholder="Add tags separated by comma..."
                class="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl focus:border-text-primary focus:ring-1 focus:ring-text-primary outline-none transition-all text-sm shadow-sm"
            />
        </div>

        <!-- Spacer -->
        <div class="h-12"></div>
    </div>
</Modal>
