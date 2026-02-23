// Unit tests for Wondura Agent output quality
// Tests validate that LLM-generated cards meet the ideal user outcome:
// specific, accurate, local-knowledge NZ travel recommendations
import { describe, it, expect } from 'vitest';
import { ExperienceCardSchema } from '../../../src/shared/schema';
import { extractJson } from '../lib/gemini';
import { z } from 'zod';

// ── Schema for validating a full agent response ──
const AgentResponseSchema = z.array(ExperienceCardSchema).length(3);

// ── Mock agent responses for testing ──

// GOOD response: specific, NZ-only, tool-data-driven
const GOOD_RESPONSE = JSON.stringify([
    {
        card_title: "Wine Tasting at Mission Estate Winery",
        hook: "New Zealand's oldest winery sits on a sun-drenched hillside above Napier, pouring wines that have won international acclaim since 1851.",
        context: "Mission Estate was founded by French missionaries and remains a working winery beloved by Hawke's Bay locals. The restaurant terrace is where locals bring visitors for a first taste of the region.",
        practical: "Open daily 9am–5pm. Cellar door tastings $15 for 5 wines. 198 Church Road, Greenmeadows, Napier. Free parking. Restaurant bookings recommended for lunch.",
        insight: "Ask for the Jewelstone range — it's their premium label and often not on the standard tasting menu. The 2022 Syrah is exceptional.",
        consider: "The restaurant gets busy on weekends — book ahead for Saturday lunch. Cellar door is walk-in only."
    },
    {
        card_title: "Sunrise Walk at Te Mata Peak",
        hook: "The 399-metre summit above Havelock North delivers one of the most dramatic panoramas in the North Island — and locals come here to watch the sunrise paint the plains gold.",
        context: "Te Mata Peak is a Hawke's Bay icon. The ridgeline track has been walked by generations of locals and the peak holds cultural significance for local iwi as a sleeping giant.",
        practical: "Free entry, open 24 hours. Te Mata Peak Road, Havelock North. 30-minute walk from the carpark to the summit. Sealed path suitable for most fitness levels.",
        insight: "The sunrise walk is best mid-week when you'll have the summit to yourself. Bring a thermos — the wind chill can surprise you even on warm mornings.",
        consider: "The peak road closes in high winds. Check Hastings District Council website before driving up. No facilities at the summit."
    },
    {
        card_title: "Seafood at Pacifica Restaurant",
        hook: "Chef Jeremy Rameka's modern NZ cuisine has earned Pacifica a place among the country's best restaurants — and it's right on Marine Parade.",
        context: "Pacifica is Napier's fine dining flagship. Rameka brings a Māori perspective to seasonal Hawke's Bay produce, with a menu that changes with what's fresh from local growers and fishers.",
        practical: "Open Wed–Sat, dinner from 5:30pm. Degustation $135pp, à la carte mains $38–$48. 209 Marine Parade, Napier. Bookings essential — often booked out 2 weeks ahead.",
        insight: "Ask about the kai moana tasting menu — it's not always on the website but available on request. The wine pairings feature small-batch Hawke's Bay producers you won't find elsewhere.",
        consider: "Closed Sun–Tue. Not suitable for young children. Smart casual dress code."
    }
]);

// BAD response: non-NZ location
const BAD_RESPONSE_NON_NZ = JSON.stringify([
    {
        card_title: "Sunset at Bondi Beach",
        hook: "Sydney's famous beach at golden hour.",
        context: "A classic Australian experience.",
        practical: "Bondi Beach, Sydney, Australia. Free entry.",
        insight: "Grab fish and chips from the local shop.",
        consider: "Crowded on weekends."
    },
    {
        card_title: "Wine in Marlborough",
        hook: "Sauvignon Blanc country.",
        context: "World-famous wine region.",
        practical: "Cloudy Bay, Blenheim. Open daily.",
        insight: "Try the reserve wines.",
        consider: "Book ahead in summer."
    },
    {
        card_title: "Hiking in Fiji",
        hook: "Tropical trail through rainforest.",
        context: "Fiji's interior is stunning.",
        practical: "Colo-i-Suva Forest Park, Fiji.",
        insight: "Bring insect repellent.",
        consider: "Rainy season Dec–Apr."
    }
]);

// BAD response: vague, no specifics
const BAD_RESPONSE_VAGUE = JSON.stringify([
    {
        card_title: "A Nice Walk",
        hook: "Go for a walk somewhere nice.",
        context: "Walking is good for you.",
        practical: "Various locations available.",
        insight: "Wear comfortable shoes.",
        consider: "Check the weather."
    },
    {
        card_title: "Try Some Food",
        hook: "There are restaurants around.",
        context: "Food is important when travelling.",
        practical: "Many options to choose from.",
        insight: "Ask locals for recommendations.",
        consider: "Prices vary."
    },
    {
        card_title: "Visit a Place",
        hook: "There are interesting places to see.",
        context: "Tourism is popular here.",
        practical: "Check opening hours online.",
        insight: "Go early to avoid crowds.",
        consider: "Some places charge entry."
    }
]);

