import React from 'react';

interface TypographyProps {
    children: React.ReactNode;
    className?: string;
}

export function Heading({ children, className = '' }: TypographyProps) {
    return (
        <h2 className={`font-display text-display-lg font-bold tracking-tight text-text-primary ${className}`}>
            {children}
        </h2>
    );
}

export function Subheading({ children, className = '' }: TypographyProps) {
    return (
        <h3 className={`font-display text-display-md font-semibold text-text-primary ${className}`}>
            {children}
        </h3>
    );
}

export function Body({ children, className = '' }: TypographyProps) {
    return (
        <p className={`font-body text-body leading-relaxed text-text-secondary ${className}`}>
            {children}
        </p>
    );
}

export function Caption({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-body text-caption uppercase tracking-wider font-medium text-text-muted ${className}`}>
            {children}
        </span>
    );
}

export function Label({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-body text-body-sm font-medium text-text-primary ${className}`}>
            {children}
        </span>
    );
}
