// Unit tests for Wondura Agent output quality
// Focus: anti-hallucination, Google Search grounding, card_title contains venue_name
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

/** Get the first distinctive word from a venue name (skip articles) */
function getDistinctiveWord(venueName: string): string | null {
    const articles = new Set(['the', 'a', 'an']);
    const words = venueName.split(/\s+/).filter(w => !articles.has(w.toLowerCase()));
    const word = words.find(w => w.length >= 4);
    return word ? word.toLowerCase() : null;
}

/** Check if card_title contains the venue_name (or a distinctive word from it) */
function cardTitleContainsVenueName(card: Card): boolean {
    if (!card.venue_name) return false;
    const titleLower = card.card_title.toLowerCase();
    const venueLower = card.venue_name.toLowerCase();

    // Direct substring match
    if (titleLower.includes(venueLower)) return true;

    // Check for distinctive words from venue name in title
    const articles = new Set(['the', 'a', 'an', 'and', '&', 'bar', 'restaurant', 'cafe', 'eatery']);
    const venueWords = venueLower.split(/[\s&]+/).filter(w => !articles.has(w) && w.length >= 3);
    return venueWords.some(word => titleLower.includes(word));
}

/** Check if a card references a venue from the research text */
function cardVenueInResearch(card: Card, researchText: string): boolean {
    if (!card.venue_name) return false;
    const researchLower = researchText.toLowerCase();
    const venueLower = card.venue_name.toLowerCase();

    // Direct full-name match (best)
    if (researchLower.includes(venueLower)) return true;

    // Multi-word match: require at least 2 distinctive words to match
    const skipWords = new Set(['the', 'a', 'an', 'and', '&', 'bar', 'restaurant', 'cafe', 'eatery',
        'grill', 'kitchen', 'beach', 'north', 'south', 'east', 'west', 'new', 'old', 'big', 'little',
        'at', 'in', 'on', 'of', 'for', 'to', 'burgers', 'burger', 'smash', 'fries', 'takeaway',
        'food', 'dining', 'point', 'road', 'street', 'avenue', 'drive', 'centre', 'center']);
    const venueWords = venueLower.split(/[\s&]+/).filter(w => !skipWords.has(w) && w.length >= 4);
    const matchingWords = venueWords.filter(w => researchLower.includes(w));
    return matchingWords.length >= 2;
}

const BANNED_PHRASES = [
    'hidden gem', 'bucket list', 'unforgettable', 'must-see', 'must-visit',
    'world-class', 'once-in-a-lifetime', 'like no other', 'jaw-dropping',
];

const NON_NZ_LOCATIONS = [
    'australia', 'sydney', 'melbourne', 'bondi', 'fiji', 'bali',
    'thailand', 'tokyo', 'london', 'paris', 'new york',
];

