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
                bg-surface rounded-card shadow-premium overflow-hidden p-6
                ${onClick ? 'cursor-pointer press-scale' : ''}
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
    isPremium?: boolean;
}

export function ExperienceCard({
    title,
    hook,
    context,
    practical,
    insight,
    consider,
    animationDelay = 0,
    isPremium = false,
}: ExperienceCardProps) {
    return (
        <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <Card className="rounded-[32px] p-[28px] my-[16px]">
                    {/* Title + Premium Badge */}
                    <div className="flex items-start justify-between gap-[16px] mb-[20px]">
                        <h3 className="font-display font-bold text-[22px] leading-[1.25] tracking-tight text-[#1A1A1A] pr-4">
                            {title}
                        </h3>
                        {isPremium && (
                            <div className="flex-shrink-0 w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#B86AEB] to-[#F07A76] flex items-center justify-center text-white font-medium text-[13px] leading-[1.15] text-center shadow-sm">
                                Wondura<br/>Pick
                            </div>
                        )}
                    </div>

                    {/* Hook — italic opener */}
                    <p className="font-body text-[15px] italic text-[#6A6A6A] leading-[1.6] mb-[20px]">
                        {hook}
                    </p>

                    {/* Context */}
                    <p className="font-body text-[15px] text-[#4F4F4F] mb-[24px] leading-[1.6]">
                        {context}
                    </p>

                    <div className="h-px bg-[#EEEEEE] w-full mb-[24px]" />

                    {/* Practical details */}
                    <div className="mb-[24px]">
                        <span className="font-body text-[10px] tracking-widest text-[#A0A0A0] uppercase block mb-[8px] font-bold">
                            PRACTICAL DETAILS
                        </span>
                        <p className="font-body text-[14px] text-[#5A5A5A] leading-[1.65]">
                            {practical}
                        </p>
                    </div>

                    {/* Local insight */}
                    {insight && (
                        <div className="border-l-[3px] border-[#E8E8E8] pl-[16px] mb-[24px]">
                            <p className="font-body text-[14px] text-[#5A5A5A] leading-[1.65]">
                                <span className="font-bold text-[#333333]">Local tip: </span>
                                {insight}
                            </p>
                        </div>
                    )}

                    {/* Consider */}
                    {consider && (
                        <div>
                            <p className="font-body text-[14px] text-[#888888] leading-[1.65]">
                                <span className="font-medium text-[#777777]">Consider: </span>
                                {consider}
                            </p>
                        </div>
                    )}
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
