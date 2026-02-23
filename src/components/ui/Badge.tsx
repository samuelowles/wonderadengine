import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'savings' | 'info' | 'neutral' | 'wondura';
    className?: string;
}

const variantStyles: Record<string, string> = {
    success: 'bg-brand-bg text-brand-accent', // Pale Green bg, Dark Green text
    savings: 'bg-orange-50 text-orange-700',
    info: 'bg-blue-50 text-blue-700',
    neutral: 'bg-surface-subtle text-text-secondary', // Gray
    wondura: 'bg-brand-bg text-brand-accent font-bold tracking-wide uppercase text-[11px]', // Special Wondura Badge
};

export function Badge({ children, variant = 'success', className = '' }: BadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center
                px-[10px] py-[3px]
                rounded-badge
                font-body text-badge
                ${variantStyles[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}
