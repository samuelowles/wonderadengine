import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { HeroTitle, BodySmall, Label, Caption } from '../ui/Typography';
import { OverlayLayout } from '../layout/Layout';
import { Compass } from '../ui/Icons';
import type { UserQuery } from '../../shared/schema';

interface FormFlowProps {
    onSubmit: (query: UserQuery) => void;
    isLoading?: boolean;
    error?: string | null;
}

export function FormFlow({ onSubmit, isLoading = false, error = null }: FormFlowProps) {
    const [formData, setFormData] = useState<UserQuery>({
        destination: '',
        dates: '',
        activity1: '',
        activity2: '',
        activity3: '',
        dealmaker: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = `
        w-full h-[48px] px-[16px]
        rounded-input border border-border-subtle bg-surface
        text-text-primary placeholder:text-text-muted/50
        font-body text-body
        focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent/40
        transition-all duration-200
    `;

    const heroContent = (
        <>
            <div className="flex items-center gap-[8px] mb-[12px] opacity-70">
                <Compass size={16} className="text-text-inverse" />
                <Caption className="text-text-inverse/70">Wondura</Caption>
            </div>
            <HeroTitle className="mb-[12px]">
                Discover{'\n'}New Zealand
            </HeroTitle>
            <BodySmall className="text-text-inverse/60 max-w-[280px]">
                Curated experiences powered by local knowledge
            </BodySmall>
        </>
    );

    return (
        <OverlayLayout
            imageSrc="/img/hero-discover.jpg"
            heroContent={heroContent}
        >
            {/* Error */}
            {error && (
                <div className="mb-[20px] p-[16px] rounded-card-inner bg-red-50 border border-red-200">
                    <p className="font-body text-body-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[20px]">
                <div>
                    <Label className="mb-[8px]">Where to?</Label>
                    <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="Queenstown, South Island, anywhere..."
                        className={inputClasses}
                    />
                </div>

                <div>
                    <Label className="mb-[8px]">When?</Label>
                    <input
                        type="text"
                        id="dates"
                        name="dates"
                        value={formData.dates}
                        onChange={handleChange}
                        placeholder="Next weekend, October, flexible..."
                        className={inputClasses}
                    />
                </div>

                <div>
                    <Label className="mb-[8px]">Activities</Label>
                    <div className="grid grid-cols-3 gap-[8px]">
                        <input
                            type="text"
                            id="activity1"
                            name="activity1"
                            value={formData.activity1}
                            onChange={handleChange}
                            placeholder="Hiking"
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            id="activity2"
                            name="activity2"
                            value={formData.activity2}
                            onChange={handleChange}
                            placeholder="Wine"
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            id="activity3"
                            name="activity3"
                            value={formData.activity3}
                            onChange={handleChange}
                            placeholder="Stars"
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div>
                    <Label className="mb-[8px]">What makes it perfect?</Label>
                    <input
                        type="text"
                        id="dealmaker"
                        name="dealmaker"
                        value={formData.dealmaker}
                        onChange={handleChange}
                        placeholder="Great coffee, kid-friendly, off the beaten track..."
                        className={inputClasses}
                    />
                </div>

                <div className="pt-[8px]">
                    <Button
                        type="submit"
                        variant="dark"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Discovering...' : 'Discover Experiences'}
                    </Button>
                </div>
            </form>
        </OverlayLayout>
    );
}
