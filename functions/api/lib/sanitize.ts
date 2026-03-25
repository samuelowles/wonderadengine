export function sanitizeParallelResponse(data: any): any {
    if (!data) return data;
    
    // Some endpoints may return an array directly, or an object with a 'results' array
    const results = Array.isArray(data) ? data : (data.results || data.events || []);

    if (!Array.isArray(results) || results.length === 0) {
        return data; // Return as-is if we can't parse it
    }

    // Keep only the top 3 results and extract only the useful bits
    return results.slice(0, 3).map((r: any) => ({
        url: r.url,
        title: r.title,
        excerpts: r.excerpts || r.snippet || r.description || null
    }));
}
