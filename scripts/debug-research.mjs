// Diagnostic: test RESEARCH model (gemini-2.5-flash with google_search)
const API_KEY = process.argv[2] || process.env.GOOGLE_AI_KEY;
if (!API_KEY) { console.error('Usage: node debug-research.mjs <API_KEY>'); process.exit(1); }

const models = ['gemini-2.5-flash', 'gemini-2.5-flash-preview', 'gemini-2.0-flash', 'gemini-3-flash-preview'];

for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    console.log(`\n--- Testing ${model} with google_search ---`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'List 3 burger restaurants near Birkenhead Auckland New Zealand' }] }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            })
        });

        console.log(`  Status: ${res.status}`);
        if (!res.ok) {
            const err = await res.json();
            console.log(`  Error: ${err.error?.message || JSON.stringify(err).slice(0, 200)}`);
        } else {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.filter(p => p.text)?.map(p => p.text)?.join('') || '';
            console.log(`  ✅ Got ${text.length} chars: ${text.slice(0, 100)}...`);
        }
    } catch (e) {
        console.log(`  ❌ Fetch error: ${e.message}`);
    }
}
