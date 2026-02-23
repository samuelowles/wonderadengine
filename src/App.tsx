import { ImmersiveLayout, HeroBgLayout } from './components/layout/Layout'
import { FormFlow } from './components/features/FormFlow'
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
        reset
    } = useWondura();

    /* ── Form ── 9:16 card on full background */
    if (phase === 'form') {
        return (
            <FormFlow
                onSubmit={submitQuery}
                error={error}
            />
        );
    }

    /* ── Loading ── Immersive with spinner */
    /* ── Loading ── Immersive with spinner */
    if (phase === 'loading') {
        return (
            <ImmersiveLayout imageSrc="/img/hero-loading.jpg">
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                    {/* Sleek Thick Ring Loader */}
                    <div className="w-[64px] h-[64px] border-[6px] border-white/20 border-t-white rounded-full animate-spin mb-[32px]" />

                    <h1 className="font-display text-h1 text-white mb-[16px] drop-shadow-md">
                        Finding Your Experience
                    </h1>

                    <span className="font-body text-micro text-white/70 tracking-widest">
                        SEARCHING LOCAL KNOWLEDGE
                    </span>
                </div>
            </ImmersiveLayout>
        );
    }

    /* ── Results ── Cards on single hero background */
    if (phase === 'results' && routingResult) {
        const destination = routingResult.extracted.destination || 'New Zealand';
        return (
            <HeroBgLayout imageSrc="/img/hero-detail.jpg" onBack={reset}>
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
