#!/usr/bin/env python3
"""
Stryder E-Bikes Data Fetcher
=============================

Fetches electric bicycle product data from the Stryder Bikes Shopify store
using their public collection JSON API and saves it as a clean, structured
JSON file for local use.

API Endpoint: https://stryderbikes.com/collections/e-bikes/products.json?limit=250
Collection:   https://stryderbikes.com/collections/e-bikes

Usage:
    python scripts/fetch_stryder_ebikes.py                # Fetch and save to scripts/stryder_ebikes.json
    python scripts/fetch_stryder_ebikes.py --output data   # Save to data/stryder_ebikes.json
    python scripts/fetch_stryder_ebikes.py --dry-run       # Fetch and print without saving

Schedule daily with Task Scheduler (Windows):
    Action: python
    Arguments: scripts/fetch_stryder_ebikes.py
    Start in: C:\\path\\to\\project

Requirements:
    pip install -r scripts/requirements.txt

Example output format (stryder_ebikes.json):
    {
      "fetched_at": "2026-02-11T10:30:00+00:00",
      "count": 12,
      "source": "https://stryderbikes.com/collections/e-bikes/products.json",
      "products": [
        {
          "id": 7654321098765,
          "title": "Stryder Zeeta Plus",
          "handle": "stryder-zeeta-plus",
          "description": "The Zeeta Plus electric bicycle...",
          "price": 29999.00,
          "compare_at_price": 34999.00,
          "available": true,
          "main_image": "https://cdn.shopify.com/.../image.jpg",
          "colors": ["Forest Green", "Gray"],
          "variants": [
            {
              "id": 47768496931068,
              "title": "Forest Green",
              "sku": "6015000061",
              "price": 38995.00,
              "compare_at_price": null,
              "available": true,
              "image": "https://cdn.shopify.com/.../ForestGreen.jpg"
            }
          ],
          "gallery_images": [
            "https://cdn.shopify.com/.../image1.jpg",
            "https://cdn.shopify.com/.../image2.jpg"
          ]
        }
      ]
    }
"""

import argparse
import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://stryderbikes.com/collections/e-bikes/products.json"
PRODUCTS_PER_PAGE = 250
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
# HTML stripping
# ---------------------------------------------------------------------------

_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"\s+")


