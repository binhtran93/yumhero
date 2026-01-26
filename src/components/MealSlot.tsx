import React from 'react';
import { Plus, X } from 'lucide-react';
import type { Recipe, MealType } from '../types';
import { twMerge } from 'tailwind-merge';

interface MealSlotProps {
    type: MealType;
    recipe: Recipe | null;
    onClick: () => void;
    onClear?: (e: React.MouseEvent) => void;
}

export const MealSlot: React.FC<MealSlotProps> = ({ type, recipe, onClick, onClear }) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                "group relative flex flex-col w-full h-[120px] transition-all duration-200 cursor-pointer border-b border-dashed border-border-subtle last:border-b-0",
                "hover:bg-surface hover:pl-1", // Subtle interaction
                recipe ? "bg-white" : ""
            )}
        >
            <div className="flex-1 p-3 flex flex-col justify-start">
                <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-widest mb-1 opacity-50">{type}</span>

                {recipe ? (
                    <div className="animate-in fade-in duration-200">
                        <h4 className="text-sm font-medium text-text-primary leading-tight">{recipe.title}</h4>
                        <div className="flex gap-2 mt-2">
                            {recipe.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[9px] border border-border-strong px-1 lg:px-2 rounded-sm text-text-secondary uppercase">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {onClear && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear(e);
                                }}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-red-600 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-text-secondary" />
                    </div>
                )}
            </div>
        </div>
    );
};
