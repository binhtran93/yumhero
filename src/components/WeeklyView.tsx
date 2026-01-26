import React, { useState } from 'react';
import type { MealType, Recipe, WeeklyPlan } from '../types';
import { DayColumn } from './DayColumn';
import { RecipeModal } from './RecipeModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_PLAN: WeeklyPlan = DAYS.map(day => ({
    day,
    meals: {
        breakfast: null,
        lunch: null,
        dinner: null,
    }
}));

export const WeeklyView: React.FC = () => {
    const [plan, setPlan] = useState<WeeklyPlan>(INITIAL_PLAN);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        day: string | null;
        mealType: MealType | null;
    }>({
        isOpen: false,
        day: null,
        mealType: null,
    });

    const handleMealClick = (day: string, type: MealType) => {
        setModalState({
            isOpen: true,
            day,
            mealType: type,
        });
    };

    const handleRecipeSelect = (recipe: Recipe) => {
        if (!modalState.day || !modalState.mealType) return;

        setPlan(currentPlan =>
            currentPlan.map(dayPlan => {
                if (dayPlan.day === modalState.day) {
                    return {
                        ...dayPlan,
                        meals: {
                            ...dayPlan.meals,
                            [modalState.mealType!]: recipe,
                        }
                    };
                }
                return dayPlan;
            })
        );

        setModalState({ isOpen: false, day: null, mealType: null });
    };

    const handleClearMeal = (day: string, type: MealType) => {
        setPlan(currentPlan =>
            currentPlan.map(dayPlan => {
                if (dayPlan.day === day) {
                    return {
                        ...dayPlan,
                        meals: {
                            ...dayPlan.meals,
                            [type]: null,
                        }
                    };
                }
                return dayPlan;
            })
        );
    };

    const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    return (
        <>
            <div className="grid grid-cols-7 h-full w-full">
                {plan.map((dayPlan) => (
                    <DayColumn
                        key={dayPlan.day}
                        dayPlan={dayPlan}
                        isToday={dayPlan.day === currentDayName}
                        onMealClick={handleMealClick}
                        onMealClear={handleClearMeal}
                    />
                ))}
            </div>

            <RecipeModal
                isOpen={modalState.isOpen}
                mealType={modalState.mealType}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSelect={handleRecipeSelect}
            />
        </>
    );
};
