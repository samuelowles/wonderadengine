import { useState, useEffect } from 'react';
import { WonduraBackground } from './Layout';

interface LoadingScreenProps {
    status?: string;
    inline?: boolean;
}

const loadingPhrases = [
    "Analyzing preferences...",
    "Scanning databases...",
    "Consulting local guides...",
    "Curating hidden gems...",
    "Correlating weather data...",
    "Resolving logistics...",
    "Synthesizing itinerary...",
    "Finalizing details..."
];

export function LoadingScreen({ status, inline = false }: LoadingScreenProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);

    // Rotate phrases extremely fast (Claude Code style)
    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const content = (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
            {/* Rotating Microcopy or Status */}
            <div className="h-[40px] relative w-full overflow-hidden">
                {status ? (
                    <h2 className="absolute inset-0 w-full font-display font-bold text-[28px] text-white drop-shadow-md transition-all duration-300 opacity-100 transform translate-y-0">
                        {status}
                    </h2>
                ) : (
                    loadingPhrases.map((phrase, idx) => (
                        <h2 
                            key={idx}
                            className={`absolute inset-0 w-full font-display font-bold text-[28px] text-white drop-shadow-md transition-all duration-300 ${
                                idx === phraseIndex 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-4'
                            }`}
                        >
                            {phrase}
                        </h2>
                    ))
                )}
            </div>

            <span className="font-body text-micro text-white/50 tracking-widest mt-[8px]">
                WONDURA ENGINE
            </span>
        </div>
    );

    if (inline) return content;

    return (
        <div className="min-h-screen bg-[#050A07] flex flex-col relative overflow-hidden">
            <WonduraBackground />
            {content}
        </div>
    );
}
