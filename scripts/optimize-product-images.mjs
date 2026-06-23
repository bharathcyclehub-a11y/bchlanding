// Convert scraped EMotorad Viper product images (.viper-em-tmp) to optimized WebP in public/.
import sharp from 'sharp';
import fs from 'node:fs';

const TMP = 'C:/Users/H/Documents/GitHub/bchlanding/.viper-em-tmp';
const PUB = 'C:/Users/H/Documents/GitHub/bchlanding/public';

const jobs = [];
for (let i = 1; i <= 11; i++) jobs.push([`black-${i}.jpg`, `viper-product-${i}.webp`, 1040, 82]);
jobs.push(['banner_1.jpg', 'viper-product-banner.webp', 1600, 80]);

let before = 0, after = 0;
for (const [src, out, maxW, q] of jobs) {
  const s = `${TMP}/${src}`;
  if (!fs.existsSync(s)) { console.log('skip', src); continue; }
  const inSize = fs.statSync(s).size;
  await sharp(s).resize({ width: maxW, withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toFile(`${PUB}/${out}`);
  const outSize = fs.statSync(`${PUB}/${out}`).size;
  before += inSize; after += outSize;
  console.log(`${src.padEnd(14)} ${(inSize / 1024).toFixed(0).padStart(5)}KB -> ${(outSize / 1024).toFixed(0).padStart(5)}KB  ${out}`);
}
console.log(`\nTOTAL ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`);
