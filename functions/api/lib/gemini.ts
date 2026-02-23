// Gemini API helper for Cloudflare Functions
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';



interface GeminiConfig {
    model: 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-3-flash-preview' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
}

export async function callGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    config: GeminiConfig
): Promise<string> {
    const url = `${GEMINI_API_BASE}/${config.model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: userMessage }]
            }],
            generationConfig: {
                temperature: config.temperature ?? 0.4,
                maxOutputTokens: config.maxOutputTokens ?? 2048,
                ...(config.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error (${response.status}):`, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as {
        candidates?: Array<{
            content?: {
                parts?: Array<{ text?: string; thought?: boolean }>
            }
        }>
    };

    // Extract text from response — skip 'thought' parts (thinking models like gemini-3-flash-preview)
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
        console.error('[GEMINI] No parts in response:', JSON.stringify(data).slice(0, 500));
        throw new Error('No parts in Gemini response');
    }

    // Filter to non-thought text parts, then join
    const textParts = parts.filter(p => p.text && !p.thought);
    const text = textParts.map(p => p.text).join('');

    if (!text) {
        // If ALL parts are thoughts (shouldn't happen with responseMimeType), try all parts
        const allText = parts.filter(p => p.text).map(p => p.text).join('');
        if (allText) {
            console.warn('[GEMINI] Only thought parts found, using them as fallback');
            return allText;
        }
        console.error('[GEMINI] No text parts found. Parts:', JSON.stringify(parts).slice(0, 500));
        throw new Error('No text in Gemini response');
    }

    return text;
}

/**
 * Call Gemini with Google Search grounding enabled.
 * Uses gemini-2.5-flash for grounded venue research.
 * Note: google_search tool requires a model that supports it.
 */
export async function callGeminiWithSearch(
    apiKey: string,
    prompt: string,
    config?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
    const model = 'gemini-2.5-flash';
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            tools: [{ google_search: {} }],
            generationConfig: {
                temperature: config?.temperature ?? 0.1,
                maxOutputTokens: config?.maxOutputTokens ?? 512,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts
        ?.filter((p: { text?: string }) => p.text)
        .map((p: { text?: string }) => p.text)
        .join('\n');

    if (!text) {
        throw new Error('No text in Gemini Search response');
    }

    return text;
}

// Extract JSON from Gemini response (handles markdown code blocks)
export function extractJson<T>(text: string): T {
    const trimmed = text.trim();

    // 1. Direct parse — works when responseMimeType is set
    try {
        return JSON.parse(trimmed);
    } catch (_) { /* continue */ }

    // 2. Try to find JSON in markdown code blocks
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            console.error('Failed to parse JSON from code block', e);
        }
    }

    // 3. Find first '[' or '{' and last matching ']' or '}'
    const firstBracket = trimmed.search(/[\[\{]/);
    if (firstBracket !== -1) {
        const opener = trimmed[firstBracket];
        const closer = opener === '[' ? ']' : '}';
        const lastBracket = trimmed.lastIndexOf(closer);
        if (lastBracket > firstBracket) {
            try {
                return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
            } catch (e) {
                console.error('Failed to parse bracket-matched JSON', e);
            }
        }
    }

    throw new Error(`No valid JSON found in response: ${trimmed.slice(0, 200)}`);
}

// Streaming version for agent endpoint
export async function streamGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    config: GeminiConfig
): Promise<ReadableStream<Uint8Array>> {
    const url = `${GEMINI_API_BASE}/${config.model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: userMessage }]
            }],
            generationConfig: {
                temperature: config.temperature ?? 0.4,
                maxOutputTokens: config.maxOutputTokens ?? 4096,
            }
        })
    });

    if (!response.ok || !response.body) {
        throw new Error(`Gemini stream error: ${response.status}`);
    }

    return response.body;
}
