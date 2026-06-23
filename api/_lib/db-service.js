/**
 * Database Service Layer (Supabase / Postgres)
 *
 * Replaces the old Firestore service. Each former Firestore "document" is
 * stored as a `doc jsonb` column, so the object shapes the API + admin UI
 * already consume are preserved exactly. Generated columns (category,
 * payment_status, …) + real created_at/updated_at power filtering & sorting.
 *
 * Tables (public schema): leads, products, categories, app_settings,
 * engagement, visitor_events, admin_users.
 *
 * All access is via the service-role client (bypasses RLS).
 */

import crypto from 'crypto';
import { getSupabase } from './supabase-admin.js';

const nowIso = () => new Date().toISOString();

// Random, non-sequential booking reference — e.g. "VPR-7K3F-9QXM".
// Reveals nothing about how many bookings exist. Alphabet excludes
// ambiguous characters (0/O, 1/I/L) so it's safe to read aloud.
const BOOKING_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function genBookingId() {
  let s = '';
  for (let i = 0; i < 8; i++) s += BOOKING_ID_ALPHABET[crypto.randomInt(BOOKING_ID_ALPHABET.length)];
  return `VPR-${s.slice(0, 4)}-${s.slice(4, 8)}`;
}

// ============================================
// LEADS
// ============================================

async function createLead(leadData) {
  const db = getSupabase();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const ts = nowIso();

  const lead = {
    id: leadId,
    bookingId: genBookingId(),
    name: leadData.name,
    phone: leadData.phone,
    email: leadData.email || null,
    message: leadData.message || null,
    area: leadData.area || null,
    childName: leadData.childName || null,
    buyingFor: leadData.buyingFor || null,
    quizAnswers: leadData.quizAnswers || {},

    payment: {
      status: 'UNPAID',
      transactionId: null,
      merchantTransactionId: null,
      amount: 99,
      currency: 'INR',
      method: null,
      paidAt: null
    },

    source: leadData.source || 'unknown',
    category: leadData.category || 'General',
    utmSource: leadData.utmSource || null,
    utmMedium: leadData.utmMedium || null,
    utmCampaign: leadData.utmCampaign || null,

    status: 'NEW',
    assignedTo: null,
    notes: '',

    createdAt: ts,
    updatedAt: ts
  };

  const { error } = await db.from('leads').insert({ id: leadId, doc: lead, created_at: ts, updated_at: ts });
  if (error) throw new Error(`Failed to create lead: ${error.message}`);

  invalidateStatsCache();
  invalidatePreBookingCache();
  return { success: true, leadId, lead };
}

