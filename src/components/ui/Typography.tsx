import React from 'react';

interface TypographyProps {
    children: React.ReactNode;
    className?: string;
}

export function Heading({ children, className = '' }: TypographyProps) {
    return (
        <h2 className={`font-serif text-4xl md:text-5xl font-semibold tracking-tight text-primary ${className}`}>
            {children}
        </h2>
    );
}

export function Subheading({ children, className = '' }: TypographyProps) {
    return (
        <h3 className={`font-serif text-2xl font-medium text-primary ${className}`}>
            {children}
        </h3>
    );
}

export function Body({ children, className = '' }: TypographyProps) {
    return (
        <p className={`font-sans text-base leading-relaxed text-secondary ${className}`}>
            {children}
        </p>
    );
}

export function Caption({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-sans text-xs uppercase tracking-wider font-medium text-secondary ${className}`}>
            {children}
        </span>
    );
}
