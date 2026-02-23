// Unit tests for Wondura Agent output quality
// Focus: anti-hallucination, tool-data grounding, search radius expansion
import { describe, it, expect } from 'vitest';
import { ExperienceCardSchema } from '../../../src/shared/schema';
import { extractJson } from '../lib/gemini';
import { z } from 'zod';

// ── Schema for validating a full agent response ──
const AgentResponseSchema = z.array(ExperienceCardSchema).length(3);
type Card = z.infer<typeof ExperienceCardSchema>;

// ══════════════════════════════════════════
//  HELPERS — reusable output validators
// ══════════════════════════════════════════

/** Extract known venue names from structured tool data */
function extractToolDataVenues(toolData: Record<string, any>): string[] {
    const venues: string[] = [];
    if (toolData.dining?.results) {
        for (const r of toolData.dining.results) {
            if (r.title) venues.push(r.title);
        }
    }
    if (toolData.activities?.results) {
        for (const r of toolData.activities.results) {
            if (r.title) venues.push(r.title);
        }
    }
    if (toolData.events?.results) {
        for (const r of toolData.events.results) {
            if (r.title) venues.push(r.title);
        }
    }
    return venues;
}

/** Get the first distinctive word from a venue name (skip articles) */
function getDistinctiveWord(venueName: string): string | null {
    const articles = new Set(['the', 'a', 'an']);
    const words = venueName.split(/\s+/).filter(w => !articles.has(w.toLowerCase()));
    const word = words.find(w => w.length >= 4);
    return word ? word.toLowerCase() : null;
}

/** Check if a card references at least one venue from the tool data whitelist */
function cardReferencesToolDataVenue(card: Card, knownVenues: string[]): boolean {
    const allText = [card.card_title, card.hook, card.context, card.practical, card.insight, card.consider]
        .join(' ').toLowerCase();
    return knownVenues.some(venue => {
        const word = getDistinctiveWord(venue);
        return word !== null && allText.includes(word);
    });
}

/** Check if a card title contains a fabricated venue (not in the known list) */
function titleLikelyFabricated(cardTitle: string, knownVenues: string[]): boolean {
    const titleLower = cardTitle.toLowerCase();
    return !knownVenues.some(venue => {
        const word = getDistinctiveWord(venue);
        return word !== null && titleLower.includes(word);
    });
}

const BANNED_PHRASES = [
    'hidden gem', 'bucket list', 'unforgettable', 'must-see', 'must-visit',
    'world-class', 'once-in-a-lifetime', 'like no other', 'jaw-dropping',
];

const NON_NZ_LOCATIONS = [
    'australia', 'sydney', 'melbourne', 'bondi', 'fiji', 'bali',
    'thailand', 'tokyo', 'london', 'paris', 'new york',
];

const SPECIFICITY_INDICATORS = [
    /\d{1,2}(?:am|pm|:\d{2})/i,           // time
    /\$\d+/,                                // price
    /\d+\s*(?:minute|hour|km|metre|m)\b/i,  // distance/duration
    /open\s+(?:daily|mon|tue|wed|thu|fri|sat|sun)/i,  // opening hours
    /(?:\d+\s+)?[\w\s]+\s+(?:road|street|avenue|parade|drive|lane)\b/i, // address
];

function cardContainsBannedPhrases(card: Card): string[] {
    const allText = [card.hook, card.context, card.practical, card.insight, card.consider, card.card_title]
        .join(' ').toLowerCase();
    return BANNED_PHRASES.filter(phrase => allText.includes(phrase));
}

function cardContainsNonNZLocations(card: Card): string[] {
    const allText = [card.hook, card.context, card.practical, card.insight, card.consider, card.card_title]
        .join(' ').toLowerCase();
    return NON_NZ_LOCATIONS.filter(loc => allText.includes(loc));
}

function cardHasSpecificity(card: Card): boolean {
    return SPECIFICITY_INDICATORS.some(pattern => pattern.test(card.practical));
}

// ══════════════════════════════════════════
//  MOCK DATA — simulating real tool responses
// ══════════════════════════════════════════

// Simulates tool data that would come back for "Beach Haven, burgers"
// Contains REAL nearby venues — this is what the model should draw from
const TOOL_DATA_BEACH_HAVEN = JSON.stringify({
    dining: {
        results: [
            { title: "Birkenhead RSA", content: "Casual dining in Birkenhead, 5 min drive from Beach Haven. Burgers $18-22. Open daily." },
            { title: "The Barking Dog Bar & Eatery", content: "Birkenhead Point. Craft burgers from $20. Open Wed-Sun, 11am-late." },
            { title: "Swashbucklers Restaurant & Bar", content: "Birkenhead. Family-friendly. Burgers, fish & chips. $16-24. Open daily 11am-9pm." },
        ]
    },
    weather: { forecast: "Partly cloudy, 22°C, light wind" },
    venue: { results: [] },
    price: { results: [] },
    activities: { results: [] },
    events: { results: [] },
});

