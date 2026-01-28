<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import {
        X,
        ChefHat,
        Utensils,
        Clock,
        AlignLeft,
        List,
        Type,
        ChevronDown,
        ChevronUp,
        Camera,
    } from "lucide-svelte";
    // ... existing imports ... (keeping them as context in replacement if needed, but tool replaces exact block)

    import type { Recipe, Ingredient } from "$lib/types";
    import { addRecipe } from "$lib/stores/userData";
    import { slide } from "svelte/transition";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        initialRecipe?: Partial<Recipe>;
    }

    let { isOpen, onClose, initialRecipe }: Props = $props();

    // Form State
    let title = $state("");
    let source = $state(""); // Mapped to sourceUrl
    let description = $state("");
    let imageUrl = $state("");
    let imageFile = $state<File | null>(null);

    // Time State (Minutes)
    let prepTime = $state<number | null>(null);
    let cookTime = $state<number | null>(null);

    // Servings
    let servings = $state<number | null>(1);
    let yields = $state("");

    // Ingredients State
    let ingredientMode = $state<"line" | "bulk">("line");
    let ingredients = $state<Ingredient[]>([]);
    let bulkIngredients = $state("");

    // Instructions
    let instructions = $state("");
    let showAdvanced = $state(false);

    let fileInput: HTMLInputElement;

    // Initializer
    $effect(() => {
        if (isOpen) {
            resetForm();
            if (initialRecipe) {
                populateForm(initialRecipe);
            }
        }
    });

    const resetForm = () => {
        title = "";
        source = "";
        description = "";
        imageUrl = "";
        imageFile = null;
        prepTime = null;
        cookTime = null;
        servings = 1;
        yields = "";
        ingredients = [{ amount: "", unit: "", name: "" }];
        bulkIngredients = "";
        ingredientMode = "line";
        instructions = "";
    };

    const populateForm = (data: Partial<Recipe>) => {
        title = data.title || "";
        source = data.sourceUrl || "";
        description = data.description || "";
        imageUrl = data.image || "";
        prepTime = data.prepTime || null;
        cookTime = data.cookTime || null;
        servings = data.servings || 1;
        yields = data.yields || "";

        ingredients = data.ingredients
            ? [...data.ingredients]
            : [{ amount: "", unit: "", name: "" }];

        bulkIngredients = ingredients.map(formatIngredientToString).join("\n");

        instructions = Array.isArray(data.instructions)
            ? data.instructions.join("\n\n")
            : data.instructions || "";
    };

    // Helper: Bulk Parsing
    const parseBulkIngredients = (text: string): Ingredient[] => {
        return text
            .split("\n")
            .filter((l) => l.trim())
            .map((line) => {
                // Very simple parser: "1 cup flour" -> amount: 1, unit: cup, name: flour
                // This is a naive implementation, can be improved.
                const parts = line.trim().split(" ");
                const amount = parts[0] || "";
                // Try to guess unit from common units, else everything else is name
                const commonUnits = [
                    "cup",
                    "cups",
                    "tbsp",
                    "tsp",
                    "g",
                    "oz",
                    "ml",
                    "l",
                    "lb",
                    "kg",
                    "pinch",
                    "clove",
                    "slice",
                ];
                let unit = "";
                let name = "";

                if (
                    parts.length > 1 &&
                    commonUnits.includes(
                        parts[1].toLowerCase().replace("s", ""),
                    )
                ) {
                    unit = parts[1];
                    name = parts.slice(2).join(" ");
                } else {
                    name = parts.slice(1).join(" ");
                }

                return { amount, unit, name };
            });
    };

    const formatIngredientToString = (i: Ingredient) => {
        return `${i.amount} ${i.unit} ${i.name}`.trim();
    };

    const handleImageUpload = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            imageFile = file;
            imageUrl = URL.createObjectURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInput.click();
    };

    // Switch Handlers
    const switchToBulk = () => {
        bulkIngredients = ingredients.map(formatIngredientToString).join("\n");
        ingredientMode = "bulk";
    };

    const switchToLine = () => {
        ingredients = parseBulkIngredients(bulkIngredients);
        if (ingredients.length === 0)
            ingredients = [{ amount: "", unit: "", name: "" }];
        ingredientMode = "line";
    };

    // Save Handler
    const handleSave = async () => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }

        // Finalize ingredients
        let finalIngredients: Ingredient[] = [];
        if (ingredientMode === "bulk") {
            finalIngredients = parseBulkIngredients(bulkIngredients);
        } else {
            finalIngredients = ingredients.filter((i) => i.name.trim());
        }

        // Calculate minutes
        const pMin = prepTime || 0;
        const cMin = cookTime || 0;
        const totalTime = pMin + cMin;

        // Note: For real app, upload imageFile and get struct. For now use placeholder/local blob
        const finalImage = imageUrl || "/placeholder-recipe.jpg";

        const newRecipe: Omit<Recipe, "id"> = {
            title,
            image: finalImage,
            description,
            sourceUrl: source,
            prepTime: pMin,
            cookTime: cMin,
            totalTime,
            servings: servings || 1,
            yields,
            ingredients: finalIngredients,
            instructions: instructions.split("\n").filter((l) => l.trim()),
            tags: [],
        };

        try {
            await addRecipe(newRecipe);
            onClose();
        } catch (e) {
            console.error("Failed to save", e);
            alert("Failed to save recipe");
        }
    };

    const addIngredientRow = () => {
        ingredients = [...ingredients, { amount: "", unit: "", name: "" }];
    };

    const removeIngredientRow = (index: number) => {
        ingredients = ingredients.filter((_, i) => i !== index);
    };
