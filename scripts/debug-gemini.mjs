// Diagnostic: inspect raw Gemini 3 Flash response structure
const API_KEY = process.argv[2] || process.env.GOOGLE_AI_KEY;
if (!API_KEY) { console.error('Usage: node debug-gemini.mjs <API_KEY>'); process.exit(1); }

const model = 'gemini-3-flash-preview';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'Return ONLY a JSON array.' }] },
        contents: [{ role: 'user', parts: [{ text: 'Return a JSON array with one object: {"name":"test","value":42}' }] }],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
            responseMimeType: 'application/json'
        }
    })
});

console.log('Status:', res.status);
const data = await res.json();

// Print full raw structure
console.log('\n=== FULL RAW RESPONSE ===');
console.log(JSON.stringify(data, null, 2));

// Inspect parts structure
const parts = data.candidates?.[0]?.content?.parts || [];
console.log(`\n=== PARTS (${parts.length}) ===`);
for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    console.log(`Part ${i}:`, JSON.stringify({
        keys: Object.keys(p),
        thought: p.thought,
        hasText: !!p.text,
        textPreview: p.text?.slice(0, 100),
        textLength: p.text?.length,
    }));
}
