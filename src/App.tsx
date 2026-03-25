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

                <div className="relative z-40 w-full flex flex-col min-h-screen pt-[16px]">
                    
                    {/* Dynamic Top Spacer: Holds title at 30vh during load, smoothly collapses to 0 when cards render to PUSH title up */}
                    <div className={`w-full shrink-0 transition-all duration-1000 ease-in-out ${isScreenLoading ? 'h-[25vh]' : 'h-[0px] mb-[16px]'}`} />

                    {/* 1. Semantic Title Block - explicitly transitions out of blur when Gemini resolves */}
                    <div className={`mb-[24px] w-full transition-all duration-1000 ${isTitleLoading ? 'blur-md opacity-40 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
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
                            <div className="mt-[24px] flex flex-col items-center opacity-100 transition-opacity duration-300">
                                <LoadingScreen inline />
                            </div>
                        ) : (
                            <div className="w-full opacity-100 transition-opacity duration-1000 delay-150">
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
