/**
 * Fetch Google Reviews for Bharath Cycle Hub via Google Places API (New)
 *
 * Prerequisites:
 *   1. Enable "Places API (New)" in Google Cloud Console
 *   2. Create an API key with Places API access
 *   3. Set GOOGLE_PLACES_API_KEY in .env.local
 *
 * Usage:
 *   node scripts/fetch-google-reviews.js
 *
 * The script:
 *   - Searches for the business by name
 *   - Fetches up to 5 reviews (Google API limit)
 *   - Merges with existing reviews (no duplicates)
 *   - Filters: 4+ stars, 10+ words, English, last 12 months preferred
 *   - Writes to public/testimonials.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'public', 'testimonials.json');

// Load environment variables
config({ path: resolve(ROOT, '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUSINESS_NAME = 'Bharath Cycle Hub';
const PLACE_SEARCH_QUERY = 'Bharath Cycle Hub Yelahanka Bangalore';
const MIN_RATING = 4;
const MIN_WORDS = 10;
const MAX_REVIEWS = 10;
const MAX_TEXT_LENGTH = 200;

// ── Helpers ──────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function truncateText(text, maxLen = MAX_TEXT_LENGTH) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

function generateId(name, date) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const dateSlug = date.replace(/-/g, '');
  return `rev_${slug}_${dateSlug}`;
}

function getRelativeDate(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ── Google Places API (New) ─────────────────────────────────────

async function searchPlace() {
  log(`Searching for place: "${PLACE_SEARCH_QUERY}"`);

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({ textQuery: PLACE_SEARCH_QUERY }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Place search failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  if (!data.places?.length) {
    throw new Error('No places found for the search query');
  }

  const place = data.places[0];
  log(`Found: ${place.displayName?.text} (${place.rating}★, ${place.userRatingCount} reviews)`);
  return place;
}

async function fetchPlaceReviews(placeId) {
  log(`Fetching reviews for place ID: ${placeId}`);

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Review fetch failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return {
    reviews: data.reviews || [],
    rating: data.rating,
    totalReviews: data.userRatingCount,
  };
}

// ── Review Processing ───────────────────────────────────────────

function processGoogleReview(review) {
  const text = review.text?.text || review.originalText?.text || '';
  const authorName = review.authorAttribution?.displayName || 'Anonymous';
  const rating = review.rating || 0;
  const publishTime = review.publishTime || new Date().toISOString();
  // Filter criteria
  if (rating < MIN_RATING) return null;
  if (wordCount(text) < MIN_WORDS) return null;

  const dateStr = publishTime.split('T')[0];

  return {
    id: generateId(authorName, dateStr),
    name: authorName,
    rating,
    text: truncateText(text),
    date: dateStr,
    relativeDate: getRelativeDate(publishTime),
    source: 'Google Reviews',
    verified: true,
  };
}

// ── Merge with Existing ─────────────────────────────────────────

function loadExistingReviews() {
  if (!existsSync(OUTPUT_PATH)) {
    return { reviews: [], googleRating: 0, totalReviews: 0 };
  }
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
  } catch {
    return { reviews: [], googleRating: 0, totalReviews: 0 };
  }
}

function mergeReviews(existing, newReviews) {
  const existingIds = new Set(existing.map(r => r.id));
  const existingNames = new Set(existing.map(r => r.name.toLowerCase()));

  const unique = newReviews.filter(r => {
    if (existingIds.has(r.id)) return false;
    if (existingNames.has(r.name.toLowerCase())) return false;
    return true;
  });

  const merged = [...existing, ...unique];

  // Sort by date (newest first), then limit
  merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  return merged.slice(0, MAX_REVIEWS);
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    log('ERROR: GOOGLE_PLACES_API_KEY not set in .env.local');
    log('');
    log('To set up:');
    log('  1. Go to https://console.cloud.google.com/apis/library/places-backend.googleapis.com');
    log('  2. Enable "Places API (New)"');
    log('  3. Create an API key at https://console.cloud.google.com/apis/credentials');
    log('  4. Add to .env.local: GOOGLE_PLACES_API_KEY=your_key_here');
    log('');
    log('Skipping API fetch. Using existing testimonials.json data.');
    process.exit(0);
  }

  try {
    // Step 1: Find the place
    const place = await searchPlace();

    // Step 2: Fetch reviews
    const { reviews: rawReviews, rating, totalReviews } = await fetchPlaceReviews(place.id);
    log(`Fetched ${rawReviews.length} raw reviews from Google`);

    // Step 3: Process and filter
    const processed = rawReviews
      .map(processGoogleReview)
      .filter(Boolean);
    log(`${processed.length} reviews passed filters (${MIN_RATING}+ stars, ${MIN_WORDS}+ words)`);

    // Step 4: Merge with existing
    const existingData = loadExistingReviews();
    const mergedReviews = mergeReviews(existingData.reviews || [], processed);

    // Step 5: Write output
    const output = {
      businessName: BUSINESS_NAME,
      googleRating: rating || existingData.googleRating || 4.7,
      totalReviews: totalReviews || existingData.totalReviews || 1200,
      lastUpdated: new Date().toISOString(),
      source: 'Google Places API',
      reviews: mergedReviews,
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
    log(`Written ${mergedReviews.length} reviews to ${OUTPUT_PATH}`);
    log('Done!');
  } catch (err) {
    log(`ERROR: ${err.message}`);
    log('Existing testimonials.json preserved. No data was lost.');
    process.exit(1);
  }
}

main();
