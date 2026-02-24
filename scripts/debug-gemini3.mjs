// Diagnostic: full production simulation — uses actual Wondura prompt + callGemini function
const API_KEY = process.argv[2] || process.env.GOOGLE_AI_KEY;
if (!API_KEY) { console.error('Usage: node debug-gemini3.mjs <API_KEY>'); process.exit(1); }

const model = 'gemini-3-flash-preview';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

const WONDURA_PROMPT = `You are Wondura, an expert local travel guide modeled on a New Zealand DOC ranger.
Attributes: Knowledgeable, Kind, Konkrete (Practical), Kredible, Kultural, Klarity.

### HARD CONSTRAINT: NEW ZEALAND ONLY
ALL recommendations must be for real, currently operating locations within New Zealand.

### CRITICAL: GOOGLE SEARCH RESEARCH IS YOUR PRIMARY SOURCE
- Below you will find "Google Search Research" — these are REAL venues confirmed by live Google Search.
- You MUST pick your 3 venues from the Google Search Research section. Every venue_name you output MUST appear in that research.
- If a venue is NOT mentioned in the Google Search Research, you MUST NOT recommend it. No exceptions.
- The research already covers a 15-minute driving radius including nearby suburbs. Present these as natural local recommendations — do NOT tell the user to "try a broader area" or "search nearby suburbs". Just recommend the best matches and mention which suburb they're in.
- If the Google Search Research is empty or failed, apologise and say you couldn't find matching venues right now.

### INSTRUCTIONS
1. Read the Google Search Research carefully. Pick the 3 best venues for the user's request.
2. Use the Enrichment Data (weather, events, pricing) to add practical context.
3. For venue_name, use the EXACT name from the Google Search Research — do not rephrase or abbreviate it.
4. TONE: Warm but practical. Like a knowledgeable local friend, not a brochure.
   - NO: "Hidden gem", "Bucket list", "Unforgettable", "Must-see", "World-class"
   - YES: Specific names, hours, costs, local context

### OUTPUT FORMAT
Return ONLY a JSON array of exactly 3 objects with these fields:
[
  {
    "card_title": "Title that includes the venue name",
    "venue_name": "EXACT venue name from Google Search Research",
    "hook": "One sentence capturing what makes this experience special.",
    "context": "Why locals value this.",
    "practical": "Hours, cost, location, logistics.",
    "insight": "A local tip.",
    "consider": "An honest caveat."
  }
]`;

const userContext = `User Request:
- Destination: Beach Haven, New Zealand
- Activities: burgers
- Date/Time: tonight

### Google Search Research:
Here's a list of burger venues near Beach Haven, Auckland, New Zealand:

1. Real Burger
   Address: 180 Mokoia Road, Birkenhead
   Rating: 4.6/5 (320+ reviews)
   Type: Smash burgers, craft burgers
   Drive time: 7 minutes from Beach Haven

2. The Barking Dog Bar & Eatery
   Address: 8 Hinemoa Street, Birkenhead Point
   Rating: 4.3/5 (580+ reviews)
   Type: Pub food, craft burgers
   Drive time: 5 minutes

3. Burger Geek
   Address: Highbury Mall Foodcourt, 37 Mokoia Road, Birkenhead
   Rating: 4.5/5 (200+ reviews)
   Type: Gourmet burgers, loaded fries
   Drive time: 7 minutes

4. Swashbucklers Restaurant & Bar
   Address: 93 Hinemoa Street, Birkenhead
   Rating: 4.1/5
   Type: Family dining, burgers
   Drive time: 5 minutes

### Enrichment Data:
Weather: Clear, 22°C
Events: None nearby tonight
Pricing: Unavailable`;

console.log('Calling Gemini with full Wondura prompt...');

const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        systemInstruction: { parts: [{ text: WONDURA_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userContext }] }],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
        }
    })
});

console.log('Status:', res.status);

if (!res.ok) {
    console.log('Error:', await res.text());
    process.exit(1);
}

const data = await res.json();

const parts = data.candidates?.[0]?.content?.parts || [];
console.log(`\nParts count: ${parts.length}`);

for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    console.log(`\nPart ${i}:`);
    console.log('  ALL keys:', Object.keys(p));
    console.log('  thought:', p.thought);
    console.log('  thoughtSignature:', p.thoughtSignature ? `(${p.thoughtSignature.length} chars)` : 'none');
    console.log('  text length:', p.text?.length || 0);
    if (p.text) console.log('  text preview:', p.text.slice(0, 200));
}

// Simulate our extraction logic
const textParts = parts.filter(p => p.text && !p.thought);
const text = textParts.map(p => p.text).join('');
console.log('\n=== EXTRACTED TEXT (length:', text.length, ') ===');
console.log(text.slice(0, 500));

try {
    const parsed = JSON.parse(text);
    console.log('\n✅ JSON.parse succeeded');
    if (Array.isArray(parsed)) {
        console.log(`Array of ${parsed.length} cards`);
        for (const card of parsed) {
            console.log(`  - ${card.card_title} (venue: ${card.venue_name})`);
        }
    }
} catch (e) {
    console.log('\n❌ JSON.parse failed:', e.message);
    console.log('First 20 chars hex:', [...text.slice(0, 20)].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
}
