/**
 * Products API - List and Create
 * GET  /api/products - List all products (public + admin with filters)
 * POST /api/products - Create new product (admin only)
 */

import { verifyAdmin } from '../_lib/auth-middleware.js';
import { FirestoreService } from '../_lib/firestore-service.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const firestoreService = new FirestoreService();

  // GET - List products (public + admin)
  if (req.method === 'GET') {
    try {
      const { category, limit = '50', cursor, status } = req.query;

      const filters = {};
      if (category && category !== 'all') filters.category = category;
      if (status && status !== 'all') filters['stock.status'] = status;

      const result = await firestoreService.listProducts({
        ...filters,
        limit: parseInt(limit),
        cursor,
      });

      // Cache at CDN only (s-maxage), never in browser (max-age=0) so client-side
      // cache invalidation (productsCache.js) works correctly after admin mutations.
      res.setHeader('Cache-Control', 'public, s-maxage=300, max-age=0, must-revalidate');

      return res.status(200).json({
        success: true,
        products: result.products,
        deletedIds: result.deletedIds || [],
        nextCursor: result.nextCursor,
        total: result.total,
      });
    } catch (error) {
      console.error('❌ Error listing products:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to list products',
      });
    }
  }

  // POST - Create product (admin only)
  if (req.method === 'POST') {
    try {
      // Verify admin authentication
      const adminUser = await verifyAdmin(req);
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Admin access required',
        });
      }

      const productData = req.body;

      // Validate required fields
      const requiredFields = ['name', 'category', 'price', 'mrp', 'image'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Create product
      const productId = await firestoreService.createProduct(productData);

      return res.status(201).json({
        success: true,
        productId,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create product',
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}