// Phrases the model should NOT say — user should never be told to broaden search
const UNACCEPTABLE_REDIRECT_PHRASES = [
    'try a broader area', 'broaden your search', 'search nearby suburbs',
    'try searching for', 'expand your search', 'try a different area',
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

function cardContainsRedirectPhrases(card: Card): string[] {
    const allText = [card.hook, card.context, card.practical, card.insight, card.consider, card.card_title]
        .join(' ').toLowerCase();
    return UNACCEPTABLE_REDIRECT_PHRASES.filter(phrase => allText.includes(phrase));
}

function cardHasSpecificity(card: Card): boolean {
    return SPECIFICITY_INDICATORS.some(pattern => pattern.test(card.practical));
}

// ══════════════════════════════════════════
//  MOCK DATA — Google Search research text + expected card output
// ══════════════════════════════════════════

// Simulates what Gemini + Google Search would return for "burgers near Beach Haven Auckland"
const MOCK_RESEARCH_TEXT = `Here are real burger venues within a 15-minute drive of Beach Haven, Auckland:

1. **Real Burger** - 180 Mokoia Road, Birkenhead, Auckland 0626
   - Type: Restaurant (burgers)
   - Google Rating: 4.6/5 (320+ reviews)
   - Known for their smash burgers and loaded fries. Popular with North Shore locals.
   - About 7 minutes drive from Beach Haven.

2. **The Barking Dog Bar & Eatery** - 8 Hinemoa Street, Birkenhead Point, Auckland
   - Type: Bar & Eatery
   - Google Rating: 4.3/5 (580+ reviews)
   - Craft burgers, good beer selection. Live music some nights.
   - About 5 minutes drive from Beach Haven.

3. **Swashbucklers Restaurant & Bar** - 93 Hinemoa Street, Birkenhead, Auckland
   - Type: Restaurant & Bar
   - Google Rating: 4.1/5 (210+ reviews)
   - Family-friendly, fish & chips and burgers. Open daily 11am-9pm.
   - About 5 minutes drive from Beach Haven.

4. **Birkenhead RSA** - 42 Birkenhead Avenue, Birkenhead, Auckland
   - Type: RSA Club / Casual Dining
   - Google Rating: 4.0/5 (150+ reviews)
   - Affordable meals including burgers $18-22. Non-members welcome.
   - About 5 minutes drive from Beach Haven.`;

// A GOOD response — uses venue names from research, includes venue_name in card_title
const GOOD_RESPONSE = JSON.stringify([
    {
        card_title: "Smash Burgers at Real Burger, Birkenhead",
        venue_name: "Real Burger",
        hook: "Birkenhead's go-to for smash burgers that have earned a loyal North Shore following.",
        context: "Real Burger has built its reputation on doing one thing well — smash-style burgers with quality NZ beef. The Mokoia Road spot draws locals from Beach Haven, Birkdale, and beyond.",
        practical: "180 Mokoia Road, Birkenhead. 4.6/5 on Google (320+ reviews). About 7 minutes drive from Beach Haven.",
        insight: "Go for the double smash with cheese — the single is good but the double hits the sweet spot. The loaded fries are shareable.",
        consider: "Can get busy at dinner, especially Fridays. Worth the short drive from Beach Haven."
    },
    {
        card_title: "The Barking Dog — Craft Burgers & Beers in Birkenhead Point",
        venue_name: "The Barking Dog Bar & Eatery",
        hook: "A solid craft burger paired with local beers at this Birkenhead Point neighbourhood pub.",
        context: "The Barking Dog is a Birkenhead Point institution — part neighbourhood pub, part eatery. It's where locals go when they want a proper burger and a pint.",
        practical: "8 Hinemoa Street, Birkenhead Point. 4.3/5 on Google (580+ reviews). Open Wed-Sun. About 5 minutes from Beach Haven.",
        insight: "Thursday is quieter for dining — weekends the bar side gets lively with live music.",
        consider: "Closed Mon-Tue. The bar atmosphere won't suit everyone for a quiet dinner."
    },
    {
        card_title: "Family Burgers at Swashbucklers, Birkenhead",
        venue_name: "Swashbucklers Restaurant & Bar",
        hook: "No-frills family dining where the burgers are honest and the portions generous.",
        context: "Swashbucklers has been a Birkenhead family staple for years — the kind of place where regulars bring their kids and grandkids.",
        practical: "93 Hinemoa Street, Birkenhead. 4.1/5 on Google. Open daily 11am-9pm. Burgers from $16. 5 min drive from Beach Haven.",
        insight: "The Kiwi burger with beetroot and egg is the local favourite — skip the fancy options here.",
        consider: "It's family-oriented, so don't expect a date-night atmosphere. But the value is hard to beat."
    }
]);

// A BAD response — fabricates venues not in the research text
const BAD_RESPONSE_FABRICATED = JSON.stringify([
    {
        card_title: "General Public Burgers & Fries",
        venue_name: "General Public Burgers & Fries",
        hook: "A neighborhood staple known for generous portions.",
        context: "This venue is a cornerstone of the Beach Haven village.",
        practical: "Located at 3/83 Beach Haven Road. Open for dinner tonight.",
        insight: "The loaded fries here are famously large.",
        consider: "Popular spot for families in the early evening."
    },
    {
        card_title: "Beach Bites Takeaway",
        venue_name: "Beach Bites Takeaway",
        hook: "A local favorite for classic Kiwi-style burgers.",
        context: "Relatively new to the Beach Haven scene.",
        practical: "Situated in the main Beach Haven shops. Burgers $15-22.",
        insight: "The Bite Burger is the go-to.",
        consider: "Check venue for exact closing times."
    },
    {
        card_title: "Harbour View Dining at Cedar Centre",
        venue_name: "Harbour View Dining",
        hook: "A genuine community-led dinner featuring gourmet cuisine.",
        context: "A local community initiative at the Cedar Centre.",
        practical: "Located at 56a Tramway Road, Beach Haven. Serving tonight 5:30-7pm.",
        insight: "This is a community gathering, bring reusable containers.",
        consider: "Service window is very short, ending at 7pm."
    }
]);

// A BAD response — card_title doesn't contain venue name
const BAD_RESPONSE_MISSING_VENUE_IN_TITLE = JSON.stringify([
    {
        card_title: "North Shore's Best Kept Secret",
        venue_name: "Real Burger",
        hook: "A burger spot worth the drive.",
        context: "Local favourite.", practical: "Birkenhead.", insight: "Good burgers.", consider: "Can be busy."
    },
    {
        card_title: "Pub Grub Done Right",
        venue_name: "The Barking Dog Bar & Eatery",
        hook: "Great pub food.", context: "Local pub.", practical: "Birkenhead Point.", insight: "Try the burger.", consider: "Closed Mondays."
    },
    {
        card_title: "Family-Friendly Dining Experience",
        venue_name: "Swashbucklers Restaurant & Bar",
        hook: "Great for families.", context: "Local favourite.", practical: "Birkenhead.", insight: "Kiwi burger.", consider: "Casual."
    }
]);

// A BAD response — tells user to broaden search instead of automatically doing it
const BAD_RESPONSE_REDIRECT = JSON.stringify([
    {
        card_title: "Real Burger in Birkenhead",
        venue_name: "Real Burger",
        hook: "Try a broader area or search nearby suburbs for more options.",
        context: "Beach Haven has limited options, but you could expand your search to find more.",
        practical: "Birkenhead has a few options.", insight: "N/A", consider: "Try searching for burgers in a wider area."
    },
    { card_title: "x", venue_name: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
    { card_title: "x", venue_name: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" }
]);


// ══════════════════════════════════════════
//  TESTS
// ══════════════════════════════════════════

describe('Schema Compliance', () => {
    it('parses a well-formed response with all required fields', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE);
        const result = AgentResponseSchema.safeParse(cards);
        expect(result.success).toBe(true);
    });

    it('returns exactly 3 cards', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE);
        expect(cards).toHaveLength(3);
    });

    it('each card has non-empty values for all fields', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(card.card_title.length).toBeGreaterThan(0);
            expect(card.venue_name?.length).toBeGreaterThan(0);
            expect(card.hook.length).toBeGreaterThan(0);
            expect(card.context.length).toBeGreaterThan(0);
            expect(card.practical.length).toBeGreaterThan(0);
            expect(card.insight.length).toBeGreaterThan(0);
            expect(card.consider.length).toBeGreaterThan(0);
        }
    });
});

