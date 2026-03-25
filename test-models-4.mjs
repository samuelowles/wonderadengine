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
                contents: [{ role: 'user', parts: [{ text: 'List 3 burger restaurants near Birkenhead Auckland' }] }],
                tools: [{ googleSearch: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            })
        });
        const elapsed = Date.now() - start;
        console.log(`  Status: ${res.status} in ${elapsed}ms`);
        const json = await res.json();
        if (!res.ok) console.log(`  Error:`, json);
        else console.log(`  Success! Text response snippet: ` + JSON.stringify(json).slice(0, 100));
    } catch (e) {
        console.log(`  Fetch error:`, e);
    }
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-3-flash-preview');
}
run();
