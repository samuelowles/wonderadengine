import React from 'react';

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
                bg-surface rounded-card shadow-premium p-6
                ${hoverable ? 'cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-float' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

/* ════════════════════════════════════════════
   Experience Card — 5-field local knowledge card
   Renders hook, context, practical, insight, consider
   ════════════════════════════════════════════ */

interface ExperienceCardProps {
    title: string;
    hook: string;
    context: string;
    practical: string;
    insight: string;
    consider: string;
    animationDelay?: number;
}

export function ExperienceCard({
    title,
    hook,
    context,
    practical,
    insight,
    consider,
    animationDelay = 0,
}: ExperienceCardProps) {
    return (
        <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <Card>
                    {/* Title */}
                    <h3 className="font-display text-h3 text-text-primary mb-[8px]">
                        {title}
                    </h3>

                    {/* Hook — italic opener */}
                    <p className="font-body text-body text-text-secondary italic mb-[12px] leading-[1.6]">
                        {hook}
                    </p>

                    {/* Context — why locals value this */}
                    <p className="font-body text-body text-text-secondary mb-[16px] leading-[1.6]">
                        {context}
                    </p>

                    {/* Practical details */}
                    <div className="pt-[16px] border-t border-border-subtle">
                        <span className="font-body text-micro text-text-muted block mb-[6px]">
                            PRACTICAL DETAILS
                        </span>
                        <p className="font-body text-body-sm text-text-secondary leading-relaxed">
                            {practical}
                        </p>
                    </div>

                    {/* Local insight */}
                    <div className="mt-[12px] pl-[12px] border-l-2 border-accent/30">
                        <p className="font-body text-body-sm text-text-secondary leading-relaxed">
                            <span className="font-medium text-text-primary">Local tip: </span>
                            {insight}
                        </p>
                    </div>

                    {/* Consider — honest caveat */}
                    <div className="mt-[12px]">
                        <p className="font-body text-body-xs text-text-muted leading-relaxed">
                            <span className="font-medium">Consider: </span>
                            {consider}
                        </p>
                    </div>
            </Card>
        </div>
    );
}

/* ════════════════════════════════════════════
   Feature Row (Options pattern)
   ════════════════════════════════════════════ */

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
   Glass Metrics Card (Immersive view)
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
   ════════════════════════════════════════════ */

interface MetricItem {
    label: string;
    value: string;
}

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
