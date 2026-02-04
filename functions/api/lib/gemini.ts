// Gemini API helper for Cloudflare Functions
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';



interface GeminiConfig {
    model: 'gemini-2.5-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
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
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
    }

    // Try to parse entire response as JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error('No valid JSON found in response');
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