async function getLeads(filters = {}) {
  const db = getSupabase();
  let query = db.from('leads').select('doc, created_at');

  // Payment status
  if (filters.status && filters.status !== 'all') {
    query = query.eq('payment_status', String(filters.status).toUpperCase());
  }
  // Lead status
  if (filters.leadStatus && filters.leadStatus !== 'all') {
    query = query.eq('lead_status', filters.leadStatus);
  }
  // Source
  if (filters.source && filters.source !== 'all') {
    if (filters.source === 'product') {
      query = query.in('source', ['product-catalog', 'product-detail']);
    } else {
      query = query.eq('source', filters.source);
    }
  }
  // Category
  if (filters.category && filters.category !== 'all') {
    if (filters.category === 'Test Ride') {
      query = query.in('category', ['Test Ride', '99 Offer']);
    } else {
      query = query.eq('category', filters.category);
    }
  }
  // Date range (on real created_at column)
  if (filters.fromDate) {
    const from = new Date(filters.fromDate); from.setHours(0, 0, 0, 0);
    query = query.gte('created_at', from.toISOString());
  }
  if (filters.toDate) {
    const to = new Date(filters.toDate); to.setHours(23, 59, 59, 999);
    query = query.lte('created_at', to.toISOString());
  }

  // Cursor (keyset on created_at): everything strictly older than the cursor lead
  const orderDir = (filters.order || 'desc') === 'asc' ? true : false; // true = ascending
  if (filters.cursor) {
    const { data: cur } = await db.from('leads').select('created_at').eq('id', filters.cursor).maybeSingle();
    if (cur?.created_at) {
      query = orderDir ? query.gt('created_at', cur.created_at) : query.lt('created_at', cur.created_at);
    }
  }

  query = query.order('created_at', { ascending: orderDir });

  const limit = parseInt(filters.limit) || 20;
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to get leads: ${error.message}`);

  return (data || []).map(r => r.doc);
}

async function getLeadById(leadId) {
  const db = getSupabase();
  const { data, error } = await db.from('leads').select('doc').eq('id', leadId).maybeSingle();
  if (error) throw new Error(`Failed to get lead: ${error.message}`);
  return data ? data.doc : null;
}

async function updateLeadPayment(leadId, paymentData, { skipExistenceCheck = false } = {}) {
  const db = getSupabase();
  const current = await getLeadById(leadId);
  if (!current) {
    if (skipExistenceCheck) return { id: leadId, payment: { ...paymentData }, updatedAt: nowIso() };
    throw new Error(`Lead not found: ${leadId}`);
  }

  const payment = { ...(current.payment || {}) };
  payment.status = paymentData.status;
  payment.method = paymentData.method || 'RAZORPAY';
  if (paymentData.transactionId) payment.transactionId = paymentData.transactionId;
  if (paymentData.orderId) payment.orderId = paymentData.orderId;
  if (paymentData.merchantTransactionId) payment.merchantTransactionId = paymentData.merchantTransactionId;
  if (paymentData.amount !== undefined) payment.amount = paymentData.amount;
  if (paymentData.currency) payment.currency = paymentData.currency;
  if (paymentData.errorMessage) payment.errorMessage = paymentData.errorMessage;
  if (paymentData.status === 'PAID') payment.paidAt = nowIso();

  const ts = nowIso();
  const doc = { ...current, payment, updatedAt: ts };

  const { error } = await db.from('leads').update({ doc, updated_at: ts }).eq('id', leadId);
  if (error) throw new Error(`Failed to update lead payment: ${error.message}`);

  invalidateStatsCache();
  invalidatePreBookingCache();
  return { id: leadId, payment, updatedAt: ts };
}

async function updateLead(leadId, updates, { skipExistenceCheck = false } = {}) {
  const db = getSupabase();
  const current = await getLeadById(leadId);
  if (!current) throw new Error(`Lead not found: ${leadId}`);

  const ts = nowIso();
  const doc = { ...current, ...updates, updatedAt: ts };

  const { error } = await db.from('leads').update({ doc, updated_at: ts }).eq('id', leadId);
  if (error) throw new Error(`Failed to update lead: ${error.message}`);

  invalidateStatsCache();
  return doc;
}

async function deleteLead(leadId) {
  const db = getSupabase();
  const { error } = await db.from('leads').delete().eq('id', leadId);
  if (error) throw new Error(`Failed to delete lead: ${error.message}`);
  invalidateStatsCache();
  return { success: true, message: `Lead ${leadId} deleted successfully` };
}

async function getLeadsStats({ useCache = true } = {}) {
  if (useCache && _statsCache.data && (Date.now() - _statsCache.ts < STATS_TTL)) {
    return _statsCache.data;
  }

  try {
    const db = getSupabase();
    const countBy = (status) => {
      let q = db.from('leads').select('id', { count: 'exact', head: true });
      if (status) q = q.eq('payment_status', status);
      return q;
    };

    const [total, paid, unpaid, pending, failed] = await Promise.all([
      countBy(null), countBy('PAID'), countBy('UNPAID'), countBy('PENDING'), countBy('FAILED')
    ]);

    let revenue = 0;
    const paidCount = paid.count || 0;
    if (paidCount > 0) {
      const { data } = await db.from('leads').select('doc').eq('payment_status', 'PAID');
      (data || []).forEach(r => { revenue += r.doc?.payment?.amount || 0; });
    }

    const stats = {
      total: total.count || 0,
      paid: paidCount,
      unpaid: unpaid.count || 0,
      pending: pending.count || 0,
      failed: failed.count || 0,
      revenue,
      revenueInRupees: revenue
    };
    _statsCache = { data: stats, ts: Date.now() };
    return stats;
  } catch (error) {
    console.error('❌ Failed to get leads stats:', error);
    return { total: 0, paid: 0, unpaid: 0, pending: 0, failed: 0, revenue: 0, revenueInRupees: 0 };
  }
}

// Pre-booking cache
let _prebookingCache = { data: null, ts: 0 };
const PREBOOKING_TTL = 30 * 1000;
function invalidatePreBookingCache() { _prebookingCache = { data: null, ts: 0 }; }

async function getPreBookingStats({ target = 75, bonusCap = 50, useCache = true } = {}) {
  if (useCache && _prebookingCache.data && (Date.now() - _prebookingCache.ts < PREBOOKING_TTL)) {
    return _prebookingCache.data;
  }
  try {
    const db = getSupabase();
    const { data, error } = await db.from('leads').select('doc').eq('category', 'Pre-Booking');
    if (error) throw error;

    const paid = [];
    (data || []).forEach(r => {
      const d = r.doc || {};
      if (d.payment?.status === 'PAID') {
        const when = d.payment?.paidAt || d.createdAt || null;
        paid.push({
          firstName: (d.name || '').trim().split(/\s+/)[0] || 'A parent',
          area: d.area || null,
          ts: when
        });
      }
    });
    paid.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));

    const result = {
      count: paid.length,
      target,
      bonusCap,
      recent: paid.slice(0, 12).map(p => ({ name: p.firstName, area: p.area, ts: p.ts }))
    };
    _prebookingCache = { data: result, ts: Date.now() };
    return result;
  } catch (error) {
    console.error('❌ Failed to get pre-booking stats:', error);
    return { count: 0, target, bonusCap, recent: [] };
  }
}

// ============================================
// ADMIN USERS (profiles, keyed to auth.users id)
// ============================================

async function createOrUpdateUser(uid, userData) {
  const db = getSupabase();
  const ts = nowIso();
  const existing = await getUserById(uid);

  const userDoc = {
    uid,
    email: userData.email,
    displayName: userData.displayName || null,
    photoURL: userData.photoURL || null,
    role: userData.role || 'admin',
    permissions: userData.permissions || ['view_leads', 'edit_leads'],
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    createdBy: userData.createdBy || null,
    createdAt: existing?.createdAt || ts,
    lastLogin: ts
  };

  const { error } = await db.from('admin_users')
    .upsert({ id: uid, doc: userDoc, updated_at: ts }, { onConflict: 'id' });
  if (error) throw new Error(`Failed to create/update user: ${error.message}`);
  return userDoc;
}

async function getUserById(uid) {
  const db = getSupabase();
  const { data, error } = await db.from('admin_users').select('doc').eq('id', uid).maybeSingle();
  if (error) throw new Error(`Failed to get user: ${error.message}`);
  return data ? data.doc : null;
}

async function getAllUsers() {
  const db = getSupabase();
  const { data, error } = await db.from('admin_users').select('doc');
  if (error) throw new Error(`Failed to get users: ${error.message}`);
  return (data || []).map(r => r.doc);
}

async function updateUserLastLogin(uid) {
  try {
    const db = getSupabase();
    const current = await getUserById(uid);
    if (!current) return;
    const ts = nowIso();
    await db.from('admin_users').update({ doc: { ...current, lastLogin: ts }, updated_at: ts }).eq('id', uid);
  } catch (error) {
    console.error('❌ Failed to update user last login:', error);
  }
}

// ============================================
// PRODUCTS
// ============================================

let _deletedIdsCache = { ids: null, ts: 0 };
const DELETED_IDS_TTL = 30 * 60 * 1000;
let _categoriesCache = { data: null, ts: 0 };
const CATEGORIES_TTL = 10 * 60 * 1000;
let _statsCache = { data: null, ts: 0 };
const STATS_TTL = 2 * 60 * 1000;

function invalidateStatsCache() { _statsCache = { data: null, ts: 0 }; }
function invalidateCategoriesCache() { _categoriesCache = { data: null, ts: 0 }; }

async function createProduct(productData) {
  const db = getSupabase();
  const productId = productData.id || `${productData.category}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const ts = nowIso();
  const product = {
    id: productId,
    name: productData.name,
    category: productData.category,
    price: productData.price,
    mrp: productData.mrp,
    image: productData.image,
    specs: productData.specs || {},
    badge: productData.badge || null,
    shortDescription: productData.shortDescription || '',
    sizeGuide: productData.sizeGuide || null,
    warranty: productData.warranty || null,
    accessories: productData.accessories || [],
    stock: productData.stock || { quantity: 0, status: 'out_of_stock' },
    deleted: false,
    createdAt: ts,
    updatedAt: ts
  };
  const { error } = await db.from('products').insert({ id: productId, doc: product, created_at: ts, updated_at: ts });
  if (error) throw new Error(`Failed to create product: ${error.message}`);
  return productId;
}

