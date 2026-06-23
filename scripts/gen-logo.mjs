// Generate a clean BCH logo via Gemini (white-background lockup for the light header).
import fs from 'node:fs';

const KEY = process.env.GEMINI_KEY;
const MODEL = 'gemini-2.5-flash-image';
const OUT = 'C:/Users/H/Documents/GitHub/bchlanding/public/bch-logo-gen.png';

const prompt = `Design a clean, modern, premium brand logo for a bicycle store.

Horizontal lockup: on the LEFT a minimalist geometric emblem that combines a bicycle wheel with a chain link; on the RIGHT the brand name in bold uppercase sans-serif on two tight lines — "BHARATH" on the top line and "CYCLE HUB" on the bottom line. Spell it EXACTLY: B-H-A-R-A-T-H  C-Y-C-L-E  H-U-B. No other words, no tagline, no slogan.

Colours: brand red #DC2626 for the emblem and for the word "CYCLE"; deep charcoal #1A1A1A for "BHARATH" and "HUB". Pure solid white (#FFFFFF) background.

Style: flat vector logo, crisp sharp clean edges, perfectly legible, well balanced, professional, generous white padding around the lockup, horizontally centered. High resolution.`;

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '4:3' } },
};
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

async function attempt(n) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 110000);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) { console.error(`try ${n}: HTTP ${res.status}`, (await res.text()).slice(0, 300)); return false; }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const img = parts.find((p) => p.inlineData || p.inline_data);
    if (!img) { console.error(`try ${n}: no image`, JSON.stringify(data).slice(0, 300)); return false; }
    fs.writeFileSync(OUT, Buffer.from((img.inlineData || img.inline_data).data, 'base64'));
    console.log('SAVED', OUT, fs.statSync(OUT).size, 'bytes');
    return true;
  } catch (e) { clearTimeout(t); console.error(`try ${n}: ${e.name} ${e.message}`); return false; }
}
for (let i = 1; i <= 3; i++) { if (await attempt(i)) process.exit(0); }
console.error('all attempts failed');
process.exit(1);
