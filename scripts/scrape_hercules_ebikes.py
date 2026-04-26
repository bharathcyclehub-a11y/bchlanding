"""
Hercules E-Bike Scraper
========================
Scrapes all e-bike products from https://hercules.in/ebike/

Requirements:
    pip install -r requirements.txt

Usage:
    python scripts/scrape_hercules_ebikes.py

Output:
    scripts/hercules_ebikes.json

Notes:
    - Uses requests + BeautifulSoup (no Selenium)
    - Adds 1-2 second delays between requests
    - Browser-like headers to avoid blocks
    - Logs progress to console
"""

import json
import logging
import re
import time
import random
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://hercules.in"
LISTING_URL = f"{BASE_URL}/ebike/"
OUTPUT_FILE = Path(__file__).parent / "hercules_ebikes.json"

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

REQUEST_TIMEOUT = 30  # seconds
DELAY_MIN = 1.0  # seconds between product page requests
DELAY_MAX = 2.0

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def fetch_page(url: str, session: requests.Session) -> BeautifulSoup | None:
    """Fetch a URL and return parsed BeautifulSoup, or None on failure."""
    try:
        resp = session.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as exc:
        log.error("Failed to fetch %s: %s", url, exc)
        return None


def polite_delay():
    """Sleep for a random interval between DELAY_MIN and DELAY_MAX."""
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))


# ---------------------------------------------------------------------------
# STEP 1 — Listing page: collect product names & URLs
# ---------------------------------------------------------------------------


def scrape_listing(session: requests.Session) -> list[dict]:
    """
    Parse the e-bike listing page and return a list of
    {"name": ..., "url": ...} dicts.
    """
    log.info("Fetching listing page: %s", LISTING_URL)
    soup = fetch_page(LISTING_URL, session)
    if soup is None:
        return []

    products = []
    seen_urls = set()

    # WooCommerce uses ul.products > li.product with <a> links
    product_items = soup.select("ul.products li.product")

    if not product_items:
        # Fallback: try any li with class containing "product"
        product_items = soup.select("li[class*='product']")

    for item in product_items:
        link = item.select_one("a[href*='/all-bikes/']") or item.find("a", href=True)
        if not link:
            continue

        url = urljoin(BASE_URL, link.get("href", "").strip())
        if url in seen_urls or url == LISTING_URL:
            continue
        seen_urls.add(url)

        # Product name: try h2/h3 inside the card, then the link text
        name_tag = item.select_one("h2, h3, .woocommerce-loop-product__title")
        name = (name_tag.get_text(strip=True) if name_tag
                else link.get_text(strip=True))

        if name and url:
            products.append({"name": name, "url": url})

    log.info("Found %d product(s) on listing page", len(products))
    return products


# ---------------------------------------------------------------------------
# STEP 2 — Product detail pages
# ---------------------------------------------------------------------------


def extract_title(soup: BeautifulSoup) -> str:
    """Extract the product title from a detail page."""
    # Try common WooCommerce selectors
    for selector in [
        "h1.product_title",
        "h1.entry-title",
        ".product_title",
        "h1",
        "h2.heading",
    ]:
        tag = soup.select_one(selector)
        if tag and tag.get_text(strip=True):
            return tag.get_text(strip=True)
    return ""


def extract_description(soup: BeautifulSoup) -> str:
    """Extract the product description."""
    for selector in [
        ".woocommerce-product-details__short-description",
        ".product-short-description",
        ".entry-summary .description",
        '[itemprop="description"]',
    ]:
        tag = soup.select_one(selector)
        if tag and tag.get_text(strip=True):
            return tag.get_text(" ", strip=True)

    # Fallback: look for a paragraph block after the title
    summary = soup.select_one(".entry-summary, .summary")
    if summary:
        paras = summary.find_all("p")
        text = " ".join(p.get_text(" ", strip=True) for p in paras if p.get_text(strip=True))
        if text:
            return text

    return ""


def extract_specifications(soup: BeautifulSoup) -> dict[str, str]:
    """
    Extract spec key-value pairs.
    Hercules uses custom table rows with classes like .Main-frame, .Main-fork, etc.
    Also handles standard WooCommerce attribute tables.
    """
    specs = {}

    # --- Approach 1: Hercules custom spec rows (td pairs) ---
    # Rows have class like "Main-frame" with two <td> children
    spec_rows = soup.select("tr[class*='Main-']")
    for row in spec_rows:
        cells = row.find_all("td")
        if len(cells) >= 2:
            key = cells[0].get_text(strip=True)
            val = cells[1].get_text(strip=True)
            if key and val:
                specs[key] = val

    # --- Approach 2: Standard WooCommerce attributes table ---
    if not specs:
        attr_table = soup.select_one(
            "table.woocommerce-product-attributes, "
            "table.shop_attributes, "
            "table.specifications"
        )
        if attr_table:
            for row in attr_table.find_all("tr"):
                th = row.find("th")
                td = row.find("td")
                if th and td:
                    key = th.get_text(strip=True)
                    val = td.get_text(" ", strip=True)
                    if key and val:
                        specs[key] = val

    # --- Approach 3: Generic two-column tables that look like specs ---
    if not specs:
        for table in soup.find_all("table"):
            rows = table.find_all("tr")
            if len(rows) >= 3:  # at least 3 rows to qualify as specs
                for row in rows:
                    cells = row.find_all(["th", "td"])
                    if len(cells) == 2:
                        key = cells[0].get_text(strip=True)
                        val = cells[1].get_text(strip=True)
                        if key and val and len(key) < 80:
                            specs[key] = val
                if specs:
                    break

    # --- Approach 4: dt/dd definition lists ---
    if not specs:
        for dl in soup.find_all("dl"):
            dts = dl.find_all("dt")
            dds = dl.find_all("dd")
            for dt, dd in zip(dts, dds):
                key = dt.get_text(strip=True)
                val = dd.get_text(strip=True)
                if key and val:
                    specs[key] = val

    return specs


