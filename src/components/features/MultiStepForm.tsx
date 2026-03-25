import { useState } from 'react';
import { FullScreenInput } from '../layout/FullScreenInput';
import type { UserQuery } from '../../shared/schema';

interface MultiStepFormProps {
    onSubmit: (query: UserQuery) => void;
    onBackToSplash: () => void;
    error?: string | null;
}

type Step = 'destination' | 'dates' | 'activities' | 'dealmaker';

export function MultiStepForm({ onSubmit, onBackToSplash, error }: MultiStepFormProps) {
    const [step, setStep] = useState<Step>('destination');
    const [formData, setFormData] = useState<UserQuery>({
        destination: '',
        dates: '',
        activity1: '',
        activity2: '',
        activity3: '',
        dealmaker: '',
    });

    const [activitiesText, setActivitiesText] = useState('');

    const handleNext = () => {
        if (step === 'destination') setStep('dates');
        else if (step === 'dates') setStep('activities');
        else if (step === 'activities') {
            // Parse activities text into 3 fields (simple split by comma)
            const parts = activitiesText.split(',').map(s => s.trim()).filter(Boolean);
            setFormData(prev => ({
                ...prev,
                activity1: parts[0] || '',
                activity2: parts[1] || '',
                activity3: parts[2] || '',
            }));
            setStep('dealmaker');
        }
        else if (step === 'dealmaker') {
            onSubmit(formData);
        }
    };

    const handleBack = () => {
        if (step === 'dealmaker') setStep('activities');
        else if (step === 'activities') setStep('dates');
        else if (step === 'dates') setStep('destination');
        else if (step === 'destination') onBackToSplash();
    };

    const renderStep = () => {
        switch (step) {
            case 'destination':
                return (
                    <FullScreenInput
                        key="dest"
                        title="Where to?"
                        placeholder="Enter destination"
                        value={formData.destination || ''}
                        onChange={(val) => setFormData({ ...formData, destination: val })}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 'dates':
                return (
                    <FullScreenInput
                        key="dates"
                        title="When?"
                        placeholder="e.g. Next weekend"
                        value={formData.dates || ''}
                        onChange={(val) => setFormData({ ...formData, dates: val })}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 'activities':
                return (
                    <FullScreenInput
                        key="acts"
                        title="Activities"
                        placeholder="Coffee, hiking, museums..."
                        value={activitiesText}
                        onChange={setActivitiesText}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 'dealmaker':
                return (
                    <div className="flex flex-col h-full w-full">
                        {error && (
                            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 p-3 bg-red-50 text-red-600 rounded-button text-sm z-50 whitespace-nowrap">
                                {error}
                            </div>
                        )}
                        <FullScreenInput
                            key="deal"
                            title="Dealmaker"
                            placeholder="Must have ocean view"
                            value={formData.dealmaker || ''}
                            onChange={(val) => setFormData({ ...formData, dealmaker: val })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    </div>
                );
        }
    };

    return renderStep();
}
