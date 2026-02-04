import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    heroImage?: boolean;
}

export function Layout({ children, heroImage = false }: LayoutProps) {
    return (
        <div className="min-h-screen bg-brand-light">
            {/* Header */}
            <header className="sticky top-0 z-50 px-5 md:px-10 py-4 bg-brand-light/90 backdrop-blur-md border-b border-border-subtle">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="font-display text-display-md font-bold text-text-primary">
                        Wondura
                    </h1>
                    <nav className="flex items-center gap-4">
                        <span className="font-body text-body-sm text-text-muted">
                            New Zealand Experiences
                        </span>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-5 md:px-10 py-8 max-w-4xl mx-auto">
                {children}
            </main>

            {/* Footer */}
            <footer className="px-5 md:px-10 py-6 border-t border-border-subtle mt-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="font-body text-caption text-text-muted">
                        Powered by local knowledge
                    </span>
                </div>
            </footer>
        </div>
    );
}

interface HeroLayoutProps {
    children: React.ReactNode;
    imageSrc: string;
    title?: string;
    subtitle?: string;
}

export function HeroLayout({ children, imageSrc, title, subtitle }: HeroLayoutProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <img
                    src={imageSrc}
                    alt="Hero background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 hero-gradient" />

                <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-12">
                    <div className="max-w-4xl mx-auto w-full">
                        {title && (
                            <h1 className="font-display text-display-xl font-bold text-text-inverse mb-2">
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p className="font-body text-body-lg text-text-inverse/80">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="px-5 md:px-10 py-8 max-w-4xl mx-auto -mt-8 relative z-20">
                {children}
            </main>
        </div>
    );
}
