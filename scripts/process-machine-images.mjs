// Removes the Gemini ✦ watermark from the Silent Conqueror image and converts
// both Machine-section images to high-quality WebP (smaller + sharper rendering).
import sharp from 'sharp';

const PUB = 'public';

async function run() {
  // ── 1. Silent Conqueror: the ✦ watermark is in the far bottom-right corner,
  // over empty dark background. Crop the right edge off to remove it cleanly,
  // then → webp. (Rider + text are centre-left, so nothing important is lost.)
  const sc = `${PUB}/viper-silent-conqueror.png`;
  const meta = await sharp(sc).metadata();
  const cropRight = 230; // px removed from the right edge (covers the ✦)
  await sharp(sc)
    .extract({ left: 0, top: 0, width: meta.width - cropRight, height: meta.height })
    .webp({ quality: 90 })
    .toFile(`${PUB}/viper-silent-conqueror.webp`);
  console.log('wrote viper-silent-conqueror.webp');

  // ── 2. Decoding Your Ride: no visible watermark → straight high-quality webp
  await sharp(`${PUB}/viper-decoding.png`)
    .webp({ quality: 92 })
    .toFile(`${PUB}/viper-decoding.webp`);
  console.log('wrote viper-decoding.webp');
}

run().catch((e) => { console.error(e); process.exit(1); });
