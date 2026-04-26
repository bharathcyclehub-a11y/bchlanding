/**
 * Firestore Database Service Layer
 *
 * This service provides clean abstraction for Firestore operations
 * All database logic is centralized here for maintainability
 *
 * Collections:
 * - leads: Customer test ride bookings
 * - users: Admin users (synced with Firebase Auth)
 * - analytics: Daily/monthly aggregated stats (optional)
 */

import { getFirestore, admin } from './firebase-admin.js';

/**
 * Get Firestore timestamp (current server time)
 * Use this for createdAt, updatedAt fields
 *
 * @returns {admin.firestore.Timestamp} Server timestamp
 */
function getTimestamp() {
  return admin.firestore.FieldValue.serverTimestamp();
}

// ============================================
// LEADS COLLECTION OPERATIONS
// ============================================

/**
 * Create a new lead in Firestore
 *
 * @param {Object} leadData - Lead information
 * @param {string} leadData.name - Customer name
 * @param {string} leadData.phone - Customer phone number
 * @param {string} [leadData.email] - Customer email (optional)
 * @param {Object} leadData.quizAnswers - Quiz responses
 * @param {string} [leadData.source] - Landing page source
 * @param {string} [leadData.category] - Lead category (99 Offer, Test Ride, EMI, Exchange, General)
 * @returns {Promise<Object>} Created lead with ID
 */
