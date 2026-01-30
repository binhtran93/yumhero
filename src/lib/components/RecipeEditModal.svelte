<script lang="ts">
    import Modal from "$lib/components/Modal.svelte";
    import ImportUrlModal from "$lib/components/ImportUrlModal.svelte";
    import PasteRecipeModal from "$lib/components/PasteRecipeModal.svelte";
    import {
        X,
        Utensils,
        ChevronDown,
        ChevronUp,
        Camera,
        Globe,
        FileText,
        MoreVertical,
    } from "lucide-svelte";

    import type { Recipe, Ingredient } from "$lib/types";
    import { addRecipe } from "$lib/stores/userData";
    import { slide, fade } from "svelte/transition";
    import { parseAmount, formatAmount } from "$lib/utils/shopping";
    import { toasts } from "$lib/stores/toasts";

    type FormIngredient = {
        amount: string;
        unit: string;
        name: string;
    };

    interface Props {
        isOpen: boolean;
        onClose: () => void;
        initialRecipe?: Partial<Recipe>;
        initialAction?: "import" | "paste" | null;
    }

    let {
        isOpen,
        onClose,
        initialRecipe,
        initialAction = null,
    }: Props = $props();

    // Form State (Buffer for the active recipe)
    let isSaving = $state(false);
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
    let ingredients = $state<FormIngredient[]>([]);
    let bulkIngredients = $state("");

    // Instructions
    let instructions = $state("");
    let showAdvanced = $state(false);

    // Multiple Recipe Management
    type RecipeVariantState = {
        title: string;
        source: string;
        description: string;
        imageUrl: string;
        imageFile: File | null;
        prepTime: number | null;
        cookTime: number | null;
        servings: number | null;
        yields: string;
        ingredients: FormIngredient[];
        ingredientMode: "line" | "bulk"; // Track mode per variant
        bulkIngredients: string;
        instructions: string;
    };

    let recipeVariants = $state<RecipeVariantState[]>([]);
    let activeVariantIndex = $state(0);

    // Import Modal State
    let showImportModal = $state(false);
    let showPasteModal = $state(false);
    let showOptionsDropdown = $state(false);

    let fileInput: HTMLInputElement;
    let titleInput = $state<HTMLInputElement>();

    // Initializer
    $effect(() => {
        if (isOpen) {
            resetForm();
            showOptionsDropdown = false;

            // Focus title input on next tick to ensure it's rendered
            setTimeout(() => titleInput?.focus(), 50);

            if (initialRecipe) {
                populateForm(initialRecipe);
                showAdvanced = true;
            }

            // Handle initial actions
            if (initialAction === "import") {
                showImportModal = true;
            } else if (initialAction === "paste") {
                showPasteModal = true;
            }
        }
    });

    const resetForm = () => {
        // Reset to a single empty variant
        const emptyVariant = createEmptyVariant();
        recipeVariants = [emptyVariant];
        activeVariantIndex = 0;
        loadVariantToBuffer(emptyVariant);
    };

    const createEmptyVariant = (): RecipeVariantState => ({
        title: "",
        source: "",
        description: "",
        imageUrl: "",
        imageFile: null,
        prepTime: null,
        cookTime: null,
        servings: 1,
        yields: "",
        ingredients: [{ amount: "", unit: "", name: "" }],
        ingredientMode: "line",
        bulkIngredients: "",
        instructions: "",
    });

    const populateForm = (data: Partial<Recipe>) => {
        // This is called when editing an EXISTING single recipe from the app
        const variant = mapRecipeToVariant(data);
        recipeVariants = [variant];
        activeVariantIndex = 0;
        loadVariantToBuffer(variant);
    };

    const mapRecipeToVariant = (data: Partial<Recipe>): RecipeVariantState => {
        const ingList = data.ingredients
            ? data.ingredients.map((i) => ({
                  amount: formatAmount(i.amount),
                  unit: i.unit || "",
                  name: i.name,
              }))
            : [{ amount: "", unit: "", name: "" }];

        return {
            title: data.title || "",
            source: data.sourceUrl || "",
            description: data.description || "",
            imageUrl: data.image || "",
            imageFile: null,
            prepTime: data.prepTime || null,
            cookTime: data.cookTime || null,
            servings: data.servings || 1,
            yields: data.yields || "",
            ingredients: ingList,
            ingredientMode: "line",
            bulkIngredients: ingList.map(formatIngredientToString).join("\n"),
            instructions: Array.isArray(data.instructions)
                ? data.instructions.join("\n\n")
                : data.instructions || "",
        };
    };

    // State Syncing
    const loadVariantToBuffer = (variant: RecipeVariantState) => {
        title = variant.title;
        source = variant.source;
        description = variant.description;
        imageUrl = variant.imageUrl;
        imageFile = variant.imageFile;
        prepTime = variant.prepTime;
        cookTime = variant.cookTime;
        servings = variant.servings;
        yields = variant.yields;
        ingredients = JSON.parse(JSON.stringify(variant.ingredients)); // Deep copy to avoid ref issues
        ingredientMode = variant.ingredientMode;
        bulkIngredients = variant.bulkIngredients;
        instructions = variant.instructions;
    };

    const saveBufferToVariant = (index: number) => {
        if (index < 0 || index >= recipeVariants.length) return;

        // Sync ingredients text to avoid staleness if mode wasn't switched explicitly
        let syncedBulk = bulkIngredients;
        let syncedIngredients = ingredients;

        // If we were in line mode, update bulk string for consistency
        if (ingredientMode === "line") {
            syncedBulk = ingredients.map(formatIngredientToString).join("\n");
        }

        recipeVariants[index] = {
            title,
            source,
            description,
            imageUrl,
            imageFile,
            prepTime,
            cookTime,
            servings,
            yields,
            ingredients: syncedIngredients,
            ingredientMode,
            bulkIngredients: syncedBulk,
            instructions,
        };
    };

    const switchVariant = (newIndex: number) => {
        if (newIndex === activeVariantIndex) return;
        saveBufferToVariant(activeVariantIndex);
        activeVariantIndex = newIndex;
        loadVariantToBuffer(recipeVariants[newIndex]);
    };

    const removeVariant = (index: number, e: Event) => {
        e.stopPropagation();
        if (recipeVariants.length <= 1) {
            toasts.error("Cannot remove the last recipe variant.");
            return;
        }

        // Helper to remove item
        const newVariants = recipeVariants.filter((_, i) => i !== index);

        // Adjust active index
        let newIndex = activeVariantIndex;
        if (index < activeVariantIndex) {
            newIndex--;
        } else if (index === activeVariantIndex) {
            newIndex = Math.max(0, index - 1);
        } else {
            // removing something after current, index stays same
        }

        // If we are removing the CURRENTLY active one, we need to load the new one.
        // If we are removing another one, we just update the array and index.
        // BUT, since we have a "buffer", if we remove the active one, we must discard buffer and load new.

        if (index === activeVariantIndex) {
            recipeVariants = newVariants;
            activeVariantIndex = newIndex;
            loadVariantToBuffer(recipeVariants[newIndex]);
        } else {
            // Just update array, keeping valid ref to current buffer?
            // Actually, simplest is to save current buffer, update array, then reload buffer to be safe.
            saveBufferToVariant(activeVariantIndex);
            recipeVariants = newVariants;
            activeVariantIndex = newIndex;
            // Ensure index is valid
            if (activeVariantIndex >= recipeVariants.length)
                activeVariantIndex = recipeVariants.length - 1;
            loadVariantToBuffer(recipeVariants[activeVariantIndex]);
        }
    };

    // Helper: Bulk Parsing
    const parseBulkIngredients = (text: string): FormIngredient[] => {
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

    const formatIngredientToString = (i: FormIngredient) => {
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
        if (isSaving) return;

        // Save current buffer first
        saveBufferToVariant(activeVariantIndex);

        if (recipeVariants.length === 0) return;

        isSaving = true;
        let successCount = 0;
        let failCount = 0;

        try {
            for (const variant of recipeVariants) {
                if (!variant.title.trim()) {
                    toasts.error("A recipe is missing a title");
                    isSaving = false;
                    return; // Stop everything if validation fails
                }

                // Finalize ingredients
                let finalIngredients: Ingredient[] = [];
                let sourceIngredients: FormIngredient[] = [];

                if (variant.ingredientMode === "bulk") {
                    sourceIngredients = parseBulkIngredients(
                        variant.bulkIngredients,
                    );
                } else {
                    sourceIngredients = variant.ingredients.filter((i) =>
                        i.name.trim(),
                    );
                }

                if (sourceIngredients.length === 0) {
                    toasts.error(
                        `Recipe "${variant.title}" has no ingredients`,
                    );
                    isSaving = false;
                    return;
                }

                const instructionSteps = variant.instructions
                    .split("\n")
                    .filter((l) => l.trim());
                if (instructionSteps.length === 0) {
                    toasts.error(
                        `Recipe "${variant.title}" has no instructions`,
                    );
                    isSaving = false;
                    return;
                }

                finalIngredients = sourceIngredients.map((i) => ({
                    amount: parseAmount(i.amount),
                    unit: i.unit.trim() || null,
                    name: i.name,
                }));

                // Calculate minutes
                const pMin = variant.prepTime || 0;
                const cMin = variant.cookTime || 0;
                const totalTime = pMin + cMin;

                // Note: For real app, upload imageFile and get struct. For now use placeholder/local blob
                const finalImage = variant.imageUrl || undefined;

                const newRecipe: Omit<Recipe, "id"> = {
                    title: variant.title,
                    image: finalImage || "",
                    description: variant.description,
                    sourceUrl: variant.source,
                    prepTime: pMin,
                    cookTime: cMin,
                    totalTime,
                    servings: variant.servings || 1,
                    yields: variant.yields,
                    ingredients: finalIngredients,
                    instructions: instructionSteps,
                    tags: [],
                };

                try {
                    await addRecipe(newRecipe);
                    successCount++;
                } catch (e) {
                    console.error("Failed to save", e);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toasts.success(
                    `Saved ${successCount} recipe${successCount > 1 ? "s" : ""}`,
                );
                onClose();
            }

            if (failCount > 0) {
                toasts.error(
                    `Failed to save ${failCount} recipe${failCount > 1 ? "s" : ""}`,
                );
            }
        } finally {
            if (successCount === 0) {
                isSaving = false;
            }
            // If success > 0, we called onClose(), so component unmounts or modal closes.
            // If logic keeps modal open on partial failure, we might want isSaving = false.
            // safely set false here.
            isSaving = false;
        }
    };

    const addIngredientRow = () => {
        ingredients = [...ingredients, { amount: "", unit: "", name: "" }];
    };

    const removeIngredientRow = (index: number) => {
        ingredients = ingredients.filter((_, i) => i !== index);
    };

    const handleImportFromUrl = async (url: string) => {
        try {
            const response = await fetch("/api/extract-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to import recipe");
            }

            const data = await response.json();
            handleExtractedData(data, url);
        } catch (error: any) {
            console.error("Import error:", error);
            throw error; // Re-throw to be handled by ImportUrlModal
        }
    };

    const handlePasteText = async (text: string) => {
        try {
            const response = await fetch("/api/extract-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to parse recipe text",
                );
            }

            const data = await response.json();
            handleExtractedData(data);
        } catch (error: any) {
            console.error("Paste error:", error);
            throw error;
        }
    };

    const handleExtractedData = (data: any, sourceUrl: string = "") => {
        // Support both single 'recipe' and array 'recipes' for resilience
        const extracted = data.recipes || (data.recipe ? [data.recipe] : []);

        if (extracted.length === 0) {
            toasts.error("No recipes found");
            return;
        }

        // Map all to variants, injecting sourceUrl if provided
        let newVariants = extracted.map((r: any) =>
            mapRecipeToVariant({ ...r, sourceUrl: sourceUrl || r.sourceUrl }),
        );

        // Limit to max 5 variants
        if (newVariants.length > 5) {
            toasts.success(
                `Imported 5 of ${newVariants.length} variants found`,
            );
            newVariants = newVariants.slice(0, 5);
        } else if (newVariants.length > 1) {
            toasts.success(`Found ${newVariants.length} variants!`);
        }

        // Add to state
        recipeVariants = newVariants;
        activeVariantIndex = 0;
        loadVariantToBuffer(newVariants[0]);
        showAdvanced = true;

        if (newVariants.length > 1) {
            toasts.success(`Found ${newVariants.length} variants!`);
        }
    };
