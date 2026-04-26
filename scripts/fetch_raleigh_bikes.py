#!/usr/bin/env python3
"""
Raleigh / Suncross Bicycle Scraper
====================================
Scrapes all bicycle data from the Raleigh brand page on suncrossbikes.com.

Strategy:
  1. Fetch the brand listing page at /brands/raleigh-bicycles
  2. Extract all product cards (name, price, detail URL)
  3. Fetch each product detail page
  4. Extract title, description, specifications, images, colors, sizes
  5. Save to raleigh_bikes.json

Usage:
  cd scripts
  pip install -r requirements.txt
  python fetch_raleigh_bikes.py

Requirements:
  - Python 3.8+
  - requests, beautifulsoup4 (see requirements.txt)

Output:
  - raleigh_bikes.json (all bike data)
  - Console logs with progress
"""

import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://www.suncrossbikes.com"
LISTING_URL = f"{BASE_URL}/brands/raleigh-bicycles?b_id=94&fcid=16&fbid=&fcol=&fs=&s=1"
OUTPUT_FILE = Path(__file__).parent / "raleigh_bikes.json"
REQUEST_DELAY = 1.5  # seconds between product page requests

# Realistic browser headers
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Referer": BASE_URL,
}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("raleigh")

# ---------------------------------------------------------------------------
# HTTP Session with retry
# ---------------------------------------------------------------------------


def create_session() -> requests.Session:
    """Create a requests session with retry logic."""
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(
        max_retries=requests.adapters.Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
    )
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


# ---------------------------------------------------------------------------
# Step 1: Fetch listing page and extract product cards
# ---------------------------------------------------------------------------