async function createLead(leadData) {
  try {
    const db = getFirestore();
    const leadsRef = db.collection('leads');

    // Generate custom ID with timestamp
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const lead = {
      id: leadId,
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || null,
      message: leadData.message || null,
      quizAnswers: leadData.quizAnswers || {},

      // Payment info (initially unpaid)
      payment: {
        status: 'UNPAID',
        transactionId: null,
        merchantTransactionId: null,
        amount: 99, // ₹99 in rupees
        currency: 'INR',
        method: null,
        paidAt: null
      },

      // Metadata
      source: leadData.source || 'unknown',
      category: leadData.category || 'General',
      utmSource: leadData.utmSource || null,
      utmMedium: leadData.utmMedium || null,
      utmCampaign: leadData.utmCampaign || null,

      // Status tracking
      status: 'NEW', // NEW, CONTACTED, SCHEDULED, COMPLETED, CANCELLED
      assignedTo: null,
      notes: '',

      // Timestamps
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    await leadsRef.doc(leadId).set(lead);
    invalidateStatsCache(); // New lead changes stats

    console.log(`✅ Lead created: ${leadId}`);

    return {
      success: true,
      leadId,
      lead
    };

  } catch (error) {
    console.error('❌ Failed to create lead:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }
}

/**
 * Get all leads with optional filtering
 *
 * @param {Object} filters - Query filters
 * @param {string} [filters.status] - Filter by payment status (PAID, UNPAID, etc.)
 * @param {string} [filters.leadStatus] - Filter by lead status (NEW, CONTACTED, etc.)
 * @param {string} [filters.category] - Filter by lead category (99 Offer, Test Ride, EMI, Exchange, General)
 * @param {string} [filters.fromDate] - Filter leads created after this date (ISO string)
 * @param {string} [filters.toDate] - Filter leads created before this date (ISO string)
 * @param {number} [filters.limit] - Max number of results (default: 100)
 * @param {string} [filters.orderBy] - Order by field (default: 'createdAt')
 * @param {string} [filters.order] - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Array>} Array of leads
 */
/**
 * Get all leads with optional filtering and pagination
 *
 * @param {Object} filters - Query filters
 * @param {string} [filters.status] - Filter by payment status (PAID, UNPAID, etc.)
 * @param {string} [filters.leadStatus] - Filter by lead status (NEW, CONTACTED, etc.)
 * @param {string} [filters.category] - Filter by lead category (99 Offer, Test Ride, EMI, Exchange, General)
 * @param {string} [filters.fromDate] - Filter leads created after this date (ISO string)
 * @param {string} [filters.toDate] - Filter leads created before this date (ISO string)
 * @param {number} [filters.limit] - Max number of results (default: 20)
 * @param {string} [filters.cursor] - Last visible document ID for pagination
 * @param {string} [filters.orderBy] - Order by field (default: 'createdAt')
 * @param {string} [filters.order] - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Array>} Array of leads
 */
async function getLeads(filters = {}) {
  try {
    const db = getFirestore();
    let query = db.collection('leads');

    // Apply Filters directly in Firestore Query
    // Note: This may require composite indexes in Firestore Console

    // Track if we're using any filter that requires client-side sorting
    // (to avoid composite index requirements)
    let usingInFilter = false;

    // 1. Status Filter (Payment Status)
    if (filters.status && filters.status !== 'all') {
      const targetStatus = filters.status.toUpperCase();
      query = query.where('payment.status', '==', targetStatus);
      usingInFilter = true; // Skip orderBy to avoid composite index
    }

    // 2. Lead Status Filter
    if (filters.leadStatus && filters.leadStatus !== 'all') {
      query = query.where('status', '==', filters.leadStatus);
      usingInFilter = true; // Skip orderBy to avoid composite index
    }

    // 3. Source Filter (e.g., 'product-catalog', 'product-detail', 'test-ride-landing')
    if (filters.source && filters.source !== 'all') {
      if (filters.source === 'product') {
        // Match both product-catalog and product-detail sources
        // Note: IN filter with orderBy requires composite index
        // We'll use IN but skip orderBy in Firestore, sort client-side instead
        query = query.where('source', 'in', ['product-catalog', 'product-detail']);
        usingInFilter = true;
      } else {
        // Even equality filter on source + orderBy requires composite index
        // Skip orderBy and sort client-side instead
        query = query.where('source', '==', filters.source);
        usingInFilter = true;
      }
    }

    // 4. Category Filter
    // Note: To avoid composite index requirements, we skip orderBy when category filter is used
    // and sort client-side instead
    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'Test Ride') {
        // 'Test Ride' is a complex condition in the old code...
        // For simplicity and performance, we'll try to use the 'category' field directly if possible.
        // If the data is dirty (category not set but source set), we might miss some.
        // Assuming 'category' field is reliably populated now (or we should migrate data).
        // Using 'in' operator to catch multiple variations
        query = query.where('category', 'in', ['Test Ride', '99 Offer']);
        usingInFilter = true;
      } else {
        query = query.where('category', '==', filters.category);
        // Even with equality filter, if combined with other filters, may need index
        // Skip orderBy to avoid index requirement
        usingInFilter = true;
      }
    }

    // 5. Date Range Filters
    // When combined with other where() filters, do date filtering client-side
    // to avoid composite index requirements
    let clientFromDate = null;
    let clientToDate = null;

    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      if (usingInFilter) {
        clientFromDate = fromDate;
      } else {
        query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(fromDate));
      }
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      if (usingInFilter) {
        clientToDate = toDate;
      } else {
        query = query.where('createdAt', '<=', admin.firestore.Timestamp.fromDate(toDate));
      }
    }

    // Default Ordering
    // Note: If using IN filter, we skip orderBy in Firestore to avoid composite index requirement
    // We'll sort client-side instead after fetching the data
    const orderByField = filters.orderBy || 'createdAt';
    const orderDir = filters.order || 'desc';

    console.log('🔍 Query Debug:', {
      filters: JSON.stringify(filters),
      usingInFilter,
      willUseOrderBy: !usingInFilter
    });

    if (!usingInFilter) {
      // Safe to use orderBy in Firestore
      console.log('⚠️ Using Firestore orderBy - may require composite index!');
      query = query.orderBy(orderByField, orderDir);
    } else {
      console.log('✅ Skipping Firestore orderBy - will sort client-side');
    }

    // Pagination: Start After Cursor
    // Note: Skip cursor pagination when using IN filter with client-side sorting
    if (filters.cursor && !usingInFilter) {
      const cursorDoc = await db.collection('leads').doc(filters.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    // Limit Result Set
    const limit = parseInt(filters.limit) || 20;
    // Fetch more if we need to do client-side date filtering
    const fetchLimit = (clientFromDate || clientToDate) ? limit * 5 : limit;
    query = query.limit(fetchLimit);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    let results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        payment: {
          ...data.payment,
          paidAt: data.payment?.paidAt?.toDate?.()?.toISOString() || null
        }
      };
    });

    // Client-side date filtering when combined with other where() filters
    if (clientFromDate) {
      results = results.filter(r => r.createdAt && new Date(r.createdAt) >= clientFromDate);
    }
    if (clientToDate) {
      results = results.filter(r => r.createdAt && new Date(r.createdAt) <= clientToDate);
    }

    // Client-side sorting when we skipped Firestore orderBy (due to IN filter)
    if (usingInFilter) {
      results.sort((a, b) => {
        const aValue = a[orderByField] || '';
        const bValue = b[orderByField] || '';

        if (orderDir === 'desc') {
          // Newest first: larger date string = newer
          if (aValue > bValue) return -1;
          if (aValue < bValue) return 1;
          return 0;
        } else {
          if (aValue > bValue) return 1;
          if (aValue < bValue) return -1;
          return 0;
        }
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Failed to get leads:', error);

    // Fallback for missing index errors: simplify query
    if (error.code === 9 || error.message.includes('index')) {
      console.warn('⚠️ Missing index detected. Suggestion: Check Firebase Console.');
    }

    throw new Error(`Failed to get leads: ${error.message}`);
  }
}

/**
 * Get a single lead by ID
 *
 * @param {string} leadId - Lead ID
 * @returns {Promise<Object|null>} Lead data or null if not found
 */
async function getLeadById(leadId) {
  try {
    const db = getFirestore();
    const leadDoc = await db.collection('leads').doc(leadId).get();

    if (!leadDoc.exists) {
      return null;
    }

    const data = leadDoc.data();
    return {
      id: leadDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      payment: {
        ...data.payment,
        paidAt: data.payment?.paidAt?.toDate?.()?.toISOString() || null
      }
    };

  } catch (error) {
    console.error('❌ Failed to get lead:', error);
    throw new Error(`Failed to get lead: ${error.message}`);
  }
}

/**
 * Update lead payment status
 *
 * @param {string} leadId - Lead ID
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.status - Payment status (PAID, FAILED, PENDING)
 * @param {string} [paymentData.transactionId] - Payment gateway transaction ID
 * @param {string} [paymentData.orderId] - Razorpay order ID
 * @param {string} [paymentData.merchantTransactionId] - Merchant transaction ID
 * @param {string} [paymentData.method] - Payment method (RAZORPAY, PHONEPE, etc.)
 * @param {number} [paymentData.amount] - Payment amount
 * @param {string} [paymentData.currency] - Payment currency
 * @param {string} [paymentData.errorMessage] - Error message for failed payments
 * @returns {Promise<Object>} Updated lead
 */
async function updateLeadPayment(leadId, paymentData, { skipExistenceCheck = false } = {}) {
  try {
    const db = getFirestore();
    const leadRef = db.collection('leads').doc(leadId);

    // Skip existence check if caller already verified (saves 1 Firestore read)
    if (!skipExistenceCheck) {
      const leadDoc = await leadRef.get();
      if (!leadDoc.exists) {
        throw new Error(`Lead not found: ${leadId}`);
      }
    }

    // Update payment info
    const updateData = {
      'payment.status': paymentData.status,
      'payment.method': paymentData.method || 'RAZORPAY',
      updatedAt: getTimestamp()
    };

    if (paymentData.transactionId) {
      updateData['payment.transactionId'] = paymentData.transactionId;
    }

    if (paymentData.orderId) {
      updateData['payment.orderId'] = paymentData.orderId;
    }

    if (paymentData.merchantTransactionId) {
      updateData['payment.merchantTransactionId'] = paymentData.merchantTransactionId;
    }

    if (paymentData.amount !== undefined) {
      updateData['payment.amount'] = paymentData.amount;
    }

    if (paymentData.currency) {
      updateData['payment.currency'] = paymentData.currency;
    }

    if (paymentData.errorMessage) {
      updateData['payment.errorMessage'] = paymentData.errorMessage;
    }

    // Set paidAt timestamp if payment is successful
    if (paymentData.status === 'PAID') {
      updateData['payment.paidAt'] = getTimestamp();
    }

    await leadRef.update(updateData);
    invalidateStatsCache(); // Payment status change affects stats

    console.log(`✅ Lead payment updated: ${leadId} - ${paymentData.status}`);

    // Build return object from update data instead of re-reading (saves 1 read)
    return { id: leadId, payment: { ...paymentData }, updatedAt: new Date().toISOString() };

  } catch (error) {
    console.error('❌ Failed to update lead payment:', error);
    throw new Error(`Failed to update lead payment: ${error.message}`);
  }
}

/**
 * Update lead status and notes
 *
 * @param {string} leadId - Lead ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.status] - Lead status (NEW, CONTACTED, SCHEDULED, etc.)
 * @param {string} [updates.notes] - Admin notes
 * @param {string} [updates.assignedTo] - Assigned admin user ID
 * @returns {Promise<Object>} Updated lead
 */
async function updateLead(leadId, updates, { skipExistenceCheck = false } = {}) {
  try {
    const db = getFirestore();
    const leadRef = db.collection('leads').doc(leadId);

    // Skip existence check if caller already verified (saves 1 Firestore read)
    if (!skipExistenceCheck) {
      const leadDoc = await leadRef.get();
      if (!leadDoc.exists) {
        throw new Error(`Lead not found: ${leadId}`);
      }
    }

    const updateData = {
      ...updates,
      updatedAt: getTimestamp()
    };

    await leadRef.update(updateData);

    console.log(`✅ Lead updated: ${leadId}`);

    // Re-read to return full updated lead (1 read — needed for complete response)
    return await getLeadById(leadId);

  } catch (error) {
    console.error('❌ Failed to update lead:', error);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
}

/**
 * Delete a lead
 *
 * @param {string} leadId - Lead ID
 * @returns {Promise<Object>} Success response
 */
async function deleteLead(leadId) {
  try {
    const db = getFirestore();
    await db.collection('leads').doc(leadId).delete();
    invalidateStatsCache(); // Deleted lead changes stats

    console.log(`✅ Lead deleted: ${leadId}`);

    return {
      success: true,
      message: `Lead ${leadId} deleted successfully`
    };

  } catch (error) {
    console.error('❌ Failed to delete lead:', error);
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}

/**
 * Get leads statistics (total, paid, unpaid, revenue)
 *
 * @returns {Promise<Object>} Stats object
 */
async function getLeadsStats({ useCache = true } = {}) {
  // Return cached stats if fresh (saves 5-6 Firestore reads)
  if (useCache && _statsCache.data && (Date.now() - _statsCache.ts < STATS_TTL)) {
    return _statsCache.data;
  }

  try {
    const db = getFirestore();
    const leadsRef = db.collection('leads');

    // Run count aggregations in parallel (5 reads)
    const [totalSnap, paidSnap, unpaidSnap, pendingSnap, failedSnap] = await Promise.all([
      leadsRef.count().get(),
      leadsRef.where('payment.status', '==', 'PAID').count().get(),
      leadsRef.where('payment.status', '==', 'UNPAID').count().get(),
      leadsRef.where('payment.status', '==', 'PENDING').count().get(),
      leadsRef.where('payment.status', '==', 'FAILED').count().get()
    ]);

    // Revenue: only fetch if paid leads exist
    let revenue = 0;
    const paidCount = paidSnap.data().count;

    if (paidCount > 0) {
      const paidLeadsSnap = await leadsRef
        .where('payment.status', '==', 'PAID')
        .select('payment.amount')
        .get();

      paidLeadsSnap.forEach(doc => {
        revenue += doc.data()?.payment?.amount || 0;
      });
    }

    const stats = {
      total: totalSnap.data().count,
      paid: paidCount,
      unpaid: unpaidSnap.data().count,
      pending: pendingSnap.data().count,
      failed: failedSnap.data().count,
      revenue,
      revenueInRupees: revenue
    };

    // Cache the result
    _statsCache = { data: stats, ts: Date.now() };

    return stats;

  } catch (error) {
    console.error('❌ Failed to get leads stats:', error);
    return {
      total: 0, paid: 0, unpaid: 0, pending: 0, failed: 0, revenue: 0, revenueInRupees: 0
    };
  }
}

// ============================================
// USER COLLECTION OPERATIONS (Admin Users)
// ============================================

/**
 * Create or update user document in Firestore
 * This should be called after creating a user in Firebase Auth
 *
 * @param {string} uid - Firebase Auth user ID
 * @param {Object} userData - User data
 * @returns {Promise<Object>} User document
 */
async function createOrUpdateUser(uid, userData) {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);

    const userDoc = {
      uid,
      email: userData.email,
      displayName: userData.displayName || null,
      photoURL: userData.photoURL || null,
      role: userData.role || 'admin',
      permissions: userData.permissions || ['view_leads', 'edit_leads'],
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdBy: userData.createdBy || null,
      createdAt: getTimestamp(),
      lastLogin: getTimestamp()
    };

    await userRef.set(userDoc, { merge: true });

    console.log(`✅ User document created/updated: ${uid}`);

    return userDoc;

  } catch (error) {
    console.error('❌ Failed to create/update user:', error);
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

/**
 * Get user by ID
 *
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserById(uid) {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null
    };

  } catch (error) {
    console.error('❌ Failed to get user:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Get all admin users
 *
 * @returns {Promise<Array>} Array of users
 */
async function getAllUsers() {
  try {
    const db = getFirestore();
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      return [];
    }

    return usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null
      };
    });

  } catch (error) {
    console.error('❌ Failed to get users:', error);
    throw new Error(`Failed to get users: ${error.message}`);
  }
}

