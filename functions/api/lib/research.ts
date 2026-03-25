// Venue research via Gemini + Google Search grounding
// Finds real, verified venues BEFORE card generation
// Returns raw grounded text — no JSON parsing needed
import { callGeminiWithSearch } from './gemini';

export interface ResearchResult {
    research_text: string;
    success: boolean;
    usage?: { prompt: number; completion: number; total: number };
}

/**
 * Research real venues using Gemini with Google Search grounding.
 * Returns raw grounded text that gets injected directly into the card-generation prompt.
 * No JSON parsing — Gemini + Google Search returns natural language with grounding.
 */
export async function researchVenues(
    location: string,
    activity: string,
    apiKey: string,
    dealmaker?: string,
    dates?: string
): Promise<ResearchResult> {
    const activityStr = activity || 'things to do';
    const dealmakerStr = dealmaker ? ` ${dealmaker}` : '';
    const datesStr = dates && dates !== 'upcoming' && dates !== 'Flexible' ? ` ${dates}` : '';
    const searchQuery = `${activityStr} near ${location} New Zealand${dealmakerStr}${datesStr}`;

    const prompt = `Search Google for: ${searchQuery}

I need a list of REAL, currently operating venues within a 15-minute drive of ${location}, New Zealand. Include venues in surrounding suburbs — in New Zealand, suburbs are close together and a 10-15 minute drive is normal.

For each venue you find, provide:
- Exact business name (as it appears on Google Maps or their website)
- Address
- Type (restaurant, bar, cafe, attraction, etc.)
- Google rating and number of reviews if available
- A brief description
- Which suburb it's in and approximate drive time from ${location}

Focus on:
1. Places with strong Google reviews (4+ stars, many reviews)
2. Places that appear in multiple sources (Google Maps, TripAdvisor, local food blogs)
3. Popular local spots, not just tourist traps

IMPORTANT: Only list venues you actually found in search results. Do NOT guess or invent venue names. If the specific suburb has few options, expand to nearby suburbs and note the drive time.`;

    try {
        console.log(`[RESEARCH] Querying Google Search: "${searchQuery}"`);

        const res = await callGeminiWithSearch(apiKey, prompt, {
            temperature: 0.1,
            maxOutputTokens: 4096,
        });

        console.log(`[RESEARCH] Got response (${res.text.length} chars)`);

        if (res.text && res.text.length > 50) {
            return { research_text: res.text, success: true, usage: res.usage };
        }

        console.warn('[RESEARCH] Response too short, treating as failure');
        return { research_text: '', success: false };
    } catch (error) {
        console.error('[RESEARCH] Failed:', error);
        return { research_text: `Research failed: ${error}`, success: false };
    }
}
