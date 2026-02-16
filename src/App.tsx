import { Layout, ImmersiveLayout, HeroBgLayout } from './components/layout/Layout'
import { FormFlow } from './components/features/FormFlow'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'
import { HeroTitle, Caption, BodySmall } from './components/ui/Typography'

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
    if (phase === 'loading') {
        return (
            <ImmersiveLayout imageSrc="/img/hero-loading.jpg">
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                    <div className="w-[48px] h-[48px] border-[3px] border-white/20 border-t-white rounded-full animate-spin mb-[32px]" />
                    <HeroTitle className="mb-[12px]">Finding Your Experience</HeroTitle>
                    <Caption className="text-white/40">Searching local knowledge...</Caption>
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
            <Layout onBack={reset}>
                <OptionsList
                    title={`Recommended ${routingResult?.routing.includes('Dest') ? 'Destinations' : 'Options'}`}
                    options={options}
                    onSelect={selectOption}
                />
            </Layout>
        );
    }

    return null;
}

export default App
