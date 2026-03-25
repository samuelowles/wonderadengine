import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function testSyntax(toolName) {
    console.log(`\nTesting ${toolName} ...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    // Use an abort controller to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const start = Date.now();
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'What is the current temperature in Auckland right now?' }] }],
                tools: [{ [toolName]: {} }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const elapsed = Date.now() - start;
        console.log(`  Status: ${res.status} in ${elapsed}ms`);
        const json = await res.json();
        if (!res.ok) console.log(`  Error:`, json);
        else {
            const hasGrounding = !!json.candidates[0]?.groundingMetadata;
            console.log(`  Success! Has groundingMetadata: ${hasGrounding}`);
            if (hasGrounding) {
                console.log(`  Chunks:`, json.candidates[0].groundingMetadata.groundingChunks?.length || 0);
            }
        }
    } catch (e) {
        clearTimeout(timeoutId);
        console.log(`  Fetch error:`, e.message);
    }
}

async function run() {
    await testSyntax('google_search');
    await testSyntax('googleSearch');
}
run();
