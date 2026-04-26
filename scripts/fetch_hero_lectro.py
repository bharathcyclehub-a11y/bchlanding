#!/usr/bin/env python3
"""
Hero Lectro E-Cycle Data Scraper
==================================
Collects all e-cycle/bike data from herolectro.com (the official Hero Lectro site).

NOTE: The correct Hero Lectro website is herolectro.com (NOT heroelectro.com,
which is an unrelated electronics store).

Strategy:
  1. Fetch sitemap.xml to discover all product page URLs
  2. Filter for bike/e-cycle product pages (exclude accessories, blog, etc.)
  3. Fetch each product page HTML
  4. Extract JSON-LD structured data (name, price, SKU, brand)
  5. Extract full specifications from HTML using BeautifulSoup
  6. Extract all image URLs
  7. Clean and save results to hero_lectro_bikes.json

Usage:
  pip install -r requirements.txt
  python fetch_hero_lectro.py

Requirements:
  - Python 3.8+
  - requests, beautifulsoup4 (see requirements.txt)

Output:
  - hero_lectro_bikes.json (all bike data)
  - Console logs with progress
"""

import json
import logging
import re
import sys
import time
import warnings
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import unquote

import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning

# Suppress XML-as-HTML warning (we parse XML sitemap with html.parser)
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://www.herolectro.com"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
OUTPUT_FILE = Path(__file__).parent / "hero_lectro_bikes.json"
REQUEST_DELAY = 1.5  # seconds between page fetches

# Browser-like headers
# NOTE: Do NOT include "Accept-Encoding: br" (Brotli) - the `requests` library
# cannot decode Brotli without the optional `brotli` package, and the SFCC
# server returns truncated pages when Brotli is requested but not decoded.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}

# Patterns to identify bike product pages from the sitemap
# These match the URL structure: /model-SKU_main.html or /model-SKU.html
BIKE_URL_PATTERN = re.compile(
    r"herolectro\.com/[a-z0-9].*\.(html)$", re.IGNORECASE
)

# Exclude non-bike pages
EXCLUDE_PATTERNS = [
    "blog", "privacy", "shipping", "return", "warranty", "terms",
    "faq", "tips", "guide", "benefits", "blessing", "commute",
    "cycling-vs", "repair", "bikepacking", "puncture", "explore-places",
    "various-ways", "know-your", "cycle-gears", "policy",
    # Accessories (specific known patterns)
    "front-lamp", "rear-lamp", "cycle-bell", "bottle-cage", "carrier-",
    "mobile-holder", "backpack", "saddle-cover", "front-basket", "frame-bag",
    "front-light", "cargo-bag", "bell-", "fender-",
    "cycle-helmet", "light-2",
]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("hero_lectro")

# ---------------------------------------------------------------------------
# HTTP Session
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
# Step 1: Fetch and parse sitemap for product URLs
# ---------------------------------------------------------------------------


