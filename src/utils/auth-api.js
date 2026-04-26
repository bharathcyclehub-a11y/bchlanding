/**
 * Authenticated API Utility
 *
 * This module provides utilities for making authenticated API calls
 * to the backend with Firebase ID token
 *
 * Usage:
 * import { authenticatedFetch } from './utils/auth-api';
 *
 * const data = await authenticatedFetch('/api/lead', {
 *   method: 'GET',
 *   getIdToken: () => yourTokenGetter()
 * });
 */

import { auth } from '../config/firebase';

/**
 * Make an authenticated API request
 * Automatically includes Firebase ID token in Authorization header
 *
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {Function} options.getIdToken - Function to get ID token (from useAuth hook)
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.headers - Additional headers
 * @returns {Promise<any>} Response data
 * @throws {Error} If request fails or user is not authenticated
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    // Get ID token
    let idToken;

    if (options.getIdToken) {
      // Use provided getIdToken function (from useAuth hook)
      idToken = await options.getIdToken();
    } else {
      // Fallback: Get token directly from Firebase auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User is not authenticated');
      }
      idToken = await currentUser.getIdToken();
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...options.headers
    };

    // Prepare fetch options — always bypass browser HTTP cache for admin calls
    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      cache: 'no-store'
    };

    // Add body if provided (for POST, PATCH, etc.)
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    // Make request
    const response = await fetch(url, fetchOptions);

    // Check content type before parsing
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Expected JSON response but got:', contentType, text.substring(0, 200));
      throw new Error(`Server returned non-JSON response (${response.status}). Check server logs.`);
    }

    // Parse response
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error('❌ Authenticated API request failed:', error);
    throw error;
  }
}

/**
 * Admin API Service
 * Provides methods for common admin API operations
 */
export class AdminAPI {
  constructor(getIdToken) {
    this.getIdToken = getIdToken;
  }

  /**
   * Verify admin token
   */
  async verifyAdmin() {
    return await authenticatedFetch('/api/admin/verify', {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get all leads with stats
   */
  async getLeads(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.leadStatus) queryParams.append('leadStatus', filters.leadStatus);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.source) queryParams.append('source', filters.source);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.cursor) queryParams.append('cursor', filters.cursor);
    if (filters.orderBy) queryParams.append('orderBy', filters.orderBy);
    if (filters.order) queryParams.append('order', filters.order);

    const url = `/api/lead${queryParams.toString() ? `?${queryParams}` : ''}`;

    return await authenticatedFetch(url, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get single lead by ID
   */
  async getLead(leadId) {
    return await authenticatedFetch(`/api/lead/${leadId}`, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Update lead
   */
  async updateLead(leadId, updates) {
    return await authenticatedFetch(`/api/lead/${leadId}`, {
      method: 'PATCH',
      body: updates,
      getIdToken: this.getIdToken
    });
  }

  /**
   * Delete lead
   */
  async deleteLead(leadId) {
    return await authenticatedFetch(`/api/lead/${leadId}`, {
      method: 'DELETE',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get all admin users (super admin only)
   */
  async getAdminUsers() {
    return await authenticatedFetch('/api/admin/users', {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Create new admin user (super admin only)
   */
  async createAdminUser(userData) {
    return await authenticatedFetch('/api/admin/users', {
      method: 'POST',
      body: userData,
      getIdToken: this.getIdToken
    });
  }

  /**
   * Set admin role for user (super admin only)
   */
  async setAdminRole(email, role = 'admin') {
    return await authenticatedFetch('/api/admin/set-admin-role', {
      method: 'POST',
      body: { email, role, isAdmin: true },
      getIdToken: this.getIdToken
    });
  }

  // ============================================
  // PRODUCT MANAGEMENT METHODS
  // ============================================

  /**
   * Get all products with optional filters
   */
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.cursor) queryParams.append('cursor', filters.cursor);

    const url = `/api/products${queryParams.toString() ? `?${queryParams}` : ''}`;

    return await authenticatedFetch(url, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId) {
    return await authenticatedFetch(`/api/products/${productId}`, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    return await authenticatedFetch('/api/products', {
      method: 'POST',
      body: productData,
      getIdToken: this.getIdToken
    });
  }

  /**
   * Update product
   */
  async updateProduct(productId, updates) {
    return await authenticatedFetch(`/api/products/${productId}`, {
      method: 'PATCH',
      body: updates,
      getIdToken: this.getIdToken
    });
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    return await authenticatedFetch(`/api/products/${productId}`, {
      method: 'DELETE',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Upload product image
   */
  async uploadProductImage(file) {
    const idToken = await this.getIdToken();

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/products/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return data.imageUrl;
  }

  /**
   * Bulk import products
   */
  async bulkImportProducts(products) {
    return await authenticatedFetch('/api/products/bulk', {
      method: 'POST',
      body: { products },
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get engagement stats (exit intent popup analytics)
   */
  async getEngagementStats(days = 30) {
    return await authenticatedFetch(`/api/analytics/engagement?days=${days}`, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get visitor events feed
   */
  async getVisitorEvents(limit = 100, action = 'all') {
    const params = new URLSearchParams({ limit, action });
    return await authenticatedFetch(`/api/analytics/visitor?${params}`, {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Get tracking settings (pause/live status)
   */
  async getTrackingSettings() {
    return await authenticatedFetch('/api/analytics/settings', {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }

  /**
   * Toggle tracking on/off
   * @param {string} key - 'visitor_tracking' or 'engagement_tracking'
   * @param {boolean} enabled - true = live, false = paused
   */
  async setTrackingStatus(key, enabled) {
    return await authenticatedFetch('/api/analytics/settings', {
      method: 'POST',
      body: { key, enabled },
      getIdToken: this.getIdToken
    });
  }

  /**
   * Export all products
   */
  async exportProducts() {
    return await authenticatedFetch('/api/products/bulk', {
      method: 'GET',
      getIdToken: this.getIdToken
    });
  }
}

/**
 * React Hook: useAdminAPI
 * Use this in components to get an AdminAPI instance
 *
 * @example
 * import { useAdminAPI } from './utils/auth-api';
 *
 * function MyComponent() {
 *   const adminAPI = useAdminAPI();
 *
 *   const loadLeads = async () => {
 *     const data = await adminAPI.getLeads();
 *     console.log(data.leads);
 *   };
 * }
 */
import { useAuth } from '../contexts/AuthContext';

/**
 * React Hook: useAdminAPI
 * Use this in components to get an AdminAPI instance
 */
export function useAdminAPI() {
  const { getIdToken } = useAuth();
  return new AdminAPI(getIdToken);
}

export default {
  authenticatedFetch,
  AdminAPI,
  useAdminAPI
};
