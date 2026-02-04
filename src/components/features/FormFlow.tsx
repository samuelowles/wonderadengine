import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Heading, Body, Label } from '../ui/Typography';
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

    const inputClasses = "w-full px-4 py-3 rounded-lg border border-border-subtle bg-surface-light text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all font-body text-body";

    return (
        <Card className="max-w-2xl mx-auto">
            <Heading className="mb-2">Plan Your Adventure</Heading>
            <Body className="mb-8">Tell us about your ideal New Zealand experience.</Body>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-body text-body-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Destination */}
                <div>
                    <Label className="block mb-2">Where to?</Label>
                    <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="e.g., Queenstown, South Island, anywhere..."
                        className={inputClasses}
                    />
                </div>

                {/* Dates */}
                <div>
                    <Label className="block mb-2">When?</Label>
                    <input
                        type="text"
                        id="dates"
                        name="dates"
                        value={formData.dates}
                        onChange={handleChange}
                        placeholder="e.g., Next weekend, October, flexible..."
                        className={inputClasses}
                    />
                </div>

                {/* Activities Grid */}
                <div>
                    <Label className="block mb-3">Activities (up to 3)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            id="activity1"
                            name="activity1"
                            value={formData.activity1}
                            onChange={handleChange}
                            placeholder="e.g., Hiking"
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            id="activity2"
                            name="activity2"
                            value={formData.activity2}
                            onChange={handleChange}
                            placeholder="e.g., Wine tasting"
                            className={inputClasses}
                        />
                        <input
                            type="text"
                            id="activity3"
                            name="activity3"
                            value={formData.activity3}
                            onChange={handleChange}
                            placeholder="e.g., Stargazing"
                            className={inputClasses}
                        />
                    </div>
                </div>

                {/* Dealmaker */}
                <div>
                    <Label className="block mb-2">What would make this trip perfect?</Label>
                    <input
                        type="text"
                        id="dealmaker"
                        name="dealmaker"
                        value={formData.dealmaker}
                        onChange={handleChange}
                        placeholder="e.g., Great coffee, kid-friendly, off the beaten track..."
                        className={inputClasses}
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="w-full"
                >
                    {isLoading ? 'Discovering...' : 'Discover Experiences'}
                </Button>
            </form>
        </Card>
    );
}