/**
 * Update user last login timestamp
 *
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
async function updateUserLastLogin(uid) {
  try {
    const db = getFirestore();
    await db.collection('users').doc(uid).update({
      lastLogin: getTimestamp()
    });

    console.log(`✅ User last login updated: ${uid}`);

  } catch (error) {
    console.error('❌ Failed to update user last login:', error);
    // Don't throw error - this is not critical
  }
}

// ============================================
// PRODUCTS COLLECTION OPERATIONS
// ============================================

// Server-side cache for soft-deleted product IDs (avoids extra Firestore read per request)
let _deletedIdsCache = { ids: null, ts: 0 };
const DELETED_IDS_TTL = 30 * 60 * 1000; // 30 minutes (invalidated on delete ops)

// Server-side cache for categories (small, rarely changes)
let _categoriesCache = { data: null, ts: 0 };
const CATEGORIES_TTL = 10 * 60 * 1000; // 10 minutes

// Server-side cache for lead stats (expensive: 5 aggregation queries)
let _statsCache = { data: null, ts: 0 };
const STATS_TTL = 2 * 60 * 1000; // 2 minutes

// Invalidate stats cache (call after lead create/update/delete)
function invalidateStatsCache() {
  _statsCache = { data: null, ts: 0 };
}

// Invalidate categories cache (call after category create/update/delete)
function invalidateCategoriesCache() {
  _categoriesCache = { data: null, ts: 0 };
}

/**
 * Create a new product in Firestore
 *
 * @param {Object} productData - Product information
 * @returns {Promise<string>} Product ID
 */
