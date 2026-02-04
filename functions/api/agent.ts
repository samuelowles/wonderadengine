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
1. **Analyze Tool Data**: Use the provided weather, events, and dining info to add "Konkrete" accuracy.
2. **Generate Cards**: Create exactly 3 travel experience cards.

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
                let toolData: { weather: unknown; events: unknown; dining: unknown; activities: unknown; price: unknown; venue: unknown } = {
                    weather: null, events: null, dining: null, activities: null, price: null, venue: null
                };

                if (parallelKey && parallelKey !== 'your_parallel_api_key_here') {
                    try {
                        const [weatherData, eventsData, diningData, activitiesData, priceData, venueData] = await Promise.all([
                            getWeather(location, dates, parallelKey).catch(e => ({ error: e.message })),
                            getEvents(location, dates, parallelKey).catch(e => ({ error: e.message })),
                            getDining(location, '', parallelKey).catch(e => ({ error: e.message })),
                            getActivities(location, activities, parallelKey).catch(e => ({ error: e.message })),
                            verifyPrice('General Costs', 'N/A', null, parallelKey).catch(e => ({ error: e.message })),
                            verifyVenue(location, 'New Zealand', dates, parallelKey).catch(e => ({ error: e.message })),
                        ]);
                        toolData = { weather: weatherData, events: eventsData, dining: diningData, activities: activitiesData, price: priceData, venue: venueData };
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
Tool Data (Price): ${JSON.stringify(toolData.price) || 'Unavailable'}
Tool Data (Venue): ${JSON.stringify(toolData.venue) || 'Unavailable'}
`;

                // Call Gemini Pro for experience cards
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
                            controller.enqueue(encoder.encode(`event: card\ndata: ${JSON.stringify(card)}\n\n`));
                        }
                    }
                } catch (parseError) {
                    console.error('Failed to parse cards:', parseError);
                    // Send raw response as fallback
                    controller.enqueue(encoder.encode(`event: card\ndata: ${JSON.stringify({
                        card_title: 'Experience Recommendation',
                        experience_description: response.slice(0, 300) + '...',
                        practical_logistics: 'Unable to parse structured data. See description above.'
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
