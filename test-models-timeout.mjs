import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function testModel(model) {
    console.log(`\nTesting ${model} ...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'List 3 burger restaurants near Birkenhead Auckland. Provide their Google rating and drive time from the centre of Birkenhead.' }] }],
                tools: [{ googleSearch: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
            })
        });
        const elapsed = Date.now() - start;
        console.log(`  Status: ${res.status} in ${elapsed}ms`);
        const json = await res.json();
        if (!res.ok) console.log(`  Error:`, json);
        else console.log(`  Success! Snippet: ` + json.candidates[0].content.parts[0].text.slice(0, 100).replace(/\n/g, ' '));
    } catch (e) {
        console.log(`  Fetch error:`, e.message);
    }
}

async function run() {
    await testModel('gemini-3-flash-preview');
    await testModel('gemini-2.5-flash');
}
run();
