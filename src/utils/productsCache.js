/**
 * Products Cache Layer
 *
 * Prevents redundant Firestore reads by caching product data in memory
 * and sessionStorage. All pages share one cache with a 5-minute TTL.
 *
 * Usage:
 *   import { getCachedProducts, invalidateProductsCache } from '../utils/productsCache';
 *   const products = await getCachedProducts();
 */

import { products as localProducts } from '../data/products';
import { api } from './api';

const CACHE_KEY = 'bch_products_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes — products rarely change

// In-memory cache (survives within same SPA session, fastest)
let memoryCache = null;

// Deduplication: if a fetch is already in-flight, reuse its promise
let inflightPromise = null;

function readCache() {
  // 1. Try memory first
  if (memoryCache && Date.now() - memoryCache.ts < CACHE_TTL) {
    return memoryCache;
  }

  // 2. Try sessionStorage
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch {
    // sessionStorage may be unavailable (private browsing, quota)
  }

  return null;
}

function writeCache(apiProducts, deletedIds) {
  const entry = { apiProducts, deletedIds, ts: Date.now() };
  memoryCache = entry;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Silently fail — memory cache still works
  }
}

function mergeWithLocal(apiProducts, deletedIds) {
  const localOnly = localProducts.filter(
    (local) =>
      !apiProducts.some((ap) => ap.id === local.id) &&
      !deletedIds.includes(local.id)
  );
  return [...apiProducts, ...localOnly];
}

/**
 * Get products with caching. Returns merged (API + local) products list.
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.forceRefresh=false] - Skip cache and fetch fresh data
 * @returns {Promise<Array>} Merged products array
 */
export async function getCachedProducts({ forceRefresh = false } = {}) {
  // Return cached data if available
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) {
      return mergeWithLocal(cached.apiProducts, cached.deletedIds);
    }
  }

  // Deduplicate concurrent fetches (e.g. ProductsPage + header both mount)
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const res = await api.getProducts({ limit: 100 });
      const apiProducts = res.products || [];
      const deletedIds = res.deletedIds || [];

      writeCache(apiProducts, deletedIds);
      return mergeWithLocal(apiProducts, deletedIds);
    } catch (err) {
      console.error('Products fetch failed:', err);

      // Return stale cache if available
      if (memoryCache) {
        return mergeWithLocal(memoryCache.apiProducts, memoryCache.deletedIds);
      }

      // Final fallback: local static data
      return localProducts;
    } finally {
      inflightPromise = null;
    }
  })();

  return inflightPromise;
}

/**
 * Clear the products cache. Call after admin creates/updates/deletes a product.
 */
export function invalidateProductsCache() {
  memoryCache = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}