async function createProduct(productData) {
  try {
    const db = getFirestore();
    const productsRef = db.collection('products');

    // Generate product ID
    const productId = productData.id || `${productData.category}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

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
      stock: productData.stock || {
        quantity: 0,
        status: 'out_of_stock'
      },
      deleted: false,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    await productsRef.doc(productId).set(product);

    console.log(`✅ Product created: ${productId}`);

    return productId;

  } catch (error) {
    console.error('❌ Failed to create product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

/**
 * Get a single product by ID
 *
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} Product data or null
 */
async function getProduct(productId) {
  try {
    const db = getFirestore();
    const productDoc = await db.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return null;
    }

    const data = productDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
    };

  } catch (error) {
    console.error('❌ Failed to get product:', error);
    throw new Error(`Failed to get product: ${error.message}`);
  }
}

/**
 * List products with optional filters and pagination
 *
 * @param {Object} options - Query options
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.status] - Filter by stock status
 * @param {number} [options.limit=50] - Number of results per page
 * @param {string} [options.cursor] - Pagination cursor (product ID)
 * @returns {Promise<Object>} { products, nextCursor, total }
 */
async function listProducts(options = {}) {
  try {
    const db = getFirestore();
    const {
      category,
      status,
      limit = 50,
      cursor
    } = options;

    let query = db.collection('products');
    let useClientSort = false;

    // Apply where filters BEFORE orderBy to avoid composite index issues
    if (category) {
      query = query.where('category', '==', category);
      useClientSort = true;
    }

    if (status) {
      query = query.where('stock.status', '==', status);
      useClientSort = true;
    }

    // Only use Firestore orderBy when no where filters (avoids composite index requirement)
    if (!useClientSort) {
      query = query.orderBy('createdAt', 'desc');
    }

    query = query.limit(limit);

    // Apply cursor for pagination (only when using Firestore orderBy)
    if (cursor && !useClientSort) {
      const cursorDoc = await db.collection('products').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();

    // Fetch soft-deleted IDs with server-side caching (avoids extra Firestore read per request)
    let deletedIds;
    if (_deletedIdsCache.ids && Date.now() - _deletedIdsCache.ts < DELETED_IDS_TTL) {
      deletedIds = _deletedIdsCache.ids;
    } else {
      const deletedSnap = await db.collection('products').where('deleted', '==', true).select('id').get();
      deletedIds = deletedSnap.docs.map(doc => doc.data().id || doc.id);
      _deletedIdsCache = { ids: deletedIds, ts: Date.now() };
    }

    if (snapshot.empty) {
      return {
        products: [],
        deletedIds,
        nextCursor: null,
        total: 0
      };
    }

    const allProducts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    });

    // Filter out soft-deleted products from results (deletedIds already fetched above)
    let products = allProducts.filter(p => p.deleted !== true);

    // Client-side sort when we skipped Firestore orderBy
    if (useClientSort) {
      products.sort((a, b) => {
        const aDate = a.createdAt || '';
        const bDate = b.createdAt || '';
        return bDate > aDate ? 1 : bDate < aDate ? -1 : 0;
      });
    }

    // Get total count (active products only)
    const total = products.length;

    // Next cursor is the last document's ID
    const nextCursor = snapshot.docs.length === limit
      ? snapshot.docs[snapshot.docs.length - 1].id
      : null;

    return {
      products,
      deletedIds,
      nextCursor,
      total
    };

  } catch (error) {
    console.error('❌ Failed to list products:', error);
    throw new Error(`Failed to list products: ${error.message}`);
  }
}

/**
 * Update a product
 *
 * @param {string} productId - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateProduct(productId, updates) {
  try {
    const db = getFirestore();
    const productRef = db.collection('products').doc(productId);

    // Check if product exists — if not, create it (upsert)
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      // Product only exists locally (products.js) — create it in Firestore
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
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
      };

      await productRef.set(product);
      console.log(`✅ Product created (upsert): ${productId}`);
      return;
    }

    const updateData = {
      ...updates,
      deleted: false,
      updatedAt: getTimestamp()
    };

    await productRef.update(updateData);

    console.log(`✅ Product updated: ${productId}`);

  } catch (error) {
    console.error('❌ Failed to update product:', error);
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

/**
 * Delete a product
 *
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Success response
 */
async function deleteProduct(productId) {
  try {
    const db = getFirestore();
    const productRef = db.collection('products').doc(productId);

    // Soft-delete: mark as deleted (upsert) so local-only products are also tracked
    await productRef.set({
      id: productId,
      deleted: true,
      updatedAt: getTimestamp()
    }, { merge: true });

    // Invalidate deletedIds cache
    _deletedIdsCache = { ids: null, ts: 0 };

    console.log(`✅ Product soft-deleted: ${productId}`);

    return {
      success: true,
      message: `Product ${productId} deleted successfully`
    };

  } catch (error) {
    console.error('❌ Failed to delete product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Bulk import products
 *
 * @param {Array} products - Array of product objects
 * @returns {Promise<Object>} Import results
 */
async function bulkImportProducts(products) {
  try {
    const db = getFirestore();
    const batch = db.batch();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const productData of products) {
      try {
        const productId = productData.id || `${productData.category}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const productRef = db.collection('products').doc(productId);

        const product = {
          ...productData,
          id: productId,
          createdAt: getTimestamp(),
          updatedAt: getTimestamp()
        };

        batch.set(productRef, product, { merge: true });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          product: productData.name || 'Unknown',
          error: error.message
        });
      }
    }

    await batch.commit();

    console.log(`✅ Bulk import completed: ${results.success} success, ${results.failed} failed`);

    return results;

  } catch (error) {
    console.error('❌ Failed to bulk import products:', error);
    throw new Error(`Failed to bulk import products: ${error.message}`);
  }
}

