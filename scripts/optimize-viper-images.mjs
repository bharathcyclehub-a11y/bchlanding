// Convert the Viper page's PNG/JPG assets to resized WebP, plus the reel posters.
// Originals are left in place (so nothing breaks if a ref is missed); JSX is repointed to .webp.
import sharp from 'sharp';
import fs from 'node:fs';

const DIR = 'C:/Users/H/Documents/GitHub/bchlanding/public';

// [file, maxWidth, quality]
const imgs = [
  ['viper-hero-kid-dark.png', 1920, 80],   // desktop full-bleed hero
  ['viper-hero-kid-mobile.png', 1080, 80], // mobile portrait hero
  ['viper-safety-decoded.png', 1100, 80],  // safety diagram
  ['viper-kids-group.jpg', 1920, 78],      // story slide bg
  ['viper-kids-outdoor.jpg', 1920, 78],    // story slide bg
  ['cycling-accessories.jpg', 1280, 78],   // what-you-get flat lay
  ['viper-frame-3.jpg', 1600, 78],         // final CTA bg
];

// reel posters
for (let i = 1; i <= 9; i++) imgs.push([`viper-reel-${i}.jpg`, 440, 70]);

let before = 0, after = 0;
for (const [file, maxW, q] of imgs) {
  const src = `${DIR}/${file}`;
  if (!fs.existsSync(src)) { console.log('skip (missing)', file); continue; }
  const out = `${DIR}/${file.replace(/\.(png|jpe?g)$/i, '.webp')}`;
  const inSize = fs.statSync(src).size;
  await sharp(src)
    .resize({ width: maxW, withoutEnlargement: true })
    .webp({ quality: q, effort: 5 })
    .toFile(out);
  const outSize = fs.statSync(out).size;
  before += inSize; after += outSize;
  console.log(`${file.padEnd(28)} ${(inSize / 1024).toFixed(0).padStart(5)}KB -> ${(outSize / 1024).toFixed(0).padStart(5)}KB  ${out.split('/').pop()}`);
}
console.log(`\nTOTAL ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB  (saved ${((1 - after / before) * 100).toFixed(0)}%)`);