def fetch_sitemap(session: requests.Session) -> list[str]:
    """Fetch sitemap.xml and extract all URLs."""
    log.info("Fetching sitemap: %s", SITEMAP_URL)
    try:
        resp = session.get(SITEMAP_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()

        urls = []

        # Try BeautifulSoup first
        soup = BeautifulSoup(resp.text, "html.parser")
        for loc in soup.find_all("loc"):
            url = loc.get_text(strip=True)
            if url:
                urls.append(url)

        # Fallback: regex extraction if BS4 found nothing
        if not urls:
            log.info("BS4 found 0 <loc> tags, trying regex fallback")
            for match in re.findall(r"<loc>\s*(https?://[^<]+)\s*</loc>", resp.text):
                urls.append(match.strip())

        log.info("Sitemap contains %d URLs", len(urls))
        return urls
    except requests.RequestException as e:
        log.error("Failed to fetch sitemap: %s", e)
        return []


# Supplementary product URLs that may not appear in the current sitemap
# (e.g., URL changed but old URL still serves product data).
# Always merged into the URL list to ensure we don't miss active products.
SUPPLEMENTARY_BIKE_URLS = [
    f"{BASE_URL}/h5-212710340_main.html",
]


def filter_bike_urls(urls: list[str]) -> list[str]:
    """Filter sitemap URLs to only include bike/e-cycle product pages."""
    bike_urls = []

    for url in urls:
        # Must be an .html product page
        if not url.endswith(".html"):
            continue

        url_lower = url.lower()

        # Exclude known non-bike pages
        if any(pat in url_lower for pat in EXCLUDE_PATTERNS):
            continue

        # Must match the product URL pattern (model-SKU.html)
        decoded_url = unquote(url)
        if BIKE_URL_PATTERN.search(decoded_url):
            bike_urls.append(url)

    # Deduplicate: prefer _main.html variants over non-main
    main_urls = {}
    non_main_urls = {}
    for url in bike_urls:
        # Extract the model identifier (before _main or .html)
        decoded = unquote(url)
        base = decoded.rsplit("/", 1)[-1]  # filename
        if "_main.html" in base:
            key = base.replace("_main.html", "")
            main_urls[key] = url
        else:
            key = base.replace(".html", "")
            non_main_urls[key] = url

    # Use _main.html version if both exist, otherwise use whatever we have
    final_urls = dict(main_urls)
    for key, url in non_main_urls.items():
        if key not in final_urls:
            final_urls[key] = url

    result = sorted(final_urls.values())
    log.info("Filtered to %d bike product URLs (from %d .html pages)", len(result), len(bike_urls))
    return result


# ---------------------------------------------------------------------------
# Step 2: Fetch and parse individual product pages
# ---------------------------------------------------------------------------


def fetch_product_page(session: requests.Session, url: str) -> dict | None:
    """Fetch a product page and extract all data."""
    try:
        resp = session.get(url, headers=HEADERS, timeout=30)
        if resp.status_code == 404:
            log.warning("  404 Not Found: %s", url)
            return None
        resp.raise_for_status()
        return parse_product_page(resp.text, url)
    except requests.RequestException as e:
        log.error("  Failed to fetch %s: %s", url, e)
        return None
    except Exception as e:
        log.error("  Parse error for %s: %s: %s", url, type(e).__name__, e)
        return None


def parse_product_page(html: str, url: str) -> dict | None:
    """Parse a product page HTML and extract all product data."""
    soup = BeautifulSoup(html, "html.parser")
    product = {"url": url}

    # Extract JSON-LD structured data
    json_ld = extract_json_ld(soup)
    if json_ld:
        product["json_ld"] = json_ld
    else:
        # No JSON-LD Product data means this is NOT a product page
        # (category/listing pages have ItemList, not Product)
        return None

    # Extract basic product info
    product["name"] = extract_product_name(soup, json_ld)
    if not product["name"] or product["name"] == "Unknown":
        return None  # Not a valid product page

    product["sku"] = extract_sku(soup, json_ld)
    product["price"] = extract_price(soup, json_ld)
    product["mrp"] = extract_mrp(soup, json_ld)
    product["currency"] = "INR"
    product["brand"] = "Hero Lectro"
    product["availability"] = extract_availability(soup, json_ld)
    product["description"] = extract_description(soup, json_ld)

    # Extract specifications (with noise filtering)
    raw_specs = extract_specifications(soup)
    product["specifications"] = clean_specifications(raw_specs)

    # Extract key highlights
    product["highlights"] = extract_highlights(soup)

    # Extract images
    product["images"] = extract_images(soup)

    # Extract color variants
    product["colors"] = extract_colors(soup)

    # Remove json_ld from final output (used internally)
    product.pop("json_ld", None)

    return product


# ---------------------------------------------------------------------------
# Data extraction helpers
# ---------------------------------------------------------------------------


def extract_json_ld(soup: BeautifulSoup) -> dict | None:
    """Extract JSON-LD Product structured data from the page."""
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            # Could be a single object or a list
            if isinstance(data, dict):
                if data.get("@type") == "Product":
                    return data
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("@type") == "Product":
                        return item
        except (json.JSONDecodeError, TypeError):
            continue
    return None


def extract_product_name(soup: BeautifulSoup, json_ld: dict | None) -> str:
    """Extract product name from multiple sources."""
    # Try JSON-LD first
    if json_ld and json_ld.get("name"):
        return json_ld["name"].strip()

    # Try page title
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)
        # Clean up title (often "Product Name | Hero Lectro")
        if "|" in title:
            return title.split("|")[0].strip()
        if "-" in title and "hero" in title.lower():
            return title.split("-")[0].strip()
        return title

    # Try H1
    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)

    # Try product name class
    for cls in ["product-name", "pdp-product-name", "product-title"]:
        el = soup.find(class_=cls)
        if el:
            return el.get_text(strip=True)

    return "Unknown"


