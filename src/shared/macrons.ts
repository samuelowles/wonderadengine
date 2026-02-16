/** Common Māori place name macron corrections */
const MAORI_MACRONS: Record<string, string> = {
    'Wanaka': 'Wānaka',
    'Taupo': 'Taupō',
    'Rotorua': 'Rotorua', // no macron needed
    'Kaikoura': 'Kaikōura',
    'Napier': 'Napier',
    'Ohakune': 'Ōhakune',
    'Tongariro': 'Tongariro',
    'Tauranga': 'Tauranga',
    'Whanganui': 'Whanganui',
    'Whakatane': 'Whakatāne',
    'Te Anau': 'Te Anau',
    'Akaroa': 'Akaroa',
    'Waiheke': 'Waiheke',
    'Piha': 'Piha',
    'Matamata': 'Matamata',
    'Oamaru': 'Ōamaru',
    'Timaru': 'Timaru',
    'Hokitika': 'Hokitika',
    'Punakaiki': 'Punakaiki',
    'Hanmer': 'Hanmer',
    'Te Puke': 'Te Puke',
    'Taumarunui': 'Taumarunui',
    'Mangawhai': 'Mangawhai',
    'Paihia': 'Paihia',
    'Waitomo': 'Waitomo',
    'Aoraki': 'Aoraki',
    'Ruapehu': 'Ruapehu',
    'Tekapo': 'Tekapō',
    'Pukaki': 'Pukaki',
    'Haast': 'Haast',
    'Milford': 'Milford',
};

/** Apply macrons to Māori place names in a string */
export function applyMacrons(text: string): string {
    let result = text;
    for (const [plain, accented] of Object.entries(MAORI_MACRONS)) {
        if (plain !== accented) {
            result = result.replace(new RegExp(`\\b${plain}\\b`, 'g'), accented);
        }
    }
    return result;
}
