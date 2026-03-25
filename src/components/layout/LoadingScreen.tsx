import { useState, useEffect } from 'react';
import { ImmersiveLayout } from './Layout';

interface LoadingScreenProps {
    // Add any props if needed
}

const loadingPhrases = [
    "Consulting local guides...",
    "Curating hidden gems...",
    "Synthesizing your itinerary...",
    "Gathering insider knowledge...",
];

export function LoadingScreen({}: LoadingScreenProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);

    // Rotate phrases every 2.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <ImmersiveLayout imageSrc="/img/hero-loading.jpg">
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                {/* Sleek Thick Ring Loader */}
                <div className="w-[64px] h-[64px] border-[6px] border-white/20 border-t-white rounded-full animate-spin mb-[40px]" />

                {/* Rotating Microcopy */}
                <div className="h-[40px] relative w-full overflow-hidden">
                    {loadingPhrases.map((phrase, idx) => (
                        <h2 
                            key={idx}
                            className={`absolute inset-0 w-full font-display text-h3 text-white drop-shadow-md transition-all duration-500 ${
                                idx === phraseIndex 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-4'
                            }`}
                        >
                            {phrase}
                        </h2>
                    ))}
                </div>

                <span className="font-body text-micro text-white/50 tracking-widest mt-[8px]">
                    WONDURA ENGINE
                </span>
            </div>
        </ImmersiveLayout>
    );
}
