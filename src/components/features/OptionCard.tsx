import { Card } from '../ui/Card';
import { Subheading, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';
import type { OptionItem } from '../../shared/schema';

interface OptionCardProps {
    option: OptionItem;
    onSelect: (option: OptionItem) => void;
}

export function OptionCard({ option, onSelect }: OptionCardProps) {
    // Render star rating
    const stars = Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < option.ranking ? 'text-brand-clay' : 'text-brand-mist'}>
            ★
        </span>
    ));

    return (
        <Card hoverable className="relative">
            {/* Ranking badge */}
            <div className="absolute top-4 right-4 glass-light px-2 py-1 rounded-full">
                <span className="text-sm">{stars}</span>
            </div>

            <div className="pr-20">
                <Subheading className="mb-1">{option.name}</Subheading>
                <Caption className="text-secondary">{option.subtext}</Caption>
            </div>

            <Body className="mt-3 mb-4">{option.justification}</Body>

            <Button
                variant="secondary"
                onClick={() => onSelect(option)}
                className="w-full"
            >
                Explore This
            </Button>
        </Card>
    );
}

interface OptionsListProps {
    title: string;
    options: OptionItem[];
    onSelect: (option: OptionItem) => void;
}

export function OptionsList({ title, options, onSelect }: OptionsListProps) {
    return (
        <div className="space-y-4">
            <Subheading>{title}</Subheading>
            {options.map((option, index) => (
                <OptionCard key={index} option={option} onSelect={onSelect} />
            ))}
        </div>
    );
}