async function getProduct(productId) {
  const db = getSupabase();
  const { data, error } = await db.from('products').select('doc').eq('id', productId).maybeSingle();
  if (error) throw new Error(`Failed to get product: ${error.message}`);
  return data ? data.doc : null;
}

async function listProducts(options = {}) {
  const db = getSupabase();
  const { category, status, limit = 50, cursor } = options;

  let query = db.from('products').select('doc, created_at').eq('deleted', false);
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('stock_status', status);

  if (cursor) {
    const { data: cur } = await db.from('products').select('created_at').eq('id', cursor).maybeSingle();
    if (cur?.created_at) query = query.lt('created_at', cur.created_at);
  }

  query = query.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list products: ${error.message}`);

  // Soft-deleted IDs (cached) so the frontend can reconcile local-only products
  let deletedIds;
  if (_deletedIdsCache.ids && Date.now() - _deletedIdsCache.ts < DELETED_IDS_TTL) {
    deletedIds = _deletedIdsCache.ids;
  } else {
    const { data: del } = await db.from('products').select('id').eq('deleted', true);
    deletedIds = (del || []).map(r => r.id);
    _deletedIdsCache = { ids: deletedIds, ts: Date.now() };
  }

  const products = (data || []).map(r => r.doc);
  const nextCursor = products.length === limit ? products[products.length - 1]?.id || null : null;

  return { products, deletedIds, nextCursor, total: products.length };
}

async function updateProduct(productId, updates) {
  const db = getSupabase();
  const current = await getProduct(productId);
  const ts = nowIso();

  if (!current) {
    // Product only existed in local products.js — create it (upsert)
    const product = {
      id: productId,
      name: updates.name || '',
      category: updates.category || '',
      price: updates.price || 0,
      mrp: updates.mrp || 0,
      image: updates.image || '',
      subCategory: updates.subCategory || '',
      cardImage: updates.cardImage || '',
      inStock: updates.inStock !== undefined ? updates.inStock : true,
      specs: updates.specs || {},
      badge: updates.badge || null,
      shortDescription: updates.shortDescription || '',
      sizeGuide: updates.sizeGuide || null,
      warranty: updates.warranty || null,
      accessories: updates.accessories || [],
      colors: updates.colors || [],
      gallery: updates.gallery || [],
      stock: updates.stock || { quantity: 0, status: 'out_of_stock' },
      deleted: false,
      createdAt: ts,
      updatedAt: ts
    };
    const { error } = await db.from('products').upsert({ id: productId, doc: product, created_at: ts, updated_at: ts }, { onConflict: 'id' });
    if (error) throw new Error(`Failed to create product: ${error.message}`);
    _deletedIdsCache = { ids: null, ts: 0 };
    return;
  }

  const doc = { ...current, ...updates, deleted: false, updatedAt: ts };
  const { error } = await db.from('products').update({ doc, updated_at: ts }).eq('id', productId);
  if (error) throw new Error(`Failed to update product: ${error.message}`);
  _deletedIdsCache = { ids: null, ts: 0 };
}

async function deleteProduct(productId) {
  const db = getSupabase();
  const ts = nowIso();
  const current = await getProduct(productId);
  const doc = { ...(current || { id: productId }), deleted: true, updatedAt: ts };
  const { error } = await db.from('products').upsert({ id: productId, doc, updated_at: ts }, { onConflict: 'id' });
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
  _deletedIdsCache = { ids: null, ts: 0 };
  return { success: true, message: `Product ${productId} deleted successfully` };
}

async function bulkImportProducts(products) {
  const db = getSupabase();
  const results = { created: 0, success: 0, failed: 0, errors: [] };
  const rows = [];

  for (const productData of products) {
    try {
      const productId = productData.id || `${productData.category}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const ts = nowIso();
      rows.push({ id: productId, doc: { ...productData, id: productId, deleted: productData.deleted ?? false, createdAt: ts, updatedAt: ts }, created_at: ts, updated_at: ts });
      results.success++; results.created++;
    } catch (error) {
      results.failed++;
      results.errors.push({ product: productData.name || 'Unknown', error: error.message });
    }
  }

  if (rows.length) {
    const { error } = await db.from('products').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`Failed to bulk import products: ${error.message}`);
  }
  _deletedIdsCache = { ids: null, ts: 0 };
  return results;
}