// A GOOD model response that only uses venues from the tool data above
const GOOD_RESPONSE_GROUNDED = JSON.stringify([
    {
        card_title: "Burgers at The Barking Dog",
        hook: "Birkenhead Point's craft burger spot draws locals from across the North Shore for its rotating seasonal menu.",
        context: "Beach Haven itself has limited burger options, but a 5-minute drive to Birkenhead opens up several solid spots. The Barking Dog has been a Birkenhead Point fixture for years.",
        practical: "Open Wed-Sun, 11am-late. Craft burgers from $20. Located at Birkenhead Point, 5 minutes drive from Beach Haven.",
        insight: "Thursday is locals' night — quieter than the weekend and the kitchen is less rushed, so the burgers come out better.",
        consider: "Closed Mon-Tue. Gets busy after 6pm on Fridays — arrive by 5:30 or expect a wait."
    },
    {
        card_title: "Swashbucklers Family Dinner",
        hook: "A no-frills family spot in Birkenhead where the burgers are honest and the portions are generous.",
        context: "Swashbucklers has been serving Birkenhead families for over a decade. It's the kind of place where the staff know the regulars.",
        practical: "Open daily 11am-9pm. Burgers $16-24, fish & chips also available. Birkenhead, 5 min from Beach Haven.",
        insight: "The Kiwi burger with beetroot and egg is the local pick — skip the fancy options.",
        consider: "It's family-oriented, so the atmosphere is casual. Not a date-night spot."
    },
    {
        card_title: "Birkenhead RSA for Classic Burgers",
        hook: "The RSA does a surprisingly good burger at prices that haven't caught up with the rest of Auckland.",
        context: "NZ RSAs are community hubs, and Birkenhead's is no exception. Non-members welcome for dining.",
        practical: "Open daily. Burgers $18-22. Casual dining in Birkenhead, 5 min drive from Beach Haven.",
        insight: "You don't need to be a member to eat here — just sign in at the front desk. The beer prices are the real bonus.",
        consider: "The dining room closes earlier than the bar — check last orders if arriving after 7:30pm."
    }
]);

// A BAD response — fabricates venues not in the tool data
const BAD_RESPONSE_FABRICATED = JSON.stringify([
    {
        card_title: "General Public Burgers & Fries",
        hook: "A neighborhood staple known for generous portions.",
        context: "This venue is a cornerstone of the Beach Haven village.",
        practical: "Located at 3/83 Beach Haven Road. Open for dinner tonight.",
        insight: "The loaded fries here are famously large.",
        consider: "Popular spot for families in the early evening."
    },
    {
        card_title: "Beach Bites Takeaway",
        hook: "A local favorite for classic Kiwi-style burgers.",
        context: "Relatively new to the Beach Haven scene.",
        practical: "Situated in the main Beach Haven shops. Burgers $15-22.",
        insight: "The Bite Burger is the go-to.",
        consider: "Check venue for exact closing times."
    },
    {
        card_title: "Tai Kahi Smash Burgers at Cedar Centre",
        hook: "A genuine community-led dinner featuring gourmet smash burgers.",
        context: "A local community initiative at the Cedar Centre.",
        practical: "Located at 56a Tramway Road, Beach Haven. Serving tonight 5:30-7pm.",
        insight: "This is a community gathering, bring reusable containers.",
        consider: "Service window is very short, ending at 7pm."
    }
]);

// A response that properly expands search radius with transparency
const GOOD_RESPONSE_EXPANDED_RADIUS = JSON.stringify([
    {
        card_title: "Burgers at The Barking Dog",
        hook: "Beach Haven's nearest quality burger spot is a short drive to Birkenhead Point.",
        context: "Beach Haven itself has limited dining options — but that's the reality of Auckland's quieter suburbs. Birkenhead, a 5-minute drive away, has several good options.",
        practical: "The Barking Dog, Birkenhead Point. Open Wed-Sun, 11am-late. Craft burgers from $20.",
        insight: "Locals from Beach Haven, Birkdale, and Chatswood all converge on Birkenhead for dining.",
        consider: "10-minute drive from Beach Haven. Closed Mon-Tue."
    },
    {
        card_title: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x"
    },
    {
        card_title: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x"
    }
]);

// ══════════════════════════════════════════
//  TESTS
// ══════════════════════════════════════════

describe('Schema Compliance', () => {
    it('parses a well-formed response with all 5 content fields', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE_GROUNDED);
        const result = AgentResponseSchema.safeParse(cards);
        expect(result.success).toBe(true);
    });

    it('returns exactly 3 cards', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE_GROUNDED);
        expect(cards).toHaveLength(3);
    });

    it('each card has non-empty values for all 5 fields', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(card.card_title.length).toBeGreaterThan(0);
            expect(card.hook.length).toBeGreaterThan(0);
            expect(card.context.length).toBeGreaterThan(0);
            expect(card.practical.length).toBeGreaterThan(0);
            expect(card.insight.length).toBeGreaterThan(0);
            expect(card.consider.length).toBeGreaterThan(0);
        }
    });
});

