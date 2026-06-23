// Generate responsive AVIF + WebP variants for the Viper product-gallery stills.
//
// Source: public/viper-product-N.webp (1000×750). For each we emit 400/700/1000-wide
// AVIF (best compression) and WebP (universal fallback), so the product page can serve
// <picture> + srcset and hand each device the smallest file that still looks identical.
//
//   run:  node scripts/gen-responsive-images.mjs
import sharp from 'node:sharp' in {} ? null : (await import('sharp')).default;
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const PUB = 'C:/Users/H/Documents/GitHub/bchlanding/public';
const WIDTHS = [400, 700, 1000];

const bases = readdirSync(PUB)
  .filter((f) => /^viper-product-\d+\.webp$/.test(f))
  .map((f) => f.replace(/\.webp$/, ''));

let made = 0;
let bytes = 0;
for (const base of bases) {
  const input = path.join(PUB, `${base}.webp`);
  const meta = await sharp(input).metadata();
  for (const w of WIDTHS) {
    if (w > meta.width) continue; // never upscale
    const avif = path.join(PUB, `${base}-${w}.avif`);
    const webp = path.join(PUB, `${base}-${w}.webp`);
    await sharp(input).resize({ width: w }).avif({ quality: 50, effort: 4 }).toFile(avif);
    await sharp(input).resize({ width: w }).webp({ quality: 80 }).toFile(webp);
    made += 2;
    bytes += statSync(avif).size + statSync(webp).size;
  }
  console.log('✓', base);
}
console.log(`\n${made} files written · ${(bytes / 1024 / 1024).toFixed(2)} MB total`);
