// Events tool - calls Parallel AI for local events
export async function getEvents(location: string, dates: string, apiKey: string) {
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: `Find local events and activities in ${location} during ${dates}`,
            processor: 'pro',
            max_results: 15,
            max_chars_per_result: 5000,
        }),
    });

    if (!response.ok) {
        console.error('Events API error:', response.status);
        return { results: [], error: 'Events data unavailable' };
    }

    return response.json();
}