describe('Tool Data Grounding (Anti-Hallucination)', () => {
    const toolData = JSON.parse(TOOL_DATA_BEACH_HAVEN);
    const knownVenues = extractToolDataVenues(toolData);

    it('grounded response cards each reference a known tool data venue', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(cardReferencesToolDataVenue(card, knownVenues)).toBe(true);
        }
    });

    it('detects fabricated venue titles not in tool data', () => {
        const cards = extractJson<Card[]>(BAD_RESPONSE_FABRICATED);
        const fabricatedCount = cards.filter(card =>
            titleLikelyFabricated(card.card_title, knownVenues)
        ).length;
        // All 3 fabricated cards should be flagged
        expect(fabricatedCount).toBe(3);
    });

    it('grounded response titles are not flagged as fabricated', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(titleLikelyFabricated(card.card_title, knownVenues)).toBe(false);
        }
    });

    it('extracts correct venue names from tool data', () => {
        expect(knownVenues).toContain('Birkenhead RSA');
        expect(knownVenues).toContain('The Barking Dog Bar & Eatery');
        expect(knownVenues).toContain('Swashbucklers Restaurant & Bar');
        expect(knownVenues).toHaveLength(3);
    });
});

describe('Search Radius Expansion', () => {
    it('expanded-radius response acknowledges the suburb has limited options', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_EXPANDED_RADIUS);
        const allText = cards.map(c =>
            [c.hook, c.context, c.practical, c.insight, c.consider].join(' ')
        ).join(' ').toLowerCase();

        // Should mention limited options, nearby area, or drive time
        const hasExpansionSignal =
            allText.includes('limited') ||
            allText.includes('nearby') ||
            allText.includes('drive') ||
            allText.includes('minute');
        expect(hasExpansionSignal).toBe(true);
    });

    it('expanded-radius response mentions a nearby suburb by name', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_EXPANDED_RADIUS);
        const allText = cards.map(c =>
            [c.card_title, c.hook, c.context, c.practical, c.insight, c.consider].join(' ')
        ).join(' ').toLowerCase();

        const nearbySuburbs = ['birkenhead', 'birkdale', 'northcote', 'glenfield', 'highbury'];
        const mentionsNearby = nearbySuburbs.some(s => allText.includes(s));
        expect(mentionsNearby).toBe(true);
    });
});

describe('NZ-Only Constraint', () => {
    it('grounded response contains no non-NZ locations', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(cardContainsNonNZLocations(card)).toEqual([]);
        }
    });
});

describe('Specificity', () => {
    it('grounded response has specific details in practical field (times, prices, addresses)', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(cardHasSpecificity(card)).toBe(true);
        }
    });

    it('fabricated response still has specific-looking details (hallucination can be specific)', () => {
        // This test documents that specificity alone doesn't catch hallucination —
        // that's why tool-data grounding is the critical check
        const cards = extractJson<Card[]>(BAD_RESPONSE_FABRICATED);
        const hasAnySpecificity = cards.some(card => cardHasSpecificity(card));
        expect(hasAnySpecificity).toBe(true);
    });
});

describe('Tone', () => {
    it('grounded response contains no banned phrases', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE_GROUNDED);
        for (const card of cards) {
            expect(cardContainsBannedPhrases(card)).toEqual([]);
        }
    });
});

describe('extractJson Robustness', () => {
    it('parses clean JSON array', () => {
        expect(extractJson<unknown[]>('[{"a": 1}]')).toEqual([{ a: 1 }]);
    });

    it('parses JSON from markdown code block', () => {
        expect(extractJson<unknown[]>('```json\n[{"a": 1}]\n```')).toEqual([{ a: 1 }]);
    });

    it('parses JSON with surrounding text', () => {
        expect(extractJson<unknown[]>('Here:\n[{"a": 1}]\nDone.')).toEqual([{ a: 1 }]);
    });

    it('throws on completely invalid input', () => {
        expect(() => extractJson('Not JSON')).toThrow();
    });
});

// ── Integration Tests: Live Venue Research via Google Search ──
// These tests call the real Gemini API with Google Search grounding.
// Only run when GOOGLE_AI_KEY env var is set.
const API_KEY = process.env.GOOGLE_AI_KEY || '';

import { researchVenues } from '../lib/research';

describe.skipIf(!API_KEY)('Live Venue Research (Google Search)', () => {
    it('finds real venues near a known NZ location', async () => {
        const result = await researchVenues('Birkenhead, Auckland', 'burgers', API_KEY);
        expect(result.venues.length).toBeGreaterThan(0);
        // At least one venue should have a name
        expect(result.venues[0].name).toBeTruthy();
        console.log('Found venues:', result.venues.map(v => v.name));
    }, 30_000);
});

// ── Unit Tests: Research Module Exports ──
describe('Research module', () => {
    it('exports researchVenues function', () => {
        expect(typeof researchVenues).toBe('function');
    });
});

