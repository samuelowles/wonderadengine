import { Button } from '../ui/Button';

interface SplashScreenProps {
    onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
    return (
        <div className="min-h-screen bg-[#050A07] flex flex-col relative overflow-hidden">
            {/* Irregular Shaped Gradient Background (Blobs) */}
            
            {/* Deep Green Base Wash - Wild stretched shape */}
            <div className="absolute -top-[20%] -left-[30%] w-[150vw] h-[50vh] bg-[#0A3D22] rounded-[20%_80%_10%_90%] mix-blend-screen filter blur-[120px] opacity-80 rotate-[15deg] skew-y-12 scale-y-125" />

            {/* Vibrant Green - Sharp asymmetric arc */}
            <div className="absolute -top-[10%] -right-[20%] w-[70vw] h-[100vh] bg-[#3B9C49] rounded-[100%_0%_90%_10%] mix-blend-screen filter blur-[110px] opacity-90 -rotate-[30deg] -skew-x-[20deg]" />
            
            {/* Bright Teal - Huge slanted wave */}
            <div className="absolute -bottom-[20%] -left-[40%] w-[160vw] h-[80vh] bg-[#1A7B9C] rounded-[30%_70%_100%_0%] mix-blend-screen filter blur-[140px] opacity-90 -rotate-[15deg] skew-x-[10deg] scale-125" />

            {/* Subtle Tree Brown - Flattened organic swipe */}
            <div className="absolute top-[50%] -right-[30%] w-[120vw] h-[40vh] bg-[#755D44] rounded-[0%_100%_10%_90%] mix-blend-screen filter blur-[120px] opacity-80 rotate-[45deg] scale-y-150" />

            {/* Massive Noise Stack (unchanged) */}
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-color-dodge contrast-[1.5]" style={{ backgroundImage: 'url("/img/noise.png")', backgroundSize: '70px 70px' }} />
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-overlay" style={{ backgroundImage: 'url("/img/noise.png")', backgroundSize: '100px 100px' }} />

            <div className="relative z-10 flex flex-col flex-1 px-[24px] pb-[48px] pt-[20vh] max-w-lg mx-auto w-full">
                {/* Hero Typographic Section */}
                <div className="flex-1 animate-slide-up">
                    <h1 className="font-display text-[56px] leading-[1.05] tracking-tight text-surface font-semibold mb-[16px]">
                        Welcome<br />
                        to Wondura
                    </h1>
                    <p className="font-body text-body text-surface/70 w-3/4">
                        Your personalized itinerary. From your mind to reality.
                    </p>
                </div>

                {/* Bottom locked CTA */}
                <div className="mt-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <Button 
                        variant="dark" 
                        size="lg" 
                        className="w-full h-[56px] text-[16px] font-medium"
                        onClick={onStart}
                    >
                        Start exploring
                    </Button>
                </div>
            </div>
        </div>
    );
}