// ============================================
// CATEGORIES COLLECTION OPERATIONS
// ============================================

/**
 * List all categories
 * @returns {Promise<Array>} Array of categories
 */
async function listCategories() {
  // Return cached categories if fresh (saves 1 Firestore read)
  if (_categoriesCache.data && (Date.now() - _categoriesCache.ts < CATEGORIES_TTL)) {
    return _categoriesCache.data;
  }

  try {
    const db = getFirestore();
    const snapshot = await db.collection('categories').orderBy('order', 'asc').get();

    if (snapshot.empty) {
      return [];
    }

    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    });

    // Cache the result
    _categoriesCache = { data: categories, ts: Date.now() };

    return categories;
  } catch (error) {
    console.error('❌ Failed to list categories:', error);
    throw new Error(`Failed to list categories: ${error.message}`);
  }
}

/**
 * Get a single category by slug (direct doc read — 1 read instead of fetching all)
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} Category or null
 */
async function getCategoryBySlug(slug) {
  // Try cache first
  if (_categoriesCache.data && (Date.now() - _categoriesCache.ts < CATEGORIES_TTL)) {
    return _categoriesCache.data.find(cat => cat.slug === slug) || null;
  }

  try {
    const db = getFirestore();
    const doc = await db.collection('categories').doc(slug).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
    };
  } catch (error) {
    console.error('❌ Failed to get category:', error);
    return null;
  }
}

