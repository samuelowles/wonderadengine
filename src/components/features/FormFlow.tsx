import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { BodySmall, Label } from '../ui/Typography';
import { FullBgLayout } from '../layout/Layout';
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
        w-full h-[44px] px-[14px]
        rounded-input border border-border-subtle bg-surface-elevated
        text-text-primary placeholder:text-text-muted/40
        font-body text-body-sm
        focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent/30
        transition-all duration-200
    `;

    return (
        <FullBgLayout imageSrc="/img/hero-discover.jpg">
            {/* Brand lockup */}
            <div className="flex flex-col items-center pt-[32px] pb-[20px] px-[24px]">
                <Compass size={24} className="text-brand-accent mb-[8px]" />
                <h1 className="font-display text-h2 text-text-primary mb-[4px]">Wondura</h1>
                <BodySmall className="text-text-muted text-center">
                    Curated New Zealand experiences
                </BodySmall>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
                {error && (
                    <div className="mb-[16px] p-[12px] rounded-card-inner bg-red-50 border border-red-200">
                        <p className="font-body text-body-xs text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-[16px]">
                    <div>
                        <Label className="mb-[6px]">Where to?</Label>
                        <input
                            type="text"
                            id="destination"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            placeholder="Queenstown, Wānaka, anywhere..."
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <Label className="mb-[6px]">When?</Label>
                        <input
                            type="text"
                            id="dates"
                            name="dates"
                            value={formData.dates}
                            onChange={handleChange}
                            placeholder="Next weekend, October..."
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <Label className="mb-[6px]">Activities</Label>
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
                        <Label className="mb-[6px]">What makes it perfect?</Label>
                        <input
                            type="text"
                            id="dealmaker"
                            name="dealmaker"
                            value={formData.dealmaker}
                            onChange={handleChange}
                            placeholder="Great coffee, kid-friendly..."
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
            </div>
        </FullBgLayout>
    );
}
