import { z } from 'zod';
import { callGemini, extractJson } from './lib/gemini';

// Request schema
const UserQuerySchema = z.object({
    destination: z.string().optional(),
    dates: z.string().optional(),
    activity1: z.string().optional(),
    activity2: z.string().optional(),
    activity3: z.string().optional(),
    dealmaker: z.string().optional(),
});

// Response schema
const ClassificationSchema = z.object({
    routing: z.enum(['Details', 'Options_Destinations', 'Options_Activities', 'Options_Both', 'Unknown']),
    extracted: z.object({
        activity: z.string().nullable(),
        destination: z.string().nullable(),
        date: z.string().nullable(),
        deal_maker: z.string().nullable(),
    }),
});

// Classifier system prompt from 03_prompts.md
const CLASSIFIER_PROMPT = `You are a travel input classifier. Analyze user inputs to classify usage dimensions.

### CLASSIFICATION RULES
1. CLEAR: Specific info provided (e.g., "Napier", "25 Oct", "Wine Tasting").
2. VAGUE: General info (e.g., "North Island", "Summer", "Relaxing").
3. BLANK: Missing info.

### ROUTING LOGIC
- Details: What=Clear AND Where=Clear.
- Options_Destinations: What=Clear AND Where!=Clear.
- Options_Activities: Where=Clear AND What!=Clear.
- Options_Both: Where!=Clear AND What!=Clear.
- Unknown: All Blank.

### OUTPUT JSON (ONLY output this JSON, no other text)
{
  "routing": "Details|Options_Destinations|Options_Activities|Options_Both|Unknown",
  "extracted": {
    "activity": "string|null",
    "destination": "string|null",
    "date": "string|null",
    "deal_maker": "string|null"
  }
}`;

interface Env {
    GOOGLE_AI_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body = await context.request.json();
        const parsed = UserQuerySchema.safeParse(body);

        if (!parsed.success) {
            return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.issues }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { destination, dates, activity1, activity2, activity3, dealmaker } = parsed.data;
        const activities = [activity1, activity2, activity3].filter(Boolean).join(', ');

        // Build user message for classifier
        const userMessage = `
Where: ${destination || 'Not specified'}
When: ${dates || 'Not specified'}
Activities: ${activities || 'Not specified'}
Dealmaker: ${dealmaker || 'Not specified'}
`;

        // Call Gemini Flash for classification
        const apiKey = context.env.GOOGLE_AI_KEY;
        if (!apiKey) {
            throw new Error(`GOOGLE_AI_KEY not configured. Available keys: ${Object.keys(context.env).join(', ')}`);
        }

        const response = await callGemini(
            apiKey,
            CLASSIFIER_PROMPT,
            userMessage,
            { model: 'gemini-3-flash-preview', temperature: 0.0 }
        );

        // Parse and validate the response
        const result = extractJson(response);
        const validated = ClassificationSchema.safeParse(result);

        if (!validated.success) {
            console.error('Invalid classification response:', result);
            // Fallback to basic logic
            return new Response(JSON.stringify({
                routing: 'Options_Both',
                extracted: {
                    activity: activities || null,
                    destination: destination || null,
                    date: dates || null,
                    deal_maker: dealmaker || null,
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(validated.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Classify error:', error);
        return new Response(JSON.stringify({ error: 'Classification failed', message: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