/**
 * Create a new category
 * @param {Object} categoryData - Category information
 * @returns {Promise<string>} Category slug
 */
async function createCategory(categoryData) {
  try {
    const db = getFirestore();
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await db.collection('categories').doc(slug).get();
    if (existing.exists) {
      throw new Error(`Category with slug "${slug}" already exists`);
    }

    const category = {
      slug,
      name: categoryData.name,
      icon: categoryData.icon || '🚲',
      description: categoryData.description || '',
      order: categoryData.order || 99,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };

    await db.collection('categories').doc(slug).set(category);
    invalidateCategoriesCache();
    console.log(`✅ Category created: ${slug}`);
    return slug;
  } catch (error) {
    console.error('❌ Failed to create category:', error);
    throw new Error(`Failed to create category: ${error.message}`);
  }
}

/**
 * Update a category
 * @param {string} slug - Category slug
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateCategory(slug, updates) {
  try {
    const db = getFirestore();
    const catRef = db.collection('categories').doc(slug);
    const catDoc = await catRef.get();
    if (!catDoc.exists) {
      throw new Error(`Category not found: ${slug}`);
    }

    const updateData = { ...updates, updatedAt: getTimestamp() };
    delete updateData.slug; // Don't allow slug change
    await catRef.update(updateData);
    invalidateCategoriesCache();
    console.log(`✅ Category updated: ${slug}`);
  } catch (error) {
    console.error('❌ Failed to update category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }
}

/**
 * Delete a category
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Success response
 */