def extract_sku(soup: BeautifulSoup, json_ld: dict | None) -> str:
    """Extract product SKU."""
    if json_ld:
        return json_ld.get("sku") or json_ld.get("mpn") or ""

    # Try data attributes
    el = soup.find(attrs={"data-pid": True})
    if el:
        return el["data-pid"]

    return ""


def extract_price(soup: BeautifulSoup, json_ld: dict | None) -> float | None:
    """Extract current selling price."""
    # JSON-LD
    if json_ld:
        offers = json_ld.get("offers", {})
        if isinstance(offers, dict):
            price = offers.get("price")
            if price:
                return _parse_price(price)
        elif isinstance(offers, list) and offers:
            price = offers[0].get("price")
            if price:
                return _parse_price(price)

    # HTML price elements
    for selector in [".sales .value", ".price-sales", ".product-price .sale",
                     "[data-price]", ".pdp-price"]:
        el = soup.select_one(selector)
        if el:
            price_text = el.get("data-price") or el.get("content") or el.get_text()
            parsed = _parse_price(price_text)
            if parsed:
                return parsed

    return None


def extract_mrp(soup: BeautifulSoup, json_ld: dict | None) -> float | None:
    """Extract MRP / original price."""
    # Look for strikethrough / compare-at price
    for selector in [".strike-through .value", ".price-standard", ".product-price .mrp",
                     ".original-price", ".compare-price"]:
        el = soup.select_one(selector)
        if el:
            price_text = el.get("content") or el.get_text()
            parsed = _parse_price(price_text)
            if parsed:
                return parsed

    # Sometimes MRP is same as price (no discount)
    return None


def extract_availability(soup: BeautifulSoup, json_ld: dict | None) -> str:
    """Extract availability status."""
    if json_ld:
        offers = json_ld.get("offers", {})
        if isinstance(offers, dict):
            avail = offers.get("availability", "")
            if "InStock" in avail:
                return "In Stock"
            elif "OutOfStock" in avail:
                return "Out of Stock"

    # Check for add-to-cart button
    cart_btn = soup.find("button", class_=re.compile(r"add-to-cart", re.I))
    if cart_btn:
        if cart_btn.get("disabled"):
            return "Out of Stock"
        return "In Stock"

    # Check for out-of-stock text
    oos = soup.find(string=re.compile(r"out of stock|sold out", re.I))
    if oos:
        return "Out of Stock"

    return "Unknown"


def extract_description(soup: BeautifulSoup, json_ld: dict | None) -> str:
    """Extract product description."""
    if json_ld and json_ld.get("description"):
        return json_ld["description"].strip()

    for selector in [".product-description", ".pdp-description",
                     ".description-content", "#product-description"]:
        el = soup.select_one(selector)
        if el:
            return el.get_text(strip=True)

    return ""


def extract_specifications(soup: BeautifulSoup) -> dict[str, Any]:
    """
    Extract all product specifications from the page.
    Hero Lectro uses tabular/accordion spec layouts.
    """
    specs = {}

    # Strategy 1: Look for spec tables
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                key = cells[0].get_text(strip=True)
                value = cells[1].get_text(strip=True)
                if key and value and key.lower() != value.lower():
                    specs[key] = value

    # Strategy 2: Look for definition lists
    for dl in soup.find_all("dl"):
        dts = dl.find_all("dt")
        dds = dl.find_all("dd")
        for dt, dd in zip(dts, dds):
            key = dt.get_text(strip=True)
            value = dd.get_text(strip=True)
            if key and value:
                specs[key] = value

    # Strategy 3: Look for spec-like div patterns (key-value pairs)
    spec_containers = soup.find_all(class_=re.compile(
        r"spec|specification|feature|detail|attribute|param", re.I
    ))
    for container in spec_containers:
        # Look for label/value pairs within
        labels = container.find_all(class_=re.compile(r"label|key|name|title|param-name", re.I))
        values = container.find_all(class_=re.compile(r"value|val|desc|param-value", re.I))

        if labels and values:
            for label, value in zip(labels, values):
                key = label.get_text(strip=True)
                val = value.get_text(strip=True)
                if key and val:
                    specs[key] = val

    # Strategy 4: Look for accordion/tab sections with specs
    for section in soup.find_all(class_=re.compile(r"accordion|tab-pane|collapse", re.I)):
        # Check if this section contains spec-like content
        rows = section.find_all(class_=re.compile(r"row|item|line", re.I))
        for row in rows:
            children = row.find_all(recursive=False)
            if len(children) >= 2:
                key = children[0].get_text(strip=True)
                value = children[1].get_text(strip=True)
                if key and value and len(key) < 60 and key != value:
                    specs[key] = value

    # Strategy 5: Parse the specs from structured divs
    # Hero Lectro often uses div pairs for specs
    for div in soup.find_all("div", class_=re.compile(r"spec-row|spec-item|product-spec", re.I)):
        text = div.get_text(separator="|", strip=True)
        parts = text.split("|")
        if len(parts) == 2:
            specs[parts[0].strip()] = parts[1].strip()

    return specs


