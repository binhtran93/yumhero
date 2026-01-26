import React from 'react';
import type { DayPlan, MealType } from '../types';
import { MealSlot } from './MealSlot';

interface DayColumnProps {
    dayPlan: DayPlan;
    isToday?: boolean;
    onMealClick: (day: string, type: MealType) => void;
    onMealClear: (day: string, type: MealType) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({ dayPlan, isToday, onMealClick, onMealClear }) => {
    return (
        <div className={`flex flex-col h-full border-r border-border-subtle last:border-r-0 min-w-0 bg-canvas`}>
            {/* Header */}
            <div className={`p-4 border-b border-border-strong flex flex-col justify-between h-32 ${isToday ? 'bg-surface' : ''}`}>
                <span className={`text-xs uppercase tracking-widest font-bold ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
                    {dayPlan.day}
                </span>
                {isToday && (
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mb-1"></div>
                )}
            </div>

            {/* Slots */}
            <div className="flex-1 flex flex-col">
                <MealSlot
                    type="breakfast"
                    recipe={dayPlan.meals.breakfast}
                    onClick={() => onMealClick(dayPlan.day, 'breakfast')}
                    onClear={() => onMealClear(dayPlan.day, 'breakfast')}
                />

                <MealSlot
                    type="lunch"
                    recipe={dayPlan.meals.lunch}
                    onClick={() => onMealClick(dayPlan.day, 'lunch')}
                    onClear={() => onMealClear(dayPlan.day, 'lunch')}
                />

                <MealSlot
                    type="dinner"
                    recipe={dayPlan.meals.dinner}
                    onClick={() => onMealClick(dayPlan.day, 'dinner')}
                    onClear={() => onMealClear(dayPlan.day, 'dinner')}
                />
            </div>
        </div>
    );
};
