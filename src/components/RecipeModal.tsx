import React from 'react';
import { X, Search, Check } from 'lucide-react';
import type { Recipe, MealType } from '../types';
import { mockRecipes } from '../data/mockRecipes';

interface RecipeModalProps {
    isOpen: boolean;
    mealType: MealType | null;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, mealType, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dimmed Backdrop */}
            <div
                className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Minimalist */}
            <div className="relative z-10 w-full max-w-lg bg-surface border border-border-strong shadow-2xl flex flex-col max-h-[60vh]">

                {/* Header */}
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-widest text-text-secondary">Select Recipe</span>
                    <button onClick={onClose} className="text-text-primary hover:opacity-50">
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-border-subtle bg-canvas">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                        <input
                            autoFocus
                            type="text"
                            placeholder={`Search for a ${mealType} recipe...`}
                            className="w-full pl-8 pr-4 py-1.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-text-secondary/50"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {mockRecipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            onClick={() => onSelect(recipe)}
                            className="cursor-pointer group flex items-center justify-between p-4 border-b border-border-subtle hover:bg-canvas last:border-b-0 transition-colors"
                        >
                            <div>
                                <h3 className="font-medium text-text-primary group-hover:underline decoration-1 underline-offset-2">{recipe.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    {recipe.tags.map(tag => (
                                        <span key={tag} className="text-[10px] text-text-secondary uppercase">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 text-text-primary">
                                <Check size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
