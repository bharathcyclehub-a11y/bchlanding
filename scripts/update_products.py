#!/usr/bin/env python3
"""
Updates the EMotorad section in src/data/products.js using data from bikes.json.

Usage:
    python scripts/update_products.py

This reads scripts/bikes.json (produced by fetch_bikes.py) and replaces the
EMOTORAD ELECTRIC BIKES section in products.js with up-to-date data from the
EMotorad API — prices, images, specs, colors, and descriptions.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BIKES_JSON = ROOT / "scripts" / "bikes.json"
PRODUCTS_JS = ROOT / "src" / "data" / "products.js"

# Section markers in products.js
SECTION_START = "  // EMOTORAD ELECTRIC BIKES"
SECTION_END_MARKER = "];"  # End of the products array


def load_bikes():
    """Load cleaned bike data from bikes.json."""
    with open(BIKES_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {data['count']} bikes from {BIKES_JSON.name} (fetched {data['fetched_at'][:10]})")
    return data["bikes"], data["fetched_at"][:10]


def sanitize(text):
    """Clean special unicode chars for JS string literals."""
    return (
        text.replace("\u2019", "'")
            .replace("\u2018", "'")
            .replace("\u201c", '"')
            .replace("\u201d", '"')
            .replace("\u2014", " - ")
            .replace("\u2013", "-")
            .replace("\u00a0", " ")
            .replace("\u2026", "...")
            .replace("\\", "\\\\")
    )


def js_string(s):
    """Escape a string for use inside JS double quotes."""
    s = sanitize(s)
    s = s.replace('"', '\\"')
    return s


def map_specs(specs_dict):
    """Map API spec keys to existing products.js spec key names."""
    mapped = {}
    for key, val in specs_dict.items():
        val = sanitize(val.strip())
        if key in ("Tyres", "Tyre"):
            mapped["wheelSize"] = val
        elif key == "Frame":
            mapped["frameType"] = val
        elif key == "Gears":
            mapped["gearCount"] = val
        elif key == "Brakes" and "brakeType" not in mapped:
            mapped["brakeType"] = val
        elif key == "Motor":
            mapped["motor"] = val
        elif key == "Battery":
            mapped["battery"] = val
        elif key == "Range":
            mapped["range"] = val
        elif key == "Front Fork":
            mapped["suspension"] = val
        elif key == "Display":
            mapped["display"] = val
        elif key == "Charging Time":
            mapped["chargingTime"] = val
        elif key == "Light":
            mapped["lights"] = val
    return mapped


def assign_badge(bike):
    """Assign a display badge based on popularity and stock."""
    pop = bike["popularity"]
    price = bike["price"]
    if pop >= 62:
        return "Bestseller"
    if pop >= 58:
        return "Top Pick"
    if price <= 25000:
        return "Value Pick"
    if not bike["in_stock"]:
        return "Coming Soon"
    return None


def generate_emotorad_section(bikes, fetched_date):
    """Generate the full JS code block for the EMotorad products section."""
    price_min = min(b["price"] for b in bikes)
    price_max = max(b["price"] for b in bikes)

    lines = []
    lines.append(f"  // {'─' * 45}")
    lines.append(
        f"  // EMOTORAD ELECTRIC BIKES ({len(bikes)})"
        f" — ₹{price_min:,}–₹{price_max:,}"
    )
    lines.append(f"  // Updated from EMotorad API on {fetched_date}")
    lines.append(f"  // {'─' * 45}")

    for i, bike in enumerate(bikes):
        idx = f"{i + 1:03d}"
        bid = f"emotorad-{idx}"
        specs = map_specs(bike["specs"])
        badge = assign_badge(bike)
        colors = bike.get("colors", [])
        name = sanitize(bike["name"])
        short_desc = js_string(
            bike.get("card_description", "") or bike.get("description", "")[:150]
        )
        img = bike.get("main_image", "")
        card_imgs = bike.get("card_images", [])

        lines.append("  {")
        lines.append(f'    id: "{bid}",')
        lines.append(f'    name: "EMotorad {name}",')
        lines.append(f'    category: "electric",')
        lines.append(f'    subCategory: "emotorad",')
        lines.append(f"    price: {bike['price']},")
        lines.append(f"    mrp: {bike['mrp']},")
        lines.append(f'    image: "{img}",')

        if card_imgs:
            lines.append(f'    cardImage: "{card_imgs[0]}",')

        lines.append(f"    inStock: {'true' if bike['in_stock'] else 'false'},")

        # Specs
        lines.append("    specs: {")
        spec_items = list(specs.items())
        for j, (k, v) in enumerate(spec_items):
            comma = "," if j < len(spec_items) - 1 else ""
            lines.append(f'      {k}: "{js_string(v)}"{comma}')
        lines.append("    },")

        # Colors
        if colors:
            lines.append("    colors: [")
            for c in colors:
                c_name = js_string(c["name"].strip())
                c_hex = js_string(c["hex"])
                c_stock = "true" if c["in_stock"] else "false"
                lines.append(
                    f'      {{ name: "{c_name}", hex: "{c_hex}", inStock: {c_stock} }},'
                )
            lines.append("    ],")

        # Gallery images (all color variants)
        gallery = bike.get("gallery_images", [])
        if gallery:
            lines.append("    gallery: [")
            for url in gallery:
                lines.append(f'      "{url}",')
            lines.append("    ],")

        # Badge
        if badge:
            lines.append(f'    badge: "{badge}",')
        else:
            lines.append("    badge: null,")

        # Short description
        lines.append(f'    shortDescription: "{short_desc}",')

        lines.append("  },")

    return "\n".join(lines)


def update_products_file(new_section):
    """Replace the EMotorad section in products.js with the new data."""
    content = PRODUCTS_JS.read_text(encoding="utf-8")

    # Find the start of the EMotorad section (the comment line)
    # Pattern: from "  // ─────" before "EMOTORAD" to the next section or end of array
    # We look for the divider line right before EMOTORAD
    pattern = re.compile(
        r"(  // ─+\n  // EMOTORAD ELECTRIC BIKES.*?\n.*?// ─+\n)"  # header
        r"(.*?)"  # all product entries
        r"(?=\n\];)",  # stop right before the closing ];
        re.DOTALL,
    )

    match = pattern.search(content)
    if not match:
        print("ERROR: Could not find EMOTORAD section in products.js")
        sys.exit(1)

    start = match.start()
    end = match.end()

    print(f"Found EMotorad section at chars {start}-{end} ({end - start} chars)")

    new_content = content[:start] + new_section + content[end:]

    # Write atomically
    temp = PRODUCTS_JS.with_suffix(".js.tmp")
    temp.write_text(new_content, encoding="utf-8")
    temp.replace(PRODUCTS_JS)

    print(f"Updated {PRODUCTS_JS.name} successfully")


def main():
    bikes, fetched_date = load_bikes()
    new_section = generate_emotorad_section(bikes, fetched_date)
    update_products_file(new_section)
    print(f"Done — {len(bikes)} EMotorad bikes written to products.js")


if __name__ == "__main__":
    main()
