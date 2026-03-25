import { useEffect, useRef } from 'react';
import { ArrowLeft } from '../ui/Icons';
import { IconButton } from '../ui/Button';

interface FullScreenInputProps {
    title: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export function FullScreenInput({ title, placeholder, value, onChange, onNext, onBack }: FullScreenInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus the input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [title]); // Refocus when title/step changes

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onNext();
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col relative">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between h-[64px] px-[20px] w-full max-w-lg mx-auto">
                <IconButton variant="ghost" onClick={onBack} className="text-text-primary">
                    <ArrowLeft size={24} />
                </IconButton>
                <div className="font-display text-h3 font-semibold text-text-primary">
                    {title}
                </div>
                <div className="w-[40px]" /> {/* Empty div to balance header */}
            </header>

            {/* Input Area */}
            <main className="flex-1 flex flex-col justify-center px-[24px] max-w-lg mx-auto w-full animate-slide-up">
                <form onSubmit={handleSubmit} className="w-full relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-none outline-none font-display text-[32px] sm:text-[40px] leading-tight text-center text-text-primary placeholder:text-text-muted caret-brand-accent"
                        autoCapitalize="sentences"
                        autoComplete="off"
                        autoCorrect="off"
                    />
                </form>
            </main>

            {/* Bottom Next Button */}
            <div className="w-full max-w-lg mx-auto px-[24px] pb-[48px] pt-[24px] mt-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                <button 
                    type="button"
                    onClick={handleSubmit}
                    className="w-full h-[56px] text-[16px] font-medium bg-black text-white hover:bg-neutral-900 rounded-button shadow-float transition-all duration-200 press-scale"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
