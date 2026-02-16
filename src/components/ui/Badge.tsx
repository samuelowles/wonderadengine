import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'savings' | 'info' | 'neutral';
    className?: string;
}

const variantStyles: Record<string, string> = {
    success: 'bg-brand-accent-light text-brand-accent border border-brand-accent-border',
    savings: 'bg-orange-50 text-orange-600 border border-orange-200',
    info: 'bg-blue-50 text-blue-600 border border-blue-200',
    neutral: 'bg-surface-elevated text-text-secondary border border-border-subtle',
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
