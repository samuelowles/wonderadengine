// Venue verification tool - calls Parallel AI for venue viability checks
// Aligned with N8N "Venue Verification Tool" definition
export async function verifyVenue(
    venueName: string,
    location: string,
    dates: string,
    apiKey: string
) {
    const objective = [
        `Verify if "${venueName}" in ${location} is appropriate, open, and logistically viable.`,
        `1. Confirm the venue exists and is currently trading (not permanently closed).`,
        `2. Find the opening hours for the specific dates: ${dates}.`,
        `3. Calculate the travel distance/time from ${location} to the venue.`,
        `4. Flag any major logistical red flags (e.g., renovations, seasonal closure, booking required).`,
    ].join(' ');

    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective,
            processor: 'pro',
            max_results: 3,
            max_chars_per_result: 5000,
        }),
    });

    if (!response.ok) {
        console.error('Venue API error:', response.status);
        return { exists: false, open_on_dates: false, travel_time_minutes: null, red_flags: ['Unable to verify'] };
    }

    const data = await response.json() as { results?: Array<{ text?: string; url?: string }> };
    const results = data.results || [];

    if (results.length === 0) {
        return { exists: false, open_on_dates: false, travel_time_minutes: null, red_flags: ['No results found for this venue'] };
    }

    const combinedText = results.map(r => r.text || '').join('\n').toLowerCase();

    // Check for closure signals
    const closedSignals = ['permanently closed', 'no longer operating', 'shut down', 'closed down', 'ceased trading'];
    const isClosed = closedSignals.some(signal => combinedText.includes(signal));

    // Check for red flags
    const red_flags: string[] = [];
    if (isClosed) red_flags.push('Venue appears permanently closed');
    if (combinedText.includes('renovation') || combinedText.includes('refurbishment')) red_flags.push('Renovations mentioned');
    if (combinedText.includes('seasonal') || combinedText.includes('winter closure') || combinedText.includes('closed for season')) red_flags.push('Seasonal closure possible');
    if (combinedText.includes('booking required') || combinedText.includes('reservation required')) red_flags.push('Advance booking required');
    if (combinedText.includes('limited capacity') || combinedText.includes('sold out')) red_flags.push('Limited capacity / may sell out');

    // Extract travel time if mentioned
    const timeMatch = combinedText.match(/(\d+)\s*(?:min|minute)/);
    const travel_time_minutes = timeMatch ? parseInt(timeMatch[1]) : null;

    return {
        exists: !isClosed && results.length > 0,
        open_on_dates: !isClosed && red_flags.length === 0,
        travel_time_minutes,
        red_flags,
        source_count: results.length,
    };
}
