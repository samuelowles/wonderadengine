import React from 'react';
import { MetricValueSmall, MetricLabel, BodyXS } from './Typography';
import { StarFilled, PlusCircle, Pencil } from './Icons';

/* ════════════════════════════════════════════
   Base Card
   28px radius, 1px border, soft rest shadow
   ════════════════════════════════════════════ */

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
    return (
        <div
            className={`
                bg-surface rounded-card border border-border-subtle shadow-rest
                ${hoverable ? 'cursor-pointer transition-shadow duration-300 hover:shadow-hover' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

/* ════════════════════════════════════════════
   Activity Card (Screen 1 Pattern)
   ════════════════════════════════════════════
   ┌──────────────────────────────────────┐
   │                              ★ badge │
   │  Title                        ┌────┐ │
   │  Metadata                     │ img│ │
   │                               │    │ │
   │  Distance   Pace     Time     │    │ │
   │  (labels)   (labels) (labels) └────┘ │
   │  ┌──────┐  ┌──────┐                 │
   │  │⊕ Save│  │✎ View│                 │
   │  └──────┘  └──────┘                 │
   └──────────────────────────────────────┘ */

interface MetricItem {
    label: string;
    value: string;
}

interface ActivityCardProps {
    title: string;
    metadata: string;
    metrics: MetricItem[];
    imageSrc: string;
    pinned?: boolean;
    onSave?: () => void;
    onClick?: () => void;
    animationDelay?: number;
}

export function ActivityCard({
    title,
    metadata,
    metrics,
    imageSrc,
    pinned = false,
    onSave,
    onClick,
    animationDelay = 0,
}: ActivityCardProps) {
    return (
        <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <Card hoverable onClick={onClick} className="relative overflow-hidden">
                <div className="flex">
                    {/* Left content area */}
                    <div className="flex-1 p-[20px] pr-[16px] flex flex-col justify-between min-h-[180px]">
                        {/* Title & meta */}
                        <div>
                            <h3 className="font-display text-h3 text-text-primary mb-[4px] pr-[8px] line-clamp-2">
                                {title}
                            </h3>
                            <BodyXS>{metadata}</BodyXS>
                        </div>

                        {/* Metric row */}
                        {metrics.length > 0 && (
                            <div className="flex gap-[24px] mt-[12px]">
                                {metrics.map((m, i) => (
                                    <div key={i} className="flex flex-col">
                                        <MetricValueSmall>{m.value}</MetricValueSmall>
                                        <MetricLabel className="mt-[2px]">{m.label}</MetricLabel>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action pills */}
                        <div className="flex gap-[8px] mt-[16px]">
                            <button
                                onClick={(e) => { e.stopPropagation(); onSave?.(); }}
                                className="inline-flex items-center gap-[6px] h-[32px] px-[14px] rounded-button bg-surface-elevated border border-border-subtle text-button-sm font-body font-semibold text-text-primary hover:border-border-card transition-colors press-scale"
                            >
                                <PlusCircle size={13} strokeWidth={2} />
                                Save
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                                className="inline-flex items-center gap-[6px] h-[32px] px-[14px] rounded-button bg-surface-elevated border border-border-subtle text-button-sm font-body font-semibold text-text-primary hover:border-border-card transition-colors press-scale"
                            >
                                <Pencil size={12} strokeWidth={2} />
                                View
                            </button>
                        </div>
                    </div>

                    {/* Right image inset */}
                    <div className="w-[120px] relative flex-shrink-0">
                        <img
                            src={imageSrc}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover card-image-inset"
                        />
                    </div>
                </div>

                {/* Star badge */}
                {pinned && (
                    <div className="absolute top-[16px] right-[16px] w-[28px] h-[28px] rounded-full bg-brand-accent-light flex items-center justify-center">
                        <StarFilled size={14} className="text-brand-accent" />
                    </div>
                )}
            </Card>
        </div>
    );
}

/* ════════════════════════════════════════════
   Feature Row (Screen 2 Pattern)
   ════════════════════════════════════════════
   ┌──┐ Feature Title        (body-sm, 500)
   │🎬│ Feature subtitle     (body-xs, muted)
   └──┘                                      */

interface FeatureRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    showDivider?: boolean;
}

export function FeatureRow({ icon, title, subtitle, showDivider = true }: FeatureRowProps) {
    return (
        <>
            <div className="flex items-start gap-[12px] py-[14px]">
                <div className="w-[32px] h-[32px] rounded-icon-bg bg-surface-elevated flex items-center justify-center flex-shrink-0 text-text-secondary">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-body text-body-sm font-medium text-text-primary">
                        {title}
                    </p>
                    <p className="font-body text-body-xs text-text-muted mt-[2px]">
                        {subtitle}
                    </p>
                </div>
            </div>
            {showDivider && (
                <div className="h-px bg-border-divider ml-[44px]" />
            )}
        </>
    );
}

/* ════════════════════════════════════════════
   Glass Metrics Card (Screen 3 Pattern)
   ════════════════════════════════════════════ */

interface GlassMetricItem {
    label: string;
    value: string;
}

interface GlassCardProps {
    metrics: GlassMetricItem[];
    className?: string;
}

export function GlassCard({ metrics, className = '' }: GlassCardProps) {
    return (
        <div className={`glass-metrics rounded-[20px] p-[20px] ${className}`}>
            <div className="space-y-[12px]">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between">
                        <span className="font-body text-body-xs text-white/60">
                            {m.label}
                        </span>
                        <span className="font-display text-metric-sm text-white">
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════
   Metric Row — inline metric display
   Used inside ActivityCard and standalone
   ════════════════════════════════════════════ */

interface MetricRowProps {
    metrics: MetricItem[];
    variant?: 'light' | 'dark';
    className?: string;
}

export function MetricRow({ metrics, variant = 'light', className = '' }: MetricRowProps) {
    const isDark = variant === 'dark';
    return (
        <div className={`flex gap-[24px] ${className}`}>
            {metrics.map((m, i) => (
                <div key={i} className="flex flex-col">
                    <span className={`font-display text-metric-sm ${isDark ? 'text-white' : 'text-text-primary'}`}>
                        {m.value}
                    </span>
                    <span className={`font-body text-caption uppercase mt-[2px] ${isDark ? 'text-white/50' : 'text-text-muted'}`}>
                        {m.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════
   Image Card — Simple card with image header
   ════════════════════════════════════════════ */

interface ImageCardProps {
    imageSrc: string;
    imageAlt?: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function ImageCard({ imageSrc, imageAlt = '', children, className = '', onClick }: ImageCardProps) {
    return (
        <Card hoverable={!!onClick} onClick={onClick} className={`overflow-hidden ${className}`}>
            <div className="aspect-[16/9] overflow-hidden">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </div>
            <div className="p-[24px]">
                {children}
            </div>
        </Card>
    );
}
