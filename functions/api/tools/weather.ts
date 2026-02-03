// Weather tool - calls Parallel AI for weather data
export async function getWeather(location: string, dates: string, apiKey: string) {
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: `Find weather forecast for ${location} around ${dates}`,
            processor: 'pro',
            max_results: 10,
            max_chars_per_result: 5000,
        }),
    });

    if (!response.ok) {
        console.error('Weather API error:', response.status);
        return { results: [], error: 'Weather data unavailable' };
    }

    return response.json();
}
