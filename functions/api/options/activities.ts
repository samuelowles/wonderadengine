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

// Activity Options prompt from 03_prompts.md
const ACTIVITIES_PROMPT = `Role: Strict Activity Concierge for New Zealand.
Task: Rank top 3 activities within the specified destination.

CONSTRAINTS:
- Must be logistically possible in the destination.
- Check seasonality against the date/season.
- Only recommend real activities that exist.

OUTPUT JSON (ONLY output this JSON, no other text):
{
  "activities": [
    {
      "name": "Activity Name",
      "location": "Suburb/Area",
      "seasonal_check": "Valid",
      "ranking": 5,
      "justification": "10-15 words."
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
User wants activities in:
- Destination: ${extracted.destination || 'New Zealand'}
- Activity interests: ${extracted.activity || 'Any activities'}
- When: ${extracted.date || 'Flexible'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

Recommend 3 best activities.
`;

        const apiKey = context.env.GOOGLE_AI_KEY;
        const response = await callGemini(
            apiKey,
            ACTIVITIES_PROMPT,
            userMessage,
            { model: 'gemini-2.5-flash', temperature: 0.2 }
        );

        interface ActivitiesResponse {
            activities?: Array<{
                name: string;
                location: string;
                seasonal_check: string;
                ranking: number;
                justification: string;
            }>;
        }
        const result = extractJson<ActivitiesResponse>(response);

        // Transform to options format
        const activities = result.activities || [];
        const options = activities.map((a: any) => ({
            name: a.name,
            subtext: a.location,
            ranking: a.ranking,
            justification: a.justification,
            image_query: `${a.name} ${a.location} new zealand`,
        }));

        return new Response(JSON.stringify({ options }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Activities error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get activities' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
