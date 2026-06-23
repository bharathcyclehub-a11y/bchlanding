"""
Viper Kids hero banner generator (Gemini 3 Pro Image, image-conditioned).

Reads a reference photo of the real EMotorad Viper and produces hero banners
with ONE riderless Viper on the LEFT and clean negative space on the RIGHT
for the landing-page text overlay.

Usage (PowerShell):
  $env:GEMINI_API_KEY="..."; python scripts/gen-viper-hero.py "C:\\Users\\H\\Downloads\\11.jpg"
"""

import base64
import json
import os
import sys
import urllib.request
import urllib.error

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    print("ERR: set GEMINI_API_KEY", file=sys.stderr)
    sys.exit(1)

REF_PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\H\Downloads\11.jpg"
OUT_DIR = "public"
MODEL = "gemini-3-pro-image-preview"

with open(REF_PATH, "rb") as f:
    REF_B64 = base64.b64encode(f.read()).decode("ascii")
REF_MIME = "image/jpeg" if REF_PATH.lower().endswith((".jpg", ".jpeg")) else "image/png"


def call_gemini(parts):
    body = {"contents": [{"parts": parts}]}
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{MODEL}:generateContent?key={API_KEY}"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read().decode("utf-8", errors="replace")}


def save_image(resp, out_path):
    if "_error" in resp:
        print(f"  Error {resp['_error']}: {resp['_body'][:400]}")
        return False
    try:
        parts = resp["candidates"][0]["content"]["parts"]
        for p in parts:
            data = p.get("inline_data") or p.get("inlineData")
            if data:
                img = base64.b64decode(data["data"])
                with open(out_path, "wb") as fh:
                    fh.write(img)
                print(f"  Wrote {out_path} ({len(img)} bytes)")
                return True
        print(f"  No image. Text: {parts[0].get('text','')[:200]}")
    except (KeyError, IndexError) as e:
        print(f"  Parse error: {e}")
    return False


COMMON = (
    "Use the electric bike in the reference image as the EXACT product: a matte-black "
    "fat-tyre electric moto-bike with a circular LED headlight, thick knobby off-road "
    "tyres, dual suspension and the same frame, badging and proportions as the reference. "
    "Show ONE such bike with ONE young rider: a confident 13-year-old Indian boy wearing FULL "
    "off-road riding gear — a full-face helmet with goggles, a fitted riding jersey, gloves, "
    "knee and elbow guards and riding pants — sitting astride the bike with both hands on the "
    "handlebars, ready to ride. The rider must look age 13 (a teenager, NOT an adult), correctly "
    "proportioned to the bike. No OTHER people. NO text, NO logos, NO watermark. "
    "Position the bike-and-rider in the LEFT THIRD of a wide 16:9 banner, 3/4 front hero angle, sharp focus. "
    "The RIGHT 55-60 percent of the frame must be calm, open negative space reserved for a text "
    "overlay. Hyper-realistic cinematic photography, premium. 16:9 widescreen, 1920x1080."
)

VARIANTS = [
    (
        "viper-hero-kid-dark.png",
        "Create a cinematic dark hero banner. " + COMMON +
        " Background: near-black dramatic darkness with a subtle deep-charcoal gradient and faint "
        "volumetric haze. The bike's round headlight glows; a subtle red rim-light (#DC2626) traces "
        "the edges of the rider and bike against the dark void. The right side is smooth, dark, "
        "empty negative space.",
    ),
    (
        "viper-hero-kid-forest.png",
        "Create a cinematic golden-hour hero banner. " + COMMON +
        " Background: a pine-forest trail at sunset with warm sun flares glowing between the trees, "
        "the same mood and palette as the reference image, but with the right side softly blurred "
        "and open for text.",
    ),
]

os.makedirs(OUT_DIR, exist_ok=True)
for fname, prompt in VARIANTS:
    print(f"\nGenerating: {fname}")
    resp = call_gemini([
        {"text": prompt},
        {"inline_data": {"mime_type": REF_MIME, "data": REF_B64}},
    ])
    save_image(resp, os.path.join(OUT_DIR, fname))

print("\nDone. Check public/viper-hero-dark.png and public/viper-hero-forest.png")
