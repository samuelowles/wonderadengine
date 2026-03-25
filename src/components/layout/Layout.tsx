import React from 'react';
import { ArrowLeft, Compass } from '../ui/Icons';
import { IconButton } from '../ui/Button';

/* ════════════════════════════════════════════
   Wondura Dynamic Background
   The shared premium blob gradient and noise
   ════════════════════════════════════════════ */

export function WonduraBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#050A07]">
            {/* Deep Green Base Wash - Wild stretched shape */}
            <div className="absolute -top-[20%] -left-[30%] w-[150vw] h-[50vh] bg-[#0A3D22] rounded-[20%_80%_10%_90%] mix-blend-screen filter blur-[120px] opacity-80 rotate-[15deg] skew-y-12 scale-y-125" />

            {/* Vibrant Green - Sharp asymmetric arc */}
            <div className="absolute -top-[10%] -right-[20%] w-[70vw] h-[100vh] bg-[#3B9C49] rounded-[100%_0%_90%_10%] mix-blend-screen filter blur-[110px] opacity-90 -rotate-[30deg] -skew-x-[20deg]" />
            
            {/* Bright Teal - Huge slanted wave */}
            <div className="absolute -bottom-[20%] -left-[40%] w-[160vw] h-[80vh] bg-[#1A7B9C] rounded-[30%_70%_100%_0%] mix-blend-screen filter blur-[140px] opacity-90 -rotate-[15deg] skew-x-[10deg] scale-125" />

            {/* Subtle Tree Brown - Flattened organic swipe */}
            <div className="absolute top-[50%] -right-[30%] w-[120vw] h-[40vh] bg-[#755D44] rounded-[0%_100%_10%_90%] mix-blend-screen filter blur-[120px] opacity-80 rotate-[45deg] scale-y-150" />
            
            {/* Massive Noise Stack */}
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-color-dodge contrast-[1.5]" style={{ backgroundImage: 'url("/img/noise.png")', backgroundSize: '70px 70px' }} />
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-overlay" style={{ backgroundImage: 'url("/img/noise.png")', backgroundSize: '100px 100px' }} />
            
            {/* Dark gradient overlay to ensure text legibility at the top/bottom if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>
    );
}

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
            <WonduraBackground />


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
            <div className="fixed inset-0 z-0">
                <WonduraBackground />
            </div>

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
/* ════════════════════════════════════════════
   Overlay Layout (Flighty-style modal sheet)
   Top 40% brand/hero, Bottom 60% white card.
   The card slides up over the background.
   ════════════════════════════════════════════ */

interface OverlayLayoutProps {
    imageSrc: string;
    children: React.ReactNode;
}

export function OverlayLayout({ imageSrc, children }: OverlayLayoutProps) {
    return (
        <div className="min-h-screen relative flex flex-col">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0">
                <img
                    src={imageSrc}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top spacer (brand area lives here in children if needed, or just space) */}
                <div className="flex-1 min-h-[30vh]" />

                {/* Modal Card */}
                <div className="bg-surface rounded-t-[32px] shadow-glass animate-slide-up">
                    {children}
                </div>
            </div>
        </div>
    );
}