# Keys to remove from specifications (noise from page layout)
_SPEC_NOISE_KEYS = {
    "bank name/ tenure", "bank name/tenure", "3 months", "6 months",
    "9 months", "12 months",
}
_SPEC_NOISE_PATTERNS = [
    r"^amex$", r"^axis$", r"^citi$", r"^hdfc$", r"^hsbc$", r"^icici$",
    r"^indus$", r"^kotak$", r"^rbl$", r"^sbi$", r"^yes$",  # EMI bank names
    r"availablecolour", r"delivery\s*&\s*service", r"hero\s*lectro",
    r"specifications$", r"e-cycle\s*spec", r"all you would",
    r"we will notify", r"^\d+\.\d+%$",  # percentage values as keys
]
_SPEC_NOISE_RE = re.compile("|".join(_SPEC_NOISE_PATTERNS), re.IGNORECASE)


def clean_specifications(specs: dict[str, Any]) -> dict[str, Any]:
    """Remove noise entries from extracted specifications."""
    cleaned = {}
    for key, value in specs.items():
        key_lower = key.lower().strip()
        # Skip known noise keys
        if key_lower in _SPEC_NOISE_KEYS:
            continue
        # Skip keys matching noise patterns
        if _SPEC_NOISE_RE.search(key):
            continue
        # Skip entries where value looks like a percentage (EMI rate)
        if isinstance(value, str) and re.match(r"^\d+\.\d+%$", value.strip()):
            continue
        # Skip very long keys (likely scraped paragraph text)
        if len(key) > 80:
            continue
        cleaned[key] = value
    return cleaned


def extract_highlights(soup: BeautifulSoup) -> list[str]:
    """Extract key product highlights/features."""
    highlights = []

    # Look for feature lists
    for ul in soup.find_all("ul", class_=re.compile(r"feature|highlight|benefit|key-point", re.I)):
        for li in ul.find_all("li"):
            text = li.get_text(strip=True)
            if text and len(text) > 5:
                highlights.append(text)

    # Look for highlighted feature cards/badges
    for el in soup.find_all(class_=re.compile(r"feature-card|feature-item|highlight-item", re.I)):
        text = el.get_text(strip=True)
        if text and len(text) > 5 and text not in highlights:
            highlights.append(text)

    return highlights


def extract_images(soup: BeautifulSoup) -> list[str]:
    """Extract all product image URLs."""
    images = []
    seen = set()

    # Strategy 1: Look for product image gallery
    for img in soup.find_all("img"):
        src = img.get("data-src") or img.get("src") or ""
        srcset = img.get("data-srcset") or img.get("srcset") or ""

        # Get the highest resolution from srcset
        if srcset:
            parts = srcset.split(",")
            for part in parts:
                url = part.strip().split(" ")[0]
                if _is_product_image(url) and url not in seen:
                    images.append(url)
                    seen.add(url)

        if _is_product_image(src) and src not in seen:
            images.append(src)
            seen.add(src)

    # Strategy 2: Look for image URLs in data attributes
    for el in soup.find_all(attrs={"data-lgimg": True}):
        try:
            img_data = json.loads(el["data-lgimg"])
            url = img_data.get("url") or img_data.get("src") or ""
            if url and url not in seen:
                images.append(url)
                seen.add(url)
        except (json.JSONDecodeError, TypeError):
            pass

    # Strategy 3: Look in carousel/slider containers
    for el in soup.find_all(attrs={"data-src": True}):
        url = el["data-src"]
        if _is_product_image(url) and url not in seen:
            images.append(url)
            seen.add(url)

    # Normalize URLs
    normalized = []
    for url in images:
        if url.startswith("//"):
            url = "https:" + url
        elif url.startswith("/"):
            url = BASE_URL + url
        normalized.append(url)

    return normalized


