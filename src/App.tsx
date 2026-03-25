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
        const destination = routingResult?.extracted.destination || query?.destination || 'New Zealand';
        const timeframe = routingResult?.extracted.date || query?.dates || 'Next Weekend';
        const dealmaker = routingResult?.extracted.deal_maker || query?.dealmaker || '';
        return (
            <HeroBgLayout onBack={reset}>
                {/* 1. Semantic Title Block (Pinned top-left) */}
                <div className="mb-[16px]">
                    <h1 className="font-display font-bold text-[28px] text-white tracking-[-0.03em] mb-[4px] lowercase">
                        {destination}
                    </h1>
                    <div className="flex items-center gap-[8px] font-body text-[15px] font-medium text-white/50">
                        <span className="capitalize">{timeframe}</span>
                        {dealmaker && (
                            <>
                                <span className="text-white/30">•</span>
                                <span className="capitalize">{dealmaker}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* 2. Content below Title Block */}
                {phase === 'loading' ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] -mt-[60px]">
                        <LoadingScreen inline />
                    </div>
                ) : (
                    routingResult && <ResultsFeed routingResult={routingResult} />
                )}
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
