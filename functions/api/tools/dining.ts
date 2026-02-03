// Dining tool - calls Parallel AI for restaurants and food
export async function getDining(location: string, preferences: string, apiKey: string) {
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: `Find restaurants and dining options in ${location} ${preferences ? `matching: ${preferences}` : ''}`,
            processor: 'pro',
            max_results: 15,
            max_chars_per_result: 5000,
        }),
    });

    if (!response.ok) {
        console.error('Dining API error:', response.status);
        return { results: [], error: 'Dining data unavailable' };
    }

    return response.json();
}
