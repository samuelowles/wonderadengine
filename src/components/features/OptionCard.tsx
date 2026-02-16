import { Card, FeatureRow } from '../ui/Card';
import { H2, H3, BodyXS } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Sparkles, GlobeCrosshair, ShieldCheck, ChevronRight } from '../ui/Icons';
import { applyMacrons } from '../../shared/macrons';
import type { OptionItem } from '../../shared/schema';

/* ════════════════════════════════════════════
   Option Card — Interstitial pattern
   No stars, specific CTAs, Māori macrons
   ════════════════════════════════════════════ */

interface OptionCardProps {
    option: OptionItem;
    onSelect: (option: OptionItem) => void;
    index: number;
    isWonduraRecommendation?: boolean;
}

const featureIcons = [MapPin, Sparkles, GlobeCrosshair, ShieldCheck];

export function OptionCard({ option, onSelect, index, isWonduraRecommendation = false }: OptionCardProps) {
    const Icon = featureIcons[index % featureIcons.length];
    const displayName = applyMacrons(option.name);

    return (
        <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Card>
                <div className="p-[24px]">
                    {/* Title + badge row */}
                    <div className="flex items-start justify-between gap-[12px] mb-[4px]">
                        <H3 as="h3">{displayName}</H3>
                        {isWonduraRecommendation && (
                            <Badge variant="success">Wondura Pick</Badge>
                        )}
                    </div>

                    <BodyXS className="block mb-[16px]">{applyMacrons(option.subtext)}</BodyXS>

                    {/* Feature row — justification */}
                    <FeatureRow
                        icon={<Icon size={16} strokeWidth={1.75} />}
                        title="Why here"
                        subtitle={applyMacrons(option.justification)}
                        showDivider={false}
                    />

                    {/* Specific CTA */}
                    <div className="mt-[20px]">
                        <Button
                            variant="dark"
                            size="lg"
                            onClick={() => onSelect(option)}
                        >
                            Explore {displayName}
                            <ChevronRight size={16} className="ml-[8px]" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

/* ════════════════════════════════════════════
   Options List
   First option is always Wondura recommendation
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
            </div>
            {options.map((option, index) => (
                <OptionCard
                    key={index}
                    option={option}
                    onSelect={onSelect}
                    index={index}
                    isWonduraRecommendation={index === 0}
                />
            ))}
        </div>
    );
}
