// Events tool - calls Parallel AI for local events
// Aligned with N8N "Local Events Search2" tool definition
import { ensureNZ } from '../lib/location';

export async function getEvents(
    location: string,
    dates: string,
    apiKey: string,
    dealmaker?: string,
    activities?: string
) {
    const nzLocation = ensureNZ(location);
    const objectiveParts = [
        `Find local events, activities, and things to do in ${nzLocation} and nearby surrounding areas during ${dates}.`,
        `Include concerts, food & drink events, sports, arts & culture, outdoor events, festivals, and community gatherings.`,
        `Provide specific venue names, addresses, dates, times, tickets, and activities.`,
    ];
    if (activities) {
        objectiveParts.push(`Focus on events related to: ${activities}.`);
    }
    if (dealmaker) {
        objectiveParts.push(`The traveler's priority is: ${dealmaker}.`);
    }
    objectiveParts.push('Exclude aggregator sites by appending: -viator -tripadvisor -alltrails -getyourguide -expedia. Prioritize local blogs, official websites, and authentic local sources.');

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
        console.error('Events API error:', response.status);
        return { results: [], error: 'Events data unavailable' };
    }

    return response.json();
}
