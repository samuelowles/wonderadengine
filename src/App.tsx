import { Layout } from './components/layout/Layout'
import { FormFlow } from './components/features/FormFlow'
import { ResultsFeed } from './components/features/ResultsFeed'
import { OptionsList } from './components/features/OptionCard'
import { useWondura } from './hooks/useWondura'
import { Button } from './components/ui/Button'
import { Heading, Body } from './components/ui/Typography'

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
                    <Button variant="secondary" onClick={reset}>
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
                    <div className="w-12 h-12 border-4 border-brand-forest border-t-transparent rounded-full animate-spin mb-4" />
                    <Heading className="text-2xl mb-2">Finding Your Experience</Heading>
                    <Body>This may take a moment...</Body>
                </div>
            )}

            {/* Results View (Streaming Experience Cards) */}
            {phase === 'results' && routingResult && (
                <div>
                    <Heading className="text-2xl mb-6">
                        Experiences in {routingResult.extracted.destination || 'New Zealand'}
                    </Heading>
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