</script>

{#snippet headerContent()}
    <div
        class="px-4 md:px-6 py-4 bg-app-surface border-b border-app-border flex items-center justify-between shrink-0 relative"
    >
        <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-app-text">Add Recipe</h2>
        </div>

        {#if !isSaving}
            <div class="flex items-center gap-1">
                <div class="relative">
                    <button
                        onclick={() =>
                            (showOptionsDropdown = !showOptionsDropdown)}
                        class="p-2 text-app-text-muted hover:text-app-text rounded-full hover:bg-app-surface-hover/50 transition-all {showOptionsDropdown
                            ? 'bg-app-surface-hover text-app-text'
                            : ''}"
                        aria-label="More options"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {#if showOptionsDropdown}
                        <div
                            transition:fade={{ duration: 100 }}
                            class="absolute right-0 top-full mt-2 w-56 bg-app-surface rounded-xl border border-app-border shadow-xl overflow-hidden z-[100] py-1.5"
                        >
                            <button
                                onclick={() => {
                                    showOptionsDropdown = false;
                                    showImportModal = true;
                                }}
                                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                            >
                                <Globe size={18} class="text-app-primary" />
                                <span>Import from web</span>
                            </button>
                            <button
                                onclick={() => {
                                    showOptionsDropdown = false;
                                    showPasteModal = true;
                                }}
                                class="w-full text-left px-4 py-3 text-sm font-medium text-app-text hover:bg-app-surface-hover flex items-center gap-3 transition-colors"
                            >
                                <FileText size={18} class="text-app-primary" />
                                <span>Paste Recipe text</span>
                            </button>
                        </div>

                        <!-- Backdrop to close dropdown -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="fixed inset-0 z-90"
                            onclick={() => (showOptionsDropdown = false)}
                        ></div>
                    {/if}
                </div>
                <button
                    onclick={onClose}
                    class="p-2 -mr-2 text-app-text-muted hover:text-app-text rounded-full hover:bg-app-surface-hover/50 transition-all"
                >
                    <X size={24} />
                </button>
            </div>
        {/if}
    </div>
{/snippet}

{#snippet footerContent()}
    <div
        class="p-4 border-t border-app-border bg-app-surface shrink-0 flex gap-3"
    >
        <button
            onclick={onClose}
            disabled={isSaving}
            class="flex-1 px-6 py-3 border border-app-border rounded-xl text-app-text font-bold hover:bg-app-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Cancel
        </button>
        <button
            onclick={handleSave}
            disabled={isSaving}
            class="flex-1 px-6 py-3 bg-app-primary text-white rounded-xl font-bold shadow-lg shadow-app-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
            {#if isSaving}
                <div
                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
                Saving...
            {:else}
                Save {recipeVariants.length > 1
                    ? `${recipeVariants.length} Recipes`
                    : "Recipe"}
            {/if}
        </button>
    </div>
{/snippet}

<Modal
    {isOpen}
    {onClose}
    class="w-full md:max-w-2xl h-full md:h-[90vh] bg-app-surface p-0 overflow-hidden flex flex-col md:rounded-2xl rounded-none"
    showCloseButton={!isSaving}
    header={headerContent}
    footer={footerContent}
    closeOnEsc={!showImportModal && !showPasteModal && !isSaving}
    closeOnClickOutside={!isSaving}
>
    <!-- Scroll Content -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <!-- Recipe Variants Tabs -->
        {#if recipeVariants.length > 1}
            <div class="mb-4">
                <div
                    class="text-xs font-semibold text-app-text-muted uppercase tracking-wider mb-2"
                >
                    Recipe Variants ({recipeVariants.length})
                </div>
                <!-- Save current buffer to state on click is handled by switchVariant which does it before switch -->
                <div
                    class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
                >
                    {#each recipeVariants as variant, i}
                        <div class="relative group shrink-0 max-w-[150px]">
                            <button
                                onclick={() => switchVariant(i)}
                                disabled={isSaving}
                                class="w-full px-4 py-2 rounded-full text-sm font-bold border transition-all truncate {activeVariantIndex ===
                                i
                                    ? 'bg-app-primary text-white border-app-primary shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-app-text-muted border-app-border hover:border-app-primary/50'}"
                                title={variant.title || `Variant ${i + 1}`}
                            >
                                {variant.title || `Variant ${i + 1}`}
                            </button>

                            {#if recipeVariants.length > 1 && !isSaving}
                                <button
                                    onclick={(e) => removeVariant(i, e)}
                                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                    aria-label="Remove variant"
                                >
                                    <X size={12} />
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Basic Info Wrapper -->
        <div class="flex flex-row gap-4 md:gap-6">
            <!-- Left Column - Inputs -->
            <div class="flex-1 space-y-4">
                <div class="space-y-2">
                    <input
                        type="text"
                        bind:this={titleInput}
                        bind:value={title}
                        disabled={isSaving}
                        placeholder="Recipe Name *"
                        class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/70 focus:outline-none focus:border-app-primary transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div class="space-y-2">
                    <input
                        type="text"
                        bind:value={source}
                        disabled={isSaving}
                        placeholder="Source"
                        class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/70 focus:outline-none focus:border-app-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
            </div>

            <!-- Right Column - Image Upload -->
            <div class="w-24 md:w-32 shrink-0">
                <button
                    onclick={triggerFileInput}
                    disabled={isSaving}
                    class="group relative w-full aspect-square md:aspect-4/3 md:h-28 rounded-xl bg-app-surface-deep border-2 border-dashed border-app-border hover:border-app-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2 disabled:opacity-50"
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
                        <span>More Details</span>
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
                        disabled={isSaving}
                        placeholder="Description"
                        class="w-full p-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-none transition-colors disabled:opacity-50"
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
                            disabled={isSaving}
                            placeholder="e.g. 15 mins"
                            class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
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
                            disabled={isSaving}
                            placeholder="e.g. 30 mins"
                            class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
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
                            disabled={isSaving}
                            placeholder="e.g. 4"
                            class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
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
                            disabled={isSaving}
                            placeholder="e.g. 12"
                            class="w-full h-10 md:h-12 px-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>
        {/if}

        <!-- Ingredients Header & Toggle -->
        <div class="space-y-4">
            <h3 class="text-app-text font-bold text-lg flex items-center gap-1">
                Ingredients <span class="text-red-500">*</span>
            </h3>

            <!-- Toggle -->
            <div
                class="flex gap-1 p-1 bg-app-surface-deep border border-app-border rounded-xl mt-4"
            >
                <button
                    onclick={switchToLine}
                    disabled={isSaving}
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all border-2 border-transparent disabled:opacity-50 {ingredientMode ===
                    'line'
                        ? 'bg-white dark:bg-gray-800 text-app-primary shadow-sm border-app-primary/10'
                        : 'text-app-text-muted hover:text-app-text hover:bg-white/50'}"
                >
                    Line-item Input
                </button>
                <button
                    onclick={switchToBulk}
                    disabled={isSaving}
                    class="flex-1 py-2 text-sm font-bold rounded-lg transition-all border-2 border-transparent disabled:opacity-50 {ingredientMode ===
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
                                disabled={isSaving}
                                placeholder="Qty"
                                class="w-14 md:w-20 h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-colors shrink-0 disabled:opacity-50"
                            />
                            <input
                                type="text"
                                bind:value={ing.unit}
                                disabled={isSaving}
                                placeholder="Unit"
                                class="w-14 md:w-24 h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-colors shrink-0 disabled:opacity-50"
                            />
                            <div class="flex-1 min-w-0">
                                <input
                                    type="text"
                                    bind:value={ing.name}
                                    disabled={isSaving}
                                    placeholder="Ingredient"
                                    class="w-full h-11 px-3 bg-white dark:bg-gray-800 border border-app-border rounded-lg text-sm font-medium focus:border-app-primary focus:outline-none transition-colors disabled:opacity-50"
                                />
                            </div>
                            <button
                                onclick={() => removeIngredientRow(i)}
                                disabled={isSaving}
                                class="w-8 h-11 flex items-center justify-center text-app-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-app-text-muted"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    {/each}
                    <button
                        onclick={addIngredientRow}
                        disabled={isSaving}
                        class="text-sm text-app-primary font-bold hover:underline pt-2 pl-1 flex items-center gap-1 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        <Utensils size={14} /> Add Line Item
                    </button>
                </div>
            {:else}
                <textarea
                    bind:value={bulkIngredients}
                    rows="10"
                    disabled={isSaving}
                    placeholder="1 cup flour&#10;2 eggs&#10;..."
                    class="w-full p-4 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-y font-mono text-sm leading-relaxed disabled:opacity-50"
                ></textarea>
            {/if}
        </div>

        <!-- Instructions -->
        <div class="space-y-4 pb-8">
            <h3 class="text-app-text font-bold text-lg flex items-center gap-1">
                Instructions <span class="text-red-500">*</span>
            </h3>
            <textarea
                bind:value={instructions}
                rows="8"
                disabled={isSaving}
                placeholder="Step-by-step directions..."
                class="w-full p-5 bg-white dark:bg-gray-800 border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-y leading-relaxed disabled:opacity-50"
            ></textarea>
        </div>
    </div>
</Modal>

<!-- Import URL Modal -->
<ImportUrlModal
    isOpen={showImportModal}
    onClose={() => (showImportModal = false)}
    onImport={handleImportFromUrl}
/>

<!-- Paste Recipe Modal -->
<PasteRecipeModal
    isOpen={showPasteModal}
    onClose={() => (showPasteModal = false)}
    onImport={handlePasteText}
/>