def fetch_listing_page(session: requests.Session) -> list[dict]:
    """
    Fetch the Raleigh brand listing page and extract all product cards.
    All products are rendered server-side (no pagination needed).
    Returns a list of dicts with: name, price, url, thumbnail, colors.
    """
    log.info("Fetching listing page: %s", LISTING_URL)

    try:
        resp = session.get(LISTING_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.error("Failed to fetch listing page: %s", e)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    products = []

    # Product cards use class "prd prd--style2"
    cards = soup.find_all("div", class_="prd")
    log.info("Found %d product cards on listing page", len(cards))

    for card in cards:
        product = extract_card_data(card)
        if product:
            products.append(product)

    # Deduplicate by URL
    seen_urls = set()
    unique = []
    for p in products:
        if p["url"] not in seen_urls:
            seen_urls.add(p["url"])
            unique.append(p)

    log.info("Extracted %d unique products from listing", len(unique))
    return unique


def extract_card_data(card) -> dict | None:
    """Extract name, price, and URL from a single product card element."""
    # Product name and URL from div.prd-tag > a
    tag_div = card.find("div", class_="prd-tag")
    if not tag_div:
        return None

    link = tag_div.find("a", href=True)
    if not link:
        return None

    name = link.get_text(strip=True)
    href = link["href"]
    if not name or not href:
        return None

    # Normalize URL
    if href.startswith("/"):
        href = BASE_URL + href

    # Extract price from div.price-new
    price = None
    price_el = card.find("div", class_="price-new")
    if price_el:
        price = parse_price(price_el.get_text())

    # Also check for sale price (div.price-old holds original price)
    original_price = None
    price_old_el = card.find("div", class_="price-old")
    if price_old_el:
        original_price = parse_price(price_old_el.get_text())

    # Extract thumbnail image URL
    thumbnail = None
    img = card.find("img", class_="js-prd-img")
    if img:
        thumbnail = img.get("data-src") or img.get("src") or ""
        thumbnail = normalize_image_url(thumbnail)

    # Extract color options from color swatches
    colors = []
    swatch_list = card.find("ul", class_="color-swatch")
    if swatch_list:
        for swatch_link in swatch_list.find_all("a", class_="js-color-toggle"):
            color_name = swatch_link.get("title", "").strip()
            if color_name:
                colors.append(color_name)

    result = {
        "name": name.strip(),
        "price": price,
        "url": href,
    }
    if original_price:
        result["original_price"] = original_price
    if thumbnail:
        result["thumbnail"] = thumbnail
    if colors:
        result["colors"] = colors

    return result


# ---------------------------------------------------------------------------
# Step 2: Fetch product detail pages
# ---------------------------------------------------------------------------


def fetch_product_detail(session: requests.Session, url: str) -> dict | None:
    """Fetch a product detail page and extract all data."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=30)
        if resp.status_code == 404:
            log.warning("  404 Not Found: %s", url)
            return None
        resp.raise_for_status()
        return parse_product_detail(resp.text, url)
    except requests.RequestException as e:
        log.error("  Failed to fetch %s: %s", url, e)
        return None
    except Exception as e:
        log.error("  Parse error for %s: %s: %s", url, type(e).__name__, e)
        return None


def parse_product_detail(html: str, url: str) -> dict:
    """Parse a product detail page and extract all product data."""
    soup = BeautifulSoup(html, "html.parser")

    return {
        "url": url,
        "name": extract_name(soup),
        "sku": extract_sku(soup),
        "price": extract_detail_price(soup),
        "brand": extract_brand(soup),
        "availability": extract_availability(soup),
        "colors": extract_colors(soup),
        "sizes": extract_sizes(soup),
        "description": extract_description(soup),
        "specifications": extract_specifications(soup),
        "other_features": extract_other_features(soup),
        "images": extract_images(soup),
    }


# ---------------------------------------------------------------------------
# Detail page extraction helpers
# ---------------------------------------------------------------------------


def extract_name(soup: BeautifulSoup) -> str:
    """Extract product name from h1.prd-block_title."""
    h1 = soup.find("h1", class_="prd-block_title")
    if h1:
        return h1.get_text(strip=True)

    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)

    return "Unknown"


def extract_sku(soup: BeautifulSoup) -> str:
    """Extract SKU from span[data-sku]."""
    sku_el = soup.find("span", attrs={"data-sku": True})
    if sku_el:
        return sku_el.get_text(strip=True)
    return ""


def extract_detail_price(soup: BeautifulSoup) -> float | None:
    """Extract price from the detail page."""
    price_el = soup.find("div", class_="prd-block_price--actual")
    if price_el:
        return parse_price(price_el.get_text())

    price_el = soup.find("div", class_="price-new")
    if price_el:
        return parse_price(price_el.get_text())

    return None


def extract_brand(soup: BeautifulSoup) -> str:
    """Extract brand name from the info box."""
    info_box = soup.find("div", class_="prd-block_info-box")
    if info_box:
        for p in info_box.find_all("p"):
            if "brand" in p.get_text().lower():
                link = p.find("a")
                if link:
                    return link.get_text(strip=True).rstrip(".")
                text = p.get_text(strip=True)
                match = re.search(r"Brand:\s*(.+)", text, re.I)
                if match:
                    return match.group(1).strip().rstrip(".")
    return ""


def extract_availability(soup: BeautifulSoup) -> str:
    """Extract availability status."""
    stock_el = soup.find("span", class_="prd-in-stock")
    if stock_el:
        return stock_el.get_text(strip=True)

    oos = soup.find("span", class_="prd-out-stock")
    if oos:
        return "Out of stock"

    return "Unknown"


def extract_colors(soup: BeautifulSoup) -> list[str]:
    """Extract available color options from the color selector."""
    colors = []
    seen = set()

    color_select = soup.find("select", id="SingleOptionSelector-0")
    if color_select:
        for option in color_select.find_all("option"):
            color = option.get_text(strip=True)
            if color and color.lower() not in seen:
                colors.append(color)
                seen.add(color.lower())

    if not colors:
        color_div = soup.find("div", class_="prd-color")
        if color_div:
            for link in color_div.find_all("a", attrs={"data-original-title": True}):
                color = link["data-original-title"].strip()
                if color and color.lower() not in seen:
                    colors.append(color)
                    seen.add(color.lower())

    return colors


def extract_sizes(soup: BeautifulSoup) -> list[dict]:
    """Extract available size options with prices and stock status."""
    sizes = []

    size_list = soup.find("ul", id="size-listing")
    if size_list:
        for li in size_list.find_all("li"):
            link = li.find("a", attrs={"data-value": True})
            if not link:
                continue

            size_name = ""
            value_span = link.find("span", class_="value")
            if value_span:
                size_name = value_span.get_text(strip=True)
            else:
                size_name = link.get_text(strip=True)

            size_data = {"size": size_name}

            price_str = link.get("data-price")
            if price_str:
                try:
                    size_data["price"] = float(price_str)
                except (ValueError, TypeError):
                    pass

            sale_str = link.get("data-saleprice")
            if sale_str and sale_str != "0":
                try:
                    size_data["sale_price"] = float(sale_str)
                except (ValueError, TypeError):
                    pass

            stock_str = link.get("data-stock")
            size_data["in_stock"] = stock_str == "1"

            sizes.append(size_data)

    if not sizes:
        size_select = soup.find("select", id="SingleOptionSelector-1")
        if size_select:
            for option in size_select.find_all("option"):
                size_name = option.get_text(strip=True)
                if size_name:
                    sizes.append({"size": size_name})

    return sizes


def extract_description(soup: BeautifulSoup) -> str:
    """Extract product description from the page."""
    meta = soup.find("meta", attrs={"name": "description"})
    if meta and meta.get("content"):
        return meta["content"].strip()

    og_desc = soup.find("meta", attrs={"property": "og:description"})
    if og_desc and og_desc.get("content"):
        return og_desc["content"].strip()

    return ""


def extract_specifications(soup: BeautifulSoup) -> dict:
    """
    Extract specifications from the Specifications tab (#Tab1).
    Structure: table.table-striped > tr > td, where each td contains:
      <img ...><b>Key</b><br>Value
    """
    specs = {}

    tab1 = soup.find("div", id="Tab1")
    if not tab1:
        return specs

    table = tab1.find("table", class_="table-striped")
    if not table:
        table = tab1.find("table")

    if not table:
        return specs

    for td in table.find_all("td"):
        bold = td.find("b")
        if not bold:
            continue

        key = bold.get_text(strip=True)
        if not key:
            continue

        # Get all text lines from the td cell
        td_text = td.get_text(separator="\n", strip=True)
        lines = [line.strip() for line in td_text.split("\n") if line.strip()]

        # Find the key line and take the value after it
        value = ""
        for i, line in enumerate(lines):
            if line == key and i + 1 < len(lines):
                value = lines[i + 1]
                break

        # Fallback: take all text except the key
        if not value:
            remaining = [l for l in lines if l != key]
            if remaining:
                value = remaining[-1]

        if key and value:
            specs[key] = value

    return specs


def extract_other_features(soup: BeautifulSoup) -> str:
    """Extract content from the 'Other Features' tab (#Tab2)."""
    tab2 = soup.find("div", id="Tab2")
    if tab2:
        text = tab2.get_text(strip=True)
        if text:
            return text
    return ""


def extract_images(soup: BeautifulSoup) -> list[str]:
    """
    Extract all product gallery image URLs from #prdMainImage.
    Images use data-src with relative paths like 'uploads/bike-gallery/...'.
    """
    images = []
    seen = set()

    gallery = soup.find("div", id="prdMainImage")
    if gallery:
        for img in gallery.find_all("img"):
            # Prefer data-zoom-image (highest res), then data-src
            url = img.get("data-zoom-image") or img.get("data-src") or img.get("src") or ""
            url = normalize_image_url(url)
            if url and is_product_image(url) and url not in seen:
                images.append(url)
                seen.add(url)

    # Fallback: any bike-gallery images on the page
    if not images:
        for img in soup.find_all("img"):
            url = img.get("data-src") or img.get("src") or ""
            url = normalize_image_url(url)
            if url and "bike-gallery" in url and "/thumb/" not in url and url not in seen:
                images.append(url)
                seen.add(url)

    return images


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def parse_price(text) -> float | None:
    """Parse a price from text like 'INR 20,085.00' or '₹29,999'."""
    if text is None:
        return None
    text = str(text).strip()
    cleaned = re.sub(r"(INR|₹|Rs\.?)\s*", "", text, flags=re.I)
    cleaned = cleaned.replace(",", "").strip()
    match = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if match:
        return float(match.group(1))
    return None


def normalize_image_url(url: str) -> str:
    """Normalize a possibly-relative image URL to absolute."""
    if not url:
        return ""
    url = url.strip()
    if url.startswith("data:"):
        return ""
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return BASE_URL + url
    if not url.startswith("http"):
        return BASE_URL + "/" + url
    return url


def is_product_image(url: str) -> bool:
    """Check if URL is a product image (not a placeholder/icon/brand logo)."""
    if not url:
        return False
    url_lower = url.lower()

    if "bike-gallery" in url_lower and "/thumb/" not in url_lower:
        return True

    if "uploads/bikes/" in url_lower:
        return True

    return False


# ---------------------------------------------------------------------------
# Step 3: Save results
# ---------------------------------------------------------------------------


def save_results(products: list[dict]) -> bool:
    """Save products to JSON. Only overwrites if we have data."""
    if not products:
        log.error("No products to save. Output file not modified.")
        return False

    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": LISTING_URL,
        "count": len(products),
        "products": products,
    }

    OUTPUT_FILE.write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    log.info("Saved %d products to %s", len(products), OUTPUT_FILE)
    return True


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------


def main() -> int:
    log.info("=" * 60)
    log.info("Raleigh / Suncross Bicycle Scraper")
    log.info("Source: %s", LISTING_URL)
    log.info("=" * 60)

    session = create_session()

    # ── Phase 1: Get product list from listing page ──
    log.info("")
    log.info("Phase 1: Fetching listing page")
    log.info("-" * 50)

    listings = fetch_listing_page(session)
    if not listings:
        log.error("No products found on listing page. Aborting.")
        return 1

    for item in listings:
        price_str = f"INR {item['price']:,.2f}" if item.get("price") else "Price N/A"
        log.info("  %-45s %s", item["name"], price_str)

    # ── Phase 2: Fetch each product detail page ──
    log.info("")
    log.info("Phase 2: Fetching product detail pages")
    log.info("-" * 50)

    products = []
    total = len(listings)

    for i, listing in enumerate(listings, 1):
        log.info("[%d/%d] %s", i, total, listing["name"])
        detail = fetch_product_detail(session, listing["url"])

        if detail:
            merged = {
                "name": detail.get("name") or listing["name"],
                "sku": detail.get("sku", ""),
                "price": detail.get("price") or listing.get("price"),
                "brand": detail.get("brand", ""),
                "availability": detail.get("availability", "Unknown"),
                "url": listing["url"],
                "colors": detail.get("colors", []),
                "sizes": detail.get("sizes", []),
                "description": detail.get("description", ""),
                "specifications": detail.get("specifications", {}),
                "other_features": detail.get("other_features", ""),
                "images": detail.get("images", []),
            }

            if listing.get("original_price"):
                merged["original_price"] = listing["original_price"]

            products.append(merged)

            spec_count = len(merged["specifications"])
            img_count = len(merged["images"])
            color_count = len(merged["colors"])
            price_str = f"INR {merged['price']:,.2f}" if merged.get("price") else "N/A"
            log.info(
                "  -> %s | %d specs | %d images | %d colors",
                price_str, spec_count, img_count, color_count,
            )
        else:
            products.append({
                "name": listing["name"],
                "price": listing.get("price"),
                "url": listing["url"],
                "colors": listing.get("colors", []),
                "sizes": [],
                "description": "",
                "specifications": {},
                "other_features": "",
                "images": [listing["thumbnail"]] if listing.get("thumbnail") else [],
            })
            log.warning("  -> Detail fetch failed, using listing data only")

        if i < total:
            time.sleep(REQUEST_DELAY)

    # ── Phase 3: Save results ──
    log.info("")
    log.info("Phase 3: Saving results")
    log.info("-" * 50)

    success = save_results(products)

    # ── Summary ──
    log.info("")
    log.info("=" * 60)
    if success:
        log.info("SUCCESS: Scraped %d bicycles from Suncross/Raleigh", len(products))
        log.info("")

        with_specs = sum(1 for p in products if p.get("specifications"))
        with_images = sum(1 for p in products if p.get("images"))
        with_colors = sum(1 for p in products if p.get("colors"))
        total_images = sum(len(p.get("images", [])) for p in products)

        log.info("  Products with specs:  %d / %d", with_specs, len(products))
        log.info("  Products with images: %d / %d (total: %d)", with_images, len(products), total_images)
        log.info("  Products with colors: %d / %d", with_colors, len(products))
        log.info("")

        for p in products:
            price_str = f"INR {p['price']:,.2f}" if p.get("price") else "N/A"
            spec_count = len(p.get("specifications", {}))
            img_count = len(p.get("images", []))
            log.info(
                "  %-40s | %-14s | %d specs | %d imgs",
                p["name"][:40], price_str, spec_count, img_count,
            )
    else:
        log.error("FAILED: No products were scraped")
        log.error("The site structure may have changed.")
    log.info("=" * 60)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
