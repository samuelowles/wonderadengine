import fs from 'fs';
const envFile = fs.readFileSync('.dev.vars', 'utf-8');
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function run() {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await res.json();
    if (!data.models) return console.log(data);
    data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
            console.log(m.name);
        }
    });
}
run();
