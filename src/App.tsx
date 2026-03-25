import { HeroBgLayout } from './components/layout/Layout'
import { SplashScreen } from './components/layout/SplashScreen'
import { LoadingScreen } from './components/layout/LoadingScreen'
import { MultiStepForm } from './components/features/MultiStepForm'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'
import { HeroTitle, BodySmall } from './components/ui/Typography'

function App() {
    const {
        phase,
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

    /* ── Loading ── Branded Microcopy */
    if (phase === 'loading') {
        return <LoadingScreen />;
    }

    /* ── Results ── Cards on single hero background */
    if (phase === 'results' && routingResult) {
        const destination = routingResult.extracted.destination || 'New Zealand';
        return (
            <HeroBgLayout imageSrc="/img/DTS_Chill Dudes_by_Daniel Faro╠Ç_015.jpg" onBack={reset}>
                <div className="mb-[24px]">
                    <HeroTitle className="mb-[4px]">{destination}</HeroTitle>
                    <BodySmall className="text-white/50">
                        {routingResult.extracted.date || 'Your curated experiences'}
                    </BodySmall>
                </div>
                <ResultsFeed routingResult={routingResult} />
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
