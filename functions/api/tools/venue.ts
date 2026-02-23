// Venue verification tool - calls Parallel AI for venue viability checks
// Enhanced with address extraction, structured verification, and batch support
import { ensureNZ } from '../lib/location';

export interface VenueVerificationResult {
    venue_name: string;
    exists: boolean;
    is_open: boolean;
    verified_address: string | null;
    operating_hours: string | null;
    red_flags: string[];
    confidence: number;       // 0-1
    source_urls: string[];
}

/**
 * Verify a single venue — checks existence, trading status, address, and hours.
 */
export async function verifyVenue(
    venueName: string,
    location: string,
    dates: string,
    apiKey: string
): Promise<VenueVerificationResult> {
    const nzLocation = ensureNZ(location);

    const objective = [
        `Verify if "${venueName}" in ${nzLocation} is a real, currently operating venue or business.`,
        `1. Confirm the venue exists and is currently trading (not permanently closed).`,
        `2. Find the exact street address of the venue.`,
        `3. Find the opening hours, especially for the dates: ${dates}.`,
        `4. Flag any major red flags (e.g., permanently closed, under renovation, seasonal closure, booking required).`,
        `5. Return the full street address including suburb and city.`,
    ].join(' ');

    try {
        const response = await fetch('https://api.parallel.ai/v1beta/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'parallel-beta': 'search-extract-2025-10-10',
            },
            body: JSON.stringify({
                objective,
                processor: 'pro',
                max_results: 5,
                max_chars_per_result: 5000,
            }),
        });

        if (!response.ok) {
            console.error('Venue API error:', response.status);
            return emptyResult(venueName, ['Unable to verify — API error']);
        }

        const data = await response.json() as { results?: Array<{ text?: string; url?: string }> };
        const results = data.results || [];

        if (results.length === 0) {
            return emptyResult(venueName, ['No results found for this venue']);
        }

        const combinedText = results.map(r => r.text || '').join('\n');
        const lowerText = combinedText.toLowerCase();
        const sourceUrls = results.map(r => r.url).filter(Boolean) as string[];

        // Check for closure signals
        const closedSignals = [
            'permanently closed', 'no longer operating', 'shut down',
            'closed down', 'ceased trading', 'has closed', 'now closed',
            'out of business', 'no longer open',
        ];
        const isClosed = closedSignals.some(signal => lowerText.includes(signal));

        // Extract red flags
        const red_flags: string[] = [];
        if (isClosed) red_flags.push('Venue appears permanently closed');
        if (lowerText.includes('renovation') || lowerText.includes('refurbishment')) red_flags.push('Renovations mentioned');
        if (lowerText.includes('seasonal') || lowerText.includes('winter closure') || lowerText.includes('closed for season')) red_flags.push('Seasonal closure possible');
        if (lowerText.includes('booking required') || lowerText.includes('reservation required') || lowerText.includes('bookings essential')) red_flags.push('Advance booking required');
        if (lowerText.includes('limited capacity') || lowerText.includes('sold out')) red_flags.push('Limited capacity / may sell out');
        if (lowerText.includes('temporarily closed') || lowerText.includes('temporary closure')) red_flags.push('Temporarily closed');

        // Extract address — look for NZ street address patterns
        const verified_address = extractAddress(combinedText);

        // Extract operating hours
        const operating_hours = extractHours(combinedText);

        // Calculate confidence
        let confidence = 0.3; // base: we found something
        if (results.length >= 2) confidence += 0.1;
        if (results.length >= 3) confidence += 0.1;
        if (verified_address) confidence += 0.2;
        if (operating_hours) confidence += 0.1;
        if (!isClosed && red_flags.length === 0) confidence += 0.2;
        confidence = Math.min(confidence, 1.0);

        return {
            venue_name: venueName,
            exists: !isClosed && results.length > 0,
            is_open: !isClosed && !red_flags.some(f =>
                f.includes('permanently closed') || f.includes('Temporarily closed')
            ),
            verified_address,
            operating_hours,
            red_flags,
            confidence,
            source_urls: sourceUrls,
        };
    } catch (error) {
        console.error('Venue verification error:', error);
        return emptyResult(venueName, ['Verification failed — network error']);
    }
}

/**
 * Verify multiple venues in parallel.
 */
export async function verifyVenueBatch(
    venues: Array<{ name: string; location: string }>,
    dates: string,
    apiKey: string
): Promise<VenueVerificationResult[]> {
    if (!apiKey || apiKey === 'your_parallel_api_key_here') {
        return venues.map(v => emptyResult(v.name, ['API key not configured']));
    }

    const promises = venues.map(v =>
        verifyVenue(v.name, v.location, dates, apiKey)
    );

    return Promise.all(promises);
}

/** Extract a street address from text using NZ address patterns */
function extractAddress(text: string): string | null {
    // NZ addresses: "123 Street Name, Suburb, City" or "123 Street Name, City 1234"
    const patterns = [
        // Full address with postcode
        /(\d{1,4}\s+[A-Z][a-zA-Z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Place|Pl|Terrace|Tce|Lane|Ln|Way|Crescent|Cres|Boulevard|Blvd|Quay|Esplanade|Parade|Highway|Hwy)[,\s]+[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?(?:\s+\d{4})?)/,
        // Simpler pattern: number + street name
        /(\d{1,4}\s+[A-Z][a-zA-Z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Place|Pl|Terrace|Tce|Lane|Ln|Way|Crescent|Cres|Boulevard|Blvd|Quay|Esplanade|Parade|Highway|Hwy))/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim().replace(/,\s*$/, '');
        }
    }
    return null;
}

/** Extract operating hours from text */
function extractHours(text: string): string | null {
    const patterns = [
        // "Open 9am-5pm" or "Hours: 9:00am - 5:00pm"
        /(?:open|hours)[:\s]*(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
        // "Monday-Friday 9am-5pm" style
        /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*[-–to]+\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[:\s]*(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
        // "Daily 9am-5pm"
        /daily[:\s]*(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1] || match[0];
        }
    }
    return null;
}

/** Create an empty/failed result */
function emptyResult(venueName: string, red_flags: string[]): VenueVerificationResult {
    return {
        venue_name: venueName,
        exists: false,
        is_open: false,
        verified_address: null,
        operating_hours: null,
        red_flags,
        confidence: 0,
        source_urls: [],
    };
}
