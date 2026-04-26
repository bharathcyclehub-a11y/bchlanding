#!/usr/bin/env python3
"""
EMotorad Bike Data Fetcher
==========================

Fetches bike product data from the EMotorad public API and saves it as
a clean, structured JSON file for local use.

API Endpoint: https://www.emotorad.com/api/bikes/all-bikes

Usage:
    python scripts/fetch_bikes.py                # Fetch and save to scripts/bikes.json
    python scripts/fetch_bikes.py --output data  # Save to data/bikes.json
    python scripts/fetch_bikes.py --dry-run      # Fetch and print without saving

Schedule daily with cron (Linux/Mac):
    0 3 * * * cd /path/to/project && python scripts/fetch_bikes.py >> logs/fetch.log 2>&1

Schedule daily with Task Scheduler (Windows):
    Action: python
    Arguments: scripts/fetch_bikes.py
    Start in: C:\\path\\to\\project

Requirements:
    pip install -r scripts/requirements.txt

Example output format (bikes.json):
    [
      {
        "id": "679c60a396fb10bcf79b8a12",
        "name": "G1 Cargo E-Cycle",
        "slug": "g1-cargo-e-cycle",
        "price": 99999,
        "mrp": 99999,
        "description": "The G1 isn't just an e-cycle...",
        "main_image": "https://ar-euro.s3.ap-south-1.amazonaws.com/.../1.jpg",
        "gallery_images": ["https://...1.jpg", "https://...2.jpg"],
        "card_images": ["https://...CartOrange.png"],
        "colors": [
          {"name": "Orange", "hex": "#FE8A30", "in_stock": true},
          {"name": "Black", "hex": "#000000", "in_stock": true}
        ],
        "in_stock": true,
        "specs": {
          "Bike Type": "Rear E-Cargo Mullet Bike",
          "Frame": "High Tensile Longtail Steel Frame",
          "Motor": "EMotorad 48V 250W Rear Hub Motor"
        },
        "category": "bike",
        "card_description": "Heavy-duty e-cycle with up to 100 km range...",
        "popularity": 65
      }
    ]
"""

import argparse
import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_URL = "https://www.emotorad.com/api/bikes/all-bikes"
REQUEST_TIMEOUT = 30  # seconds
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds between retries
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent  # scripts/

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data fetching
# ---------------------------------------------------------------------------


