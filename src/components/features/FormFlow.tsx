import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
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

    return (
        <OverlayLayout imageSrc="/img/hero-discover.jpg">
            <div className="p-[24px] pb-[32px] w-full max-w-lg mx-auto bg-surface rounded-card shadow-premium">
                {/* Brand Lockup */}
                <div className="flex flex-col items-center mb-[24px]">
                    <div className="mb-[8px] text-brand-accent">
                        <Compass size={24} />
                    </div>
                    <h1 className="font-display text-h1 text-text-primary text-center mb-[4px]">
                        Wondura
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-[16px]">
                    {error && (
                        <div className="p-4 rounded-[16px] bg-red-50 border border-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Main Inputs */}
                    <div className="space-y-[16px]">
                        <Input
                            name="destination"
                            placeholder="Where to?"
                            value={formData.destination}
                            onChange={handleChange}
                        />

                        <Input
                            name="dates"
                            placeholder="When?"
                            value={formData.dates}
                            onChange={handleChange}
                        />

                        {/* Activities: Side-by-side Text Fields */}
                        <div className="flex gap-[8px]">
                            <Input
                                name="activity1"
                                placeholder="Activity #1"
                                value={formData.activity1}
                                onChange={handleChange}
                                className="text-center"
                            />
                            <Input
                                name="activity2"
                                placeholder="Activity #2"
                                value={formData.activity2}
                                onChange={handleChange}
                                className="text-center"
                            />
                            <Input
                                name="activity3"
                                placeholder="Activity #3"
                                value={formData.activity3}
                                onChange={handleChange}
                                className="text-center"
                            />
                        </div>

                        <Input
                            name="dealmaker"
                            placeholder="What makes it perfect?"
                            value={formData.dealmaker}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-[16px]">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={isLoading}
                            className="w-full shadow-float"
                        >
                            {isLoading ? 'Curating...' : 'Discover Experiences'}
                        </Button>
                    </div>
                </form>
            </div>
        </OverlayLayout>
    );
}
