import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function testModel(model) {
    console.log(`\n--- Testing ${model} ---`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'List 3 burger restaurants near Birkenhead Auckland New Zealand' }] }],
                tools: [{ googleSearch: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            })
        });
        console.log(`  Status: ${res.status}`);
        const textResponse = await res.text();
        console.log(`  Response length: ${textResponse.length}`);
        if (!res.ok) {
            console.log(`  Error: ${textResponse.slice(0, 200)}`);
        } else {
            console.log(`  Success! Extracting response payload: ` + textResponse.slice(0, 100));
        }
    } catch (e) {
        console.log(`  Fetch error: ${e.message}`);
    }
}

async function run() {
    await testModel('gemini-1.5-flash-latest');
    await testModel('gemini-2.5-flash');
}
run();