def fetch_bikes_from_api() -> list[dict]:
    """
    Fetch raw bike data from the EMotorad API with retry logic.

    Returns the parsed JSON array on success.
    Raises RuntimeError if all retries are exhausted.
    """
    headers = {
        "Accept": "application/json",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
    }

    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("Fetching from API (attempt %d/%d)...", attempt, MAX_RETRIES)
            response = requests.get(
                API_URL, headers=headers, timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()

            data = response.json()

            if not isinstance(data, list):
                raise ValueError(
                    f"Expected a JSON array, got {type(data).__name__}"
                )

            if len(data) == 0:
                raise ValueError("API returned an empty array")

            logger.info(
                "Successfully fetched %d bikes (%d bytes)",
                len(data),
                len(response.content),
            )
            return data

        except requests.exceptions.ConnectionError as exc:
            last_error = exc
            logger.warning("Connection error: %s", exc)
        except requests.exceptions.Timeout as exc:
            last_error = exc
            logger.warning("Request timed out after %ds", REQUEST_TIMEOUT)
        except requests.exceptions.HTTPError as exc:
            last_error = exc
            logger.warning(
                "HTTP %d: %s", response.status_code, response.reason
            )
        except (ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            logger.warning("Invalid response: %s", exc)

        if attempt < MAX_RETRIES:
            logger.info("Retrying in %ds...", RETRY_DELAY)
            time.sleep(RETRY_DELAY)

    raise RuntimeError(
        f"Failed to fetch bike data after {MAX_RETRIES} attempts: {last_error}"
    )


# ---------------------------------------------------------------------------
# Data cleaning & transformation
# ---------------------------------------------------------------------------


def slugify(name: str) -> str:
    """Convert a product name into a URL-friendly slug."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)  # Remove non-alphanumeric chars
    slug = re.sub(r"[\s_]+", "-", slug)   # Replace whitespace/underscores with hyphens
    slug = re.sub(r"-+", "-", slug)       # Collapse multiple hyphens
    return slug.strip("-")


def clean_specs(specs_list: list[dict]) -> dict[str, str]:
    """
    Convert the specs array [{name, value}, ...] into a flat dictionary.

    Strips whitespace from both keys and values.
    """
    if not specs_list:
        return {}
    return {
        spec["name"].strip(): spec["value"].strip()
        for spec in specs_list
        if "name" in spec and "value" in spec
    }


def extract_colors(models: list[dict]) -> list[dict]:
    """
    Extract color variant information from the models array.

    Returns a list of {name, hex, in_stock} dicts.
    """
    if not models:
        return []
    return [
        {
            "name": model.get("colorName", "Unknown"),
            "hex": model.get("colorCode", "#000000"),
            "in_stock": bool(model.get("inStock", False)),
        }
        for model in models
    ]


def extract_main_image(product_images: list) -> str | None:
    """
    Get the first image from the first color variant's gallery.

    productImages is an array of arrays — one gallery per color variant.
    """
    if not product_images:
        return None
    first_variant = product_images[0]
    if isinstance(first_variant, list) and first_variant:
        return first_variant[0]
    if isinstance(first_variant, str):
        return first_variant
    return None


def flatten_gallery_images(product_images: list) -> list[str]:
    """
    Flatten all color variant galleries into a single deduplicated list.

    Preserves order while removing duplicates.
    """
    seen = set()
    images = []
    for variant_gallery in (product_images or []):
        if isinstance(variant_gallery, list):
            for url in variant_gallery:
                if url not in seen:
                    seen.add(url)
                    images.append(url)
        elif isinstance(variant_gallery, str) and variant_gallery not in seen:
            seen.add(variant_gallery)
            images.append(variant_gallery)
    return images


def clean_bike(raw: dict) -> dict:
    """
    Transform a single raw API bike object into our clean format.

    Handles missing fields gracefully with sensible defaults.
    """
    name = (raw.get("name") or "").strip()
    slug = raw.get("urlName") or slugify(name)
    product_images = raw.get("productImages") or []

    return {
        "id": raw.get("_id", ""),
        "name": name,
        "slug": slug,
        "price": raw.get("price", 0),
        "mrp": raw.get("slashPrice") or raw.get("price", 0),
        "description": (raw.get("description") or "").strip(),
        "main_image": extract_main_image(product_images),
        "gallery_images": flatten_gallery_images(product_images),
        "card_images": raw.get("cartImages") or [],
        "colors": extract_colors(raw.get("models") or []),
        "in_stock": bool(raw.get("inStock", False)),
        "specs": clean_specs(raw.get("specs") or []),
        "category": raw.get("category", ""),
        "card_description": (raw.get("cardDesc") or "").strip(),
        "popularity": raw.get("popularity", 0),
    }


def clean_all_bikes(raw_data: list[dict]) -> list[dict]:
    """
    Clean and transform the full list of raw bike objects.

    Filters out inactive products and sorts by popularity (descending).
    """
    cleaned = []
    skipped = 0

    for raw in raw_data:
        # Skip inactive products
        if not raw.get("active", True):
            skipped += 1
            continue

        try:
            cleaned.append(clean_bike(raw))
        except Exception as exc:
            name = raw.get("name", "unknown")
            logger.warning("Skipping bike '%s': %s", name, exc)
            skipped += 1

    # Sort by popularity descending so the most popular bikes come first
    cleaned.sort(key=lambda b: b.get("popularity", 0), reverse=True)

    logger.info(
        "Cleaned %d bikes (%d skipped/inactive)", len(cleaned), skipped
    )
    return cleaned


# ---------------------------------------------------------------------------
# File output
# ---------------------------------------------------------------------------


def save_to_json(bikes: list[dict], output_dir: Path) -> Path:
    """
    Atomically save cleaned bike data to bikes.json.

    Writes to a temporary file first, then renames — so the main file is
    never left in a partial/corrupt state.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "bikes.json"
    temp_path = output_dir / "bikes.json.tmp"

    # Wrap with metadata
    payload = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "count": len(bikes),
        "source": API_URL,
        "bikes": bikes,
    }

    try:
        temp_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        temp_path.replace(output_path)
        logger.info("Saved %d bikes to %s", len(bikes), output_path)
        return output_path
    except Exception:
        # Clean up temp file on failure
        temp_path.unlink(missing_ok=True)
        raise


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch and save EMotorad bike data from their public API.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output directory for bikes.json (default: scripts/)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and print data without saving to disk",
    )
    return parser.parse_args()


def main() -> int:
    """
    Main entry point.

    Returns 0 on success, 1 on failure.
    """
    args = parse_args()

    logger.info("=" * 50)
    logger.info("EMotorad Bike Data Fetcher — started")
    logger.info("=" * 50)

    try:
        # Step 1: Fetch raw data from API
        raw_data = fetch_bikes_from_api()

        # Step 2: Clean and transform
        bikes = clean_all_bikes(raw_data)

        if not bikes:
            logger.error("No bikes remaining after cleaning — aborting save")
            return 1

        # Step 3: Save or print
        if args.dry_run:
            print(json.dumps(bikes[:3], indent=2, ensure_ascii=False))
            logger.info("Dry run complete — printed first 3 bikes")
        else:
            output_dir = Path(args.output) if args.output else DEFAULT_OUTPUT_DIR
            save_to_json(bikes, output_dir)

        logger.info("Done — %d bikes processed", len(bikes))
        return 0

    except RuntimeError as exc:
        logger.error("Fatal: %s", exc)
        return 1
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        return 130


if __name__ == "__main__":
    sys.exit(main())
