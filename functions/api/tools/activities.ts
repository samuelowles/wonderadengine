// Activities tool - calls Parallel AI for local activities
// Aligned with N8N "Local Activities Search1" tool definition
export async function getActivities(
    location: string,
    activityTypes: string,
    apiKey: string,
    dealmaker?: string,
    dates?: string
) {
    const objectiveParts = [
        `Find local activities, attractions, and experiences in ${location}.`,
        `Include outdoor adventures, water sports, tours, cultural activities, entertainment, wellness, wildlife, scenic spots, and family-friendly options.`,
        `Provide details on bookings, schedules, prices, requirements, and activity descriptions.`,
    ];
    if (activityTypes) {
        objectiveParts.push(`Focus on activities related to: ${activityTypes}.`);
    }
    if (dates) {
        objectiveParts.push(`The traveler is visiting around: ${dates}. Check seasonal availability.`);
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
        console.error('Activities API error:', response.status);
        return { results: [], error: 'Activities data unavailable' };
    }

    return response.json();
}
