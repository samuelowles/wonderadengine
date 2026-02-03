import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading, Body } from '../ui/Typography';
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
        <Card className="max-w-2xl mx-auto">
            <Heading className="mb-2">Plan Your Adventure</Heading>
            <Body className="mb-8">Tell us about your ideal New Zealand experience.</Body>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="destination" className="block font-sans text-sm font-medium text-primary mb-2">
                        Where to?
                    </label>
                    <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="e.g., Queenstown, South Island, anywhere..."
                        className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                    />
                </div>

                <div>
                    <label htmlFor="dates" className="block font-sans text-sm font-medium text-primary mb-2">
                        When?
                    </label>
                    <input
                        type="text"
                        id="dates"
                        name="dates"
                        value={formData.dates}
                        onChange={handleChange}
                        placeholder="e.g., Next weekend, October, flexible..."
                        className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="activity1" className="block font-sans text-sm font-medium text-primary mb-2">
                            Activity 1
                        </label>
                        <input
                            type="text"
                            id="activity1"
                            name="activity1"
                            value={formData.activity1}
                            onChange={handleChange}
                            placeholder="e.g., Hiking"
                            className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                        />
                    </div>
                    <div>
                        <label htmlFor="activity2" className="block font-sans text-sm font-medium text-primary mb-2">
                            Activity 2
                        </label>
                        <input
                            type="text"
                            id="activity2"
                            name="activity2"
                            value={formData.activity2}
                            onChange={handleChange}
                            placeholder="e.g., Wine tasting"
                            className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                        />
                    </div>
                    <div>
                        <label htmlFor="activity3" className="block font-sans text-sm font-medium text-primary mb-2">
                            Activity 3
                        </label>
                        <input
                            type="text"
                            id="activity3"
                            name="activity3"
                            value={formData.activity3}
                            onChange={handleChange}
                            placeholder="e.g., Stargazing"
                            className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="dealmaker" className="block font-sans text-sm font-medium text-primary mb-2">
                        Dealmaker
                    </label>
                    <input
                        type="text"
                        id="dealmaker"
                        name="dealmaker"
                        value={formData.dealmaker}
                        onChange={handleChange}
                        placeholder="What would make this trip perfect?"
                        className="w-full px-4 py-3 rounded-lg border border-brand-mist bg-surface text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Discovering...' : 'Discover Experiences'}
                </Button>
            </form>
        </Card>
    );
}
