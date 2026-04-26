/**
 * Admin Verification Endpoint
 *
 * GET /api/admin/verify
 * Verifies that the authenticated user has admin privileges
 *
 * Requires: Authorization header with Firebase ID token
 */

import { requireAdmin } from '../_lib/auth-middleware.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only GET requests are allowed'
    });
  }

  try {
    // Verify user is authenticated and has admin role
    const user = await requireAdmin(req, res);

    if (!user) {
      // Response already sent by requireAdmin middleware
      return;
    }

    // Return user info with role
    return res.status(200).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role || 'admin',
        admin: user.admin || false
      }
    });

  } catch (error) {
    console.error('❌ Admin verification error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to verify admin status'
    });
  }
}
