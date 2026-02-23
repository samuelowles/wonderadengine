// Post-LLM Verification Gate
// Verifies every venue/location in generated experience cards before sending to client
import { verifyVenueBatch, type VenueVerificationResult } from '../tools/venue';
import { ensureNZ } from './location';

export interface VerifiedCard {
    card_title: string;
    experience_description: string;
    practical_logistics: string;
    venue_name: string | null;
    venue_address: string | null;
    verification_status: 'verified' | 'unverified' | 'failed';
    verification_note: string | null;
}

/**
 * Extract a venue name from a card — uses the explicit field if present,
 * otherwise attempts heuristic extraction from the title/logistics.
 */
function extractVenueName(card: Record<string, unknown>): string | null {
    // Prefer explicit venue_name field
    if (typeof card.venue_name === 'string' && card.venue_name.trim()) {
        return card.venue_name.trim();
    }

    // Heuristic: the card_title often IS the venue name for dining/activity cards
    if (typeof card.card_title === 'string' && card.card_title.trim()) {
        const title = card.card_title.trim();
        // Skip generic titles like "Morning Hike" or "Scenic Drive"
        const genericPatterns = /^(morning|afternoon|evening|day|night|scenic|local|hidden|best|top|great|amazing|ultimate|perfect)/i;
        if (!genericPatterns.test(title)) {
            return title;
        }
    }

    // Try to extract from practical_logistics ("Visit XYZ at 123 Street...")
    if (typeof card.practical_logistics === 'string') {
        const visitMatch = card.practical_logistics.match(/(?:visit|at|book)\s+([A-Z][A-Za-z\s'&-]+?)(?:\s+at|\s+on|\s*[,.])/i);
        if (visitMatch) {
            return visitMatch[1].trim();
        }
    }

    return null;
}

/**
 * Run the verification gate on an array of LLM-generated cards.
 *
 * For each card:
 * - 'verified': venue confirmed real, open, and address populated
 * - 'unverified': couldn't confirm but no negative signals
 * - 'failed': venue confirmed closed or non-existent (EXCLUDED from results)
 */
export async function verifyCards(
    cards: Record<string, unknown>[],
    location: string,
    dates: string,
    apiKey: string
): Promise<VerifiedCard[]> {
    const nzLocation = ensureNZ(location);

    // If no API key, return all cards as unverified
    if (!apiKey || apiKey === 'your_parallel_api_key_here') {
        return cards.map(card => ({
            card_title: String(card.card_title || ''),
            experience_description: String(card.experience_description || ''),
            practical_logistics: String(card.practical_logistics || ''),
            venue_name: extractVenueName(card),
            venue_address: typeof card.venue_address === 'string' ? card.venue_address : null,
            verification_status: 'unverified' as const,
            verification_note: 'Verification unavailable — API key not configured',
        }));
    }

    // Extract venue names from all cards
    const venueEntries = cards.map(card => ({
        card,
        venueName: extractVenueName(card),
    }));

    // Build batch verification request for cards that have a venue name
    const venuesToVerify = venueEntries
        .filter(e => e.venueName !== null)
        .map(e => ({ name: e.venueName!, location: nzLocation }));

    // Run batch verification
    let verificationResults: VenueVerificationResult[] = [];
    if (venuesToVerify.length > 0) {
        try {
            verificationResults = await verifyVenueBatch(venuesToVerify, dates, apiKey);
        } catch (error) {
            console.error('Batch venue verification failed:', error);
        }
    }

    // Build a lookup map: venue name → verification result
    const verificationMap = new Map<string, VenueVerificationResult>();
    for (const result of verificationResults) {
        verificationMap.set(result.venue_name, result);
    }

    // Process each card
    const verifiedCards: VerifiedCard[] = [];

    for (const entry of venueEntries) {
        const { card, venueName } = entry;

        const baseCard = {
            card_title: String(card.card_title || ''),
            experience_description: String(card.experience_description || ''),
            practical_logistics: String(card.practical_logistics || ''),
            venue_name: venueName,
        };

        if (!venueName) {
            // No venue to verify — pass through as unverified
            verifiedCards.push({
                ...baseCard,
                venue_address: typeof card.venue_address === 'string' ? card.venue_address : null,
                verification_status: 'unverified',
                verification_note: 'No specific venue to verify',
            });
            continue;
        }

        const verification = verificationMap.get(venueName);

        if (!verification) {
            // Verification didn't run for this venue
            verifiedCards.push({
                ...baseCard,
                venue_address: typeof card.venue_address === 'string' ? card.venue_address : null,
                verification_status: 'unverified',
                verification_note: 'Venue verification did not complete',
            });
            continue;
        }

        if (!verification.exists || (!verification.is_open && verification.confidence > 0.5)) {
            // Venue is confirmed closed or non-existent — EXCLUDE this card
            console.warn(`Excluding card "${baseCard.card_title}": venue "${venueName}" failed verification`, verification.red_flags);
            continue; // skip — don't add to results
        }

        if (verification.is_open && verification.confidence >= 0.6) {
            // Verified — confirmed real and open
            verifiedCards.push({
                ...baseCard,
                venue_address: verification.verified_address
                    || (typeof card.venue_address === 'string' ? card.venue_address : null),
                verification_status: 'verified',
                verification_note: verification.red_flags.length > 0
                    ? `Note: ${verification.red_flags.join('; ')}`
                    : null,
            });
        } else {
            // Low confidence — include but mark as unverified
            verifiedCards.push({
                ...baseCard,
                venue_address: verification.verified_address
                    || (typeof card.venue_address === 'string' ? card.venue_address : null),
                verification_status: 'unverified',
                verification_note: 'Could not independently verify this venue is currently open',
            });
        }
    }

    return verifiedCards;
}