def extract_colors(soup: BeautifulSoup) -> list[str]:
    """Extract available color variants."""
    colors = []
    seen = set()

    # Look for color swatches
    for el in soup.find_all(class_=re.compile(r"color-swatch|color-option|variant-color", re.I)):
        color = (
            el.get("data-color")
            or el.get("data-attr-value")
            or el.get("title")
            or el.get_text(strip=True)
        )
        if color and color.lower() not in seen:
            colors.append(color)
            seen.add(color.lower())

    # Look for color labels
    for el in soup.find_all(class_=re.compile(r"color-label|selected-color|color-name", re.I)):
        color = el.get_text(strip=True)
        if color and color.lower() not in seen:
            colors.append(color)
            seen.add(color.lower())

    return colors


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def _parse_price(value: Any) -> float | None:
    """Parse a price value from various formats."""
    if value is None:
        return None
    text = str(value).replace(",", "").replace("₹", "").replace("INR", "").strip()
    try:
        return float(text)
    except (ValueError, TypeError):
        # Try to extract number
        match = re.search(r"[\d]+\.?\d*", text)
        if match:
            return float(match.group())
        return None


def _is_product_image(url: str) -> bool:
    """Check if a URL is likely a product image (not a UI/icon image)."""
    if not url:
        return False
    url_lower = url.lower()

    # Must be an image
    if not any(ext in url_lower for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]):
        # Check if it's a dynamic image URL without extension
        if "demandware.static" not in url_lower and "image" not in url_lower:
            return False

    # Exclude common non-product images
    exclude = [
        "logo", "icon", "favicon", "banner", "arrow", "close",
        "spinner", "loading", "placeholder", "pixel", "tracking",
        "social", "facebook", "twitter", "instagram", "youtube",
        "payment", "visa", "mastercard", "upi",
    ]
    if any(ex in url_lower for ex in exclude):
        return False

    # For Hero Lectro, product images are on demandware.static
    if "demandware.static" in url_lower:
        return True

    # General product image heuristics
    if any(kw in url_lower for kw in ["product", "lectro", "hero", "bike", "cycle"]):
        return True

    return False


# ---------------------------------------------------------------------------
# Step 3: Also try category listing pages for additional products
# ---------------------------------------------------------------------------

CATEGORY_URLS = [
    f"{BASE_URL}/bikes/",
    f"{BASE_URL}/cargo-e-bikes?pageId=cargo",
    f"{BASE_URL}/viking-e-bikes/",
    f"{BASE_URL}/mountain-e-bikes/",
    f"{BASE_URL}/city-e-bikes/",
    f"{BASE_URL}/cargo/",
]


def discover_products_from_categories(
    session: requests.Session,
    known_urls: set[str],
) -> list[str]:
    """Fetch category pages and extract product URLs not in sitemap."""
    new_urls = []

    for cat_url in CATEGORY_URLS:
        log.info("Checking category page: %s", cat_url)
        try:
            resp = session.get(cat_url, headers=HEADERS, timeout=30)
            if resp.status_code != 200:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")

            # Extract product links
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if href.startswith("/"):
                    href = BASE_URL + href

                if href.endswith(".html") and "herolectro.com" in href:
                    decoded = unquote(href)
                    if decoded not in known_urls and not any(
                        pat in decoded.lower() for pat in EXCLUDE_PATTERNS
                    ):
                        new_urls.append(href)
                        known_urls.add(decoded)

            # Also check JSON-LD ItemList
            for script in soup.find_all("script", type="application/ld+json"):
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get("@type") == "ItemList":
                        for item in data.get("itemListElement", []):
                            url = item.get("url", "")
                            if url and url not in known_urls:
                                new_urls.append(url)
                                known_urls.add(url)
                except (json.JSONDecodeError, TypeError):
                    pass

            time.sleep(1)
        except requests.RequestException as e:
            log.warning("Failed to fetch category %s: %s", cat_url, e)

    log.info("Discovered %d additional product URLs from categories", len(new_urls))
    return new_urls


