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
const TitleSchema = z.object({
    title: z.string()
});

const TITLE_PROMPT = `You are a travel copywriting engine for the Wondura Engine app. 
Generate a short, evocative 2-5 word trip title based on the user's raw inputs. 
For example, if they enter "Queenstown" and "family", output "Family weekend in Queenstown". 
If they enter "Taupo" and "hiking", output "Summer hiking in Taupo".
Make it sound premium, human, and exciting.
Output ONLY the following JSON, no markdown, no other text:
{
  "title": "Your Title Here"
}`;

interface Env {
    GOOGLE_AI_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body = await context.request.json();
        const parsed = UserQuerySchema.safeParse(body);

        if (!parsed.success) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
        }

        const { destination, dates, activity1, activity2, activity3, dealmaker } = parsed.data;
        const activities = [activity1, activity2, activity3].filter(Boolean).join(', ');

        const userMessage = `
Where: ${destination || 'Not specified'}
When: ${dates || 'Not specified'}
Activities: ${activities || 'Not specified'}
Dealmaker: ${dealmaker || 'Not specified'}
`;

        const apiKey = context.env.GOOGLE_AI_KEY;
        if (!apiKey) {
            throw new Error(`GOOGLE_AI_KEY not configured.`);
        }

        const response = await callGemini(
            apiKey,
            TITLE_PROMPT,
            userMessage,
            { model: 'gemini-3-flash-preview', temperature: 0.7, responseMimeType: 'application/json' }
        );

        const result = extractJson(response.text);
        const validated = TitleSchema.safeParse(result);

        if (!validated.success) {
            console.error('Invalid title response:', result);
            return new Response(JSON.stringify({ title: destination || 'New Zealand Trip' }), { status: 200 });
        }

        return new Response(JSON.stringify(validated.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Title error:', error);
        return new Response(JSON.stringify({ title: 'New Zealand Trip' }), { status: 200 });
    }
};
