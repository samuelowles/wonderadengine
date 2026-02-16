// Gemini API helper for Cloudflare Functions
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';



interface GeminiConfig {
    model: 'gemini-2.0-flash' | 'gemini-3-flash-preview' | 'gemini-2.5-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
    temperature?: number;
    maxOutputTokens?: number;
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
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error (${response.status}):`, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('No text in Gemini response');
    }

    return text;
}

// Extract JSON from Gemini response (handles markdown code blocks)
export function extractJson<T>(text: string): T {
    const trimmed = text.trim();

    // Try to find JSON in code blocks first
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            console.error('Failed to parse JSON from code block', e);
        }
    }

    // Try to find the first '{' or '[' and match to the last '}' or ']'
    const jsonMatch = trimmed.match(/([\[\{][\s\S]*[\]\}])/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error('Failed to parse regex-matched JSON', e);
        }
    }

    // Last resort: try to parse the entire trimmed text
    try {
        return JSON.parse(trimmed);
    } catch (e) {
        throw new Error('No valid JSON found in response');
    }
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
