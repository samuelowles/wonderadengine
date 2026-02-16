import { Layout, ImmersiveLayout } from './components/layout/Layout'
import { FormFlow } from './components/features/FormFlow'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'
import { Button } from './components/ui/Button'
import { H1, HeroTitle, Caption, BodySmall } from './components/ui/Typography'
import { ArrowLeft } from './components/ui/Icons'

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

    /* ── Form ── uses OverlayLayout (inside FormFlow) */
    if (phase === 'form') {
        return (
            <FormFlow
                onSubmit={submitQuery}
                error={error}
            />
        );
    }

    /* ── Loading ── Immersive with dimmed hero + spinner */
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

    /* ── Results ── Standard Layout with bottom nav */
    if (phase === 'results' && routingResult) {
        return (
            <Layout>
                <div className="mb-[8px]">
                    <Button variant="ghost" size="sm" onClick={reset} className="mb-[16px] -ml-[8px]">
                        <ArrowLeft size={16} className="mr-[6px]" />
                        New Search
                    </Button>
                </div>

                <div className="mb-[24px]">
                    <H1>Your Experiences</H1>
                    <BodySmall className="mt-[4px]">
                        {routingResult.extracted.destination || 'New Zealand'}
                    </BodySmall>
                </div>

                <ResultsFeed routingResult={routingResult} onBack={reset} />
            </Layout>
        );
    }

    /* ── Options ── Standard Layout with bottom nav */
    if (phase === 'options') {
        return (
            <Layout>
                <div className="mb-[8px]">
                    <Button variant="ghost" size="sm" onClick={reset} className="mb-[16px] -ml-[8px]">
                        <ArrowLeft size={16} className="mr-[6px]" />
                        New Search
                    </Button>
                </div>

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
