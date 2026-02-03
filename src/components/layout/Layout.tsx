import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-paper">
            <header className="px-5 md:px-10 lg:px-30 py-6 border-b border-brand-mist">
                <h1 className="font-serif text-2xl font-semibold text-primary">Wondura</h1>
            </header>
            <main className="px-5 md:px-10 lg:px-30 py-8 max-w-4xl mx-auto">
                {children}
            </main>
        </div>
    );
}
