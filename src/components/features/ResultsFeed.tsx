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
                    <Body className="text-primary font-medium mb-4">{card.hook}</Body>

                    <div className="space-y-3">
                        <div>
                            <Caption>Why Locals Love It</Caption>
                            <Body className="mt-1">{card.context}</Body>
                        </div>

                        <div>
                            <Caption>Practical Details</Caption>
                            <Body className="mt-1">{card.practical}</Body>
                        </div>

                        <div>
                            <Caption>Local Insight</Caption>
                            <Body className="mt-1">{card.insight}</Body>
                        </div>

                        <div className="pt-3 border-t border-brand-mist">
                            <Caption className="text-brand-clay">Consider</Caption>
                            <Body className="mt-1 text-secondary">{card.consider}</Body>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
