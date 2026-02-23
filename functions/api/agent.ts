// Wondura Agent — generates local-knowledge experience cards for New Zealand travel
// Uses Gemini 2.0 Flash with Google Search for venue research + Parallel AI for enrichment
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

// ── Wondura Agent Prompt ──
const WONDURA_PROMPT = `You are Wondura, an expert local travel guide modeled on a New Zealand DOC ranger.
Attributes: Knowledgeable, Kind, Konkrete (Practical), Kredible, Kultural, Klarity.

### HARD CONSTRAINT: NEW ZEALAND ONLY
ALL recommendations must be for real, currently operating locations within New Zealand.

### CRITICAL: GOOGLE SEARCH RESEARCH IS YOUR PRIMARY SOURCE
- Below you will find "Google Search Research" — these are REAL venues confirmed by live Google Search.
- You MUST pick your 3 venues from the Google Search Research section. Every venue_name you output MUST appear in that research.
- If a venue is NOT mentioned in the Google Search Research, you MUST NOT recommend it. No exceptions.
- The research already covers a 15-minute driving radius including nearby suburbs. Present these as natural local recommendations — do NOT tell the user to "try a broader area" or "search nearby suburbs". Just recommend the best matches and mention which suburb they're in.
- If the Google Search Research is empty or failed, apologise and say you couldn't find matching venues right now.

### INSTRUCTIONS
1. Read the Google Search Research carefully. Pick the 3 best venues for the user's request.
2. Use the Enrichment Data (weather, events, pricing) to add practical context.
3. For venue_name, use the EXACT name from the Google Search Research — do not rephrase or abbreviate it.
4. TONE: Warm but practical. Like a knowledgeable local friend, not a brochure.
   - NO: "Hidden gem", "Bucket list", "Unforgettable", "Must-see", "World-class"
   - YES: Specific names, hours, costs, local context

### OUTPUT FORMAT
Return ONLY a JSON array of exactly 3 objects with these fields:
[
  {
    "card_title": "Title that includes the venue name (e.g. 'Smash Burgers at Real Burger' or 'The Barking Dog — Northcote's Best Pub Grub')",
    "venue_name": "EXACT venue name from Google Search Research",
    "hook": "One sentence capturing what makes this experience special.",
    "context": "Why locals value this. History, culture, or community significance.",
    "practical": "Hours, cost, location, logistics from the research. Be specific.",
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

                // ── Phase 1 & 2: Research + Enrichment (CONCURRENT) ──
                send('status', { phase: 'researching' });
                console.log(`[AGENT] Starting research + enrichment for "${activities}" in "${location}"`);

                // Research via Google Search
                const researchPromise = withTimeout(
                    researchVenues(location, activities, apiKey),
                    20_000,
                    { research_text: 'Research timed out — no venue data available.', success: false }
                );

                // Enrichment via Parallel AI (concurrent with research)
                let toolData: Record<string, unknown> = {
                    weather: null, events: null, dining: null,
                    activities: null, price: null
                };

                const TOOL_TIMEOUT = 15_000;
                const errorFallback = { error: 'Timed out' };

                let enrichPromise: Promise<void> = Promise.resolve();
                if (parallelKey && parallelKey !== 'your_parallel_api_key_here') {
                    enrichPromise = (async () => {
                        try {
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
                    })();
                }

                // Wait for both research and enrichment
                const [researchResult] = await Promise.all([researchPromise, enrichPromise]);

                console.log(`[AGENT] Research ${researchResult.success ? 'succeeded' : 'failed'} (${researchResult.research_text.length} chars)`);
                console.log(`[AGENT] Research preview: ${researchResult.research_text.slice(0, 300)}`);

                send('status', { phase: 'generating' });

                // ── Phase 3: Generate cards from grounded research ──
                const userContext = `
User Request:
- Destination: ${extracted.destination ? ensureNZ(extracted.destination) : 'Not specified (default: New Zealand)'}
- When: ${extracted.date || 'Flexible'}
- Activities: ${extracted.activity || 'Open to suggestions'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

### Google Search Research (live search results — your PRIMARY source for venue names):
${researchResult.research_text || 'No research data available. Be honest with the user that you could not find verified venues.'}

### Enrichment Data (supplementary context):
Weather: ${JSON.stringify(toolData.weather) || 'Unavailable'}
Events: ${JSON.stringify(toolData.events) || 'Unavailable'}
Dining: ${JSON.stringify(toolData.dining) || 'Unavailable'}
Activities: ${JSON.stringify(toolData.activities) || 'Unavailable'}
Pricing: ${JSON.stringify(toolData.price) || 'Unavailable'}
`;

                console.log(`[AGENT] Generating cards...`);

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
                            console.log(`[AGENT] Sending card: "${card.card_title}" (venue: "${card.venue_name}")`);
                            send('card', card);
                        }
                        console.log(`[AGENT] Done — sent ${cards.length} cards`);
                    }
                } catch (parseError) {
                    console.error('[AGENT] Failed to parse cards:', parseError, 'Raw:', response.slice(0, 500));
                    send('error', { error: 'Failed to parse experience cards from AI response' });
                }

                send('done', {});
                controller.close();
            } catch (error) {
                console.error('[AGENT] Fatal error:', error);
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
