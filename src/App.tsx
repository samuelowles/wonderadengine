import { HeroBgLayout } from './components/layout/Layout'
import { SplashScreen } from './components/layout/SplashScreen'
import { LoadingScreen } from './components/layout/LoadingScreen'
import { MultiStepForm } from './components/features/MultiStepForm'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'

function App() {
    const {
        phase,
        query,
        tripTitle,
        routingResult,
        options,
        error,
        submitQuery,
        selectOption,
        reset,
        startForm
    } = useWondura();

    /* ── Splash ── Welcome Screen */
    if (phase === 'splash') {
        return <SplashScreen onStart={startForm} />;
    }

    /* ── Form ── Multi-step full screen input */
    if (phase === 'form') {
        return (
            <MultiStepForm
                onSubmit={submitQuery}
                onBackToSplash={reset}
                error={error}
            />
        );
    }

    /* ── Loading & Results ── Unified Hero Layout */
    if (phase === 'loading' || phase === 'results') {
        const destination = tripTitle || routingResult?.extracted.destination || query?.destination || 'New Zealand';
        const timeframe = routingResult?.extracted.date || query?.dates || 'Next Weekend';
        const dealmaker = routingResult?.extracted.deal_maker || query?.dealmaker || '';
        const isTitleLoading = !tripTitle && phase === 'loading';
        const isScreenLoading = phase === 'loading';

        return (
            <HeroBgLayout onBack={reset}>
                {/* Full screen dark overlay (NO BACKDROP BLUR) during the ENTIRE loading phase */}
                <div className={`fixed inset-0 z-30 pointer-events-none bg-black/60 transition-all duration-1000 ease-in-out ${isScreenLoading ? 'opacity-100' : 'opacity-0'}`} />

                {/* Monolithic Animated Layout Wrapper: Moves entire structural cluster 27vh downwards during load, perfectly sliding up to 0 on results */}
                <div 
                    className="relative z-40 w-full flex flex-col min-h-screen pt-[16px] transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ transform: isScreenLoading ? 'translateY(27vh)' : 'translateY(0)' }}
                >
                    
                    {/* 1. Semantic Title Block - explicitly transitions out of blur when Gemini resolves, with a 500ms delay to ensure the string snaps underneath it first */}
                    <div className={`mb-[24px] w-full transition-all duration-1000 ${isTitleLoading ? 'blur-xl opacity-30 scale-[0.98]' : 'blur-0 opacity-100 scale-100 delay-500'}`}>
                        <h1 className="font-display font-bold text-[64px] leading-none text-white tracking-[-0.03em] mb-[12px]">
                            {destination}
                        </h1>
                        <div className="flex justify-between w-full items-center font-body text-[18px] font-medium text-white/80">
                            <span className="capitalize">{timeframe}</span>
                            {dealmaker && <span className="capitalize">{dealmaker}</span>}
                        </div>
                    </div>

                    {/* 2. Content below Title Block */}
                    <div className="w-full transition-all duration-1000">
                        {isScreenLoading ? (
                            <div className="mt-[15vh] flex flex-col items-center opacity-100 transition-opacity duration-300">
                                <LoadingScreen inline />
                            </div>
                        ) : (
                            <div className="w-full opacity-100 animate-slide-up delay-150">
                                {routingResult && <ResultsFeed routingResult={routingResult} />}
                            </div>
                        )}
                    </div>
                </div>
            </HeroBgLayout>
        );
    }

    /* ── Options ── Standard layout, no bottom nav */
    if (phase === 'options') {
        return (
            <HeroBgLayout imageSrc="/img/hero-options.jpg" onBack={reset}>
                <OptionsList
                    title={`Recommended ${routingResult?.routing.includes('Dest') ? 'Destinations' : 'Options'}`}
                    options={options}
                    onSelect={selectOption}
                />
            </HeroBgLayout>
        );
    }

    return null;
}

export default App
