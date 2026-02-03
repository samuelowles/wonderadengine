// Activities tool - calls Parallel AI for local activities
export async function getActivities(location: string, activityTypes: string, apiKey: string) {
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: `Find activities and things to do in ${location} ${activityTypes ? `related to: ${activityTypes}` : ''}`,
            processor: 'pro',
            max_results: 20,
            max_chars_per_result: 5000,
        }),
    });

    if (!response.ok) {
        console.error('Activities API error:', response.status);
        return { results: [], error: 'Activities data unavailable' };
    }

    return response.json();
}
