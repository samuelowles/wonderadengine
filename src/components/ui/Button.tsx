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
        dark: 'bg-black text-white hover:bg-neutral-900 rounded-button text-[16px] font-semibold shadow-float', // Master Black Pill
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary rounded-button text-button-sm',
        pill: 'bg-white text-text-primary border border-border-subtle hover:border-gray-200 rounded-button text-button-sm font-semibold',
    };

    const sizes: Record<string, string> = {
        lg: 'h-[56px] px-[32px] w-full text-[17px]', // Flighty style
        md: 'h-[44px] px-[24px]',                 // Standard
        sm: 'h-[32px] px-[16px] text-button-sm',  // Compact
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
