// NZ Location Enforcement Utility
// Ensures every location string includes "New Zealand" for geo-scoping

/**
 * Ensures a location string includes "New Zealand".
 * - If already present (case-insensitive), returns unchanged.
 * - If empty/null/undefined, returns "New Zealand".
 * - Otherwise appends ", New Zealand".
 */
export function ensureNZ(location: string | null | undefined): string {
    if (!location || location.trim() === '') {
        return 'New Zealand';
    }

    const trimmed = location.trim();

    // Already contains "New Zealand" (case-insensitive)
    if (/new\s*zealand/i.test(trimmed)) {
        return trimmed;
    }

    return `${trimmed}, New Zealand`;
}
