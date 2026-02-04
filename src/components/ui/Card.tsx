import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    variant?: 'light' | 'dark';
}

export function Card({ children, className = '', hoverable = false, variant = 'light' }: CardProps) {
    const baseClasses = 'rounded-xl p-6';
    const hoverClasses = hoverable ? 'transition-lift hover-lift cursor-pointer' : '';

    const variantClasses = {
        light: 'bg-surface-light border border-border-subtle shadow-card',
        dark: 'bg-surface-dark border border-border-dark text-text-inverse',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
}

interface ImageCardProps {
    children: React.ReactNode;
    imageSrc?: string;
    imageAlt?: string;
    className?: string;
    hoverable?: boolean;
}

export function ImageCard({ children, imageSrc, imageAlt = '', className = '', hoverable = false }: ImageCardProps) {
    const hoverClasses = hoverable ? 'transition-lift hover-lift cursor-pointer' : '';

    return (
        <div className={`rounded-xl overflow-hidden bg-surface-light border border-border-subtle shadow-card ${hoverClasses} ${className}`}>
            {imageSrc && (
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 hero-gradient opacity-30" />
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

interface MetricRowProps {
    metrics: Array<{ label: string; value: string }>;
    className?: string;
}

export function MetricRow({ metrics, className = '' }: MetricRowProps) {
    return (
        <div className={`flex gap-6 ${className}`}>
            {metrics.map((metric, index) => (
                <div key={index} className="flex flex-col">
                    <span className="font-body text-caption uppercase tracking-wider text-text-muted">
                        {metric.label}
                    </span>
                    <span className="font-display text-body-lg font-semibold text-text-primary">
                        {metric.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
