import { Layout } from './components/layout/Layout'
import { FormFlow } from './components/features/FormFlow'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'
import { Button } from './components/ui/Button'
import { Heading, Body, Caption } from './components/ui/Typography'

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

    return (
        <Layout>
            {/* Back button when not on form */}
            {phase !== 'form' && (
                <div className="mb-6">
                    <Button variant="ghost" size="sm" onClick={reset}>
                        ← New Search
                    </Button>
                </div>
            )}

            {/* Form View */}
            {phase === 'form' && (
                <FormFlow
                    onSubmit={submitQuery}
                    error={error}
                />
            )}

            {/* Loading View */}
            {phase === 'loading' && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-3 border-brand-accent border-t-transparent rounded-full animate-spin mb-6" />
                    <Heading className="text-display-md mb-2">Finding Your Experience</Heading>
                    <Body>Searching local knowledge...</Body>
                </div>
            )}

            {/* Results View (Streaming Experience Cards) */}
            {phase === 'results' && routingResult && (
                <div>
                    <div className="mb-8">
                        <Heading className="mb-2">
                            Experiences in {routingResult.extracted.destination || 'New Zealand'}
                        </Heading>
                        <Caption>
                            Curated by local knowledge
                        </Caption>
                    </div>
                    <ResultsFeed routingResult={routingResult} />
                </div>
            )}

            {/* Options View */}
            {phase === 'options' && (
                <OptionsList
                    title={`Recommended ${routingResult?.routing.includes('Dest') ? 'Destinations' : 'Options'}`}
                    options={options}
                    onSelect={selectOption}
                />
            )}
        </Layout>
    )
}

export default App
