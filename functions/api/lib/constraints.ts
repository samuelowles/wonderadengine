export function getDriveTimeConstraint(activityCategory: string | undefined): { minutes: string, description: string } {
    if (!activityCategory) return { minutes: "15", description: "15-minute" };
    
    const act = activityCategory.toLowerCase();
    
    // Quick food, cafes, bars
    if (/(cafe|coffee|bakery|breakfast|bar|pub|drinks|nightlife|club)/.test(act)) {
        return { minutes: "5", description: "5-minute" };
    }
    // Restaurants, dinner
    if (/(restaurant|dining|dinner|lunch|food|eats)/.test(act)) {
        return { minutes: "5", description: "5-minute" };
    }
    // General / Indoor / Local
    if (/(museum|gallery|art|shopping|retail|indoor|park|playground|family|kids|zoo|local attractions)/.test(act)) {
        return { minutes: "15", description: "15-minute" };
    }
    // Active Outdoors
    if (/(outdoor|beach|kayak|water sport|bike|biking|surf|boat)/.test(act)) {
        return { minutes: "30", description: "30-minute" };
    }
    // Hiking / Nature / Skiing
    if (/(hike|hiking|walk|trek|mountain|national|ski|snowboard|glacier)/.test(act)) {
        return { minutes: "45", description: "45-minute" };
    }
    // Specialist long-distance tours
    if (/(wildlife|scenic tour|wine|vineyard)/.test(act)) {
        return { minutes: "60", description: "60-minute" };
    }
    
    // Default fallback
    return { minutes: "15", description: "15-minute" };
}
