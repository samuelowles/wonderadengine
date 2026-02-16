import React from 'react';

interface TypographyProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

/* ── Display / Heading ── */

export function HeroTitle({ children, className = '', as: Tag = 'h1' }: TypographyProps) {
    return (
        <Tag className={`font-display text-hero text-text-inverse ${className}`}>
            {children}
        </Tag>
    );
}

export function H1({ children, className = '', as: Tag = 'h1' }: TypographyProps) {
    return (
        <Tag className={`font-display text-h1 text-text-primary ${className}`}>
            {children}
        </Tag>
    );
}

export function H2({ children, className = '', as: Tag = 'h2' }: TypographyProps) {
    return (
        <Tag className={`font-display text-h2 text-text-primary ${className}`}>
            {children}
        </Tag>
    );
}

export function H3({ children, className = '', as: Tag = 'h3' }: TypographyProps) {
    return (
        <Tag className={`font-display text-h3 text-text-primary ${className}`}>
            {children}
        </Tag>
    );
}

/* ── Body ── */

export function Body({ children, className = '' }: TypographyProps) {
    return (
        <p className={`font-body text-body text-text-primary ${className}`}>
            {children}
        </p>
    );
}

export function BodySmall({ children, className = '' }: TypographyProps) {
    return (
        <p className={`font-body text-body-sm text-text-secondary ${className}`}>
            {children}
        </p>
    );
}

export function BodyXS({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-body text-body-xs text-text-muted ${className}`}>
            {children}
        </span>
    );
}

/* ── Labels & Captions ── */

export function Caption({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-body text-caption uppercase text-text-muted ${className}`}>
            {children}
        </span>
    );
}

export function Label({ children, className = '' }: TypographyProps) {
    return (
        <label className={`font-body text-body-sm font-medium text-text-primary block ${className}`}>
            {children}
        </label>
    );
}

/* ── Metrics ── */

export function MetricValue({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-display text-metric text-text-primary ${className}`}>
            {children}
        </span>
    );
}

export function MetricValueSmall({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-display text-metric-sm text-text-primary ${className}`}>
            {children}
        </span>
    );
}

export function MetricLabel({ children, className = '' }: TypographyProps) {
    return (
        <span className={`font-body text-caption uppercase text-text-muted ${className}`}>
            {children}
        </span>
    );
}

// Backward compat aliases
export const Heading = H1;
export const Subheading = H2;
export const SectionHeader = ({ children, className = '' }: TypographyProps) => (
    <div className={`font-body text-caption uppercase text-text-muted tracking-widest mb-[16px] ${className}`}>
        {children}
    </div>
);
