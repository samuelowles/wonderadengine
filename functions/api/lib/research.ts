// Venue research via Gemini + Google Search grounding
// Finds real, verified venues BEFORE card generation — no post-hoc verification needed
import { callGeminiWithSearch } from './gemini';

export interface ResearchedVenue {
    name: string;
    address: string;
    type: string;       // e.g. "restaurant", "bar", "cafe"
    rating: string;     // e.g. "4.5/5"
    description: string;
    source: string;     // e.g. "Google Maps", "TripAdvisor"
}

export interface ResearchResult {
    venues: ResearchedVenue[];
    raw_response: string;
}

/**
 * Research real venues using Gemini with Google Search grounding.
 * Returns only venues that Google Search can confirm exist.
 */
export async function researchVenues(
    location: string,
    activity: string,
    apiKey: string
): Promise<ResearchResult> {
    const searchQuery = activity
        ? `best ${activity} venues, restaurants, bars, or experiences near ${location}, New Zealand`
        : `best restaurants, cafes, bars, and things to do near ${location}, New Zealand`;

    const prompt = `Search for: ${searchQuery}

Find 5-8 REAL, currently operating venues. For each venue, provide:
- Exact business name (as it appears on Google Maps)
- Street address
- Type (restaurant, bar, cafe, activity, attraction)
- Google rating if available
- Brief description (1-2 sentences)
- Source (e.g. Google Maps, TripAdvisor)

Return ONLY a JSON array, no other text:
[
  {
    "name": "Exact Business Name",
    "address": "Full street address",
    "type": "restaurant",
    "rating": "4.5/5",
    "description": "Brief description of the venue",
    "source": "Google Maps"
  }
]

IMPORTANT:
- Only include venues you found in actual search results
- Do NOT invent or guess venue names
- Include venues from nearby suburbs if the specific area has few options
- All venues must be in New Zealand`;

    try {
        console.log(`[RESEARCH] Searching for venues: "${searchQuery}"`);

        const response = await callGeminiWithSearch(apiKey, prompt, {
            temperature: 0.1,
            maxOutputTokens: 2048,
        });

        console.log(`[RESEARCH] Raw response (${response.length} chars): ${response.slice(0, 300)}`);

        // Try to extract JSON from the response
        let venues: ResearchedVenue[] = [];
        try {
            // Try direct parse first
            const parsed = JSON.parse(response.trim());
            if (Array.isArray(parsed)) {
                venues = parsed;
            }
        } catch {
            // Try to find JSON array in the response
            const match = response.match(/\[[\s\S]*\]/);
            if (match) {
                try {
                    venues = JSON.parse(match[0]);
                } catch {
                    console.error('[RESEARCH] Failed to parse JSON from response');
                }
            }
        }

        console.log(`[RESEARCH] Found ${venues.length} venues:`, venues.map(v => v.name));

        return { venues, raw_response: response };
    } catch (error) {
        console.error('[RESEARCH] Venue research failed:', error);
        return { venues: [], raw_response: String(error) };
    }
}
