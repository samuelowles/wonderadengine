import React from 'react';
import { ArrowLeft, ActivityPulse, MessageBubble, UserCircle, Compass } from '../ui/Icons';
import { IconButton } from '../ui/Button';

/* ════════════════════════════════════════════
   Bottom Navigation Bar
   Glass-light, 3 icon tabs, 44px touch targets,
   safe-area-inset-bottom
   ════════════════════════════════════════════ */

interface BottomNavProps {
    activeTab?: number;
    onTabChange?: (tab: number) => void;
}

function BottomNav({ activeTab = 0, onTabChange }: BottomNavProps) {
    const tabs = [
        { icon: ActivityPulse, label: 'Explore' },
        { icon: MessageBubble, label: 'Chat' },
        { icon: UserCircle, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav shadow-nav">
            <div className="flex items-center justify-around h-[56px] max-w-lg mx-auto">
                {tabs.map((tab, i) => {
                    const Icon = tab.icon;
                    const isActive = i === activeTab;
                    return (
                        <button
                            key={i}
                            onClick={() => onTabChange?.(i)}
                            className={`
                                flex items-center gap-[6px] h-[36px] px-[14px] rounded-button
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-cta-dark text-text-inverse'
                                    : 'text-text-muted hover:text-text-secondary'
                                }
                            `}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            {isActive && (
                                <span className="font-body text-button-sm animate-fade-in">
                                    {tab.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Safe area spacer */}
            <div className="h-safe-bottom" />
        </nav>
    );
}

/* ════════════════════════════════════════════
   Standard Layout
   Warm page bg, optional header, bottom nav
   ════════════════════════════════════════════ */

interface LayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
    className?: string;
}

export function Layout({ children, showNav = true, className = '' }: LayoutProps) {
    return (
        <div className={`min-h-screen bg-page ${className}`}>
            {/* Header */}
            <header className="sticky top-0 z-40 glass-nav">
                <div className="flex items-center justify-between h-[56px] px-[24px] max-w-lg mx-auto">
                    <div className="flex items-center gap-[8px]">
                        <Compass size={20} className="text-brand-accent" />
                        <span className="font-display text-h3 text-text-primary">Wondura</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className={`px-[24px] pt-[24px] max-w-lg mx-auto ${showNav ? 'pb-[120px]' : 'pb-[48px]'}`}>
                {children}
            </main>

            {/* Bottom nav */}
            {showNav && <BottomNav activeTab={0} />}
        </div>
    );
}

/* ════════════════════════════════════════════
   Immersive Layout (Screen 3 pattern)
   Full-screen image hero, glass nav, dark text
   ════════════════════════════════════════════ */

interface ImmersiveLayoutProps {
    imageSrc: string;
    children: React.ReactNode;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export function ImmersiveLayout({ imageSrc, children, onBack, rightAction }: ImmersiveLayoutProps) {
    return (
        <div className="min-h-screen relative bg-black">
            {/* Full-bleed background image */}
            <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-hero-dark" />

            {/* Glass navigation bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[56px] px-[16px]">
                {onBack && (
                    <IconButton variant="glass" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </IconButton>
                )}
                <div className="flex-1" />
                {rightAction}
            </nav>

            {/* Content overlay */}
            <div className="relative z-10 min-h-screen px-[24px] pt-[80px] pb-[48px]">
                {children}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════
   Overlay Layout (Screen 2 / Flighty paywall)
   Hero image top → white modal card bottom
   ════════════════════════════════════════════ */

interface OverlayLayoutProps {
    imageSrc: string;
    heroContent?: React.ReactNode;
    children: React.ReactNode;
}

export function OverlayLayout({ imageSrc, heroContent, children }: OverlayLayoutProps) {
    return (
        <div className="min-h-screen bg-page">
            {/* Hero image section */}
            <div className="relative h-[45vh] min-h-[320px]">
                <img
                    src={imageSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 gradient-hero-dark" />

                {/* Hero content overlay */}
                {heroContent && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-[32px] text-center">
                        {heroContent}
                    </div>
                )}

                {/* Carousel dots */}
                <div className="absolute bottom-[20px] left-0 right-0 flex justify-center gap-[6px] z-10">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                    <div className="w-[6px] h-[6px] rounded-full bg-white/40" />
                    <div className="w-[6px] h-[6px] rounded-full bg-white/40" />
                </div>
            </div>

            {/* White modal card sliding up over hero */}
            <div className="relative bg-surface rounded-t-card -mt-[24px] shadow-rest">
                <div className="px-[24px] pt-[28px] pb-[48px] max-w-lg mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
