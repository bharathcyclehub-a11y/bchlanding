"""
Before/After images for the Viper Kids "Transformation" section (Gemini 3 Pro Image).

  $env:GEMINI_API_KEY="..."; python scripts/gen-transform.py "C:\\Users\\H\\Downloads\\11.jpg"
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


def call_gemini(parts):
    body = {"contents": [{"parts": parts}]}
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{MODEL}:generateContent?key={API_KEY}")
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return {"_error": e.code, "_body": e.read().decode("utf-8", errors="replace")}


def save_image(resp, out_path):
    if "_error" in resp:
        print(f"  Error {resp['_error']}: {resp['_body'][:400]}")
        return
    try:
        for p in resp["candidates"][0]["content"]["parts"]:
            data = p.get("inline_data") or p.get("inlineData")
            if data:
                img = base64.b64decode(data["data"])
                with open(out_path, "wb") as fh:
                    fh.write(img)
                print(f"  Wrote {out_path} ({len(img)} bytes)")
                return
        print("  No image returned.")
    except (KeyError, IndexError) as e:
        print(f"  Parse error: {e}")


BEFORE = (
    "Cinematic, photorealistic editorial photograph, wide 3:2 landscape. A 13-year-old Indian boy "
    "sits slumped on a sofa in a dark living room late at night. His face and hands are lit only by "
    "the cold blue glow of a smartphone he is staring at; the rest of the room falls into shadow. "
    "Mood: isolated, restless, screen-addicted, melancholic. Muted desaturated cool tones, subtle "
    "film grain, shallow depth of field. No text, no logos, no watermark."
)

AFTER = (
    "Use the electric bike in the reference image as the EXACT product: a matte-black fat-tyre Viper "
    "e-bike with a circular LED headlight and thick knobby tyres. Create a bright, joyful, "
    "photorealistic lifestyle photograph, wide 3:2 landscape. A happy 13-year-old Indian boy in a "
    "casual t-shirt and a bicycle helmet rides this Viper down a leafy, tree-lined Bangalore street "
    "at golden hour, a genuine big smile on his face, full of freedom and energy. Warm sun flares "
    "through the trees; a couple of friends are softly blurred in the background. Vibrant, warm, "
    "uplifting. No text, no logos, no watermark."
)

os.makedirs(OUT_DIR, exist_ok=True)

print("Generating: transform-before.png")
save_image(call_gemini([{"text": BEFORE}]), os.path.join(OUT_DIR, "transform-before.png"))

print("Generating: transform-after.png")
save_image(call_gemini([
    {"text": AFTER},
    {"inline_data": {"mime_type": "image/jpeg", "data": REF_B64}},
]), os.path.join(OUT_DIR, "transform-after.png"))

print("Done.")
