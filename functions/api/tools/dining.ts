// Dining tool - calls Parallel AI for restaurants and food
// Aligned with N8N "Food and Dining Search" tool definition
export async function getDining(
    location: string,
    preferences: string,
    apiKey: string,
    dealmaker?: string,
    activities?: string
) {
    const objectiveParts = [
        `Find restaurants and dining options in ${location}.`,
        `Include fine dining, casual restaurants, cafes, bars, seafood, ethnic cuisines, and local favorites.`,
        `Provide details on menus, prices, hours, reviews, and reservations.`,
    ];
    if (preferences) {
        objectiveParts.push(`Dining preferences: ${preferences}.`);
    }
    if (activities) {
        objectiveParts.push(`The traveler is interested in: ${activities}. Suggest dining that complements these activities.`);
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
        console.error('Dining API error:', response.status);
        return { results: [], error: 'Dining data unavailable' };
    }

    return response.json();
}
