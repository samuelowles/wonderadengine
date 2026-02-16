import { Card, FeatureRow } from '../ui/Card';
import { H2, H3, BodyXS } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Sparkles, GlobeCrosshair, ShieldCheck, ChevronRight } from '../ui/Icons';
import type { OptionItem } from '../../shared/schema';

/* ════════════════════════════════════════════
   Option Card — Feature/Pricing pattern
   ════════════════════════════════════════════ */

interface OptionCardProps {
    option: OptionItem;
    onSelect: (option: OptionItem) => void;
    index: number;
}

// Map ranking to badge
function getRankBadge(ranking: number): { label: string; variant: 'success' | 'savings' | 'neutral' } | null {
    if (ranking >= 4) return { label: 'Top Pick', variant: 'success' };
    if (ranking >= 3) return { label: 'Recommended', variant: 'savings' };
    return null;
}

// Feature icons pool
const featureIcons = [MapPin, Sparkles, GlobeCrosshair, ShieldCheck];

export function OptionCard({ option, onSelect, index }: OptionCardProps) {
    const badge = getRankBadge(option.ranking);
    const Icon = featureIcons[index % featureIcons.length];

    return (
        <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Card>
                <div className="p-[24px]">
                    {/* Title + badge row */}
                    <div className="flex items-start justify-between gap-[12px] mb-[4px]">
                        <H3 as="h3">{option.name}</H3>
                        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                    </div>

                    <BodyXS className="block mb-[16px]">{option.subtext}</BodyXS>

                    {/* Feature row — justification */}
                    <FeatureRow
                        icon={<Icon size={16} strokeWidth={1.75} />}
                        title="Why this option"
                        subtitle={option.justification}
                        showDivider={false}
                    />

                    {/* Star rating */}
                    <div className="flex items-center gap-[3px] mt-[12px] mb-[20px]">
                        {Array.from({ length: 5 }, (_, i) => (
                            <span
                                key={i}
                                className={`text-[14px] ${i < option.ranking ? 'text-brand-accent' : 'text-border-subtle'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <Button
                        variant="dark"
                        size="lg"
                        onClick={() => onSelect(option)}
                    >
                        Explore This
                        <ChevronRight size={16} className="ml-[8px]" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}

/* ════════════════════════════════════════════
   Options List container
   ════════════════════════════════════════════ */

interface OptionsListProps {
    title: string;
    options: OptionItem[];
    onSelect: (option: OptionItem) => void;
}

export function OptionsList({ title, options, onSelect }: OptionsListProps) {
    return (
        <div className="space-y-[16px]">
            <div className="mb-[8px]">
                <H2>{title}</H2>
                <BodyXS className="block mt-[4px]">
                    {options.length} option{options.length !== 1 ? 's' : ''} found
                </BodyXS>
            </div>
            {options.map((option, index) => (
                <OptionCard key={index} option={option} onSelect={onSelect} index={index} />
            ))}
        </div>
    );
}