// ============================================
// CATEGORIES
// ============================================

async function listCategories() {
  if (_categoriesCache.data && (Date.now() - _categoriesCache.ts < CATEGORIES_TTL)) {
    return _categoriesCache.data;
  }
  const db = getSupabase();
  const { data, error } = await db.from('categories').select('doc').order('sort_order', { ascending: true });
  if (error) throw new Error(`Failed to list categories: ${error.message}`);
  const categories = (data || []).map(r => r.doc);
  _categoriesCache = { data: categories, ts: Date.now() };
  return categories;
}

async function getCategoryBySlug(slug) {
  if (_categoriesCache.data && (Date.now() - _categoriesCache.ts < CATEGORIES_TTL)) {
    return _categoriesCache.data.find(c => c.slug === slug) || null;
  }
  const db = getSupabase();
  const { data, error } = await db.from('categories').select('doc').eq('slug', slug).maybeSingle();
  if (error) { console.error('❌ Failed to get category:', error); return null; }
  return data ? data.doc : null;
}

async function createCategory(categoryData) {
  const db = getSupabase();
  const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await getCategoryBySlug(slug);
  if (existing) throw new Error(`Category with slug "${slug}" already exists`);

  const ts = nowIso();
  const category = {
    slug,
    name: categoryData.name,
    icon: categoryData.icon || '🚲',
    description: categoryData.description || '',
    order: categoryData.order || 99,
    createdAt: ts,
    updatedAt: ts
  };
  const { error } = await db.from('categories').insert({ slug, doc: category, created_at: ts, updated_at: ts });
  if (error) throw new Error(`Failed to create category: ${error.message}`);
  invalidateCategoriesCache();
  return slug;
}

