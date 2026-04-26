#!/usr/bin/env python3
"""
Aoki Shopify Product Data Fetcher
===================================

Fetches all product data from the Aoki Shopify store public JSON API
and saves it as a clean, structured JSON file.

API Endpoint: https://aoki.co.in/products.json

Usage:
    python scripts/fetch_aoki_products.py                    # Fetch and save to scripts/products.json
    python scripts/fetch_aoki_products.py --output data      # Save to data/products.json
    python scripts/fetch_aoki_products.py --dry-run          # Fetch and print first 3 products
    python scripts/fetch_aoki_products.py --dry-run --all    # Fetch and print all products

Requirements:
    pip install -r scripts/requirements.txt
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

BASE_URL = "https://aoki.co.in"
PRODUCTS_ENDPOINT = f"{BASE_URL}/products.json"
PAGE_LIMIT = 250          # Shopify max per page
REQUEST_TIMEOUT = 30      # seconds
MAX_RETRIES = 3
RETRY_DELAY = 5           # seconds between retries
RATE_LIMIT_DELAY = 1      # seconds between paginated requests
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

# Pre-compiled regex for stripping HTML tags
HTML_TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")


def strip_html(html: str) -> str:
    """
    Remove HTML tags from a string and return clean plain text.

    Handles:
    - <style> and <script> blocks (removes content entirely)
    - All HTML tags (<p>, <br>, <div>, <span>, etc.)
    - HTML entities (&amp;, &nbsp;, &#39;, etc.)
    - Excess whitespace left after tag removal
    """
    if not html:
        return ""

    # Remove <style>...</style> and <script>...</script> blocks entirely
    text = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.IGNORECASE | re.DOTALL)

    # Replace <br> and block-level tags with newlines before stripping
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</(p|div|li|h[1-6])>", "\n", text, flags=re.IGNORECASE)

    # Strip all remaining HTML tags
    text = HTML_TAG_RE.sub("", text)

    # Decode HTML entities (&amp; → &, &nbsp; → space, etc.)
    text = unescape(text)

    # Normalize whitespace: collapse runs of spaces (preserve newlines)
    lines = text.split("\n")
    lines = [WHITESPACE_RE.sub(" ", line).strip() for line in lines]

    # Remove empty lines and join
    text = "\n".join(line for line in lines if line)

    return text.strip()


# ---------------------------------------------------------------------------
# Data fetching with pagination
# ---------------------------------------------------------------------------


def fetch_page(page: int, session: requests.Session) -> list[dict]:
    """
    Fetch a single page of products from the Shopify API.

    Args:
        page: Page number (1-indexed).
        session: Reusable requests session for connection pooling.

    Returns:
        List of raw product dicts from that page.

    Raises:
        requests.exceptions.RequestException on network errors.
        ValueError if response format is unexpected.
    """
    params = {"limit": PAGE_LIMIT, "page": page}

    response = session.get(
        PRODUCTS_ENDPOINT,
        params=params,
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()

    data = response.json()

    # Shopify wraps products in a {"products": [...]} envelope
    if not isinstance(data, dict) or "products" not in data:
        raise ValueError(
            f"Unexpected response format on page {page}: "
            f"expected object with 'products' key, got {type(data).__name__}"
        )

    products = data["products"]

    if not isinstance(products, list):
        raise ValueError(
            f"Expected 'products' to be an array, got {type(products).__name__}"
        )

    return products


def fetch_all_products() -> list[dict]:
    """
    Fetch ALL products from the Shopify store, handling pagination.

    Shopify's /products.json supports up to 250 products per page.
    We keep requesting pages until we get an empty result.

    Returns:
        Complete list of raw product dicts.

    Raises:
        RuntimeError if all retries are exhausted on any page.
    """
    all_products = []
    page = 1

    # Use a session for connection reuse across pages
    session = requests.Session()
    session.headers.update({
        "Accept": "application/json",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
    })

    while True:
        last_error = None

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info(
                    "Fetching page %d (attempt %d/%d)...",
                    page, attempt, MAX_RETRIES,
                )
                products = fetch_page(page, session)

                # Empty page means we've reached the end
                if not products:
                    logger.info(
                        "Page %d returned 0 products — pagination complete.", page
                    )
                    session.close()
                    return all_products

                all_products.extend(products)
                logger.info(
                    "Page %d: fetched %d products (total so far: %d)",
                    page, len(products), len(all_products),
                )

                # If we got fewer than the limit, this is the last page
                if len(products) < PAGE_LIMIT:
                    logger.info("Last page reached (received %d < %d limit).", len(products), PAGE_LIMIT)
                    session.close()
                    return all_products

                # Success — break retry loop and move to next page
                last_error = None
                break

            except requests.exceptions.ConnectionError as exc:
                last_error = exc
                logger.warning("Connection error on page %d: %s", page, exc)
            except requests.exceptions.Timeout as exc:
                last_error = exc
                logger.warning("Timeout on page %d after %ds", page, REQUEST_TIMEOUT)
            except requests.exceptions.HTTPError as exc:
                last_error = exc
                logger.warning("HTTP error on page %d: %s", page, exc)
            except (ValueError, json.JSONDecodeError) as exc:
                last_error = exc
                logger.warning("Invalid response on page %d: %s", page, exc)

            if attempt < MAX_RETRIES:
                logger.info("Retrying page %d in %ds...", page, RETRY_DELAY)
                time.sleep(RETRY_DELAY)

        # If we exhausted retries on this page, abort
        if last_error is not None:
            session.close()
            raise RuntimeError(
                f"Failed to fetch page {page} after {MAX_RETRIES} attempts: {last_error}"
            )

        # Rate-limit: brief pause between pages to be polite
        page += 1
        time.sleep(RATE_LIMIT_DELAY)

    # Unreachable, but satisfies type checkers
    session.close()
    return all_products


# ---------------------------------------------------------------------------
# Data cleaning & transformation
# ---------------------------------------------------------------------------


def extract_price(variants: list[dict]) -> float | None:
    """
    Extract the selling price from the first variant.

    Returns None if no variants or price is missing.
    """
    if not variants:
        return None

    price_str = variants[0].get("price")
    if price_str is None:
        return None

    try:
        return float(price_str)
    except (ValueError, TypeError):
        return None


def extract_compare_price(variants: list[dict]) -> float | None:
    """
    Extract the compare-at price (MRP) from the first variant.

    Shopify uses compare_at_price for the original/higher price.
    Returns None if not set (meaning no discount).
    """
    if not variants:
        return None

    compare_str = variants[0].get("compare_at_price")
    if not compare_str:
        return None

    try:
        return float(compare_str)
    except (ValueError, TypeError):
        return None


def check_availability(variants: list[dict]) -> bool:
    """
    Check if any variant is available (in stock).

    Returns True if at least one variant has available=True.
    """
    if not variants:
        return False

    return any(v.get("available", False) for v in variants)


def extract_main_image(images: list[dict]) -> str | None:
    """Get the main (first) image URL from the images array."""
    if not images:
        return None
    return images[0].get("src")


def extract_gallery_images(images: list[dict]) -> list[str]:
    """Extract all image URLs from the images array."""
    if not images:
        return []
    return [img["src"] for img in images if img.get("src")]


def extract_variants(variants: list[dict]) -> list[dict]:
    """
    Extract cleaned variant data for every variant.

    Each variant includes: id, title, sku, price, compare_at_price,
    available, option values, weight, and inventory info.
    """
    if not variants:
        return []

    cleaned = []
    for v in variants:
        variant = {
            "id": v.get("id"),
            "title": (v.get("title") or "").strip(),
            "sku": (v.get("sku") or "").strip(),
            "price": None,
            "compare_at_price": None,
            "available": v.get("available", False),
        }

        # Parse price
        try:
            variant["price"] = float(v["price"]) if v.get("price") else None
        except (ValueError, TypeError):
            pass

        # Parse compare_at_price
        try:
            variant["compare_at_price"] = (
                float(v["compare_at_price"])
                if v.get("compare_at_price")
                else None
            )
        except (ValueError, TypeError):
            pass

        # Collect option values (option1, option2, option3)
        options = []
        for key in ("option1", "option2", "option3"):
            val = v.get(key)
            if val and val.strip().lower() != "default title":
                options.append(val.strip())
        if options:
            variant["options"] = options

        # Weight info (if present)
        weight = v.get("weight")
        if weight:
            variant["weight"] = weight
            variant["weight_unit"] = v.get("weight_unit", "kg")

        cleaned.append(variant)

    return cleaned


def extract_tags(raw: dict) -> list[str]:
    """Extract and clean product tags."""
    tags_str = raw.get("tags", "")
    if not tags_str:
        return []
    if isinstance(tags_str, list):
        return [t.strip() for t in tags_str if t.strip()]
    return [t.strip() for t in tags_str.split(",") if t.strip()]


def clean_product(raw: dict) -> dict:
    """
    Transform a single raw Shopify product into our clean format.

    Maps Shopify fields to a consistent, frontend-friendly structure.
    """
    variants = raw.get("variants") or []
    images = raw.get("images") or []

    return {
        "id": raw.get("id"),
        "name": (raw.get("title") or "").strip(),
        "slug": (raw.get("handle") or "").strip(),
        "description": strip_html(raw.get("body_html") or ""),
        "product_type": (raw.get("product_type") or "").strip(),
        "vendor": (raw.get("vendor") or "").strip(),
        "tags": extract_tags(raw),
        "price": extract_price(variants),
        "compare_price": extract_compare_price(variants),
        "in_stock": check_availability(variants),
        "variants": extract_variants(variants),
        "main_image": extract_main_image(images),
        "gallery_images": extract_gallery_images(images),
        "created_at": raw.get("created_at"),
        "updated_at": raw.get("updated_at"),
        "published_at": raw.get("published_at"),
    }


def clean_all_products(raw_products: list[dict]) -> list[dict]:
    """
    Clean and transform the full list of raw Shopify products.

    Skips products that fail to parse and logs warnings.
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

    logger.info(
        "Cleaned %d products (%d skipped due to errors)",
        len(cleaned), skipped,
    )
    return cleaned


# ---------------------------------------------------------------------------
# File output
# ---------------------------------------------------------------------------


def save_to_json(products: list[dict], output_dir: Path) -> Path:
    """
    Atomically save cleaned product data to products.json.

    Writes to a temporary file first, then renames — so the main file
    is never left in a partial/corrupt state if the process crashes.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "products.json"
    temp_path = output_dir / "products.json.tmp"

    payload = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": PRODUCTS_ENDPOINT,
        "count": len(products),
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
        description="Fetch product data from Aoki Shopify store API.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Output directory for products.json (default: scripts/)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and print data without saving to disk",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="In dry-run mode, print all products instead of first 3",
    )
    return parser.parse_args()


def main() -> int:
    """
    Main entry point. Returns 0 on success, 1 on failure.
    """
    args = parse_args()

    logger.info("=" * 55)
    logger.info("Aoki Shopify Product Fetcher — started")
    logger.info("API: %s", PRODUCTS_ENDPOINT)
    logger.info("=" * 55)

    try:
        # Step 1: Fetch all pages of products
        raw_products = fetch_all_products()

        if not raw_products:
            logger.error("API returned no products — aborting")
            return 1

        logger.info("Total raw products fetched: %d", len(raw_products))

        # Step 2: Clean and transform
        products = clean_all_products(raw_products)

        if not products:
            logger.error("No products remaining after cleaning — aborting save")
            return 1

        # Step 3: Save or print
        if args.dry_run:
            display = products if args.all else products[:3]
            print(json.dumps(display, indent=2, ensure_ascii=False))
            logger.info(
                "Dry run complete — printed %d of %d products",
                len(display), len(products),
            )
        else:
            output_dir = (
                Path(args.output) if args.output else DEFAULT_OUTPUT_DIR
            )
            save_to_json(products, output_dir)

        # Summary
        in_stock = sum(1 for p in products if p["in_stock"])
        logger.info("Summary: %d products (%d in stock, %d out of stock)",
                     len(products), in_stock, len(products) - in_stock)
        return 0

    except RuntimeError as exc:
        logger.error("Fatal: %s", exc)
        return 1
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        return 130


if __name__ == "__main__":
    sys.exit(main())
