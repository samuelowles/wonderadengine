import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
    const baseClasses = 'bg-surface rounded-xl shadow-sm border border-brand-mist p-6';
    const hoverClasses = hoverable ? 'transition-lift hover-lift cursor-pointer' : '';

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
}