async function deleteCategory(slug) {
  try {
    const db = getFirestore();

    // Check if any products use this category
    const productsSnap = await db.collection('products').where('category', '==', slug).limit(1).get();
    if (!productsSnap.empty) {
      throw new Error(`Cannot delete category "${slug}" - it has products. Move or delete them first.`);
    }

    await db.collection('categories').doc(slug).delete();
    invalidateCategoriesCache();
    console.log(`✅ Category deleted: ${slug}`);
    return { success: true, message: `Category ${slug} deleted successfully` };
  } catch (error) {
    console.error('❌ Failed to delete category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

/**
 * Seed default categories if none exist
 * @returns {Promise<void>}
 */
async function seedDefaultCategories() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('categories').limit(1).get();
    if (!snapshot.empty) return; // Already has categories

    const defaults = [
      { slug: 'kids', name: 'Kids Cycles', icon: '🚲', description: 'Safe, colourful cycles for children aged 3–12', order: 1 },
      { slug: 'geared', name: 'Geared Cycles', icon: '⚙️', description: 'Multi-speed bicycles with 21–27 gears', order: 2 },
      { slug: 'mountain', name: 'Mountain Bikes', icon: '⛰️', description: 'Rugged trail-ready MTBs with suspension', order: 3 },
      { slug: 'city', name: 'City / Commuter', icon: '🏙️', description: 'Comfortable everyday bicycles for urban commutes', order: 4 },
      { slug: 'electric', name: 'Electric Bikes', icon: '⚡', description: 'Pedal-assist and throttle e-bikes', order: 5 },
    ];

    const batch = db.batch();
    for (const cat of defaults) {
      const ref = db.collection('categories').doc(cat.slug);
      batch.set(ref, { ...cat, createdAt: getTimestamp(), updatedAt: getTimestamp() });
    }
    await batch.commit();
    console.log('✅ Default categories seeded');
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
  }
}

// ============================================
// TRACKING SETTINGS (Pause/Live toggle)
// ============================================

// Cache tracking settings to avoid Firestore read on every visitor event
const _trackingCache = {};
const TRACKING_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get tracking setting (visitor/engagement pause status)
 * Uses server-side cache to avoid Firestore read per visitor event
 * @param {string} key - Setting key (e.g., 'visitor_tracking', 'engagement_tracking')
 * @returns {Promise<Object>} { enabled: boolean, updatedAt }
 */
async function getTrackingSetting(key = 'visitor_tracking') {
  try {
    const cached = _trackingCache[key];
    if (cached && (Date.now() - cached.ts < TRACKING_TTL)) {
      return cached.data;
    }

    const db = getFirestore();
    const doc = await db.collection('settings').doc(key).get();
    const data = doc.exists ? doc.data() : { enabled: true };

    _trackingCache[key] = { data, ts: Date.now() };
    return data;
  } catch (error) {
    console.error('❌ Failed to get tracking setting:', error);
    return { enabled: true };
  }
}

/**
 * Set tracking setting (pause/resume)
 * Immediately invalidates cache so the change takes effect
 * @param {string} key - Setting key
 * @param {boolean} enabled - true = live, false = paused
 * @returns {Promise<Object>} Updated setting
 */
async function setTrackingSetting(key = 'visitor_tracking', enabled = true) {
  try {
    const db = getFirestore();
    const data = { enabled, updatedAt: getTimestamp() };
    await db.collection('settings').doc(key).set(data, { merge: true });

    // Invalidate cache immediately
    _trackingCache[key] = { data, ts: Date.now() };

    console.log(`✅ Tracking setting "${key}" set to ${enabled ? 'LIVE' : 'PAUSED'}`);
    return data;
  } catch (error) {
    console.error('❌ Failed to set tracking setting:', error);
    throw new Error(`Failed to update tracking setting: ${error.message}`);
  }
}

// ============================================
// ENGAGEMENT EVENTS (Exit Intent Popup tracking)
// ============================================

/**
 * Record an engagement event (popup shown, whatsapp click, call click, dismiss)
 * Events are stored in daily aggregate docs to minimize writes
 *
 * @param {Object} eventData
 * @param {string} eventData.action - popup_shown | whatsapp_click | call_click | dismiss
 * @param {string} eventData.page - Page pathname where event occurred
 * @returns {Promise<void>}
 */
async function recordEngagementEvent(eventData) {
  try {
    const db = getFirestore();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docId = `exit_intent_${today}`;

    const docRef = db.collection('engagement').doc(docId);

    // Use increment for atomic counter updates
    const increment = admin.firestore.FieldValue.increment(1);
    const arrayUnion = admin.firestore.FieldValue.arrayUnion;

    const updateData = {
      date: today,
      updatedAt: getTimestamp()
    };

    // Increment the specific action counter
    updateData[`counts.${eventData.action}`] = increment;
    updateData['counts.total'] = increment;

    // Track pages where events occurred
    if (eventData.page) {
      updateData['pages'] = arrayUnion(eventData.page);
    }

    await docRef.set(updateData, { merge: true });
  } catch (error) {
    console.error('❌ Failed to record engagement event:', error);
    // Don't throw - engagement tracking should never break the user experience
  }
}

/**
 * Get engagement stats for a date range
 *
 * @param {Object} options
 * @param {number} [options.days=30] - Number of days to look back
 * @returns {Promise<Object>} Aggregated stats
 */
async function getEngagementStats(options = {}) {
  try {
    const db = getFirestore();
    const days = options.days || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const snapshot = await db.collection('engagement')
      .where('date', '>=', startDateStr)
      .orderBy('date', 'desc')
      .get();

    if (snapshot.empty) {
      return {
        totals: { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 },
        daily: [],
        topPages: []
      };
    }

    const totals = { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 };
    const daily = [];
    const pageSet = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const counts = data.counts || {};

      totals.popup_shown += counts.popup_shown || 0;
      totals.whatsapp_click += counts.whatsapp_click || 0;
      totals.call_click += counts.call_click || 0;
      totals.dismiss += counts.dismiss || 0;
      totals.total += counts.total || 0;

      daily.push({
        date: data.date,
        ...counts
      });

      // Track pages
      if (data.pages) {
        data.pages.forEach(p => {
          pageSet[p] = (pageSet[p] || 0) + (counts.total || 0);
        });
      }
    });

    const topPages = Object.entries(pageSet)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    return { totals, daily, topPages };
  } catch (error) {
    console.error('❌ Failed to get engagement stats:', error);
    return {
      totals: { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 },
      daily: [],
      topPages: []
    };
  }
}

