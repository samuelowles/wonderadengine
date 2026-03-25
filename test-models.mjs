import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function run() {
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-preview', 'gemini-2.0-flash', 'gemini-3-flash-preview'];

    for (const model of models) {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + API_KEY;
        console.log('\n--- Testing', model, 'with google_search ---');

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

            console.log('  Status:', res.status);
            if (!res.ok) {
                const err = await res.json();
                console.log('  Error:', err.error?.message || JSON.stringify(err));
            } else {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.filter(p => p.text)?.map(p => p.text)?.join('') || '';
                console.log('  Got ', text.length, ' chars: ', text.slice(0, 100).replace(/\n/g, ' '));
            }
        } catch (e) {
            console.log('  Fetch error:', e.message);
        }
    }
}
run();