async function updateCategory(slug, updates) {
  const db = getSupabase();
  const current = await getCategoryBySlug(slug);
  if (!current) throw new Error(`Category not found: ${slug}`);
  const ts = nowIso();
  const u = { ...updates }; delete u.slug;
  const doc = { ...current, ...u, updatedAt: ts };
  const { error } = await db.from('categories').update({ doc, updated_at: ts }).eq('slug', slug);
  if (error) throw new Error(`Failed to update category: ${error.message}`);
  invalidateCategoriesCache();
}

async function deleteCategory(slug) {
  const db = getSupabase();
  const { count } = await db.from('products').select('id', { count: 'exact', head: true }).eq('category', slug).eq('deleted', false);
  if (count && count > 0) {
    throw new Error(`Cannot delete category "${slug}" - it has products. Move or delete them first.`);
  }
  const { error } = await db.from('categories').delete().eq('slug', slug);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
  invalidateCategoriesCache();
  return { success: true, message: `Category ${slug} deleted successfully` };
}

async function seedDefaultCategories() {
  try {
    const db = getSupabase();
    const { count } = await db.from('categories').select('slug', { count: 'exact', head: true });
    if (count && count > 0) return;

    const ts = nowIso();
    const defaults = [
      { slug: 'kids', name: 'Kids Cycles', icon: '🚲', description: 'Safe, colourful cycles for children aged 3–12', order: 1 },
      { slug: 'geared', name: 'Geared Cycles', icon: '⚙️', description: 'Multi-speed bicycles with 21–27 gears', order: 2 },
      { slug: 'mountain', name: 'Mountain Bikes', icon: '⛰️', description: 'Rugged trail-ready MTBs with suspension', order: 3 },
      { slug: 'city', name: 'City / Commuter', icon: '🏙️', description: 'Comfortable everyday bicycles for urban commutes', order: 4 },
      { slug: 'electric', name: 'Electric Bikes', icon: '⚡', description: 'Pedal-assist and throttle e-bikes', order: 5 },
    ];
    const rows = defaults.map(c => ({ slug: c.slug, doc: { ...c, createdAt: ts, updatedAt: ts }, created_at: ts, updated_at: ts }));
    await db.from('categories').insert(rows);
    invalidateCategoriesCache();
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
  }
}