def strip_html(html: str) -> str:
    """
    Remove HTML tags from a string and normalize whitespace.

    Handles HTML entities (&amp; &nbsp; etc.) via html.unescape.
    """
    if not html:
        return ""
    text = _TAG_RE.sub(" ", html)
    text = unescape(text)
    text = _WHITESPACE_RE.sub(" ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Data fetching with pagination
# ---------------------------------------------------------------------------


def _request_page(page: int) -> list[dict]:
    """
    Fetch a single page of products from the Shopify collection endpoint.

    Returns the products array for that page.
    Raises RuntimeError after MAX_RETRIES failures.
    """
    headers = {
        "Accept": "application/json",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
    }
    params = {"limit": PRODUCTS_PER_PAGE, "page": page}
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(
                "Fetching page %d (attempt %d/%d)...", page, attempt, MAX_RETRIES
            )
            response = requests.get(
                BASE_URL, headers=headers, params=params, timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()

            data = response.json()

            if not isinstance(data, dict) or "products" not in data:
                raise ValueError(
                    f"Unexpected response structure: missing 'products' key"
                )

            products = data["products"]
            if not isinstance(products, list):
                raise ValueError(
                    f"Expected 'products' to be an array, got {type(products).__name__}"
                )

            logger.info(
                "Page %d: fetched %d products (%d bytes)",
                page,
                len(products),
                len(response.content),
            )
            return products

        except requests.exceptions.ConnectionError as exc:
            last_error = exc
            logger.warning("Connection error: %s", exc)
        except requests.exceptions.Timeout as exc:
            last_error = exc
            logger.warning("Request timed out after %ds", REQUEST_TIMEOUT)
        except requests.exceptions.HTTPError as exc:
            last_error = exc
            logger.warning("HTTP %d: %s", response.status_code, response.reason)
            # Don't retry on 4xx client errors (except 429)
            if response.status_code != 429 and 400 <= response.status_code < 500:
                break
        except (ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            logger.warning("Invalid response: %s", exc)

        if attempt < MAX_RETRIES:
            delay = RETRY_DELAY * attempt  # Incremental backoff
            logger.info("Retrying in %ds...", delay)
            time.sleep(delay)

    raise RuntimeError(
        f"Failed to fetch page {page} after {MAX_RETRIES} attempts: {last_error}"
    )


def fetch_all_products() -> list[dict]:
    """
    Fetch all products from the Shopify collection, handling pagination.

    Shopify collection endpoints use page-based pagination (?page=1&limit=250).
    Keeps fetching until an empty page is returned.
    """
    all_products = []
    page = 1

    while True:
        products = _request_page(page)

        if not products:
            logger.info("Page %d is empty — pagination complete", page)
            break

        all_products.extend(products)
        logger.info("Running total: %d products", len(all_products))

        # If we got fewer than the limit, this is the last page
        if len(products) < PRODUCTS_PER_PAGE:
            break

        page += 1

        # Be polite to the server between pages
        time.sleep(1)

    if not all_products:
        raise RuntimeError("No products found in the e-bikes collection")

    logger.info("Fetched %d total products across %d page(s)", len(all_products), page)
    return all_products


# ---------------------------------------------------------------------------
# Data cleaning & transformation
# ---------------------------------------------------------------------------


def _extract_colors(options: list[dict]) -> list[str]:
    """
    Extract color names from the Shopify options array.

    Shopify stores color as an option named "Color" (or "Colour").
    Returns an empty list if no color option exists.
    """
    for option in options:
        name = (option.get("name") or "").strip().lower()
        if name in ("color", "colour"):
            return option.get("values") or []
    return []


def _extract_variants(raw_variants: list[dict]) -> list[dict]:
    """
    Extract cleaned variant data from the Shopify variants array.

    Each variant includes: id, title, sku, price, compare_at_price,
    available, and featured image URL.
    """
    variants = []
    for v in raw_variants:
        featured_image = v.get("featured_image") or {}
        image_url = featured_image.get("src") if isinstance(featured_image, dict) else None

        variants.append({
            "id": v.get("id"),
            "title": (v.get("title") or "").strip(),
            "sku": (v.get("sku") or "").strip(),
            "price": _parse_price(v.get("price")),
            "compare_at_price": _parse_price(v.get("compare_at_price")),
            "available": bool(v.get("available", False)),
            "image": image_url,
        })
    return variants


def clean_product(raw: dict) -> dict:
    """
    Transform a single raw Shopify product object into our clean format.

    Extracts:
      - id, title, handle
      - description (HTML stripped)
      - price & compare_at_price from first variant
      - available (stock status)
      - main_image & gallery_images
    """
    # Basic fields
    product_id = raw.get("id")
    title = (raw.get("title") or "").strip()
    handle = (raw.get("handle") or "").strip()
    description = strip_html(raw.get("body_html") or "")

    # Price from first variant
    raw_variants = raw.get("variants") or []
    first_variant = raw_variants[0] if raw_variants else {}

    price = _parse_price(first_variant.get("price"))
    compare_at_price = _parse_price(first_variant.get("compare_at_price"))

    # Availability: true if any variant is available
    available = any(v.get("available", False) for v in raw_variants)

    # Colors from options
    colors = _extract_colors(raw.get("options") or [])

    # Cleaned variants with per-color price, stock, SKU, and image
    variants = _extract_variants(raw_variants)

    # Images
    images = raw.get("images") or []
    image_urls = [img["src"] for img in images if img.get("src")]
    main_image = image_urls[0] if image_urls else None

    return {
        "id": product_id,
        "title": title,
        "handle": handle,
        "description": description,
        "price": price,
        "compare_at_price": compare_at_price,
        "available": available,
        "colors": colors,
        "variants": variants,
        "main_image": main_image,
        "gallery_images": image_urls,
    }


def _parse_price(value) -> float | None:
    """
    Parse a Shopify price string ("29999.00") into a float.

    Returns None if the value is missing, empty, or unparseable.
    """
    if value is None or value == "":
        return None
    try:
        parsed = float(value)
        return parsed if parsed > 0 else None
    except (ValueError, TypeError):
        return None


def clean_all_products(raw_products: list[dict]) -> list[dict]:
    """
    Clean and transform the full list of raw Shopify products.

    Sorts by title alphabetically for consistent output.
    """
    cleaned = []
    skipped = 0

    for raw in raw_products:
        try:
            cleaned.append(clean_product(raw))
        except Exception as exc:
            title = raw.get("title", "unknown")
            logger.warning("Skipping product '%s': %s", title, exc)
            skipped += 1

    # Sort alphabetically by title
    cleaned.sort(key=lambda p: p.get("title", "").lower())

    logger.info(
        "Cleaned %d products (%d skipped)", len(cleaned), skipped
    )
    return cleaned


# ---------------------------------------------------------------------------
# File output
# ---------------------------------------------------------------------------


def save_to_json(products: list[dict], output_dir: Path) -> Path:
    """
    Atomically save cleaned product data to stryder_ebikes.json.

    Writes to a temporary file first, then renames — so the main file is
    never left in a partial/corrupt state.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "stryder_ebikes.json"
    temp_path = output_dir / "stryder_ebikes.json.tmp"

    payload = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "count": len(products),
        "source": BASE_URL,
        "products": products,
    }

    try:
        temp_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        temp_path.replace(output_path)
        logger.info("Saved %d products to %s", len(products), output_path)
        return output_path
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch Stryder e-bike data from their Shopify store.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output directory for stryder_ebikes.json (default: scripts/)",
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

    logger.info("=" * 55)
    logger.info("Stryder E-Bikes Data Fetcher — started")
    logger.info("=" * 55)

    try:
        # Step 1: Fetch all pages of products
        raw_products = fetch_all_products()

        # Step 2: Clean and transform
        products = clean_all_products(raw_products)

        if not products:
            logger.error("No products remaining after cleaning — aborting save")
            return 1

        # Step 3: Save or print
        if args.dry_run:
            print(json.dumps(products[:3], indent=2, ensure_ascii=False))
            logger.info("Dry run complete — printed first 3 of %d products", len(products))
        else:
            output_dir = Path(args.output) if args.output else DEFAULT_OUTPUT_DIR
            save_to_json(products, output_dir)

        logger.info("Done — %d products processed", len(products))
        return 0

    except RuntimeError as exc:
        logger.error("Fatal: %s", exc)
        return 1
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        return 130


if __name__ == "__main__":
    sys.exit(main())
