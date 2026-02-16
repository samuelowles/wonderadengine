import React from 'react';

/* ────────────────────────────────────────────
   Button — The Single Dark CTA
   Philosophy: 56px height, #1A1A1A bg, pill radius,
   button token (16px/600). One button, one action.
   ──────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'dark' | 'ghost' | 'pill';
    size?: 'lg' | 'md' | 'sm';
    children: React.ReactNode;
}

export function Button({
    variant = 'dark',
    size = 'md',
    children,
    className = '',
    ...props
}: ButtonProps) {
    const base = 'inline-flex items-center justify-center font-body transition-all duration-200 ease-spring press-scale disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<string, string> = {
        dark: 'bg-cta-dark text-text-inverse hover:bg-cta-dark-hover rounded-button text-button font-semibold',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary rounded-button text-button-sm',
        pill: 'bg-surface-elevated text-text-primary border border-border-subtle hover:border-border-card rounded-button text-button-sm font-semibold',
    };

    const sizes: Record<string, string> = {
        lg: 'h-[56px] px-[32px] w-full',         // Full-width CTA — Flighty style
        md: 'h-[44px] px-[24px]',                 // Standard button
        sm: 'h-[32px] px-[16px] text-button-sm',  // Pill / compact
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

/* ────────────────────────────────────────────
   IconButton — For navigation & quick actions
   44×44 minimum touch target
   ──────────────────────────────────────────── */

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'glass' | 'ghost' | 'surface';
    children: React.ReactNode;
}

export function IconButton({
    variant = 'ghost',
    children,
    className = '',
    ...props
}: IconButtonProps) {
    const base = 'inline-flex items-center justify-center w-[44px] h-[44px] rounded-full transition-colors duration-200 press-scale';

    const variants: Record<string, string> = {
        glass: 'glass-back text-text-inverse',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
        surface: 'bg-surface text-text-primary shadow-rest hover:shadow-hover',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