// ============================================
// TRACKING SETTINGS
// ============================================

const _trackingCache = {};
const TRACKING_TTL = 5 * 60 * 1000;

async function getTrackingSetting(key = 'visitor_tracking') {
  try {
    const cached = _trackingCache[key];
    if (cached && (Date.now() - cached.ts < TRACKING_TTL)) return cached.data;

    const db = getSupabase();
    const { data } = await db.from('app_settings').select('doc').eq('key', key).maybeSingle();
    const result = data ? data.doc : { enabled: true };
    _trackingCache[key] = { data: result, ts: Date.now() };
    return result;
  } catch (error) {
    console.error('❌ Failed to get tracking setting:', error);
    return { enabled: true };
  }
}

async function setTrackingSetting(key = 'visitor_tracking', enabled = true) {
  const db = getSupabase();
  const ts = nowIso();
  const data = { enabled, updatedAt: ts };
  const { error } = await db.from('app_settings').upsert({ key, doc: data, updated_at: ts }, { onConflict: 'key' });
  if (error) throw new Error(`Failed to update tracking setting: ${error.message}`);
  _trackingCache[key] = { data, ts: Date.now() };
  return data;
}

// ============================================
// ENGAGEMENT (daily aggregate counters)
// ============================================

async function recordEngagementEvent(eventData) {
  try {
    const db = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    const docId = `exit_intent_${today}`;

    const { data: existing } = await db.from('engagement').select('doc').eq('id', docId).maybeSingle();
    const doc = existing?.doc || { date: today, counts: {}, pages: [] };
    doc.counts = doc.counts || {};
    doc.counts[eventData.action] = (doc.counts[eventData.action] || 0) + 1;
    doc.counts.total = (doc.counts.total || 0) + 1;
    if (eventData.page) {
      doc.pages = Array.isArray(doc.pages) ? doc.pages : [];
      if (!doc.pages.includes(eventData.page)) doc.pages.push(eventData.page);
    }
    doc.date = today;
    doc.updatedAt = nowIso();

    await db.from('engagement').upsert({ id: docId, doc, updated_at: doc.updatedAt }, { onConflict: 'id' });
  } catch (error) {
    console.error('❌ Failed to record engagement event:', error);
  }
}

async function getEngagementStats(options = {}) {
  try {
    const db = getSupabase();
    const days = options.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data } = await db.from('engagement').select('doc').gte('date', startDateStr).order('date', { ascending: false });

    const totals = { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 };
    const daily = [];
    const pageSet = {};

    (data || []).forEach(r => {
      const d = r.doc || {};
      const counts = d.counts || {};
      totals.popup_shown += counts.popup_shown || 0;
      totals.whatsapp_click += counts.whatsapp_click || 0;
      totals.call_click += counts.call_click || 0;
      totals.dismiss += counts.dismiss || 0;
      totals.total += counts.total || 0;
      daily.push({ date: d.date, ...counts });
      if (d.pages) d.pages.forEach(p => { pageSet[p] = (pageSet[p] || 0) + (counts.total || 0); });
    });

    const topPages = Object.entries(pageSet).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }));
    return { totals, daily, topPages };
  } catch (error) {
    console.error('❌ Failed to get engagement stats:', error);
    return { totals: { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 }, daily: [], topPages: [] };
  }
}

