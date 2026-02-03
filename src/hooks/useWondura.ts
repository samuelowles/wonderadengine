import { useState, useCallback } from 'react';
import type { UserQuery, RoutingResult, OptionItem } from '../shared/schema';

type Phase = 'form' | 'loading' | 'results' | 'options';

interface WonduraState {
    phase: Phase;
    routingResult: RoutingResult | null;
    options: OptionItem[];
    error: string | null;
}

export function useWondura() {
    const [state, setState] = useState<WonduraState>({
        phase: 'form',
        routingResult: null,
        options: [],
        error: null,
    });

    const submitQuery = useCallback(async (query: UserQuery) => {
        setState(prev => ({ ...prev, phase: 'loading', error: null }));

        try {
            // Step 1: Classify the query
            const classifyResponse = await fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query),
            });

            if (!classifyResponse.ok) {
                throw new Error('Classification failed');
            }

            const routingResult: RoutingResult = await classifyResponse.json();

            // Step 2: Route based on classification
            if (routingResult.routing === 'Details') {
                setState(prev => ({ ...prev, phase: 'results', routingResult }));
            } else if (routingResult.routing.startsWith('Options_')) {
                // Fetch options
                let endpoint = '/api/options/both';
                if (routingResult.routing === 'Options_Destinations') {
                    endpoint = '/api/options/destinations';
                } else if (routingResult.routing === 'Options_Activities') {
                    endpoint = '/api/options/activities';
                }

                const optionsResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(routingResult),
                });

                if (!optionsResponse.ok) {
                    throw new Error('Options fetch failed');
                }

                const optionsData = await optionsResponse.json() as { options?: OptionItem[], destinations?: any[] };
                const options = optionsData.options || optionsData.destinations || [];

                setState(prev => ({
                    ...prev,
                    phase: 'options',
                    routingResult,
                    options
                }));
            } else {
                // Unknown - show options_both as fallback
                setState(prev => ({ ...prev, phase: 'options', routingResult }));
            }
        } catch (error) {
            setState(prev => ({ ...prev, phase: 'form', error: String(error) }));
        }
    }, []);

    const selectOption = useCallback((option: OptionItem) => {
        // When user selects an option, go to results with that selection
        const newRouting: RoutingResult = {
            routing: 'Details',
            extracted: {
                destination: option.name,
                activity: null,
                date: state.routingResult?.extracted.date || null,
                deal_maker: state.routingResult?.extracted.deal_maker || null,
            },
        };
        setState(prev => ({ ...prev, phase: 'results', routingResult: newRouting }));
    }, [state.routingResult]);

    const reset = useCallback(() => {
        setState({
            phase: 'form',
            routingResult: null,
            options: [],
            error: null,
        });
    }, []);

    return {
        ...state,
        submitQuery,
        selectOption,
        reset,
    };
}
