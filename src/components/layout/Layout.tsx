import React from 'react';
import { ArrowLeft, Compass } from '../ui/Icons';
import { IconButton } from '../ui/Button';

/* ════════════════════════════════════════════
   Minimal Header — glass, brand lockup only
   No bottom nav (removed per feedback)
   ════════════════════════════════════════════ */

interface LayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    className?: string;
    onBack?: () => void;
}

export function Layout({ children, showHeader = true, className = '', onBack }: LayoutProps) {
    return (
        <div className={`min-h-screen bg-page ${className}`}>
            {showHeader && (
                <header className="sticky top-0 z-40 glass-nav">
                    <div className="flex items-center justify-between h-[56px] px-[24px] max-w-lg mx-auto">
                        {onBack ? (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-[6px] font-body text-body-sm text-text-secondary hover:text-text-primary transition-colors press-scale"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                        ) : (
                            <div className="flex items-center gap-[8px]">
                                <Compass size={20} className="text-brand-accent" />
                                <span className="font-display text-h3 text-text-primary">Wondura</span>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <main className="px-[24px] pt-[24px] pb-[48px] max-w-lg mx-auto">
                {children}
            </main>
        </div>
    );
}

/* ════════════════════════════════════════════
   Immersive Layout (full-screen hero bg)
   ════════════════════════════════════════════ */

interface ImmersiveLayoutProps {
    imageSrc: string;
    children: React.ReactNode;
    onBack?: () => void;
}

export function ImmersiveLayout({ imageSrc, children, onBack }: ImmersiveLayoutProps) {
    return (
        <div className="min-h-screen relative bg-black">
            <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-hero-dark" />

            {onBack && (
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center h-[56px] px-[16px]">
                    <IconButton variant="glass" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </IconButton>
                </nav>
            )}

            <div className="relative z-10 min-h-screen px-[24px] pt-[80px] pb-[48px]">
                {children}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════
   Full Background Layout
   Full-screen background image with a centered
   9:16 card overlaid. For form page.
   ════════════════════════════════════════════ */

interface FullBgLayoutProps {
    imageSrc: string;
    children: React.ReactNode;
}

export function FullBgLayout({ imageSrc, children }: FullBgLayoutProps) {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-[16px]">
            {/* Full background */}
            <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* 9:16 Card */}
            <div className="relative z-10 w-full max-w-[400px] aspect-[9/16] max-h-[90vh] bg-surface rounded-card shadow-glass overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════
   Hero Background Layout
   Single full-bleed hero image with content
   (cards) overlaid on top. For results page.
   ════════════════════════════════════════════ */

interface HeroBgLayoutProps {
    imageSrc: string;
    children: React.ReactNode;
    onBack?: () => void;
}

export function HeroBgLayout({ imageSrc, children, onBack }: HeroBgLayoutProps) {
    return (
        <div className="min-h-screen relative">
            {/* Fixed background image */}
            <div className="fixed inset-0 z-0">
                <img
                    src={imageSrc}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Navigation */}
            {onBack && (
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center h-[56px] px-[16px]">
                    <IconButton variant="glass" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </IconButton>
                </nav>
            )}

            {/* Scrollable content */}
            <div className="relative z-10 min-h-screen px-[24px] pt-[72px] pb-[48px] max-w-lg mx-auto">
                {children}
            </div>
        </div>
    );
}