// ============================================
// VISITOR EVENTS
// ============================================

async function recordVisitorEvent(data) {
  try {
    const db = getSupabase();
    const doc = {
      visitorId: data.visitorId || 'unknown',
      action: data.action,
      page: data.page || '/',
      referrer: data.referrer || null,
      screenWidth: data.screenWidth || null,
      device: data.screenWidth ? (data.screenWidth < 768 ? 'mobile' : data.screenWidth < 1024 ? 'tablet' : 'desktop') : null,
      createdAt: nowIso()
    };
    await db.from('visitor_events').insert({ doc });
  } catch (error) {
    console.error('❌ Failed to record visitor event:', error);
  }
}

async function getVisitorEvents(options = {}) {
  try {
    const db = getSupabase();
    const limit = options.limit || 50;
    let query = db.from('visitor_events').select('id, doc').order('created_at', { ascending: false });
    if (options.action && options.action !== 'all') query = query.eq('action', options.action);
    query = query.limit(limit);

    const { data } = await query;
    const events = (data || []).map(r => ({ id: r.id, ...r.doc }));

    const visitorIds = new Set();
    let pageViews = 0, popupShown = 0, whatsappClicks = 0, callClicks = 0;
    events.forEach(e => {
      visitorIds.add(e.visitorId);
      if (e.action === 'page_view') pageViews++;
      if (e.action === 'popup_shown') popupShown++;
      if (e.action === 'whatsapp_click') whatsappClicks++;
      if (e.action === 'call_click') callClicks++;
    });

    return {
      events,
      summary: { total: events.length, uniqueVisitors: visitorIds.size, pageViews, popupShown, whatsappClicks, callClicks }
    };
  } catch (error) {
    console.error('❌ Failed to get visitor events:', error);
    return { events: [], summary: { total: 0, uniqueVisitors: 0, pageViews: 0, popupShown: 0, whatsappClicks: 0, callClicks: 0 } };
  }
}

// ============================================
// Service class (compat with route imports) + named exports
// ============================================

export class DbService {
  createLead = createLead;
  getLeads = getLeads;
  getLeadById = getLeadById;
  updateLeadPayment = updateLeadPayment;
  updateLead = updateLead;
  deleteLead = deleteLead;
  getLeadsStats = getLeadsStats;
  getPreBookingStats = getPreBookingStats;

  createOrUpdateUser = createOrUpdateUser;
  getUserById = getUserById;
  getAllUsers = getAllUsers;
  updateUserLastLogin = updateUserLastLogin;

  createProduct = createProduct;
  getProduct = getProduct;
  listProducts = listProducts;
  updateProduct = updateProduct;
  deleteProduct = deleteProduct;
  bulkImportProducts = bulkImportProducts;

  listCategories = listCategories;
  getCategoryBySlug = getCategoryBySlug;
  createCategory = createCategory;
  updateCategory = updateCategory;
  deleteCategory = deleteCategory;
  seedDefaultCategories = seedDefaultCategories;

  recordEngagementEvent = recordEngagementEvent;
  getEngagementStats = getEngagementStats;
  recordVisitorEvent = recordVisitorEvent;
  getVisitorEvents = getVisitorEvents;

  getTrackingSetting = getTrackingSetting;
  setTrackingSetting = setTrackingSetting;

  invalidateStatsCache = invalidateStatsCache;
  invalidateCategoriesCache = invalidateCategoriesCache;
}

export {
  createLead, getLeads, getLeadById, updateLeadPayment, updateLead, deleteLead, getLeadsStats, getPreBookingStats,
  createOrUpdateUser, getUserById, getAllUsers, updateUserLastLogin,
  createProduct, getProduct, listProducts, updateProduct, deleteProduct, bulkImportProducts,
  listCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory, seedDefaultCategories,
  recordEngagementEvent, getEngagementStats, recordVisitorEvent, getVisitorEvents,
  getTrackingSetting, setTrackingSetting,
  invalidateStatsCache, invalidateCategoriesCache
};
