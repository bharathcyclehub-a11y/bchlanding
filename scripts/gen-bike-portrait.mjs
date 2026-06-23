// One-off: generate a 9:16 portrait studio shot of the exact Viper e-cycle, to fill the
// left column of the Machine section on mobile so it matches the spec-table height.
import fs from 'node:fs';

const KEY = process.env.GEMINI_KEY;
const MODEL = 'gemini-3-pro-image-preview';
const SRC = 'C:/Users/H/Documents/GitHub/bchlanding/public/viper-bike.jpg';
const OUT = 'C:/Users/H/Documents/GitHub/bchlanding/public/viper-bike-portrait.png';

const b64 = fs.readFileSync(SRC).toString('base64');

const prompt = `Studio product photograph of THIS EXACT electric cycle, recomposed as a TALL vertical 9:16 portrait.

KEEP IDENTICAL: the same matte-black EMotorad Viper fat-tyre e-cycle — same brown/tan saddle, the black battery pack on the frame, the fat knobby tyres, the round headlight, the same frame shape and proportions and colours as the reference image. Do not change the bike.

COMPOSITION: centre the bike, shown in a clean 3/4 side profile, large and prominent in the vertical frame. Clean seamless soft light-grey studio background (very light, near white, around #EEF1F5) with a soft realistic contact shadow beneath the tyres. Bright, even, premium product lighting. Crisp and photorealistic, e-commerce hero style. Leave clean background space above and below the bike so it sits well in a tall frame.

No text, no logos added, no watermark anywhere.`;

const body = {
  contents: [{ parts: [{ inline_data: { mime_type: 'image/jpeg', data: b64 } }, { text: prompt }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '9:16' } },
};

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

async function attempt(n) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 110000); // 110s per try (API is slow at peak)
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) { console.error(`try ${n}: HTTP`, res.status, (await res.text()).slice(0, 300)); return false; }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const img = parts.find((p) => p.inlineData || p.inline_data);
    if (!img) { console.error(`try ${n}: no image`, JSON.stringify(data).slice(0, 300)); return false; }
    fs.writeFileSync(OUT, Buffer.from((img.inlineData || img.inline_data).data, 'base64'));
    console.log('SAVED', OUT, fs.statSync(OUT).size, 'bytes');
    return true;
  } catch (e) { clearTimeout(t); console.error(`try ${n}: ${e.name} ${e.message}`); return false; }
}

for (let i = 1; i <= 4; i++) {
  if (await attempt(i)) process.exit(0);
}
console.error('all attempts failed');
process.exit(1);
