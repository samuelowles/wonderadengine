// Price verification tool - calls Parallel AI for live pricing data
// Aligned with N8N "Price Verification Tool" definition
export async function verifyPrice(
    productName: string,
    expectedPrice: string,
    url: string | null,
    apiKey: string,
    dates?: string
) {
    const objectiveParts = [
        `Find and verify current pricing for "${productName}".`,
    ];
    if (url) {
        objectiveParts.push(`Check the specific URL: ${url}.`);
    }
    if (expectedPrice && expectedPrice !== 'N/A') {
        objectiveParts.push(`Expected price is around ${expectedPrice}. Confirm or flag discrepancies.`);
    }
    if (dates) {
        objectiveParts.push(`For travel dates: ${dates}.`);
    }
    objectiveParts.push(
        `Ignore ads and focus on the primary listed price or current offer price.`,
        `Return the exact price found, currency, and source URL.`
    );

    const response = await fetch('https://api.parallel.ai/v1beta/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'parallel-beta': 'search-extract-2025-10-10',
        },
        body: JSON.stringify({
            objective: objectiveParts.join(' '),
            processor: 'pro',
            max_results: 5,
            max_chars_per_result: 10000,
        }),
    });

    if (!response.ok) {
        console.error('Price API error:', response.status);
        return { verified: false, found_price: null, confidence: 0, error: 'Price verification unavailable' };
    }

    const data = await response.json() as { results?: Array<{ text?: string; url?: string }> };
    const results = data.results || [];

    if (results.length === 0) {
        return { verified: false, found_price: null, confidence: 0, source_url: null };
    }

    // Extract pricing information from search results
    const combinedText = results.map(r => r.text || '').join('\n');
    const sourceUrl = results[0]?.url || null;

    // Look for price patterns (NZD/AUD/$)
    const priceMatch = combinedText.match(/\$\s*[\d,]+(?:\.\d{2})?/);
    const foundPrice = priceMatch ? priceMatch[0] : null;

    // Determine confidence based on result quality
    let confidence = 0.5;
    if (foundPrice) confidence = 0.8;
    if (foundPrice && results.length >= 2) confidence = 0.9;

    // Check if found price matches expected
    const verified = foundPrice !== null && expectedPrice !== 'N/A'
        ? foundPrice.replace(/[$,\s]/g, '') === expectedPrice.replace(/[$,\s]/g, '')
        : foundPrice !== null;

    return { verified, found_price: foundPrice, confidence, source_url: sourceUrl, raw_results: results.length };
}
