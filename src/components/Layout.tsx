import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="h-screen w-screen bg-canvas text-text-primary overflow-hidden flex flex-col font-display">
            {/* Ultra-minimal header */}
            <header className="h-12 border-b border-border-subtle bg-surface flex items-center px-6 justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold tracking-tight uppercase">YumHero <span className="text-text-secondary font-normal ml-2">Weekly Planner</span></h1>
                </div>
                <div className="text-xs text-text-secondary font-mono">
                    Week 42 • 2026
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
};
