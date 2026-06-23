// One-off: generate a 9:16 portrait mobile hero from the landscape source image.
// Keeps the same kid + e-cycle + dark crimson studio look, recomposed for a phone
// with the rider on the lower half and dark smoky negative space up top for text.
import fs from 'node:fs';

const KEY = process.env.GEMINI_KEY;
const MODEL = 'gemini-3-pro-image-preview';
const SRC = 'C:/Users/H/Documents/GitHub/bchlanding/public/viper-hero-kid-dark.png';
const OUT = 'C:/Users/H/Documents/GitHub/bchlanding/public/viper-hero-kid-mobile.png';

const b64 = fs.readFileSync(SRC).toString('base64');

const prompt = `Recompose this exact scene as a VERTICAL 9:16 portrait poster for a phone screen.

KEEP IDENTICAL: the same child rider in the full-face motocross helmet and grey/black riding gear, sitting on the same matte-black fat-tyre electric cycle with the glowing round LED headlight. Same dark charcoal studio backdrop with the same crimson-red atmospheric haze/smoke and dramatic red rim lighting. Premium, cinematic, moody — like a high-end product launch poster.

NEW COMPOSITION FOR PORTRAIT:
- Place the child + e-cycle in the LOWER 55% of the tall frame, large and prominent, slightly toward the right, the front wheel and headlight clearly visible.
- Leave the UPPER 45% as deep, dark, near-black studio space with only soft red smoke drifting through it — clean empty negative space so large headline text can be overlaid there and stay perfectly readable.
- Keep a smooth dark gradient: darkest at the very top, the rider emerging from shadow at the bottom.
- No text, no logos, no watermark anywhere in the image.
- Cinematic, sharp, photorealistic.`;

const body = {
  contents: [{ parts: [{ inline_data: { mime_type: 'image/png', data: b64 } }, { text: prompt }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '9:16' } },
};

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (!res.ok) {
  console.error('HTTP', res.status, (await res.text()).slice(0, 600));
  process.exit(1);
}
const data = await res.json();
const parts = data?.candidates?.[0]?.content?.parts || [];
const img = parts.find((p) => p.inlineData || p.inline_data);
if (!img) {
  console.error('No image in response:', JSON.stringify(data).slice(0, 600));
  process.exit(1);
}
const out = (img.inlineData || img.inline_data).data;
fs.writeFileSync(OUT, Buffer.from(out, 'base64'));
console.log('SAVED', OUT, fs.statSync(OUT).size, 'bytes');
