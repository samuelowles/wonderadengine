import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const apiKey = match[1];

const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;

async function test(toolName) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                role: 'user',
                parts: [{ text: "What is the weather in Queenstown NZ right now?" }]
            }],
            tools: [{ [toolName]: {} }]
        })
    });
    console.log(toolName, response.status);
    if (!response.ok) {
        console.log(await response.text());
    } else {
        const data = await response.json();
        console.log("Success with", toolName);
    }
}

async function run() {
    await test('google_search');
    await test('googleSearch');
}
run();
