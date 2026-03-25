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

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#E76C82" />
        <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ParagraphBullet = ({ text, boldPrefix }: { text: string, boldPrefix?: string }) => (
    <div className="flex gap-[16px] items-start">
        <div className="mt-[2px] flex-shrink-0">
            <CheckIcon />
        </div>
        <p className="font-body text-[15px] text-[#111111] leading-[1.5]">
            {boldPrefix && <span className="font-bold text-[#111111]">{boldPrefix} </span>}
            <span className="text-[#333333] font-medium">{text}</span>
        </p>
    </div>
);

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
            <Card className="!rounded-[32px] !p-[32px] my-[24px] !bg-[#F9F6F0]">
                {/* 1. Header Array: Title + Inline Badge */}
                <div className="mb-[24px]">
                    <h3 className="font-display font-medium text-[30px] leading-[1.15] tracking-[-0.02em] text-[#111111]">
                        {title}
                    </h3>
                    {isPremium && (
                        <div className="inline-flex mt-[12px] px-[12px] py-[4px] rounded-full bg-gradient-to-r from-[#B450A4] to-[#E76C82] text-white text-[12px] font-bold uppercase tracking-wide">
                            Wondura Pick
                        </div>
                    )}
                </div>

                {/* 2. Body Payload (Hook + Context) */}
                <div className="mb-[24px]">
                    {hook && (
                        <p className="font-display text-[18px] text-[#222222] leading-[1.4] mb-[8px]">
                            {hook}
                        </p>
                    )}
                    {context && (
                        <p className="font-body text-[15px] text-[#444444] font-medium leading-[1.6]">
                            {context}
                        </p>
                    )}
                </div>

                {/* 3. Regimented Suno Bullet List Architecture for Metadata */}
                <div className="flex flex-col gap-[16px]">
                    {practical && (
                        <ParagraphBullet text={practical} />
                    )}
                    {insight && (
                        <ParagraphBullet boldPrefix="Local tip:" text={insight} />
                    )}
                    {consider && (
                        <ParagraphBullet boldPrefix="Consider:" text={consider} />
                    )}
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
