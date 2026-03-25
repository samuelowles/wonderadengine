import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function testModel(model) {
    console.log(`\n--- Testing ${model} ---`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'List 3 burger restaurants near Birkenhead Auckland New Zealand' }] }],
                tools: [{ googleSearch: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        
        console.log(`  Status: ${res.status}`);
        if (!res.ok) {
            const err = await res.json();
            console.log(`  Error: ${err.error?.message || JSON.stringify(err)}`);
        } else {
            console.log(`  Success!`);
        }
    } catch (e) {
        console.log(`  Fetch error: ${e.message}`);
    }
}

async function run() {
    await testModel('gemini-3-flash-preview');
}
run();
