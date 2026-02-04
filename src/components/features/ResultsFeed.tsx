import { useEffect, useState } from 'react';
import { ImageCard, Card } from '../ui/Card';
import { Subheading, Body, Caption } from '../ui/Typography';
import type { ExperienceCard } from '../../shared/schema';
import type { RoutingResult } from '../../shared/schema';

interface ResultsFeedProps {
    routingResult: RoutingResult;
}

// Cycle through available card images
const cardImages = [
    '/img/hero-sunrise.jpg',
    '/img/card-thumbnail.jpg',
];

export function ResultsFeed({ routingResult }: ResultsFeedProps) {
    const [cards, setCards] = useState<ExperienceCard[]>([]);
    const [status, setStatus] = useState<string>('Connecting...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch('/api/agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(routingResult),
                });

                if (!response.ok) throw new Error('Failed to connect');
                if (!response.body) throw new Error('No response body');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const chunk of lines) {
                        const eventMatch = chunk.match(/event: (\w+)/);
                        const dataMatch = chunk.match(/data: (.+)/);

                        if (eventMatch && dataMatch) {
                            const event = eventMatch[1];
                            const data = JSON.parse(dataMatch[1]);

                            if (event === 'status') {
                                setStatus(data.phase === 'searching'
                                    ? `Searching ${data.tool || ''}...`
                                    : 'Generating experiences...');
                            } else if (event === 'card') {
                                setCards(prev => [...prev, data as ExperienceCard]);
                                setStatus('');
                            } else if (event === 'error') {
                                setError(data.error);
                            } else if (event === 'done') {
                                setStatus('');
                            }
                        }
                    }
                }
            } catch (err) {
                setError(String(err));
            }
        };

        fetchResults();
    }, [routingResult]);

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <Subheading className="text-red-700 mb-2">Something went wrong</Subheading>
                <Body className="text-red-600">{error}</Body>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {status && (
                <div className="flex items-center gap-3 py-4">
                    <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                    <Caption className="text-text-secondary">{status}</Caption>
                </div>
            )}

            {/* Experience Cards */}
            {cards.map((card, index) => (
                <ImageCard
                    key={index}
                    imageSrc={cardImages[index % cardImages.length]}
                    imageAlt={card.card_title}
                    hoverable
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <Subheading className="mb-3">{card.card_title}</Subheading>

                    <Body className="mb-4 leading-relaxed">
                        {card.experience_description}
                    </Body>

                    {/* Practical Logistics */}
                    <div className="pt-4 border-t border-border-subtle">
                        <Caption className="block mb-2 text-brand-accent">Practical Details</Caption>
                        <p className="font-body text-body-sm text-text-secondary leading-relaxed">
                            {card.practical_logistics}
                        </p>
                    </div>
                </ImageCard>
            ))}

            {/* Completion Message */}
            {cards.length > 0 && !status && (
                <div className="text-center py-4">
                    <Caption className="text-text-muted">
                        {cards.length} experience{cards.length !== 1 ? 's' : ''} found
                    </Caption>
                </div>
            )}
        </div>
    );
}
