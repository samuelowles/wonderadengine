import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/PARALLEL_API_KEY=([^\r\n]+)/);
const apiKey = match[1];

async function run() {
    console.log("Starting...");
    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: 'What is the weather in Queenstown NZ',
            processor: 'pro',
            max_results: 1,
            max_chars_per_result: 1000,
        }),
    });
    console.log(response.status);
    const data = await response.json();
    console.log(Object.keys(data));
    console.log(JSON.stringify(data, null, 2));
}
run();
