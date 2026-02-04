import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = 'font-body font-medium rounded-full transition-lift press-scale focus-ring inline-flex items-center justify-center';

    const sizeClasses = {
        sm: 'px-4 py-2 text-body-sm',
        md: 'px-6 py-3 text-body',
        lg: 'px-8 py-4 text-body-lg',
    };

    const variantClasses = {
        primary: 'bg-brand-accent text-text-inverse shadow-button hover:bg-brand-accent-hover',
        secondary: 'bg-transparent border border-border-subtle text-text-primary hover:bg-surface-elevated',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
    };

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