// BAD response: banned tone words
const BAD_RESPONSE_TONE = JSON.stringify([
    {
        card_title: "Hidden Gem Winery Experience",
        hook: "This unforgettable hidden gem is a bucket list must-see.",
        context: "A world-class destination that's truly must-visit.",
        practical: "Open daily. Check website.",
        insight: "This is a once-in-a-lifetime experience.",
        consider: "Book early for this amazing adventure."
    },
    { card_title: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
    { card_title: "x", hook: "x", context: "x", practical: "x", insight: "x", consider: "x" },
]);

// ── Helpers ──

const BANNED_PHRASES = [
    'hidden gem', 'bucket list', 'unforgettable', 'must-see', 'must-visit',
    'world-class', 'once-in-a-lifetime', 'like no other', 'jaw-dropping',
];

const NON_NZ_LOCATIONS = [
    'australia', 'sydney', 'melbourne', 'bondi', 'fiji', 'bali',
    'thailand', 'tokyo', 'london', 'paris', 'new york',
];

const SPECIFICITY_INDICATORS = [
    /\d{1,2}(?:am|pm|:\d{2})/i,           // time: "9am", "5:30pm"
    /\$\d+/,                                // price: "$15", "$135"
    /\d+\s*(?:minute|hour|km|metre|m)\b/i,  // distance/duration
    /open\s+(?:daily|mon|tue|wed|thu|fri|sat|sun)/i,  // opening hours
    /(?:\d+\s+)?[\w\s]+\s+(?:road|street|avenue|parade|drive|lane)\b/i, // street address
];

function cardContainsBannedPhrases(card: z.infer<typeof ExperienceCardSchema>): string[] {
    const allText = [card.hook, card.context, card.practical, card.insight, card.consider, card.card_title]
        .join(' ')
        .toLowerCase();
    return BANNED_PHRASES.filter(phrase => allText.includes(phrase));
}

function cardContainsNonNZLocations(card: z.infer<typeof ExperienceCardSchema>): string[] {
    const allText = [card.hook, card.context, card.practical, card.insight, card.consider, card.card_title]
        .join(' ')
        .toLowerCase();
    return NON_NZ_LOCATIONS.filter(loc => allText.includes(loc));
}

function cardHasSpecificity(card: z.infer<typeof ExperienceCardSchema>): boolean {
    const practicalText = card.practical;
    return SPECIFICITY_INDICATORS.some(pattern => pattern.test(practicalText));
}

// ══════════════════════════════════════════
//  TESTS
// ══════════════════════════════════════════

describe('Agent Output: Schema Compliance', () => {
    it('should parse a well-formed response into ExperienceCardSchema', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE);
        const result = AgentResponseSchema.safeParse(cards);
        expect(result.success).toBe(true);
    });

    it('should return exactly 3 cards', () => {
        const cards = extractJson<unknown[]>(GOOD_RESPONSE);
        expect(cards).toHaveLength(3);
    });

    it('each card should have all 5 content fields', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(card.card_title).toBeTruthy();
            expect(card.hook).toBeTruthy();
            expect(card.context).toBeTruthy();
            expect(card.practical).toBeTruthy();
            expect(card.insight).toBeTruthy();
            expect(card.consider).toBeTruthy();
        }
    });

    it('should handle JSON wrapped in markdown code blocks', () => {
        const wrapped = '```json\n' + GOOD_RESPONSE + '\n```';
        const cards = extractJson<unknown[]>(wrapped);
        const result = AgentResponseSchema.safeParse(cards);
        expect(result.success).toBe(true);
    });

    it('should throw on completely invalid input', () => {
        expect(() => extractJson('This is not JSON at all')).toThrow();
    });
});

describe('Agent Output: NZ-Only Constraint', () => {
    it('good response should contain no non-NZ locations', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(GOOD_RESPONSE);
        for (const card of cards) {
            const violations = cardContainsNonNZLocations(card);
            expect(violations).toEqual([]);
        }
    });

    it('should detect non-NZ locations in bad response', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(BAD_RESPONSE_NON_NZ);
        const allViolations = cards.flatMap(card => cardContainsNonNZLocations(card));
        expect(allViolations.length).toBeGreaterThan(0);
    });
});

describe('Agent Output: Specificity', () => {
    it('good response practical fields should contain specific details', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(GOOD_RESPONSE);
        for (const card of cards) {
            expect(cardHasSpecificity(card)).toBe(true);
        }
    });

    it('vague response should fail specificity check', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(BAD_RESPONSE_VAGUE);
        const specificCount = cards.filter(card => cardHasSpecificity(card)).length;
        // Vague cards should have few or no specific details
        expect(specificCount).toBeLessThan(cards.length);
    });
});

describe('Agent Output: Tone', () => {
    it('good response should contain no banned phrases', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(GOOD_RESPONSE);
        for (const card of cards) {
            const violations = cardContainsBannedPhrases(card);
            expect(violations).toEqual([]);
        }
    });

    it('should detect banned phrases in bad response', () => {
        const cards = extractJson<z.infer<typeof ExperienceCardSchema>[]>(BAD_RESPONSE_TONE);
        const allViolations = cards.flatMap(card => cardContainsBannedPhrases(card));
        expect(allViolations.length).toBeGreaterThan(0);
    });
});

describe('Agent Output: extractJson robustness', () => {
    it('should parse clean JSON array', () => {
        const result = extractJson<unknown[]>('[{"a": 1}]');
        expect(result).toEqual([{ a: 1 }]);
    });

    it('should parse JSON with leading/trailing whitespace', () => {
        const result = extractJson<unknown[]>('  \n  [{"a": 1}]  \n  ');
        expect(result).toEqual([{ a: 1 }]);
    });

    it('should parse JSON from markdown code block', () => {
        const result = extractJson<unknown[]>('```json\n[{"a": 1}]\n```');
        expect(result).toEqual([{ a: 1 }]);
    });

    it('should parse JSON with surrounding text', () => {
        const result = extractJson<unknown[]>('Here is the response:\n[{"a": 1}]\nDone.');
        expect(result).toEqual([{ a: 1 }]);
    });
});
