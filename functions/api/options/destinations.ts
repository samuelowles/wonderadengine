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

// Destination Options prompt from 03_prompts.md
const DESTINATIONS_PROMPT = `Role: Strict Geospatial Travel Expert for New Zealand.
Task: Rank top 3 destinations based on User Input.

CONSTRAINTS:
- Strict Geo-fencing: If user says "South Island", exclude North Island. If "North Island", exclude South Island.
- Verify existence of towns - only recommend real NZ towns/cities.
- Consider the activities requested when ranking destinations.

OUTPUT JSON (ONLY output this JSON, no other text):
{
  "destinations": [
    {
      "name": "City Name",
      "region": "Region Name",
      "ranking": 5,
      "justification": "10-15 words.",
      "image_query": "Search term to find image"
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
User wants destinations for:
- Activities: ${extracted.activity || 'Any activities'}
- General location hint: ${extracted.destination || 'Anywhere in New Zealand'}
- When: ${extracted.date || 'Flexible'}
- Dealmaker: ${extracted.deal_maker || 'None specified'}

Recommend 3 best destinations.
`;

        const apiKey = context.env.GOOGLE_AI_KEY;
        const response = await callGemini(
            apiKey,
            DESTINATIONS_PROMPT,
            userMessage,
            { model: 'gemini-3-flash-preview', temperature: 0.2 }
        );

        interface DestinationsResponse {
            destinations?: Array<{
                name: string;
                region: string;
                ranking: number;
                justification: string;
                image_query: string;
            }>;
        }
        const result = extractJson<DestinationsResponse>(response);

        // Transform to options format
        const destinations = result.destinations || [];
        const options = destinations.map((d: any) => ({
            name: d.name,
            subtext: d.region,
            ranking: d.ranking,
            justification: d.justification,
            image_query: d.image_query,
        }));

        return new Response(JSON.stringify({ options }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Destinations error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get destinations' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
