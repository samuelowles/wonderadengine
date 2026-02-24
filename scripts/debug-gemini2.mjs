// Diagnostic: test with realistic Wondura prompt + research data
const API_KEY = process.argv[2] || process.env.GOOGLE_AI_KEY;
if (!API_KEY) { console.error('Usage: node debug-gemini2.mjs <API_KEY>'); process.exit(1); }

const model = 'gemini-3-flash-preview';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

const systemPrompt = `You are Wondura, a travel guide. Return ONLY a JSON array of exactly 3 objects with these fields:
[{"card_title":"Title with venue name","venue_name":"Exact venue name","hook":"one sentence","context":"why locals value this","practical":"hours, cost, address","insight":"local tip","consider":"honest caveat"}]`;

const userMessage = `User Request:
- Destination: Beach Haven, New Zealand
- Activities: burgers

### Google Search Research:
1. Real Burger - 180 Mokoia Road, Birkenhead. 4.6/5 (320+ reviews). Smash burgers. 7 min from Beach Haven.
2. The Barking Dog Bar & Eatery - 8 Hinemoa Street, Birkenhead Point. 4.3/5 (580+ reviews). Craft burgers. 5 min drive.
3. Burger Geek - Highbury Mall, Birkenhead. 4.5/5 (200+ reviews). Gourmet burgers. 7 min drive.
4. Swashbucklers Restaurant & Bar - 93 Hinemoa Street, Birkenhead. 4.1/5. Family dining. 5 min drive.`;

const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
        }
    })
});

console.log('Status:', res.status);
const data = await res.json();

const parts = data.candidates?.[0]?.content?.parts || [];
console.log(`\nParts count: ${parts.length}`);

for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    console.log(`\nPart ${i}:`);
    console.log('  Keys:', Object.keys(p));
    console.log('  thought:', p.thought);
    console.log('  thoughtSignature:', p.thoughtSignature ? `(${p.thoughtSignature.length} chars)` : 'none');
    console.log('  text length:', p.text?.length || 0);
    if (p.text) console.log('  text preview:', p.text.slice(0, 200));
}

// Try parsing the text
const textParts = parts.filter(p => p.text);
const fullText = textParts.map(p => p.text).join('');
console.log('\n=== COMBINED TEXT ===');
console.log(fullText.slice(0, 500));

try {
    const parsed = JSON.parse(fullText);
    console.log('\n✅ JSON.parse succeeded:', Array.isArray(parsed) ? `Array of ${parsed.length}` : typeof parsed);
    if (Array.isArray(parsed) && parsed[0]) {
        console.log('First card_title:', parsed[0].card_title);
        console.log('First venue_name:', parsed[0].venue_name);
    }
} catch (e) {
    console.log('\n❌ JSON.parse failed:', e.message);
}
