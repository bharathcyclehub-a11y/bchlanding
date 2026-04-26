/**
 * Single Product API - Get, Update, Delete
 * GET    /api/products/[id] - Get single product (public)
 * PATCH  /api/products/[id] - Update product (admin only)
 * DELETE /api/products/[id] - Delete product (admin only)
 */

import { verifyAdmin } from '../_lib/auth-middleware.js';
import { FirestoreService } from '../_lib/firestore-service.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const firestoreService = new FirestoreService();

  // GET - Get single product (public)
  if (req.method === 'GET') {
    try {
      const product = await firestoreService.getProduct(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch product',
      });
    }
  }

  // PATCH - Update product (admin only)
  if (req.method === 'PATCH') {
    try {
      // Verify admin authentication
      const adminUser = await verifyAdmin(req);
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Admin access required',
        });
      }

      const updates = req.body;

      // Don't allow updating the ID
      if (updates.id) {
        delete updates.id;
      }

      await firestoreService.updateProduct(id, updates);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update product',
      });
    }
  }

  // DELETE - Delete product (admin only)
  if (req.method === 'DELETE') {
    try {
      // Verify admin authentication
      const adminUser = await verifyAdmin(req);
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Admin access required',
        });
      }

      await firestoreService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete product',
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}
