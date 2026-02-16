// Weather tool - calls Parallel AI for weather data
// Aligned with N8N "Weather Search" tool definition
export async function getWeather(
    location: string,
    dates: string,
    apiKey: string,
    dealmaker?: string,
    activities?: string
) {
    const objectiveParts = [
        `Find comprehensive weather information for ${location} around ${dates}.`,
        `Include temperature, precipitation, wind conditions, and forecasts.`,
    ];
    if (activities) {
        objectiveParts.push(`The traveler is interested in: ${activities}. Provide weather suitability for these activities.`);
    }
    if (dealmaker) {
        objectiveParts.push(`Their priority is: ${dealmaker}.`);
    }

    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: objectiveParts.join(' '),
            processor: 'pro',
            max_results: 20,
            max_chars_per_result: 10000,
        }),
    });

    if (!response.ok) {
        console.error('Weather API error:', response.status);
        return { results: [], error: 'Weather data unavailable' };
    }

    return response.json();
}