describe('Card Title Contains Venue Name', () => {
    it('good response: every card_title contains the venue_name', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardTitleContainsVenueName(card)).toBe(true);
        }
    });

    it('bad response: card_titles without venue names are detected', () => {
        const cards = extractJson<Card[]>(BAD_RESPONSE_MISSING_VENUE_IN_TITLE);
        const missingCount = cards.filter(c => !cardTitleContainsVenueName(c)).length;
        expect(missingCount).toBe(3); // All 3 titles are missing venue names
    });

    it('venue name extraction handles partial matches (e.g. "Real Burger" in "Smash Burgers at Real Burger")', () => {
        const card: Card = {
            card_title: "Smash Burgers at Real Burger, Birkenhead",
            venue_name: "Real Burger",
            hook: "", context: "", practical: "", insight: "", consider: ""
        };
        expect(cardTitleContainsVenueName(card)).toBe(true);
    });

    it('venue name extraction handles multi-word venue names', () => {
        const card: Card = {
            card_title: "The Barking Dog — Best Pub Grub",
            venue_name: "The Barking Dog Bar & Eatery",
            hook: "", context: "", practical: "", insight: "", consider: ""
        };
        expect(cardTitleContainsVenueName(card)).toBe(true);
    });
});

describe('Google Search Research Grounding (Anti-Hallucination)', () => {
    it('good response: all venue_names appear in the research text', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardVenueInResearch(card, MOCK_RESEARCH_TEXT)).toBe(true);
        }
    });

    it('fabricated response: venue_names do NOT appear in research text', () => {
        const cards = extractJson<Card[]>(BAD_RESPONSE_FABRICATED);
        const fabricatedCount = cards.filter(c => !cardVenueInResearch(c, MOCK_RESEARCH_TEXT)).length;
        expect(fabricatedCount).toBe(3); // All 3 are fabricated
    });

    it('detects when a single fabricated venue is mixed with real ones', () => {
        const mixedResponse = JSON.stringify([
            { card_title: "Real Burger Smash", venue_name: "Real Burger", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
            { card_title: "Fake Place Downtown", venue_name: "Burger Palace Deluxe", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
            { card_title: "Barking Dog Pub Grub", venue_name: "The Barking Dog Bar & Eatery", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
        ]);
        const cards = extractJson<Card[]>(mixedResponse);
        const grounded = cards.filter(c => cardVenueInResearch(c, MOCK_RESEARCH_TEXT));
        const fabricated = cards.filter(c => !cardVenueInResearch(c, MOCK_RESEARCH_TEXT));
        expect(grounded).toHaveLength(2);
        expect(fabricated).toHaveLength(1);
        expect(fabricated[0].venue_name).toBe('Burger Palace Deluxe');
    });
});

describe('No Redirect Phrases (Auto-Broaden)', () => {
    it('good response: does not tell user to broaden search', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardContainsRedirectPhrases(card)).toEqual([]);
        }
    });

    it('bad response: detects redirect phrases', () => {
        const cards = extractJson<Card[]>(BAD_RESPONSE_REDIRECT);
        const allPhrases = cards.flatMap(c => cardContainsRedirectPhrases(c));
        expect(allPhrases.length).toBeGreaterThan(0);
    });
});