// ============================================
// VISITOR EVENTS (Individual event log)
// ============================================

/**
 * Record an individual visitor event
 *
 * @param {Object} data
 * @param {string} data.visitorId - Anonymous session-stable visitor ID
 * @param {string} data.action - page_view | popup_shown | whatsapp_click | call_click | dismiss
 * @param {string} data.page - Page pathname
 * @param {string} [data.referrer] - Document referrer
 * @param {number} [data.screenWidth] - Viewport width
 * @returns {Promise<void>}
 */
async function recordVisitorEvent(data) {
  try {
    const db = getFirestore();
    const eventsRef = db.collection('visitor_events');

    await eventsRef.add({
      visitorId: data.visitorId || 'unknown',
      action: data.action,
      page: data.page || '/',
      referrer: data.referrer || null,
      screenWidth: data.screenWidth || null,
      device: data.screenWidth ? (data.screenWidth < 768 ? 'mobile' : data.screenWidth < 1024 ? 'tablet' : 'desktop') : null,
      createdAt: getTimestamp()
    });
  } catch (error) {
    console.error('❌ Failed to record visitor event:', error);
  }
}

/**
 * Get recent visitor events for admin panel
 *
 * @param {Object} options
 * @param {number} [options.limit=50] - Max events to return
 * @param {string} [options.action] - Filter by action type
 * @returns {Promise<Object>} { events, summary }
 */
async function getVisitorEvents(options = {}) {
  try {
    const db = getFirestore();
    const limit = options.limit || 50;

    let query = db.collection('visitor_events')
      .orderBy('createdAt', 'desc');

    if (options.action && options.action !== 'all') {
      query = db.collection('visitor_events')
        .where('action', '==', options.action)
        .orderBy('createdAt', 'desc');
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return { events: [], summary: { total: 0, uniqueVisitors: 0, pageViews: 0, popupShown: 0, whatsappClicks: 0, callClicks: 0 } };
    }

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null
      };
    });

    // Build summary from fetched events
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
      summary: {
        total: events.length,
        uniqueVisitors: visitorIds.size,
        pageViews,
        popupShown,
        whatsappClicks,
        callClicks
      }
    };
  } catch (error) {
    console.error('❌ Failed to get visitor events:', error);
    return { events: [], summary: { total: 0, uniqueVisitors: 0, pageViews: 0, popupShown: 0, whatsappClicks: 0, callClicks: 0 } };
  }
}

export class FirestoreService {
  // Utility
  getTimestamp = getTimestamp;

  // Lead operations
  createLead = createLead;
  getLeads = getLeads;
  getLeadById = getLeadById;
  updateLeadPayment = updateLeadPayment;
  updateLead = updateLead;
  deleteLead = deleteLead;
  getLeadsStats = getLeadsStats;

  // User operations
  createOrUpdateUser = createOrUpdateUser;
  getUserById = getUserById;
  getAllUsers = getAllUsers;
  updateUserLastLogin = updateUserLastLogin;

  // Product operations
  createProduct = createProduct;
  getProduct = getProduct;
  listProducts = listProducts;
  updateProduct = updateProduct;
  deleteProduct = deleteProduct;
  bulkImportProducts = bulkImportProducts;

  // Category operations
  listCategories = listCategories;
  getCategoryBySlug = getCategoryBySlug;
  createCategory = createCategory;
  updateCategory = updateCategory;
  deleteCategory = deleteCategory;
  seedDefaultCategories = seedDefaultCategories;

  // Engagement operations
  recordEngagementEvent = recordEngagementEvent;
  getEngagementStats = getEngagementStats;

  // Visitor operations
  recordVisitorEvent = recordVisitorEvent;
  getVisitorEvents = getVisitorEvents;

  // Tracking settings
  getTrackingSetting = getTrackingSetting;
  setTrackingSetting = setTrackingSetting;

  // Cache management
  invalidateStatsCache = invalidateStatsCache;
  invalidateCategoriesCache = invalidateCategoriesCache;
}

export {
  // Utility
  getTimestamp,

  // Lead operations
  createLead,
  getLeads,
  getLeadById,
  updateLeadPayment,
  updateLead,
  deleteLead,
  getLeadsStats,

  // User operations
  createOrUpdateUser,
  getUserById,
  getAllUsers,
  updateUserLastLogin,

  // Product operations
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  bulkImportProducts,

  // Category operations
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,

  // Engagement operations
  recordEngagementEvent,
  getEngagementStats,

  // Visitor operations
  recordVisitorEvent,
  getVisitorEvents,

  // Tracking settings
  getTrackingSetting,
  setTrackingSetting,

  // Cache management
  invalidateStatsCache,
  invalidateCategoriesCache
};
