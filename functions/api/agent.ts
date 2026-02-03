import { z } from 'zod';
import { callGemini, extractJson } from './lib/gemini';
import { getWeather } from './tools/weather';
import { getEvents } from './tools/events';
import { getDining } from './tools/dining';
import { getActivities } from './tools/activities';

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
const WONDURA_PROMPT = `You are Wondura, an expert local travel guide modeled on a New Zealand DOC ranger.
Attributes: Knowledgeable, Kind, Konkrete (Practical), Kredible, Kultural, Klarity.

### INSTRUCTIONS
1. Analyze the Tool Data provided. If data is missing, acknowledge it; do not hallucinate.
2. Generate exactly 3 "Experience Cards" based on the user's request and tool data.
3. TONE: Warm but practical. No "Hidden gems", no "Bucket list", no "Unforgettable".
4. FORMAT: Output ONLY a JSON Array, no other text.

### OUTPUT SCHEMA (ONLY output this JSON array)
[
  {
    "card_title": "String (No clickbait)",
    "hook": "One sentence summary.",
    "context": "Why locals value this.",
    "practical": "Hours, Cost, Logistics (derived from Tool Data).",
    "insight": "Cultural/Local nuance.",
    "consider": "Honest caveat (e.g., 'Windy in afternoons')."
  }
]`;

interface Env {
    GOOGLE_AI_KEY: string;
    PARALLEL_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const encoder = new TextEncoder();

    // Create a streaming response
    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Parse request
                const body = await context.request.json();
                const parsed = RoutingResultSchema.safeParse(body);

                if (!parsed.success) {
                    controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Invalid input' })}\n\n`));
                    controller.close();
                    return;
                }

                const { extracted } = parsed.data;
                const location = extracted.destination || 'New Zealand';
                const dates = extracted.date || 'upcoming';
                const activities = extracted.activity || '';

                // Send status: searching
                controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ phase: 'searching', tool: 'weather' })}\n\n`));

                // Parallel tool execution
                const apiKey = context.env.GOOGLE_AI_KEY;
                const parallelKey = context.env.PARALLEL_API_KEY;

                // Execute tools concurrently (with fallbacks if PARALLEL_API_KEY not set)
                let toolData: { weather: unknown; events: unknown; dining: unknown; activities: unknown } = {
                    weather: null, events: null, dining: null, activities: null
                };

                if (parallelKey && parallelKey !== 'your_parallel_api_key_here') {
                    try {
                        const [weatherData, eventsData, diningData, activitiesData] = await Promise.all([
                            getWeather(location, dates, parallelKey).catch(e => ({ error: e.message })),
                            getEvents(location, dates, parallelKey).catch(e => ({ error: e.message })),
                            getDining(location, '', parallelKey).catch(e => ({ error: e.message })),
                            getActivities(location, activities, parallelKey).catch(e => ({ error: e.message })),
                        ]);
                        toolData = { weather: weatherData, events: eventsData, dining: diningData, activities: activitiesData };
                    } catch (e) {
                        console.error('Tool execution error:', e);
                    }
                }

                controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ phase: 'generating' })}\n\n`));

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
`;

                // Call Gemini Pro for experience cards
                const response = await callGemini(
                    apiKey,
                    WONDURA_PROMPT,
                    userContext,
                    { model: 'gemini-1.5-pro', temperature: 0.4, maxOutputTokens: 4096 }
                );

                // Parse response and send cards
                try {
                    const cards = extractJson(response);
                    if (Array.isArray(cards)) {
                        for (const card of cards) {
                            controller.enqueue(encoder.encode(`event: card\ndata: ${JSON.stringify(card)}\n\n`));
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse cards:', parseError);
                    // Send raw response as fallback
                    controller.enqueue(encoder.encode(`event: card\ndata: ${JSON.stringify({
                        card_title: 'Experience Recommendation',
                        hook: response.slice(0, 200),
                        context: 'Generated response',
                        practical: 'See details below',
                        insight: response,
                        consider: 'Unable to parse structured data'
                    })}\n\n`));
                }

                controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
                controller.close();
            } catch (error) {
                console.error('Agent error:', error);
                controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`));
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