# ---------------------------------------------------------------------------
# Step 4: Save results
# ---------------------------------------------------------------------------


def save_results(products: list[dict], output_path: Path) -> bool:
    """Save cleaned products to JSON. Only overwrites if we have data."""
    if not products:
        log.error("No products to save. Output file not modified.")
        return False

    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": BASE_URL,
        "count": len(products),
        "products": products,
    }

    output_path.write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    log.info("Saved %d products to %s", len(products), output_path)
    return True


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------


def main() -> int:
    log.info("=" * 60)
    log.info("Hero Lectro E-Cycle Data Scraper")
    log.info("Source: %s", BASE_URL)
    log.info("=" * 60)

    session = create_session()

    # ── Phase 1: Get product URLs from sitemap ──
    log.info("")
    log.info("Phase 1: Discovering product URLs from sitemap")
    log.info("-" * 50)

    sitemap_urls = fetch_sitemap(session)
    bike_urls = filter_bike_urls(sitemap_urls)

    # Merge supplementary URLs (products whose sitemap URLs may have changed)
    known = set(unquote(u) for u in bike_urls)
    for extra_url in SUPPLEMENTARY_BIKE_URLS:
        if unquote(extra_url) not in known:
            bike_urls.append(extra_url)
            known.add(unquote(extra_url))
            log.info("Added supplementary URL: %s", unquote(extra_url).rsplit("/", 1)[-1])

    for url in bike_urls:
        log.info("  %s", unquote(url).rsplit("/", 1)[-1])

    # ── Phase 2: Check category pages for additional products ──
    log.info("")
    log.info("Phase 2: Checking category pages for additional products")
    log.info("-" * 50)

    known = set(unquote(u) for u in bike_urls)
    extra_urls = discover_products_from_categories(session, known)
    all_urls = bike_urls + extra_urls

    log.info("Total product URLs to fetch: %d", len(all_urls))

    # ── Phase 3: Fetch each product page ──
    log.info("")
    log.info("Phase 3: Fetching product details")
    log.info("-" * 50)

    products = []
    total = len(all_urls)

    for i, url in enumerate(all_urls, 1):
        decoded_name = unquote(url).rsplit("/", 1)[-1]
        log.info("[%d/%d] %s", i, total, decoded_name)
        product = fetch_product_page(session, url)
        if product:
            products.append(product)
            log.info("  -> %s | %s | %s",
                     product["name"],
                     f"₹{product['price']:,.0f}" if product.get("price") else "N/A",
                     product.get("availability", "?"))
        else:
            log.warning("  -> Skipped (no valid product data)")

        if i < total:
            time.sleep(REQUEST_DELAY)

    # ── Phase 4: Deduplicate by SKU ──
    log.info("")
    log.info("Phase 4: Deduplicating products")
    log.info("-" * 50)

    seen_skus = set()
    seen_names = set()
    unique_products = []
    for p in products:
        key = p.get("sku") or p.get("name", "").lower()
        name_key = p["name"].lower().strip()
        if key and key not in seen_skus and name_key not in seen_names:
            seen_skus.add(key)
            seen_names.add(name_key)
            unique_products.append(p)

    log.info("Unique products: %d (from %d fetched)", len(unique_products), len(products))

    # ── Phase 5: Save results ──
    log.info("")
    log.info("Phase 5: Saving results")
    log.info("-" * 50)

    success = save_results(unique_products, OUTPUT_FILE)

    # ── Summary ──
    log.info("")
    log.info("=" * 60)
    if success:
        log.info("SUCCESS: Scraped %d e-cycles from Hero Lectro", len(unique_products))
        log.info("")
        for p in unique_products:
            price_str = f"₹{p['price']:,.0f}" if p.get("price") else "Price N/A"
            spec_count = len(p.get("specifications", {}))
            img_count = len(p.get("images", []))
            log.info("  %-20s | %-12s | %s | %d specs | %d images",
                     p["name"], price_str, p.get("availability", "?"),
                     spec_count, img_count)
    else:
        log.error("FAILED: No products were scraped")
        log.error("The site may have changed its structure.")
    log.info("=" * 60)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
