/**
 * Categories API Hub
 * Merged into single serverless function to save Vercel function slots
 *
 * GET    /api/categories          - List all categories (public)
 * POST   /api/categories          - Create new category (admin only)
 * GET    /api/categories/:slug    - Get category details (public)
 * PATCH  /api/categories/:slug    - Update category (admin only)
 * DELETE /api/categories/:slug    - Delete category (admin only)
 */

import {
  listCategories,
  createCategory,
  seedDefaultCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} from '../_lib/firestore-service.js';
import { verifyAdmin } from '../_lib/auth-middleware.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vercel catch-all: req.query.path is an array or undefined
  const pathParts = req.query.path || [];
  const slug = pathParts[0] || null;

  try {
    // --- LIST / CREATE (no slug) ---
    if (!slug) {
      if (req.method === 'GET') {
        let categories = await listCategories();

        if (categories.length === 0) {
          await seedDefaultCategories();
          categories = await listCategories();
        }

        res.setHeader('Cache-Control', 'public, s-maxage=600, max-age=60');
        return res.status(200).json({ success: true, data: categories });
      }

      if (req.method === 'POST') {
        const admin = await verifyAdmin(req);
        if (!admin) {
          return res.status(401).json({ success: false, error: 'Unauthorized - Admin access required' });
        }

        const { name, icon, description, order } = req.body;
        if (!name) {
          return res.status(400).json({ success: false, error: 'Category name is required' });
        }

        const newSlug = await createCategory({ name, icon, description, order });
        return res.status(201).json({ success: true, data: { slug: newSlug }, message: `Category "${name}" created successfully` });
      }

      return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
    }

    // --- SINGLE CATEGORY (with slug) ---
    if (req.method === 'GET') {
      const category = await getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ success: false, error: `Category not found: ${slug}` });
      }
      return res.status(200).json({ success: true, data: category });
    }

    if (req.method === 'PATCH') {
      const admin = await verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Unauthorized - Admin access required' });
      }

      const { name, icon, description, order } = req.body;
      await updateCategory(slug, {
        ...(name && { name }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order })
      });

      return res.status(200).json({ success: true, message: `Category "${slug}" updated successfully` });
    }

    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Unauthorized - Admin access required' });
      }

      const result = await deleteCategory(slug);
      return res.status(200).json({ success: true, message: result.message });
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });

  } catch (error) {
    console.error(`❌ Categories API error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
}
