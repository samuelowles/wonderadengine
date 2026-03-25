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

        return (
            <HeroBgLayout onBack={reset}>
                {/* Unified content wrapper that blurs EVERYTHING (Title + Loader) during semantic generation */}
                <div className={`transition-all duration-1000 ease-in-out ${isTitleLoading ? 'blur-md opacity-40 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
                    
                    {/* Constant Spacer pushing the title to the exact vertical center */}
                    <div className="h-[30vh] w-full shrink-0" />

                    {/* 1. Semantic Title Block */}
                    <div className="mb-[24px] relative z-40 w-full transition-transform duration-700">
                        <h1 className="font-display font-bold text-[64px] leading-none text-white tracking-[-0.03em] mb-[12px]">
                            {destination}
                        </h1>
                        <div className="flex justify-between w-full items-center font-body text-[18px] font-medium text-white/80">
                            <span className="capitalize">{timeframe}</span>
                            {dealmaker && <span className="capitalize">{dealmaker}</span>}
                        </div>
                    </div>

                    {/* 2. Content below Title Block */}
                    <div className="relative z-40 w-full">
                        {phase === 'loading' ? (
                            <div className="h-[25vh] flex flex-col items-center justify-center">
                                <LoadingScreen inline />
                            </div>
                        ) : (
                            routingResult && <ResultsFeed routingResult={routingResult} />
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
