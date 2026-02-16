import { z } from 'zod';
import { callGemini, extractJson } from './lib/gemini';
import { getWeather } from './tools/weather';
import { getEvents } from './tools/events';
import { getDining } from './tools/dining';
import { getActivities } from './tools/activities';
import { verifyPrice } from './tools/price';
import { verifyVenue } from './tools/venue';

// Request schema
const RoutingResultSchema = z.object({
    routing: z.enum(['Details', 'Options_Destinations', 'Options_Activities', 'Options_Both', 'Unknown']),
    extracted: z.object({
        activity: z.string().nullable(),
        destination: z.string().nullable(),
        date: z.string().nullable(),
        deal_maker: z.string().nullable(),
    }),
});

// Wondura Agent System Prompt from 03_prompts.md
const WONDURA_PROMPT = `You are Wondura, an expert local travel guide agent. Your persona is modeled on a New Zealand Department of Conservation (DOC) ranger: knowledgeable, friendly, helpful, authentic, and practical.

You do not generate generic itineraries. You generate specific, highly practical, and culturally aware travel experience cards.

### TONE OF VOICE GUIDELINES (THE 6 K's)
You must strictly adhere to these 6 core voice attributes:

1. **Knowledgeable**: Speak from genuine understanding. Provide context and cite local expertise.
2. **Kind**: Warm and approachable, never condescending or fake-friendly.
3. **Konkrete (Practical)**: Specific details, clear information, actionable advice.
4. **Kredible**: Honest and transparent. Acknowledge limitations or caveats.
5. **Kultural**: Respectful of local culture, environment, and community. Use correct terminology (e.g., dual place names).
6. **Klarity**: Plain language, logical organization, no jargon.

### WORKFLOW SEQUENCE
1. **Analyze Tool Data**: Use ALL provided tool data to add "Konkrete" accuracy.
   - **Weather Data**: For packing advice and activity suitability.
   - **Events Data**: For community gatherings during travel dates.
   - **Dining Data**: For confirmed operating hours and menu info.
   - **Activities Data**: For booking availability and current pricing.
   - **Price Verification**: Cross-check any prices mentioned in your cards against verified pricing data. If price data is available, use it.
   - **Venue Verification**: Check that any venue you recommend is confirmed open and operational. Flag red flags (closures, renovations) in the "Consider" section.
2. **Generate Cards**: Create exactly 3 travel experience cards.
3. **Verify Before Outputting**: Do NOT recommend a venue that Venue Verification flagged as closed. Do NOT cite a price that Price Verification contradicts.

### CONTENT STRUCTURE (The PEROT Principle)
Every card description must follow this flow:
1. **Hook**: One sentence capturing what makes this special.
2. **Context**: Why locals value this (history/culture).
3. **Practical**: Specifics on hours, location, cost, accessibility.
4. **Insight**: What makes it authentically local.
5. **Consider**: A helpful caveat or alternative.

### JSON OUTPUT FORMAT (ONLY output this JSON Array)
[
  {
    "card_title": "Clear, descriptive title (No clickbait)",
    "experience_description": "Friendly, knowledgeable description following the Hook -> Context -> Insight flow (approx 50-70 words).",
    "practical_logistics": "Seamless integration of booking details, timing, cost estimates, and safety info (e.g., 'Open Tues-Sun, 10am-4pm. $25 entry.'). Use Tool Data here."
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
                const location = extracted.destination || 'New Zealand';
                const dates = extracted.date || 'upcoming';
                const activities = extracted.activity || '';
                const dealmaker = extracted.deal_maker || '';

                const apiKey = context.env.GOOGLE_AI_KEY;
                const parallelKey = context.env.PARALLEL_API_KEY;

                // ── Tool Execution (with per-tool status + 15s timeout) ──
                let toolData: Record<string, unknown> = {
                    weather: null, events: null, dining: null,
                    activities: null, price: null, venue: null
                };

                const TOOL_TIMEOUT = 15_000; // 15 seconds per tool
                const errorFallback = { error: 'Timed out' };

                if (parallelKey && parallelKey !== 'your_parallel_api_key_here') {
                    try {
                        send('status', { phase: 'searching', tool: 'weather' });

                        // Run tools with individual timeouts and status updates
                        const toolPromises = [
                            withTimeout(getWeather(location, dates, parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getEvents(location, dates, parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getDining(location, '', parallelKey, dealmaker, activities), TOOL_TIMEOUT, errorFallback),
                            withTimeout(getActivities(location, activities, parallelKey, dealmaker, dates), TOOL_TIMEOUT, errorFallback),
                            withTimeout(verifyPrice(`${activities || 'travel'} experiences in ${location}`, 'N/A', null, parallelKey, dates), TOOL_TIMEOUT, errorFallback as any),
                            withTimeout(verifyVenue(location, location, dates, parallelKey), TOOL_TIMEOUT, errorFallback as any),
                        ];

                        const toolNames = ['weather', 'events', 'dining', 'activities', 'price', 'venue'];

                        // Execute all concurrently but track completion
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

                // Build context for agent
                const userContext = `
User Request:
- Destination: ${extracted.destination || 'Not specified'}
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

                // Call Gemini for experience cards
                const response = await callGemini(
                    apiKey,
                    WONDURA_PROMPT,
                    userContext,
                    { model: 'gemini-3-flash-preview', temperature: 0.4, maxOutputTokens: 4096 }
                );

                // Parse response and send cards
                try {
                    const cards = extractJson(response);
                    if (Array.isArray(cards)) {
                        for (const card of cards) {
                            send('card', card);
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse cards:', parseError);
                    send('card', {
                        card_title: 'Experience Recommendation',
                        experience_description: response.slice(0, 300) + '...',
                        practical_logistics: 'Unable to parse structured data. See description above.'
                    });
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