def extract_images(soup: BeautifulSoup) -> list[str]:
    """Extract all product image URLs from the gallery and page."""
    urls = set()

    # WooCommerce gallery images
    gallery = soup.select_one(
        ".woocommerce-product-gallery, "
        ".woo-variation-product-gallery, "
        ".product-gallery"
    )
    search_area = gallery if gallery else soup

    for img in search_area.find_all("img"):
        for attr in ["data-large_image", "data-src", "src", "data-lazy-src"]:
            src = img.get(attr, "")
            if src and "/wp-content/uploads/" in src:
                # Prefer full-size: strip WP size suffixes like -300x300
                clean = re.sub(r"-\d+x\d+(?=\.\w+$)", "", src)
                urls.add(clean)

    # Also check <a> tags wrapping gallery images
    for a_tag in search_area.find_all("a", href=True):
        href = a_tag["href"]
        if "/wp-content/uploads/" in href and href.lower().endswith(
            (".jpg", ".jpeg", ".png", ".webp")
        ):
            urls.add(href)

    return sorted(urls)


def extract_price(soup: BeautifulSoup) -> str:
    """Extract the product price."""
    for selector in [
        ".price .woocommerce-Price-amount",
        ".price .amount",
        ".price ins .amount",
        ".price",
        ".woocommerce-variation-price .amount",
    ]:
        tag = soup.select_one(selector)
        if tag:
            text = tag.get_text(strip=True)
            # Clean up: keep digits, commas, dots, and currency symbol
            cleaned = re.sub(r"[^\d₹,.\s–-]", "", text).strip()
            if cleaned:
                return cleaned
    return ""


def extract_stock_status(soup: BeautifulSoup) -> bool:
    """Check if a product is in stock. Returns True if in stock, False if out."""
    # WooCommerce adds "outofstock" class to body or product wrapper
    body = soup.find("body")
    if body and "outofstock" in body.get("class", []):
        return False

    product_div = soup.select_one(".product")
    if product_div and "outofstock" in product_div.get("class", []):
        return False

    # Check for explicit "Out of stock" text in stock status area
    stock_tag = soup.select_one(".stock.out-of-stock, .out-of-stock")
    if stock_tag:
        return False

    # Check for the generic "out of stock" text near purchase area
    for selector in [".stock", ".availability", ".product-stock"]:
        tag = soup.select_one(selector)
        if tag and "out of stock" in tag.get_text(strip=True).lower():
            return False

    # If "Add to Cart" or "Buy Now" button exists, likely in stock
    cart_btn = soup.select_one(
        "button.single_add_to_cart_button, "
        ".add_to_cart_button, "
        "a[href*='buy']"
    )
    if cart_btn:
        return True

    return True  # Default to in-stock if no indicators found


def is_ebike(specs: dict[str, str]) -> bool:
    """Check if a product is an e-bike by looking for battery/motor specs."""
    keys_lower = [k.lower() for k in specs]
    return any("battery" in k or "motor" in k for k in keys_lower)


def scrape_product_page(url: str, session: requests.Session) -> dict | None:
    """Scrape a single product detail page and return structured data."""
    soup = fetch_page(url, session)
    if soup is None:
        return None

    title = extract_title(soup)
    if not title:
        log.warning("No title found for %s — skipping", url)
        return None

    specs = extract_specifications(soup)

    # Filter: only keep e-bikes (products with Battery/Motor in specs)
    if not is_ebike(specs):
        log.info("  -> Skipping (not an e-bike): %s", title)
        return None

    in_stock = extract_stock_status(soup)

    return {
        "title": title,
        "url": url,
        "description": extract_description(soup),
        "price": extract_price(soup),
        "specifications": specs,
        "images": extract_images(soup),
        "inStock": in_stock,
    }


# ---------------------------------------------------------------------------
# STEP 3 — Save to JSON
# ---------------------------------------------------------------------------


def save_results(products: list[dict]):
    """Save products to JSON file. Only overwrites if we have data."""
    if not products:
        log.warning("No products scraped — output file NOT overwritten")
        return

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    log.info("Saved %d product(s) to %s", len(products), OUTPUT_FILE)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    log.info("=" * 60)
    log.info("Hercules E-Bike Scraper — Starting")
    log.info("=" * 60)

    session = requests.Session()

    # Step 1: Get product list from the listing page
    listings = scrape_listing(session)
    if not listings:
        log.error("No products found on listing page. Exiting.")
        return

    # Step 2: Scrape each product detail page
    products = []
    for i, item in enumerate(listings, start=1):
        log.info("[%d/%d] Scraping: %s", i, len(listings), item["name"])
        product = scrape_product_page(item["url"], session)
        if product:
            products.append(product)
            stock_label = "IN STOCK" if product["inStock"] else "OUT OF STOCK"
            log.info(
                "  -> %s | %s | %s | %d specs | %d images",
                product["title"],
                product["price"] or "no price",
                stock_label,
                len(product["specifications"]),
                len(product["images"]),
            )
        else:
            log.warning("  -> FAILED to scrape %s", item["url"])

        # Polite delay (skip after last product)
        if i < len(listings):
            polite_delay()

    # Step 3: Save results
    save_results(products)

    log.info("=" * 60)
    log.info("Done. %d/%d products scraped successfully.", len(products), len(listings))
    log.info("=" * 60)


if __name__ == "__main__":
    main()
