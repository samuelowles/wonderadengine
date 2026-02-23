// Wondura Agent — generates local-knowledge experience cards for New Zealand travel
// Uses Gemini 3 Flash Preview with Google Search research + Parallel AI enrichment
import { callGemini, extractJson } from './lib/gemini';
import { researchVenues } from './lib/research';
import { RoutingResultSchema } from '../../src/shared/schema';
import { ensureNZ } from './lib/location';

// Tools (enrichment — weather, events, pricing)
import { getWeather } from './tools/weather';
import { getEvents } from './tools/events';
import { getDining } from './tools/dining';
import { getActivities } from './tools/activities';
import { verifyPrice } from './tools/price';

// ── Wondura Agent Prompt (aligned with 03_prompts.md) ──
const WONDURA_PROMPT = `You are Wondura, an expert local travel guide modeled on a New Zealand DOC ranger.
Attributes: Knowledgeable, Kind, Konkrete (Practical), Kredible, Kultural, Klarity.

### HARD CONSTRAINT: NEW ZEALAND ONLY
ALL recommendations must be for real, currently operating locations within New Zealand. If the user mentions a non-NZ destination, redirect to a comparable NZ alternative.

### CRITICAL: VERIFIED VENUE LIST IS YOUR ONLY SOURCE
- You may ONLY recommend venues from the **Verified Venues** list below. These venues have been confirmed via Google Search.
- If a venue is NOT in the Verified Venues list, you MUST NOT use it. Do not invent venue names.
- If the Verified Venues list has fewer than 3 venues, still produce cards only for the verified ones. Do not pad with invented venues.
- Use the enrichment data (weather, events, pricing) to add practical details to your cards.

### INSTRUCTIONS
1. Select the 3 best venues from the Verified Venues list based on relevance to the user's request.
2. Generate exactly 3 Experience Cards using ONLY venues from the verified list.
3. TONE: Warm but practical. Like a knowledgeable local friend, not a brochure.
   - NO: "Hidden gem", "Bucket list", "Unforgettable", "Must-see", "World-class"
   - YES: Specific venue names, hours, costs, local context

### OUTPUT FORMAT
Return ONLY a JSON array of exactly 3 objects with these fields:
[
  {
    "card_title": "Clear, descriptive title — no clickbait",
    "venue_name": "The exact venue name from the Verified Venues list",
    "hook": "One sentence capturing what makes this experience special.",
    "context": "Why locals value this. History, culture, or community significance.",
    "practical": "Hours, cost, location, logistics — use address and rating from verified data. Be specific.",
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

                // ── Phase 1: Research venues via Google Search ──
                send('status', { phase: 'researching' });
                console.log(`[AGENT] Phase 1: Researching venues for "${activities}" in "${location}"`);

                const researchResult = await withTimeout(
                    researchVenues(location, activities, apiKey),
                    15_000,
                    { venues: [], raw_response: 'Research timed out' }
                );

                console.log(`[AGENT] Research found ${researchResult.venues.length} verified venues`);

                // ── Phase 2: Enrich with Parallel AI tools (concurrent) ──
                let toolData: Record<string, unknown> = {
                    weather: null, events: null, dining: null,
                    activities: null, price: null
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
                        ];

                        const toolNames = ['weather', 'events', 'dining', 'activities', 'price'];
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

                // ── Phase 3: Generate cards from verified venues + enrichment ──
                const verifiedVenueList = researchResult.venues.length > 0
                    ? researchResult.venues.map((v, i) =>
                        `${i + 1}. ${v.name} — ${v.type} — ${v.address} — Rating: ${v.rating} — ${v.description} (Source: ${v.source})`
                    ).join('\n')
                    : 'No verified venues found. Use enrichment data to find real venues, but be transparent about limited data.';

                const userContext = `
User Request:
- Destination: ${extracted.destination ? ensureNZ(extracted.destination) : 'Not specified (default: New Zealand)'}
- When: ${extracted.date || 'Flexible'}
- Activities: ${extracted.activity || 'Open to suggestions'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

### Verified Venues (confirmed via Google Search):
${verifiedVenueList}

### Enrichment Data:
Weather: ${JSON.stringify(toolData.weather) || 'Unavailable'}
Events: ${JSON.stringify(toolData.events) || 'Unavailable'}
Dining: ${JSON.stringify(toolData.dining) || 'Unavailable'}
Activities: ${JSON.stringify(toolData.activities) || 'Unavailable'}
Pricing: ${JSON.stringify(toolData.price) || 'Unavailable'}
`;

                console.log(`[AGENT] Phase 3: Generating cards with ${researchResult.venues.length} verified venues`);

                // Call Gemini — force JSON output
                const response = await callGemini(
                    apiKey,
                    WONDURA_PROMPT,
                    userContext,
                    { model: 'gemini-3-flash-preview', temperature: 0.4, maxOutputTokens: 4096, responseMimeType: 'application/json' }
                );

                // Parse and send cards
                try {
                    const cards = extractJson(response);
                    if (Array.isArray(cards)) {
                        for (const card of cards) {
                            send('card', card);
                        }
                        console.log(`[AGENT] Sent ${cards.length} cards`);
                    }
                } catch (parseError) {
                    console.error('Failed to parse cards:', parseError, 'Raw:', response.slice(0, 500));
                    send('error', { error: 'Failed to parse experience cards from AI response' });
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
