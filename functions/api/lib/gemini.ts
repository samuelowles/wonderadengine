// Gemini API helper for Cloudflare Functions

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';



interface GeminiConfig {
    model: 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-3-flash-preview' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
}

export interface GeminiResponse {
    text: string;
    usage?: { prompt: number; completion: number; total: number };
}

export async function callGemini(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    config: GeminiConfig
): Promise<GeminiResponse> {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await response.json() as any;

    // Log full response structure for debugging
    const candidate = data.candidates?.[0];
    if (!candidate) {
        console.error('[GEMINI] No candidates in response:', JSON.stringify(data).slice(0, 500));
        throw new Error('No candidates in Gemini response — possible content filter or quota error');
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.error(`[GEMINI] Unexpected finishReason: ${candidate.finishReason}`);
    }

    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
        console.error('[GEMINI] No parts in candidate:', JSON.stringify(candidate).slice(0, 500));
        throw new Error('No parts in Gemini response');
    }

    // Log part structure for debugging
    console.log(`[GEMINI] Response has ${parts.length} part(s), keys: ${parts.map((p: any) => Object.keys(p).join(',')).join(' | ')}`);

    // Extract text from all parts that have a text field
    // (thoughtSignature is just metadata, not a separate part type)
    const text = parts
        .filter((p: any) => typeof p.text === 'string')
        .map((p: any) => p.text)
        .join('');

    if (!text) {
        console.error('[GEMINI] No text in any parts. Parts:', JSON.stringify(parts).slice(0, 500));
        throw new Error('No text in Gemini response');
    }

    console.log(`[GEMINI] Extracted ${text.length} chars of text`);
    
    const usage = data.usageMetadata ? {
        prompt: data.usageMetadata.promptTokenCount || 0,
        completion: data.usageMetadata.candidatesTokenCount || 0,
        total: data.usageMetadata.totalTokenCount || 0
    } : undefined;

    return { text, usage };
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
): Promise<GeminiResponse> {
    const model = 'gemini-2.5-flash';
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s abort

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }],
                tools: [{ googleSearch: {} }],
                generationConfig: {
                    temperature: config?.temperature ?? 0.1,
                    maxOutputTokens: config?.maxOutputTokens ?? 4096,
                }
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
    } catch (e) {
        clearTimeout(timeout);
        throw new Error(`Fetch failed or timed out: ${e}`);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Search API error: ${response.status} - ${errorText}`);
    }

    const json = await response.json() as any;
    const text = json.candidates?.[0]?.content?.parts
        ?.filter((p: { text?: string }) => p.text)
        .map((p: { text?: string }) => p.text)
        .join('\n');

    if (!text) {
        throw new Error('No text in Gemini Search response');
    }

    const usage = json.usageMetadata ? {
        prompt: json.usageMetadata.promptTokenCount || 0,
        completion: json.usageMetadata.candidatesTokenCount || 0,
        total: json.usageMetadata.totalTokenCount || 0
    } : undefined;

    return { text, usage };
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
