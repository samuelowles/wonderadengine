// Wondura Agent — generates local-knowledge experience cards for New Zealand travel
// Uses Gemini 3 Flash Preview with tool data from Parallel AI
import { callGemini, extractJson } from './lib/gemini';
import { RoutingResultSchema } from '../../src/shared/schema';
import { ensureNZ } from './lib/location';

// Tools
import { getWeather } from './tools/weather';
import { getEvents } from './tools/events';
import { getDining } from './tools/dining';
import { getActivities } from './tools/activities';
import { verifyPrice } from './tools/price';
import { verifyVenue } from './tools/venue';
import { verifyVenuesBatchViaSearch } from './lib/verify-search';

// ── Wondura Agent Prompt (aligned with 03_prompts.md) ──
const WONDURA_PROMPT = `You are Wondura, an expert local travel guide modeled on a New Zealand DOC ranger.
Attributes: Knowledgeable, Kind, Konkrete (Practical), Kredible, Kultural, Klarity.

### HARD CONSTRAINT: NEW ZEALAND ONLY
ALL recommendations must be for real, currently operating locations within New Zealand. If the user mentions a non-NZ destination, redirect to a comparable NZ alternative.

### CRITICAL: NO FABRICATION — TOOL DATA IS YOUR ONLY SOURCE
- You may ONLY recommend venues, restaurants, or businesses that are **explicitly named in the Tool Data** provided below.
- If a venue name does not appear in the Tool Data, you MUST NOT use it. Do not invent venue names, even if they sound plausible.
- If the Tool Data does not contain enough venues for the requested location, you MUST:
  1. Acknowledge that options are limited in the specific suburb/neighborhood.
  2. EXPAND your search radius to nearby suburbs (typically 5–15 minutes drive) and recommend real venues from the Tool Data in those areas.
  3. Be transparent: say something like "Beach Haven itself has limited burger options, but a 10-minute drive to Birkenhead opens up several great spots."
- If the Tool Data returns errors or empty results for ALL tools, say so honestly. Recommend the user try a broader area or different activity.
- NEVER guess at addresses. If an address is not in the Tool Data, say "check venue website for address" or omit it.
- PREFER venues that appear MULTIPLE times across Tool Data results, or have Google ratings/reviews mentioned. These are more likely to be real.
- A venue mentioned in one vague result with no address or rating is LESS trustworthy than one appearing in multiple results with specific details.

### INSTRUCTIONS
1. Analyze ALL Tool Data below. Extract real venue names, addresses, hours, and prices ONLY from this data.
2. Generate exactly 3 Experience Cards. Each card MUST reference a venue that appears in the Tool Data.
3. Cross-check prices against the Price Verification data. If no price data exists, say "check venue website for current pricing."
4. For small suburbs or neighborhoods: expand your recommendations to include nearby areas. NZ suburbs are close together — a 10-minute drive to a neighboring suburb is normal and expected.
5. TONE: Warm but practical. Like a knowledgeable local friend, not a brochure.
   - NO: "Hidden gem", "Bucket list", "Unforgettable", "Must-see", "World-class"
   - YES: Specific venue names FROM THE TOOL DATA, hours, costs, local context

### OUTPUT FORMAT
Return ONLY a JSON array of exactly 3 objects with these fields:
[
  {
    "card_title": "Clear, descriptive title — no clickbait",
    "hook": "One sentence capturing what makes this experience special.",
    "context": "Why locals value this. History, culture, or community significance.",
    "practical": "Hours, cost, location, logistics — derived from Tool Data. Be specific.",
    "insight": "An authentically local tip or cultural nuance a visitor wouldn't know.",
    "consider": "An honest caveat or alternative (e.g., 'Closed Mondays', 'Book 2 days ahead', '10-min drive from Beach Haven')."
  }
]`;

interface Env {
    GOOGLE_AI_KEY: string;
    PARALLEL_API_KEY: string;
}

