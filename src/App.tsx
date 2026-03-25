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
        return (
            <HeroBgLayout onBack={reset}>
                {phase === 'loading' ? (
                    <div className="flex flex-col h-[calc(100vh-160px)]">
                        {/* 1. Top Offset block pushing the Semantic Title precisely to the optical center */}
                        <div className="flex-1" />

                        {/* 2. Semantic Title Block (Anchored in absolute center during load) */}
                        <div className="shrink-0 mb-[16px] w-full">
                            <h1 className="font-display font-bold text-[28px] text-white tracking-[-0.03em] mb-[4px]">
                                {destination}
                            </h1>
                            <div className="flex justify-between w-full items-center font-body text-[15px] font-medium text-white/80">
                                <span className="capitalize">{timeframe}</span>
                                {dealmaker && <span className="capitalize">{dealmaker}</span>}
                            </div>
                        </div>

                        {/* 3. DOC Ranger loader centered perfectly underneath the Semantic Header */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <LoadingScreen inline />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-[16px] w-full">
                            <h1 className="font-display font-bold text-[28px] text-white tracking-[-0.03em] mb-[4px]">
                                {destination}
                            </h1>
                            <div className="flex justify-between w-full items-center font-body text-[15px] font-medium text-white/80">
                                <span className="capitalize">{timeframe}</span>
                                {dealmaker && <span className="capitalize">{dealmaker}</span>}
                            </div>
                        </div>
                        {routingResult && <ResultsFeed routingResult={routingResult} />}
                    </>
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
