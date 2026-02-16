import { useEffect, useState } from 'react';
import { ActivityCard, GlassCard } from '../ui/Card';
import { H2, Body, BodySmall, Caption, HeroTitle, BodyXS, SectionHeader } from '../ui/Typography';
import { ImmersiveLayout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { Bookmark } from '../ui/Icons';
import type { ExperienceCard } from '../../shared/schema';
import type { RoutingResult } from '../../shared/schema';

interface ResultsFeedProps {
    routingResult: RoutingResult;
    onBack?: () => void;
}

// Compressed thumbnail images
const thumbs = [
    '/img/thumb-1.jpg',
    '/img/thumb-2.jpg',
    '/img/thumb-3.jpg',
    '/img/thumb-4.jpg',
    '/img/thumb-5.jpg',
];

/** Parse practical_logistics into structured metrics */
function parseMetrics(logistics: string): Array<{ label: string; value: string }> {
    const metrics: Array<{ label: string; value: string }> = [];

    const durationMatch = logistics.match(/(\d+[\.\d]*\s*(?:hour|hr|min|day|night)s?)/i);
    const costMatch = logistics.match(/(\$[\d,]+(?:\.\d{2})?(?:\s*[-–]\s*\$[\d,]+(?:\.\d{2})?)?)/i);
    const distanceMatch = logistics.match(/(\d+[\.\d]*\s*(?:km|mi|miles|metres|meters))/i);

    if (durationMatch) metrics.push({ label: 'Duration', value: durationMatch[1] });
    if (costMatch) metrics.push({ label: 'Price', value: costMatch[1] });
    if (distanceMatch) metrics.push({ label: 'Distance', value: distanceMatch[1] });

    if (metrics.length === 0) {
        const chunks = logistics.split(/[,.]/).filter(s => s.trim().length > 0);
        if (chunks.length >= 2) {
            metrics.push({ label: 'Info', value: chunks[0].trim().substring(0, 18) });
            metrics.push({ label: 'Note', value: chunks[1].trim().substring(0, 18) });
        } else {
            metrics.push({ label: 'Details', value: logistics.substring(0, 24) });
        }
    }

    return metrics.slice(0, 3);
}

export function ResultsFeed({ routingResult, onBack }: ResultsFeedProps) {
    const [cards, setCards] = useState<ExperienceCard[]>([]);
    const [status, setStatus] = useState<string>('Connecting...');
    const [error, setError] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<ExperienceCard | null>(null);

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
                                    : 'Curating experiences...');
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

    const destination = routingResult.extracted.destination || 'New Zealand';
    const date = routingResult.extracted.date || 'Anytime';

    // ── Detail View ──
    if (selectedCard) {
        const metrics = parseMetrics(selectedCard.practical_logistics);
        return (
            <ImmersiveLayout
                imageSrc="/img/hero-detail.jpg"
                onBack={() => setSelectedCard(null)}
                rightAction={
                    <Button variant="ghost" size="sm" className="text-text-inverse/80 hover:text-text-inverse">
                        <Bookmark size={18} />
                    </Button>
                }
            >
                <div className="mt-[28vh]">
                    <HeroTitle className="mb-[8px]">{selectedCard.card_title}</HeroTitle>
                    <BodyXS className="text-white/50 block mb-[32px]">
                        {destination} · Experience
                    </BodyXS>

                    <GlassCard
                        metrics={metrics.length > 0 ? metrics : [
                            { label: 'Type', value: 'Experience' },
                            { label: 'Region', value: destination },
                        ]}
                        className="mb-[32px]"
                    />

                    <Body className="text-white/80 leading-relaxed">
                        {selectedCard.experience_description}
                    </Body>

                    <div className="mt-[24px] pt-[24px] border-t border-white/10">
                        <Caption className="text-white/40 block mb-[8px]">Practical Details</Caption>
                        <BodySmall className="text-white/60">
                            {selectedCard.practical_logistics}
                        </BodySmall>
                    </div>
                </div>
            </ImmersiveLayout>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="p-[24px] rounded-card bg-red-50 border border-red-200">
                <H2 className="text-red-700 mb-[8px]" as="p">Something went wrong</H2>
                <Body className="text-red-600">{error}</Body>
            </div>
        );
    }

    // ── Feed View ──
    return (
        <div className="space-y-[16px]">
            {/* Loading */}
            {status && (
                <div className="flex items-center gap-[12px] py-[32px] justify-center">
                    <div className="w-[20px] h-[20px] border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
                    <BodySmall className="text-text-muted">{status}</BodySmall>
                </div>
            )}

            {/* Section header */}
            {cards.length > 0 && (
                <SectionHeader>Curated for you</SectionHeader>
            )}

            {/* Activity cards */}
            {cards.map((card, index) => (
                <ActivityCard
                    key={index}
                    title={card.card_title}
                    metadata={`${destination} · ${date}`}
                    metrics={parseMetrics(card.practical_logistics)}
                    imageSrc={thumbs[index % thumbs.length]}
                    pinned={index === 0}
                    onSave={() => { }}
                    onClick={() => setSelectedCard(card)}
                    animationDelay={index * 80}
                />
            ))}

            {/* Done indicator */}
            {cards.length > 0 && !status && (
                <div className="text-center py-[24px]">
                    <BodyXS className="text-text-muted">
                        {cards.length} experience{cards.length !== 1 ? 's' : ''} curated for you
                    </BodyXS>
                </div>
            )}
        </div>
    );
}
