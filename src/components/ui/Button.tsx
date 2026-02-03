import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
    const baseClasses = 'px-6 py-3 rounded-full font-sans font-medium transition-lift press-scale';

    const variantClasses = {
        primary: 'bg-brand-forest text-inverse hover:bg-opacity-90',
        secondary: 'bg-transparent border border-brand-mist text-primary hover:bg-surface',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
