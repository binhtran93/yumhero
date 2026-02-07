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
        Clock,
        Hash,
        AlignLeft,
        Settings2,
        Link2,
        Users,
        Type,
        LayoutList,
        ListTodo,
        ChefHat,
        Save,
        Check,
    } from "lucide-svelte";

    import type { Recipe, Ingredient, MealType } from "$lib/types";
    import { addRecipe, updateRecipe } from "$lib/stores/recipes";
    import { userTags, addTag as addUserTag } from "$lib/stores/tags";
    import { user } from "$lib/stores/auth";
    import { get } from "svelte/store";
    import { slide, fade } from "svelte/transition";
    import { parseAmount, formatAmount } from "$lib/utils/shopping";
    import { toasts } from "$lib/stores/toasts";
    import { twMerge } from "tailwind-merge";

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
        adaptive?: boolean;
    }

    let {
        isOpen,
        onClose,
        initialRecipe,
        initialAction = null,
        adaptive = true,
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
    let mealTypes = $state<MealType[]>([]);
    let showAdvanced = $state(false);

    // Multiple Recipe Management
    type RecipeVariantState = {
        id?: string;
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
        tags: string[];
        mealTypes: MealType[];
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
        id: undefined,
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
        tags: [],
        mealTypes: [],
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
            id: data.id,
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
            tags: data.tags || [],
            mealTypes: Array.from(new Set(data.mealTypes || [])),
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
        tags = variant.tags || [];
        mealTypes = variant.mealTypes || [];
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
            id: recipeVariants[index].id,
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
            tags,
            mealTypes,
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

    const toggleMealType = (type: MealType) => {
        if (mealTypes.includes(type)) {
            mealTypes = mealTypes.filter((t) => t !== type);
        } else {
            mealTypes = [...mealTypes, type];
        }
    };

    // Tags Management
    let tagInput = $state("");
    let tags = $state<string[]>([]);
    let selectedTagIndex = $state(-1);

    let tagSuggestions = $derived(
        tagInput.trim()
            ? get(userTags)
                  .data.map((t) => t.label)
                  .filter(
                      (label) =>
                          label
                              .toLowerCase()
                              .includes(tagInput.toLowerCase().trim()) &&
                          !tags.includes(label),
                  )
                  .slice(0, 5)
            : [],
    );

    const addTag = (label?: string) => {
        const cleanTag =
            typeof label === "string" ? label.trim() : tagInput.trim();
        if (cleanTag && tags.length < 5 && !tags.includes(cleanTag)) {
            tags = [...tags, cleanTag];
            tagInput = "";
            selectedTagIndex = -1;
        }
    };

    const removeTag = (index: number) => {
        tags = tags.filter((_, i) => i !== index);
    };

    const handleTagKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (
                selectedTagIndex >= 0 &&
                selectedTagIndex < tagSuggestions.length
            ) {
                addTag(tagSuggestions[selectedTagIndex]);
            } else {
                addTag();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedTagIndex = Math.min(
                selectedTagIndex + 1,
                tagSuggestions.length - 1,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedTagIndex = Math.max(selectedTagIndex - 1, -1);
        } else if (e.key === "Escape") {
            selectedTagIndex = -1;
        } else if (e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    const isBlobUrl = (url: string | undefined | null): boolean =>
        Boolean(url && url.startsWith("blob:"));

    const revokeBlobUrl = (url: string | undefined | null) => {
        if (isBlobUrl(url)) {
            URL.revokeObjectURL(url as string);
        }
    };

    const handleImageUpload = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            revokeBlobUrl(imageUrl);
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

    type PresignedUploadResponse = {
        uploadUrl: string;
        publicUrl: string;
        method: "PUT";
        headers?: Record<string, string>;
        key: string;
    };

    const uploadImageFileToR2 = async (file: File): Promise<string> => {
        const currentUser = get(user);
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        const token = await currentUser.getIdToken();
        const presignResponse = await fetch("/api/r2/presign-upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
            }),
        });

        if (!presignResponse.ok) {
            let message = "Failed to create upload URL";
            try {
                const errorData = await presignResponse.json();
                message = errorData.error || message;
            } catch {
                // Keep fallback message if JSON parsing fails
            }
            throw new Error(message);
        }

        const presigned: PresignedUploadResponse = await presignResponse.json();
        const uploadResponse = await fetch(presigned.uploadUrl, {
            method: presigned.method || "PUT",
            headers: {
                ...(presigned.headers || {}),
                "Content-Type": file.type,
            },
            body: file,
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload image to storage");
        }

        return presigned.publicUrl;
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

                let finalImage = variant.imageUrl || undefined;
                if (variant.imageFile) {
                    finalImage = await uploadImageFileToR2(variant.imageFile);
                    if (isBlobUrl(variant.imageUrl)) {
                        revokeBlobUrl(variant.imageUrl);
                    }
                    variant.imageUrl = finalImage;
                    variant.imageFile = null;

                    if (activeVariantIndex < recipeVariants.length) {
                        const activeVariant = recipeVariants[activeVariantIndex];
                        if (activeVariant === variant) {
                            imageUrl = finalImage;
                            imageFile = null;
                        }
                    }
                }

                if (isBlobUrl(finalImage)) {
                    finalImage = undefined;
                }

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
                    tags: variant.tags,
                    mealTypes: variant.mealTypes,
                };

                try {
                    if (variant.id) {
                        await updateRecipe(variant.id, newRecipe);
                    } else {
                        await addRecipe(newRecipe);
                    }
                    // Also ensure tags are in user's tag collection
                    for (const tagLabel of variant.tags) {
                        const existingTags = get(userTags).data;
                        if (
                            !existingTags.some(
                                (t) =>
                                    t.label.toLowerCase() ===
                                    tagLabel.toLowerCase(),
                            )
                        ) {
                            await addUserTag(tagLabel);
                        }
                    }
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
            const currentUser = get(user);
            if (!currentUser) {
                toasts.error("You must be logged in to import recipes");
                throw new Error("User not authenticated");
            }
            const token = await currentUser.getIdToken();

            const currentTags = get(userTags).data.map((t) => t.label);
            const response = await fetch("/api/extract-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url, userTags: currentTags }),
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
            const currentUser = get(user);
            if (!currentUser) {
                toasts.error("You must be logged in to import recipes");
                throw new Error("User not authenticated");
            }
            const token = await currentUser.getIdToken();

            const currentTags = get(userTags).data.map((t) => t.label);
            const response = await fetch("/api/extract-recipe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text, userTags: currentTags }),
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
            class="px-6 py-3 bg-app-bg border border-app-border rounded-xl text-app-text font-bold hover:bg-app-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-auto flex items-center gap-2"
        >
            <X size={18} />
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
                <Save size={18} />
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
    {adaptive}
    class="w-full md:max-w-2xl md:h-[90vh] bg-app-surface p-0 overflow-hidden flex flex-col md:rounded-2xl"
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
                    class="flex items-center gap-2 overflow-x-auto p-2 scrollbar-none"
                >
                    {#each recipeVariants as variant, i}
                        <div class="relative group shrink-0 max-w-[150px]">
                            <button
                                onclick={() => switchVariant(i)}
                                disabled={isSaving}
                                class="w-full px-4 py-2 rounded-full text-sm font-bold border transition-all truncate {activeVariantIndex ===
                                i
                                    ? 'bg-app-primary text-white border-app-primary shadow-md'
                                    : 'bg-app-bg text-app-text-muted border-app-border hover:border-app-primary/50'}"
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
            <div class="flex-1 space-y-6">
                <!-- Recipe Name -->
                <div class="space-y-3">
                    <div class="px-1">
                        <span
                            class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                            >Recipe Name <span class="text-red-500">*</span
                            ></span
                        >
                    </div>
                    <input
                        type="text"
                        bind:this={titleInput}
                        bind:value={title}
                        disabled={isSaving}
                        placeholder="e.g. Grandma's Famous Lasagna"
                        class="w-full h-11 px-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-all font-medium"
                    />
                </div>

                <!-- Meal Type -->
                <div class="space-y-3">
                    <div class="px-1">
                        <span
                            class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                            >Meal Category</span
                        >
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each ["breakfast", "lunch", "dinner", "snack"] as type}
                            <button
                                type="button"
                                onclick={() => toggleMealType(type as MealType)}
                                disabled={isSaving}
                                class={twMerge(
                                    "px-4 py-2 rounded-full text-xs font-bold border transition-all disabled:opacity-50",
                                    mealTypes.includes(type as MealType)
                                        ? "bg-app-primary text-white border-app-primary shadow-sm"
                                        : "bg-app-bg text-app-text-muted border-app-border hover:border-app-primary/50",
                                )}
                            >
                                <span class="capitalize">{type}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Right Column - Image Upload -->
            <div class="w-24 md:w-32 shrink-0 pt-7">
                <button
                    onclick={triggerFileInput}
                    disabled={isSaving}
                    class="group relative w-full aspect-square md:aspect-4/3 md:h-28 rounded-2xl bg-app-surface-deep border-2 border-dashed border-app-border hover:border-app-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
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
                            class="p-2 md:p-3 bg-app-bg rounded-full shadow-sm group-hover:scale-110 transition-transform"
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

        <!-- Ingredients Section -->
        <div class="space-y-4 pt-4">
            <div class="flex items-center justify-between px-1">
                <div class="px-1">
                    <span
                        class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                    >
                        Ingredients <span class="text-red-500">*</span>
                    </span>
                </div>

                <!-- Toggle -->
                <div
                    class="flex p-1 bg-app-surface-deep border border-app-border rounded-xl"
                >
                    <button
                        onclick={switchToLine}
                        disabled={isSaving}
                        class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border border-transparent {ingredientMode ===
                        'line'
                            ? 'bg-app-bg text-app-primary shadow-sm border-app-primary/10'
                            : 'text-app-text-muted hover:text-app-text'}"
                    >
                        List
                    </button>
                    <button
                        onclick={switchToBulk}
                        disabled={isSaving}
                        class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border border-transparent {ingredientMode ===
                        'bulk'
                            ? 'bg-app-bg text-app-primary shadow-sm border-app-primary/10'
                            : 'text-app-text-muted hover:text-app-text'}"
                    >
                        Bulk
                    </button>
                </div>
            </div>

            <!-- Inputs -->
            {#if ingredientMode === "line"}
                <div
                    class="space-y-3 bg-app-surface-deep/30 p-3 md:p-4 rounded-2xl border border-app-border"
                >
                    {#each ingredients as ing, i}
                        <div class="flex gap-2 w-full min-w-0">
                            <input
                                type="text"
                                bind:value={ing.amount}
                                disabled={isSaving}
                                placeholder="Qty"
                                class="w-14 md:w-20 h-10 px-3 bg-app-bg border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-all shrink-0 disabled:opacity-50"
                            />
                            <input
                                type="text"
                                bind:value={ing.unit}
                                disabled={isSaving}
                                placeholder="Unit"
                                class="w-14 md:w-24 h-10 px-3 bg-app-bg border border-app-border rounded-lg text-sm focus:border-app-primary focus:outline-none transition-all shrink-0 disabled:opacity-50"
                            />
                            <div class="flex-1 min-w-0">
                                <input
                                    type="text"
                                    bind:value={ing.name}
                                    disabled={isSaving}
                                    placeholder="Ingredient"
                                    class="w-full h-10 px-3 bg-app-bg border border-app-border rounded-lg text-sm font-medium focus:border-app-primary focus:outline-none transition-all disabled:opacity-50"
                                />
                            </div>
                            <button
                                onclick={() => removeIngredientRow(i)}
                                disabled={isSaving}
                                class="w-8 h-10 flex items-center justify-center text-app-text-muted hover:text-red-500 rounded-lg transition-all shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    {/each}
                    <button
                        onclick={addIngredientRow}
                        disabled={isSaving}
                        class="text-xs text-app-primary font-bold hover:underline pt-1 pl-1 flex items-center gap-1.5"
                    >
                        <div
                            class="w-5 h-5 rounded-full bg-app-primary/10 flex items-center justify-center"
                        >
                            <Utensils size={12} />
                        </div>
                        Add next ingredient
                    </button>
                </div>
            {:else}
                <textarea
                    bind:value={bulkIngredients}
                    rows="8"
                    disabled={isSaving}
                    placeholder="1 cup flour&#10;2 eggs&#10;..."
                    class="w-full p-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/40 focus:outline-none focus:border-app-primary resize-y font-mono text-sm leading-relaxed disabled:opacity-50"
                ></textarea>
            {/if}
        </div>

        <!-- Instructions Section -->
        <div class="space-y-4 pt-4">
            <div class="px-1">
                <span
                    class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                >
                    Instructions <span class="text-red-500">*</span>
                </span>
            </div>
            <textarea
                bind:value={instructions}
                rows="8"
                disabled={isSaving}
                placeholder="How do you make it? Speak your mind..."
                class="w-full p-5 bg-app-bg border border-app-border rounded-2xl text-app-text placeholder:text-app-text-muted/40 focus:outline-none focus:border-app-primary transition-all resize-y leading-relaxed text-sm disabled:opacity-50"
            ></textarea>
        </div>

        <!-- Redesigned Advanced Section -->
        <div class="pt-4">
            <button
                onclick={() => (showAdvanced = !showAdvanced)}
                class="w-full flex items-center justify-between py-4 px-2 hover:bg-app-surface-hover/30 rounded-xl transition-all group"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-xl bg-app-surface-deep border border-app-border flex items-center justify-center group-hover:bg-app-bg group-hover:border-app-primary/30 transition-all"
                    >
                        <Settings2
                            size={20}
                            class="text-app-text-muted group-hover:text-app-primary transition-colors {showAdvanced
                                ? 'rotate-45'
                                : ''}"
                        />
                    </div>
                    <div class="text-left">
                        <h4
                            class="text-sm font-bold text-app-text group-hover:text-app-primary transition-colors"
                        >
                            Additional Details
                        </h4>
                        <p class="text-[11px] text-app-text-muted">
                            Description, tags, prep time, and more
                        </p>
                    </div>
                </div>
                <div
                    class="text-app-text-muted group-hover:text-app-primary transition-colors"
                >
                    {#if showAdvanced}
                        <ChevronUp size={20} />
                    {:else}
                        <ChevronDown size={20} />
                    {/if}
                </div>
            </button>

            {#if showAdvanced}
                <div
                    transition:slide={{ duration: 300 }}
                    class="space-y-8 pt-6 pb-12"
                >
                    <!-- Description -->
                    <div class="space-y-3">
                        <div class="px-1">
                            <span
                                class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                                >Description</span
                            >
                        </div>
                        <textarea
                            bind:value={description}
                            rows="4"
                            disabled={isSaving}
                            placeholder="Add a short description or notes about this recipe..."
                            class="w-full p-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary resize-none transition-all text-sm leading-relaxed"
                        ></textarea>
                    </div>

                    <!-- Source & Tags Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Source -->
                        <div class="space-y-3">
                            <div class="px-1">
                                <span
                                    class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                                    >Source</span
                                >
                            </div>
                            <input
                                type="text"
                                bind:value={source}
                                disabled={isSaving}
                                placeholder="Website URL or Cookbook name"
                                class="w-full h-11 px-4 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-all text-sm"
                            />
                        </div>

                        <!-- Tags -->
                        <div class="space-y-3">
                            <div class="px-1">
                                <span
                                    class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                                    >Tags (Max 5)</span
                                >
                            </div>
                            <div class="relative">
                                <div
                                    class="flex flex-wrap gap-2 p-2 bg-app-bg border border-app-border rounded-xl min-h-[44px] focus-within:border-app-primary transition-colors"
                                >
                                    {#each tags as tag, i}
                                        <span
                                            class="bg-app-primary/10 text-app-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                                        >
                                            {tag}
                                            <button
                                                onclick={() => removeTag(i)}
                                                class="hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    {/each}
                                    {#if tags.length < 5}
                                        <input
                                            type="text"
                                            bind:value={tagInput}
                                            onkeydown={handleTagKeydown}
                                            onblur={() =>
                                                setTimeout(() => addTag(), 200)}
                                            placeholder={tags.length === 0
                                                ? "Add tags..."
                                                : ""}
                                            class="flex-1 bg-transparent border-none outline-none text-app-text placeholder:text-app-text-muted/50 text-sm min-w-[80px] h-7"
                                        />
                                    {/if}
                                </div>

                                {#if tagSuggestions.length > 0}
                                    <div
                                        class="absolute left-0 right-0 top-full mt-1 bg-app-bg border border-app-border rounded-xl shadow-xl z-[100] overflow-hidden py-1"
                                    >
                                        {#each tagSuggestions as suggestion, i}
                                            <button
                                                onclick={() =>
                                                    addTag(suggestion)}
                                                class="w-full text-left px-4 py-2.5 text-sm transition-colors {i ===
                                                selectedTagIndex
                                                    ? 'bg-app-primary text-white font-bold'
                                                    : 'text-app-text hover:bg-app-surface-hover'}"
                                            >
                                                {suggestion}
                                            </button>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Meta Grid (Prep, Cook, Serves, Yields) -->
                    <div
                        class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-app-surface-deep/50 rounded-2xl border border-app-border"
                    >
                        <div class="space-y-2">
                            <span
                                class="text-[10px] font-bold text-app-text-muted uppercase tracking-widest"
                                >Prep</span
                            >
                            <input
                                type="text"
                                bind:value={prepTime}
                                disabled={isSaving}
                                placeholder="15m"
                                class="w-full h-10 px-3 bg-app-bg border border-app-border rounded-lg text-app-text placeholder:text-app-text-muted/30 focus:outline-none focus:border-app-primary transition-all text-sm font-medium"
                            />
                        </div>
                        <div class="space-y-2">
                            <span
                                class="text-[10px] font-bold text-app-text-muted uppercase tracking-widest"
                                >Cook</span
                            >
                            <input
                                type="text"
                                bind:value={cookTime}
                                disabled={isSaving}
                                placeholder="30m"
                                class="w-full h-10 px-3 bg-app-bg border border-app-border rounded-lg text-app-text placeholder:text-app-text-muted/30 focus:outline-none focus:border-app-primary transition-all text-sm font-medium"
                            />
                        </div>
                        <div class="space-y-2">
                            <span
                                class="text-xs font-bold text-app-text-muted uppercase tracking-wider pl-1"
                                >Serves</span
                            >
                            <input
                                type="text"
                                bind:value={servings}
                                disabled={isSaving}
                                placeholder="4"
                                class="w-full h-10 px-3 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
                            />
                        </div>
                        <div class="space-y-2">
                            <span
                                class="text-[10px] font-bold text-app-text-muted uppercase tracking-widest"
                                >Yields</span
                            >
                            <input
                                type="text"
                                bind:value={yields}
                                disabled={isSaving}
                                placeholder="12"
                                class="w-full h-10 px-3 bg-app-bg border border-app-border rounded-xl text-app-text placeholder:text-app-text-muted/50 focus:outline-none focus:border-app-primary transition-colors text-center font-medium disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</Modal>

<!-- Import URL Modal -->
<ImportUrlModal
    isOpen={showImportModal}
    onClose={() => (showImportModal = false)}
    onImport={handleImportFromUrl}
    {adaptive}
/>

<!-- Paste Recipe Modal -->
<PasteRecipeModal
    isOpen={showPasteModal}
    onClose={() => (showPasteModal = false)}
    onImport={handlePasteText}
    {adaptive}
/>
