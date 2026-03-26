import { useEffect, useState } from 'react';
import { ExperienceCard } from '../ui/Card';
import { LoadingScreen } from '../layout/LoadingScreen';
import { H2, Body, BodySmall, BodyXS } from '../ui/Typography';
import type { ExperienceCard as ExperienceCardType } from '../../shared/schema';
import type { RoutingResult } from '../../shared/schema';

interface ResultsFeedProps {
    routingResult: RoutingResult;
    onBack?: () => void;
}

export function ResultsFeed({ routingResult, onBack }: ResultsFeedProps) {
    const [cards, setCards] = useState<ExperienceCardType[]>([]);
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
                                const msg = data.phase === 'researching'
                                    ? 'Researching venues...'
                                    : data.phase === 'searching'
                                        ? `Searching ${data.tool || ''}...`
                                        : 'Curating experiences...';
                                setStatus(msg);
                            } else if (event === 'card') {
                                setCards(prev => [...prev, data as ExperienceCardType]);
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

    // Error state
    if (error) {
        return (
            <div className="p-[24px] rounded-card bg-red-50/80 border border-red-200">
                <H2 className="text-red-700 mb-[8px]" as="p">Something went wrong</H2>
                <Body className="text-red-600">{error}</Body>
            </div>
        );
    }

    return (
        <div className="space-y-[16px]">
            {/* Initial Loading State */}
            {cards.length === 0 && status && (
                <div className="py-[10vh]">
                    <LoadingScreen status={status} inline={true} />
                </div>
            )}

            {/* Incremental Loading State (when some cards exist but still fetching) */}
            {cards.length > 0 && status && (
                <div className="flex items-center gap-[12px] py-[24px] justify-center animate-pulse">
                    <div className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <BodySmall className="text-white/70">{status}</BodySmall>
                </div>
            )}

            {/* section header deleted by user request */}

            {/* Experience cards */}
            {cards.map((card, index) => (
                <ExperienceCard
                    key={index}
                    title={card.card_title}
                    hook={card.hook}
                    context={card.context}
                    practical={card.practical}
                    insight={card.insight}
                    consider={card.consider}
                    animationDelay={index * 80}
                    isPremium={index === 0}
                />
            ))}

            {/* Done indicator */}
            {cards.length > 0 && !status && (
                <div className="text-center py-[24px]">
                    <BodyXS className="text-white/40">
                        {cards.length} experience{cards.length !== 1 ? 's' : ''} curated
                    </BodyXS>
                </div>
            )}
        </div>
    );
}
