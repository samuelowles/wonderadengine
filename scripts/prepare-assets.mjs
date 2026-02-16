import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const SRC_DIR = join(root, 'img');
const OUT_DIR = join(root, 'public', 'img');

async function main() {
    await mkdir(OUT_DIR, { recursive: true });

    const files = (await readdir(SRC_DIR)).filter(f => f.endsWith('.jpg'));
    console.log(`Found ${files.length} source images\n`);

    // Hero images — 1200×800, quality 75
    const heroSources = [
        'Death_to_Stock_Chasing_Sunrise_17_Wendy_Shepherd.jpg',  // hero-discover
        'Death_to_Stock_Chasing_Sunrise_1_Julian_DeSchutter.jpg', // hero-loading
        'Death_to_Stock_Chasing_Sunrise_5_Ivan_Calderon.jpg',     // hero-detail
    ];
    const heroNames = ['hero-discover.jpg', 'hero-loading.jpg', 'hero-detail.jpg'];

    for (let i = 0; i < heroSources.length; i++) {
        const src = join(SRC_DIR, heroSources[i]);
        const out = join(OUT_DIR, heroNames[i]);
        try {
            const info = await sharp(src)
                .resize(1200, 800, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 75, mozjpeg: true })
                .toFile(out);
            console.log(`✓ ${heroNames[i]} — ${(info.size / 1024).toFixed(0)}KB`);
        } catch (e) {
            console.log(`✗ ${heroNames[i]} — ${e.message}`);
        }
    }

    // Thumbnails — 400×400, quality 70
    const thumbSources = [
        'Death_to_Stock_Chasing_Sunrise_3_Julian_DeSchutter.jpg',
        'Death_to_Stock_Chasing_Sunrise_13_Julian_DeSchutter.jpg',
        'Death_to_Stock_Chasing_Sunrise_14_Julian_DeSchutter.jpg',
        'Death_to_Stock_Chasing_Sunrise_2_Julian_DeSchutter.jpg',
        'DTS_Chill Dudes_by_Daniel Faró_004.jpg',
    ];

    for (let i = 0; i < thumbSources.length; i++) {
        const src = join(SRC_DIR, thumbSources[i]);
        const out = join(OUT_DIR, `thumb-${i + 1}.jpg`);
        try {
            const info = await sharp(src)
                .resize(400, 400, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 70, mozjpeg: true })
                .toFile(out);
            console.log(`✓ thumb-${i + 1}.jpg — ${(info.size / 1024).toFixed(0)}KB`);
        } catch (e) {
            console.log(`✗ thumb-${i + 1}.jpg — ${e.message}`);
        }
    }

    console.log('\nDone!');
}

main();
