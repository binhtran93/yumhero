<script lang="ts">
    import type { MealType, Recipe, WeeklyPlan } from "$lib/types";
    import DayColumn from "$lib/components/DayColumn.svelte";
    import RecipeModal from "$lib/components/RecipeModal.svelte";

    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    // State: Weekly Plan
    let plan = $state<WeeklyPlan>(
        DAYS.map((day) => ({
            day,
            meals: {
                breakfast: null,
                lunch: null,
                dinner: null,
            },
        })),
    );

    // State: Modal
    // We keep this simple and local. No stores needed suitable for MVP.
    let modal = $state<{
        isOpen: boolean;
        day: string | null;
        mealType: MealType | null;
    }>({
        isOpen: false,
        day: null,
        mealType: null,
    });

    // Handlers
    const handleMealClick = (day: string, type: MealType) => {
        console.log("Open Modal:", day, type);
        modal.isOpen = true;
        modal.day = day;
        modal.mealType = type;
    };

    const handleRecipeSelect = (recipe: Recipe) => {
        if (!modal.day || !modal.mealType) return;

        const dayIndex = plan.findIndex((d) => d.day === modal.day);
        if (dayIndex !== -1) {
            // Direct mutation is valid and reactive in Svelte 5
            plan[dayIndex].meals[modal.mealType] = recipe;
        }

        closeModal();
    };

    const handleClearMeal = (day: string, type: MealType) => {
        const dayIndex = plan.findIndex((d) => d.day === day);
        if (dayIndex !== -1) {
            plan[dayIndex].meals[type] = null;
        }
    };

    const closeModal = () => {
        modal.isOpen = false;
        // Optional: reset day/type if needed, but keeping them helps with exit animations if we had them
    };

    const currentDayName =
        DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
</script>

<div class="grid grid-cols-7 h-full w-full bg-canvas">
    {#each plan as dayPlan (dayPlan.day)}
        <DayColumn
            {dayPlan}
            isToday={dayPlan.day === currentDayName}
            onMealClick={handleMealClick}
            onMealClear={handleClearMeal}
        />
    {/each}
</div>

<!-- Modal acts as a pure controlled component -->
<RecipeModal
    isOpen={modal.isOpen}
    mealType={modal.mealType}
    onClose={closeModal}
    onSelect={handleRecipeSelect}
/>
