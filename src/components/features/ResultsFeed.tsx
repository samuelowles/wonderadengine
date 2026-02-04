import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Subheading, Body, Caption } from '../ui/Typography';
import type { ExperienceCard } from '../../shared/schema';
import type { RoutingResult } from '../../shared/schema';

interface ResultsFeedProps {
    routingResult: RoutingResult;
}

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
                                setStatus('Complete');
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
            <Card className="border-brand-clay">
                <Subheading className="text-brand-clay">Something went wrong</Subheading>
                <Body>{error}</Body>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {status && (
                <div className="flex items-center gap-3 text-secondary">
                    <div className="w-4 h-4 border-2 border-brand-forest border-t-transparent rounded-full animate-spin" />
                    <Caption>{status}</Caption>
                </div>
            )}

            {cards.map((card, index) => (
                <Card key={index} className="transition-all animate-in fade-in slide-in-from-bottom-4">
                    <Subheading className="mb-2">{card.card_title}</Subheading>

                    <div className="space-y-4">
                        <Body className="text-primary leading-relaxed whitespace-pre-wrap">
                            {card.experience_description}
                        </Body>

                        <div className="pt-3 border-t border-brand-mist">
                            <Caption className="text-brand-clay font-bold mb-1">Practical Logistics</Caption>
                            <Body className="text-secondary text-sm bg-brand-mist/20 p-3 rounded-md">
                                {card.practical_logistics}
                            </Body>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
