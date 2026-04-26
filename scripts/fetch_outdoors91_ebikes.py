#!/usr/bin/env python3
"""
Outdoors91 Electric Cycle Scraper
==================================
Scrapes all electric bicycle data from outdoors91.com.

Strategy:
  1. Fetch the listing page at /bicycles/electric-cycle
  2. Extract product cards (name, price, detail URL)
  3. Fetch each product detail page
  4. Extract description, specifications, and image URLs
  5. Save to outdoors91_ebikes.json

Usage:
  cd scripts
  pip install -r requirements.txt
  python fetch_outdoors91_ebikes.py

Requirements:
  - Python 3.8+
  - requests, beautifulsoup4 (see requirements.txt)

Output:
  - outdoors91_ebikes.json (all e-bike data)
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

BASE_URL = "https://www.outdoors91.com"
LISTING_URL = f"{BASE_URL}/bicycles/electric-cycle"
OUTPUT_FILE = Path(__file__).parent / "outdoors91_ebikes.json"
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
log = logging.getLogger("outdoors91")

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
    Fetch the electric cycle listing page and extract product cards.
    Returns a list of dicts with: name, price, url.
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

    # Product cards use class "crdListNew"
    cards = soup.find_all("div", class_="crdListNew")
    if not cards:
        # Fallback: any card-like containers with product links
        cards = soup.find_all("div", class_=re.compile(r"card.*", re.I))
        log.info("Fallback card selector found %d elements", len(cards))

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
    # Find the product detail link — anchor with /buy/ in href
    link = card.find("a", href=re.compile(r"/buy/"))
    if not link:
        link = card.find("a", href=True)

    if not link or not link.get("href"):
        return None

    href = link["href"]
    if href.startswith("/"):
        href = BASE_URL + href

    # Skip if not a product detail page
    if "/buy/" not in href:
        return None

    # Extract name from .cardName
    name = None
    name_el = card.find(class_="cardName")
    if name_el:
        name = name_el.get_text(strip=True)

    if not name:
        for tag in ["h2", "h3", "h4", "span", "div"]:
            el = card.find(tag)
            if el:
                text = el.get_text(strip=True)
                if text and 3 < len(text) < 100:
                    name = text
                    break

    if not name:
        name = link.get_text(strip=True)

    if not name:
        return None

    # Extract price from .priceHolder
    price = None
    price_el = card.find(class_="priceHolder")
    if price_el:
        price_text = price_el.get_text()
        price = parse_price(price_text)

    if price is None:
        for el in card.find_all(string=re.compile(r"[\d,]+/-|₹[\d,]+")):
            price = parse_price(el)
            if price:
                break

    return {
        "name": name.strip(),
        "price": price,
        "url": href,
    }


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


def parse_product_detail(html: str, url: str) -> dict | None:
    """Parse a product detail page and extract all product data."""
    soup = BeautifulSoup(html, "html.parser")

    return {
        "url": url,
        "name": extract_name(soup),
        "price": extract_price(soup),
        "description": extract_description(soup),
        "specifications": extract_specifications(soup),
        "images": extract_images(soup),
        "colors": extract_colors(soup),
    }


# ---------------------------------------------------------------------------
# Detail page extraction helpers
# ---------------------------------------------------------------------------


def extract_name(soup: BeautifulSoup) -> str:
    """Extract product name from the detail page."""
    h1 = soup.find("h1", class_=re.compile(r"secTitle|prodNameHeader", re.I))
    if h1:
        return h1.get_text(strip=True)

    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)

    title = soup.find("title")
    if title:
        text = title.get_text(strip=True)
        if "|" in text:
            return text.split("|")[0].strip()
        return text

    return "Unknown"


def extract_price(soup: BeautifulSoup) -> float | None:
    """Extract price from the detail page."""
    # Try .priceWidget .price
    price_widget = soup.find(class_="priceWidget")
    if price_widget:
        price = parse_price(price_widget.get_text())
        if price:
            return price

    price_el = soup.find(class_="price")
    if price_el:
        price = parse_price(price_el.get_text())
        if price:
            return price

    # Look for Mrp text pattern
    mrp_text = soup.find(string=re.compile(r"Mrp\s*:\s*[\d,]+", re.I))
    if mrp_text:
        return parse_price(mrp_text)

    return None


def extract_description(soup: BeautifulSoup) -> str:
    """Extract product description from the detail page."""
    desc_parts = []

    # Try .pdNewInfo container
    info_section = soup.find(class_="pdNewInfo")
    if info_section:
        for p in info_section.find_all(["p", "div"], class_=re.compile(r"prodTitle|prodDesc", re.I)):
            text = p.get_text(strip=True)
            if text and len(text) > 10:
                desc_parts.append(text)

        feature_list = info_section.find("ul", class_=re.compile(r"prodInfoList", re.I))
        if feature_list:
            for li in feature_list.find_all("li"):
                text = li.get_text(strip=True)
                if text:
                    desc_parts.append(f"- {text}")

    # Fallback: meta description
    if not desc_parts:
        meta = soup.find("meta", attrs={"name": "description"})
        if meta and meta.get("content"):
            desc_parts.append(meta["content"].strip())

    return "\n".join(desc_parts)


def extract_specifications(soup: BeautifulSoup) -> dict:
    """
    Extract specifications from the detail page.
    Outdoors91 uses .kybSpecList with .specWidget items containing
    .specTitle (key) and .specList (value) as siblings.
    """
    specs = {}

    # Primary: ONE .specWidget contains ALL specs as sibling pairs:
    #   <div class="specWidget">
    #     <div class="specTitle">Battery</div>
    #     <div class="specList">7.8Ah ...</div>
    #     <div class="specTitle">Motor</div>
    #     <div class="specList">36V 250W ...</div>
    #   </div>
    spec_container = soup.find(class_="specWidget")
    if spec_container:
        titles = spec_container.find_all(class_="specTitle")
        values = spec_container.find_all(class_="specList")
        for title_el, value_el in zip(titles, values):
            key = title_el.get_text(strip=True)
            value = value_el.get_text(strip=True)
            # The value often has the key prepended (DOM text leakage)
            if value.startswith(key):
                value = value[len(key):].strip()
            # Also strip leading ** or * from values
            value = value.lstrip("*").strip()
            if key and value:
                specs[key] = value

    # Fallback: all text pairs from .kybSpecList using stripped_strings
    if not specs:
        spec_section = soup.find(class_="kybSpecList")
        if spec_section:
            # Collect all specWidget-like divs
            children = spec_section.find_all("div", recursive=False)
            for child in children:
                texts = [t.strip() for t in child.stripped_strings if t.strip()]
                if len(texts) >= 2:
                    specs[texts[0]] = " ".join(texts[1:])

    # Fallback: spec tables
    if not specs:
        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["td", "th"])
                if len(cells) >= 2:
                    key = cells[0].get_text(strip=True)
                    val = cells[1].get_text(strip=True)
                    if key and val and key.lower() != val.lower():
                        specs[key] = val

    return specs


def extract_images(soup: BeautifulSoup) -> list[str]:
    """
    Extract all product image URLs from the detail page.
    Outdoors91 uses CloudFront CDN (d2f9uwgpmber13.cloudfront.net).
    """
    images = []
    seen = set()

    # Strategy 1: Product slider containers
    for cls in ["prodSliderNav", "prodBody", "prodMain", "prodSlider"]:
        container = soup.find(class_=cls)
        if container:
            for img in container.find_all("img"):
                url = img.get("data-src") or img.get("src") or ""
                url = normalize_image_url(url)
                if url and is_product_image(url) and url not in seen:
                    images.append(url)
                    seen.add(url)

    # Strategy 2: All CloudFront images on the page
    for img in soup.find_all("img"):
        url = img.get("data-src") or img.get("src") or ""
        url = normalize_image_url(url)
        if url and is_product_image(url) and url not in seen:
            images.append(url)
            seen.add(url)

    # Strategy 3: data-src attributes on non-img elements
    for el in soup.find_all(attrs={"data-src": True}):
        if el.name == "img":
            continue  # already handled
        url = normalize_image_url(el["data-src"])
        if url and is_product_image(url) and url not in seen:
            images.append(url)
            seen.add(url)

    # Convert thumbnails to full-size URLs
    full_size = []
    for url in images:
        full_url = url.replace("/uploads/thumbs/", "/image_new/")
        full_size.append(full_url)

    return full_size


def extract_colors(soup: BeautifulSoup) -> list[str]:
    """Extract available color options."""
    colors = []
    seen = set()

    # Generic labels to skip (not actual color names)
    skip_labels = {"colour", "color", "selectcolour", "selectcolor", "select colour", "select"}

    for btn in soup.find_all(class_="colorBtn"):
        color = btn.get("title") or btn.get("data-color") or btn.get_text(strip=True)
        if color and color.lower().strip() not in skip_labels and color.lower() not in seen:
            colors.append(color)
            seen.add(color.lower())

    # Fallback: color swatch images with alt text or title in the colorWidget
    if not colors:
        widget = soup.find(class_="colorWidget")
        if widget:
            for img in widget.find_all("img"):
                color = img.get("alt") or img.get("title") or ""
                color = color.strip()
                if color and color.lower() not in skip_labels and color.lower() not in seen:
                    colors.append(color)
                    seen.add(color.lower())

    return colors


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def parse_price(text) -> float | None:
    """Parse a price from text like '29,999/-' or '₹ 29,999'."""
    if text is None:
        return None
    text = str(text)
    # Remove currency symbols, commas, /- suffix, whitespace
    cleaned = re.sub(r"[₹,/\-\s]", "", text)
    match = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if match:
        value = float(match.group(1))
        # Ignore tiny numbers (likely EMI monthly amounts)
        if value > 1000:
            return value
        if "emi" not in text.lower() and "month" not in text.lower():
            return value
    return None


def normalize_image_url(url: str) -> str:
    """Normalize an image URL to absolute."""
    if not url:
        return ""
    url = url.strip()
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return BASE_URL + url
    return url


def is_product_image(url: str) -> bool:
    """Check if URL is a product image (not a placeholder/icon/site asset)."""
    if not url:
        return False
    url_lower = url.lower()

    if not any(ext in url_lower for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]):
        return False

    # Skip known non-product images
    skip = [
        "logo", "icon", "favicon", "banner", "firstload",
        "spinner", "loading", "placeholder", "pixel",
        "social", "facebook", "twitter", "instagram",
        "payment", "visa", "mastercard", "upi",
        "arrow", "close", "search", "cart", "menu",
        # Outdoors91 site-wide assets (not product photos)
        "cyclebg", "cyclebgbottom", "enquiry_thumb", "assembly_thumb",
        "call_request_thumb", "500off", "push-permission",
        "91engage", "/assets/ninetyone/",
    ]
    if any(s in url_lower for s in skip):
        return False

    # Only accept images from the product image CDN (d2f9uwgpmber13)
    # or the product uploads folder
    if "d2f9uwgpmber13.cloudfront.net" in url_lower:
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
    log.info("Outdoors91 Electric Cycle Scraper")
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
        price_str = f"₹{item['price']:,.0f}" if item.get("price") else "Price N/A"
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
            # Merge: detail page data takes precedence over listing
            merged = {
                "name": detail.get("name") or listing["name"],
                "price": detail.get("price") or listing.get("price"),
                "url": listing["url"],
                "description": detail.get("description", ""),
                "specifications": detail.get("specifications", {}),
                "images": detail.get("images", []),
                "colors": detail.get("colors", []),
            }
            products.append(merged)

            spec_count = len(merged["specifications"])
            img_count = len(merged["images"])
            price_str = f"₹{merged['price']:,.0f}" if merged.get("price") else "N/A"
            log.info("  -> %s | %d specs | %d images", price_str, spec_count, img_count)
        else:
            # Include with listing data only
            products.append({
                "name": listing["name"],
                "price": listing.get("price"),
                "url": listing["url"],
                "description": "",
                "specifications": {},
                "images": [],
                "colors": [],
            })
            log.warning("  -> Detail fetch failed, using listing data only")

        # Polite delay between requests
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
        log.info("SUCCESS: Scraped %d electric cycles from Outdoors91", len(products))
        log.info("")
        for p in products:
            price_str = f"₹{p['price']:,.0f}" if p.get("price") else "N/A"
            spec_count = len(p.get("specifications", {}))
            img_count = len(p.get("images", []))
            log.info(
                "  %-40s | %-12s | %d specs | %d images",
                p["name"], price_str, spec_count, img_count,
            )
    else:
        log.error("FAILED: No products were scraped")
        log.error("The site structure may have changed.")
    log.info("=" * 60)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
