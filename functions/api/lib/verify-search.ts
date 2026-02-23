// Venue verification via Gemini + Google Search grounding
// Fast, authoritative venue existence checks using Google Search
import { callGeminiWithSearch } from './gemini';

export interface SearchVerificationResult {
    venue_name: string;
    exists: boolean;
    confidence: 'high' | 'medium' | 'low' | 'none';
    summary: string;
}

/**
 * Verify a single venue exists using Gemini with Google Search grounding.
 * Returns a simple exists/doesn't-exist result based on live Google Search.
 */
export async function verifyVenueViaSearch(
    venueName: string,
    location: string,
    apiKey: string
): Promise<SearchVerificationResult> {
    try {
        const prompt = `Does "${venueName}" exist as a real, currently operating restaurant, bar, cafe, or business in or near ${location}, New Zealand? 

Answer with ONLY one of these exact formats:
- YES: [one sentence about the venue from search results]
- NO: [one sentence explaining why not found]
- UNCERTAIN: [one sentence explaining]`;

        const response = await callGeminiWithSearch(apiKey, prompt, {
            temperature: 0.0,
            maxOutputTokens: 200,
        });

        const trimmed = response.trim().toUpperCase();

        if (trimmed.startsWith('YES')) {
            return {
                venue_name: venueName,
                exists: true,
                confidence: 'high',
                summary: response.trim(),
            };
        } else if (trimmed.startsWith('NO')) {
            return {
                venue_name: venueName,
                exists: false,
                confidence: 'high',
                summary: response.trim(),
            };
        } else {
            return {
                venue_name: venueName,
                exists: false,
                confidence: 'low',
                summary: response.trim(),
            };
        }
    } catch (error) {
        console.error(`Venue search verification failed for "${venueName}":`, error);
        return {
            venue_name: venueName,
            exists: false,
            confidence: 'none',
            summary: 'Verification failed',
        };
    }
}

/**
 * Verify multiple venues in parallel using Gemini + Google Search.
 * Returns results for all venues — fast due to parallel execution.
 */
export async function verifyVenuesBatchViaSearch(
    venues: Array<{ name: string; location: string }>,
    apiKey: string
): Promise<SearchVerificationResult[]> {
    return Promise.all(
        venues.map(v => verifyVenueViaSearch(v.name, v.location, apiKey))
    );
}