</script>

{#snippet headerContent()}
    <!-- ... (keep existing header) ... -->
    <div
        class="px-4 md:px-6 py-4 bg-app-surface border-b border-app-border flex items-center justify-between shrink-0"
    >
        <button
            onclick={onClose}
            class="p-2 -ml-2 text-app-text-muted hover:text-app-text rounded-full hover:bg-app-surface-hover/50 transition-all"
        >
            <X size={24} />
        </button>
        <h2 class="text-xl font-display font-medium text-app-text">
            Add Recipe
        </h2>
        <button
            onclick={handleSave}
            class="px-5 py-2 bg-app-primary hover:bg-app-primary/90 text-white font-bold rounded-lg text-sm transition-all shadow-sm active:scale-95"
        >
            Save
        </button>
    </div>
{/snippet}

<Modal
    {isOpen}
    {onClose}
    class="w-full md:max-w-2xl h-full md:h-[90vh] bg-app-surface p-0 overflow-hidden flex flex-col md:rounded-2xl rounded-none"
    showCloseButton={false}
    header={headerContent}
>
    <!-- Scroll Content -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <!-- Basic Info Wrapper -->
        <div class="flex flex-row gap-4 md:gap-6">
            <!-- Left Column - Inputs -->
            <div class="flex-1 space-y-4">
                <div class="space-y-2">
                    <input
                        type="text"
                        bind:value={title}
                        placeholder="Title"
                        class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-lg font-medium"
                    />
                </div>

                <div class="space-y-2">
                    <input
                        type="text"
                        bind:value={source}
                        placeholder="Source"
                        class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors"
                    />
                </div>
            </div>

            <!-- Right Column - Image Upload -->
            <div class="w-24 md:w-32 shrink-0">
                <button
                    onclick={triggerFileInput}
                    class="group relative w-full aspect-square md:aspect-[4/3] md:h-28 rounded-xl bg-app-surface-deep border-2 border-dashed border-app-border hover:border-app-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2"
                >
                    {#if imageUrl}
                        <img
                            src={imageUrl}
                            alt="Preview"
                            class="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <span class="text-white text-xs font-bold"
                                >Change</span
                            >
                        </div>
                    {:else}
                        <div
                            class="p-2 md:p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                        >
                            <Camera
                                size={20}
                                class="text-app-text-muted group-hover:text-app-primary transition-colors"
                            />
                        </div>
                        <span
                            class="text-[10px] md:text-xs text-app-text-muted font-medium text-center leading-tight"
                            >Add Photo</span
                        >
                    {/if}
                </button>
                <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    bind:this={fileInput}
                    onchange={handleImageUpload}
                />
            </div>
        </div>

        <!-- Advanced Toggle -->
        <div class="relative py-2">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-app-border"></div>
            </div>
            <div class="relative flex justify-center">
                <button
                    onclick={() => (showAdvanced = !showAdvanced)}
                    class="bg-app-surface px-4 py-1 text-xs font-bold uppercase tracking-wider text-app-text-muted hover:text-app-primary flex items-center gap-2 transition-colors rounded-full border border-app-border hover:border-app-primary/30"
                >
                    {#if showAdvanced}
                        <span>Hide Details</span>
                        <ChevronUp size={14} />
                    {:else}
                        <span>Advanced Details</span>
                        <ChevronDown size={14} />
                    {/if}
                </button>
            </div>
        </div>

        {#if showAdvanced}
            <div transition:slide class="space-y-6 pt-2">
                <div class="space-y-2">
                    <textarea
                        bind:value={description}
                        rows="4"
                        placeholder="Description"
                        class="w-full p-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-none transition-colors"
                    ></textarea>
                </div>

                <!-- Metadata Row (Prep, Cook, Serves, Yields) -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="space-y-2">
                        <label
                            class="text-xs text-app-text-muted uppercase font-bold pl-1"
                            for="prep">Prep Time</label
                        >
                        <input
                            id="prep"
                            type="text"
                            bind:value={prepTime}
                            placeholder="e.g. 15 mins"
                            class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-xs text-app-text-muted uppercase font-bold pl-1"
                            for="cook">Cook Time</label
                        >
                        <input
                            id="cook"
                            type="text"
                            bind:value={cookTime}
                            placeholder="e.g. 30 mins"
                            class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-xs text-app-text-muted uppercase font-bold pl-1"
                            for="serves">Serves</label
                        >
                        <input
                            id="serves"
                            type="text"
                            bind:value={servings}
                            placeholder="e.g. 4"
                            class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-xs text-app-text-muted uppercase font-bold pl-1"
                            for="yields">Yields</label
                        >
                        <input
                            id="yields"
                            type="text"
                            bind:value={yields}
                            placeholder="e.g. 12"
                            class="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium"
                        />
                    </div>
                </div>
            </div>
        {/if}

        <!-- Ingredients Header & Toggle -->
        <div class="space-y-4">
            <h3 class="text-app-text font-bold text-lg">Ingredients</h3>

            <!-- Toggle -->
            <div
                class="flex gap-1 p-1 bg-app-surface-deep border border-app-border rounded-xl mt-4"
            >
                <button
                    onclick={switchToLine}
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all border-2 border-transparent {ingredientMode ===
                    'line'
                        ? 'bg-white dark:bg-gray-800 text-app-primary shadow-sm border-app-primary/10'
                        : 'text-app-text-muted hover:text-app-text hover:bg-white/50'}"
                >
                    Line-item Input
                </button>
                <button
                    onclick={switchToBulk}
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all border-2 border-transparent {ingredientMode ===
                    'bulk'
                        ? 'bg-white dark:bg-gray-800 text-app-primary shadow-sm border-app-primary/10'
                        : 'text-app-text-muted hover:text-app-text hover:bg-white/50'}"
                >
                    Bulk Input
                </button>
            </div>

            <!-- Helper Text -->
            <p class="text-xs text-app-text-muted leading-relaxed px-1">
                Type in multiple ingredients below (one ingredient per line), or
                copy and paste them from websites or your own notes.
            </p>

            <!-- Inputs -->
            {#if ingredientMode === "line"}
                <div
                    class="space-y-3 bg-app-surface-deep p-3 md:p-4 rounded-2xl border border-app-border"
                >
                    <!-- Header (Hide on mobile for space) -->
                    <div
                        class="hidden md:flex items-center gap-3 px-1 text-[10px] uppercase font-bold text-app-text-muted"
                    >
                        <span class="w-16 md:w-20 pl-1">Qty</span>
                        <span class="w-16 md:w-20 pl-1">Unit</span>
                        <span class="flex-1 pl-1">Ingredient</span>
                        <span class="w-8"></span>
                    </div>
                    {#each ingredients as ing, i}
                        <div class="flex gap-2 w-full min-w-0">
                            <input
                                type="text"
                                bind:value={ing.amount}
                                placeholder="Qty"
                                class="w-14 md:w-20 h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-colors shrink-0"
                            />
                            <input
                                type="text"
                                bind:value={ing.unit}
                                placeholder="Unit"
                                class="w-14 md:w-20 h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-colors shrink-0"
                            />
                            <div class="flex-1 min-w-0">
                                <input
                                    type="text"
                                    bind:value={ing.name}
                                    placeholder="Ingredient"
                                    class="w-full h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm font-medium focus:border-app-primary focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                onclick={() => removeIngredientRow(i)}
                                class="w-8 h-11 flex items-center justify-center text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    {/each}
                    <button
                        onclick={addIngredientRow}
                        class="text-sm text-app-primary font-bold hover:underline pt-2 pl-1 flex items-center gap-1"
                    >
                        <Utensils size={14} /> Add Line Item
                    </button>
                </div>
            {:else}
                <textarea
                    bind:value={bulkIngredients}
                    rows="10"
                    placeholder="1 cup flour&#10;2 eggs&#10;..."
                    class="w-full p-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-y font-mono text-sm leading-relaxed"
                ></textarea>
            {/if}
        </div>

        <!-- Instructions -->
        <div class="space-y-4 pb-8">
            <h3 class="text-app-text font-bold text-lg">Instructions</h3>
            <textarea
                bind:value={instructions}
                rows="8"
                placeholder="Step-by-step directions..."
                class="w-full p-5 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-y leading-relaxed"
            ></textarea>
        </div>
    </div>
</Modal>