/** Wrap a promise with a timeout. Returns fallback on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    const timeout = new Promise<T>((resolve) =>
        setTimeout(() => resolve(fallback), ms)
    );
    return Promise.race([promise, timeout]);
}

/** SSE helper */
function sse(event: string, data: unknown): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: string, data: unknown) => {
                controller.enqueue(encoder.encode(sse(event, data)));
            };

            try {
                // Parse request
                const body = await context.request.json();
                const parsed = RoutingResultSchema.safeParse(body);

                if (!parsed.success) {
                    send('error', { error: 'Invalid input' });
                    controller.close();
                    return;
                }

                const { extracted } = parsed.data;
                const location = ensureNZ(extracted.destination || 'New Zealand');
                const dates = extracted.date || 'upcoming';
                const activities = extracted.activity || '';
                const dealmaker = extracted.deal_maker || '';

                const apiKey = context.env.GOOGLE_AI_KEY;
                const parallelKey = context.env.PARALLEL_API_KEY;

                // ── Tool Execution (concurrent, 15s timeout each) ──
                let toolData: Record<string, unknown> = {
                    weather: null, events: null, dining: null,
                    activities: null, price: null, venue: null
                };

                const TOOL_TIMEOUT = 15_000;
                const errorFallback = { error: 'Timed out' };

                if (parallelKey && parallelKey !== 'your_parallel_api_key_here') {
                    try {
                        send('status', { phase: 'searching', tool: 'weather' });

                        const toolPromises = [
                            withTimeout(getWeather(location, dates, parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getEvents(location, dates, parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getDining(location, '', parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getActivities(location, activities, parallelKey, dealmaker, dates), TOOL_TIMEOUT, errorFallback),
                            withTimeout(verifyPrice(`${activities || 'travel'} experiences in ${location}`, 'N/A', null, parallelKey, dates), TOOL_TIMEOUT, errorFallback as any),
                            withTimeout(verifyVenue(location, location, dates, parallelKey), TOOL_TIMEOUT, errorFallback as any),
                        ];

                        const toolNames = ['weather', 'events', 'dining', 'activities', 'price', 'venue'];
                        const results = await Promise.allSettled(toolPromises);

                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            if (result.status === 'fulfilled') {
                                toolData[toolNames[i]] = result.value;
                            } else {
                                toolData[toolNames[i]] = { error: String(result.reason) };
                            }
                        }
                    } catch (e) {
                        console.error('Tool execution error:', e);
                    }
                }

                send('status', { phase: 'generating' });

                // Build context for agent — inject all tool data
                const userContext = `
User Request:
- Destination: ${extracted.destination ? ensureNZ(extracted.destination) : 'Not specified (default: New Zealand)'}
- When: ${extracted.date || 'Flexible'}
- Activities: ${extracted.activity || 'Open to suggestions'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

Tool Data (Weather): ${JSON.stringify(toolData.weather) || 'Unavailable'}
Tool Data (Events): ${JSON.stringify(toolData.events) || 'Unavailable'}
Tool Data (Dining): ${JSON.stringify(toolData.dining) || 'Unavailable'}
Tool Data (Activities): ${JSON.stringify(toolData.activities) || 'Unavailable'}
Tool Data (Price): ${JSON.stringify(toolData.price) || 'Unavailable'}
Tool Data (Venue): ${JSON.stringify(toolData.venue) || 'Unavailable'}
`;

                // Call Gemini — force JSON output
                const response = await callGemini(
                    apiKey,
                    WONDURA_PROMPT,
                    userContext,
                    { model: 'gemini-3-flash-preview', temperature: 0.4, maxOutputTokens: 4096, responseMimeType: 'application/json' }
                );

                // Parse and send cards immediately — no blocking verification
                let parsedCards: Array<Record<string, string>> = [];
                try {
                    const cards = extractJson(response);
                    if (Array.isArray(cards)) {
                        parsedCards = cards;
                        for (const card of cards) {
                            send('card', card);
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse cards:', parseError, 'Raw:', response.slice(0, 500));
                    send('error', { error: 'Failed to parse experience cards from AI response' });
                }

                // ── Post-stream venue verification via Gemini + Google Search ──
                // Runs AFTER cards are sent — zero impact on time-to-first-card
                // Unverified cards are DROPPED
                if (parsedCards.length > 0 && apiKey) {
                    try {
                        send('status', { phase: 'verifying' });

                        const venuesToVerify = parsedCards.map(c => ({
                            name: c.card_title || '',
                            location,
                        })).filter(v => v.name);

                        // 3 parallel Gemini + Google Search calls, 8s timeout
                        const verificationResults = await withTimeout(
                            verifyVenuesBatchViaSearch(venuesToVerify, apiKey),
                            8000,
                            venuesToVerify.map(v => ({
                                venue_name: v.name,
                                exists: false,
                                confidence: 'none' as const,
                                summary: 'Verification timed out',
                            }))
                        );

                        for (const result of verificationResults) {
                            if (result.exists) {
                                send('verified', {
                                    venue_name: result.venue_name,
                                    verified: true,
                                    confidence: result.confidence,
                                    summary: result.summary,
                                });
                            } else {
                                // DROP unverified cards
                                send('drop', {
                                    venue_name: result.venue_name,
                                    reason: result.summary,
                                });
                            }
                        }
                    } catch (verifyError) {
                        console.error('Post-stream verification error:', verifyError);
                        // Non-fatal — cards already sent, just no verification
                    }
                }

                send('done', {});
                controller.close();
            } catch (error) {
                console.error('Agent error:', error);
                controller.enqueue(encoder.encode(sse('error', { error: String(error) })));
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
};
