import { z } from 'zod';
import { callGemini, extractJson } from '../lib/gemini';

const RoutingResultSchema = z.object({
    routing: z.enum(['Details', 'Options_Destinations', 'Options_Activities', 'Options_Both', 'Unknown']),
    extracted: z.object({
        activity: z.string().nullable(),
        destination: z.string().nullable(),
        date: z.string().nullable(),
        deal_maker: z.string().nullable(),
    }),
});

// Combined Options prompt
const BOTH_PROMPT = `Role: Complete Travel Planner for New Zealand.
Task: Recommend 2 destinations, each with 2 activities.

CONSTRAINTS:
- Only real NZ destinations and activities.
- Consider seasonality and logistics.
- Each destination should match the user's interests.

OUTPUT JSON (ONLY output this JSON, no other text):
{
  "destinations": [
    {
      "name": "City Name",
      "region": "Region Name",
      "ranking": 5,
      "justification": "10-15 words.",
      "image_query": "Search term for destination image",
      "activities": [
        { "name": "Activity 1", "justification": "Brief reason" },
        { "name": "Activity 2", "justification": "Brief reason" }
      ]
    }
  ]
}`;

interface Env {
    GOOGLE_AI_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body = await context.request.json();
        const parsed = RoutingResultSchema.safeParse(body);

        if (!parsed.success) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { extracted } = parsed.data;

        const userMessage = `
User is looking for a complete trip:
- Location hint: ${extracted.destination || 'Anywhere in New Zealand'}
- Activity interests: ${extracted.activity || 'Open to anything'}
- When: ${extracted.date || 'Flexible'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

Recommend 2 destinations with 2 activities each.
`;

        const apiKey = context.env.GOOGLE_AI_KEY;
        const response = await callGemini(
            apiKey,
            BOTH_PROMPT,
            userMessage,
            { model: 'gemini-1.5-flash', temperature: 0.2 }
        );

        const result = extractJson(response);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Both options error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get options' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