describe('Search Radius Expansion', () => {
    it('good response mentions nearby suburb by name (not telling user to go there manually)', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        const allText = cards.map(c =>
            [c.card_title, c.hook, c.context, c.practical, c.insight, c.consider].join(' ')
        ).join(' ').toLowerCase();

        const nearbySuburbs = ['birkenhead', 'birkdale', 'northcote', 'glenfield', 'highbury'];
        const mentionsNearby = nearbySuburbs.some(s => allText.includes(s));
        expect(mentionsNearby).toBe(true);
    });

    it('good response mentions drive time from requested location', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        const allText = cards.map(c =>
            [c.practical, c.consider].join(' ')
        ).join(' ').toLowerCase();

        const hasDriveReference = allText.includes('minute') || allText.includes('drive');
        expect(hasDriveReference).toBe(true);
    });
});

describe('NZ-Only Constraint', () => {
    it('good response contains no non-NZ locations', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardContainsNonNZLocations(card)).toEqual([]);
        }
    });
});

describe('Specificity', () => {
    it('good response has specific details in practical field (times, prices, addresses)', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardHasSpecificity(card)).toBe(true);
        }
    });

    it('fabricated response can also have specific-looking details (specificity alone does not catch hallucination)', () => {
        const cards = extractJson<Card[]>(BAD_RESPONSE_FABRICATED);
        const hasAnySpecificity = cards.some(card => cardHasSpecificity(card));
        expect(hasAnySpecificity).toBe(true);
    });
});

describe('Tone', () => {
    it('good response contains no banned phrases', () => {
        const cards = extractJson<Card[]>(GOOD_RESPONSE);
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

// ── Research Module Tests ──
import { researchVenues } from '../lib/research';

describe('Research Module', () => {
    it('exports researchVenues function', () => {
        expect(typeof researchVenues).toBe('function');
    });

    it('returns { research_text, success } shape', async () => {
        // Without a real API key, the function should fail gracefully
        const result = await researchVenues('Auckland', 'burgers', 'invalid-key');
        expect(result).toHaveProperty('research_text');
        expect(result).toHaveProperty('success');
        expect(typeof result.research_text).toBe('string');
        expect(typeof result.success).toBe('boolean');
    });
});

// ── Integration Tests (only with real API key) ──
const API_KEY = process.env.GOOGLE_AI_KEY || '';

describe.skipIf(!API_KEY)('Live Venue Research (Google Search)', () => {
    it('finds real venues near a known NZ location', async () => {
        const result = await researchVenues('Birkenhead, Auckland', 'burgers', API_KEY);
        expect(result.success).toBe(true);
        expect(result.research_text.length).toBeGreaterThan(100);
        // Should mention at least one known venue
        const textLower = result.research_text.toLowerCase();
        const knownVenues = ['real burger', 'barking dog', 'swashbucklers', 'birkenhead'];
        const mentionsKnown = knownVenues.some(v => textLower.includes(v));
        expect(mentionsKnown).toBe(true);
        console.log('Research text preview:', result.research_text.slice(0, 300));
    }, 30_000);
});
