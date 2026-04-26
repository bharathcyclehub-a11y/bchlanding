/**
 * Authentication Middleware for Vercel Serverless Functions
 *
 * This middleware provides:
 * 1. Firebase ID Token verification
 * 2. Role-based access control (RBAC)
 * 3. Request authentication utilities
 *
 * Usage in API routes:
 *
 * @example
 * const { requireAuth, requireAdmin } = require('./lib/auth-middleware');
 *
 * module.exports = async (req, res) => {
 *   // Verify user is authenticated
 *   const user = await requireAuth(req, res);
 *   if (!user) return; // Response already sent by middleware
 *
 *   // Your protected logic here
 *   res.json({ message: 'Success', user });
 * };
 */

import { verifyIdToken } from './firebase-admin.js';

/**
 * Extract Bearer token from Authorization header
 *
 * Supports formats:
 * - Authorization: Bearer <token>
 * - Authorization: <token>
 *
 * @param {Object} req - HTTP request object
 * @returns {string|null} Extracted token or null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return null;
  }

  // Check if it starts with "Bearer "
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Return as-is (assume it's just the token)
  return authHeader;
}

/**
 * Middleware: Verify user is authenticated
 * Returns decoded token if valid, sends error response if not
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<Object|null>} Decoded token with user info, or null if auth failed
 *
 * Decoded token structure:
 * {
 *   uid: string,
 *   email: string,
 *   email_verified: boolean,
 *   admin: boolean,  // Custom claim (if set)
 *   role: string,    // Custom claim (if set)
 *   iat: number,
 *   exp: number
 * }
 */
async function requireAuth(req, res) {
  try {
    // Extract token from Authorization header
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing authentication token. Please include Authorization header.'
      });
      return null;
    }

    // Verify token with Firebase Admin
    const decodedToken = await verifyIdToken(token);

    // Attach decoded token to request for downstream use
    req.user = decodedToken;

    return decodedToken;

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);

    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: error.message || 'Invalid or expired authentication token'
    });

    return null;
  }
}

/**
 * Middleware: Verify user is authenticated AND has admin role
 * Checks for custom claim: admin = true
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<Object|null>} Decoded token if admin, null otherwise
 */
async function requireAdmin(req, res) {
  // First, verify authentication
  const decodedToken = await requireAuth(req, res);

  if (!decodedToken) {
    return null; // Auth failed, response already sent
  }

  // Check for admin custom claim
  if (!decodedToken.admin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required. You do not have permission to access this resource.'
    });
    return null;
  }

  return decodedToken;
}

/**
 * Middleware: Verify user has specific role
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Promise<Object|null>} Decoded token if role matches, null otherwise
 *
 * @example
 * const user = await requireRole(req, res, 'super_admin');
 * const user = await requireRole(req, res, ['admin', 'super_admin']);
 */
async function requireRole(req, res, allowedRoles) {
  // First, verify authentication
  const decodedToken = await requireAuth(req, res);

  if (!decodedToken) {
    return null; // Auth failed, response already sent
  }

  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Check if user has one of the allowed roles
  const userRole = decodedToken.role;

  if (!userRole || !roles.includes(userRole)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: `Required role: ${roles.join(' or ')}. Your role: ${userRole || 'none'}`
    });
    return null;
  }

  return decodedToken;
}

/**
 * Middleware: Optional authentication
 * Verifies token if present, but doesn't fail if missing
 * Useful for endpoints that have different behavior for authenticated users
 *
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object|null>} Decoded token if valid, null if not authenticated
 */
async function optionalAuth(req) {
  try {
    const token = extractToken(req);

    if (!token) {
      return null; // No token, but that's okay
    }

    const decodedToken = await verifyIdToken(token);
    req.user = decodedToken;
    return decodedToken;

  } catch (error) {
    // Token was provided but invalid - log but don't fail
    console.warn('⚠️ Optional auth failed:', error.message);
    return null;
  }
}

/**
 * Utility: Check if request is from admin user
 * Does NOT send response, just returns boolean
 *
 * @param {Object} req - HTTP request object (must have req.user from requireAuth)
 * @returns {boolean} True if user is admin
 */
function isAdmin(req) {
  return req.user && req.user.admin === true;
}

/**
 * Utility: Check if request is from user with specific role
 *
 * @param {Object} req - HTTP request object (must have req.user from requireAuth)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {boolean} True if user has role
 */
function hasRole(req, allowedRoles) {
  if (!req.user) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(req.user.role);
}

/**
 * Utility: Get current user ID from request
 *
 * @param {Object} req - HTTP request object (must have req.user from requireAuth)
 * @returns {string|null} User ID or null
 */
function getCurrentUserId(req) {
  return req.user ? req.user.uid : null;
}

/**
 * Set CORS headers for API responses
 * Configurable for development vs production
 *
 * @param {Object} res - HTTP response object
 * @param {Object} options - CORS options
 */
function setCorsHeaders(res, options = {}) {
  const {
    allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5175'
    ].filter(Boolean),
    methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    allowedHeaders = 'Content-Type, Authorization',
    credentials = true,
    requestOrigin
  } = options;

  // Only reflect origin if it's in the allowlist — never fall back to '*'
  const originToSet = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] || '';

  res.setHeader('Access-Control-Allow-Origin', originToSet);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders);

  if (credentials && originToSet) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * Handle OPTIONS preflight request
 * Call this at the start of your API handler
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {boolean} True if OPTIONS request was handled
 */
function handleCors(req, res) {
  setCorsHeaders(res, { requestOrigin: req.headers.origin });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

/**
 * Verify admin without sending response (for API handlers that manage their own responses)
 * Returns decoded token if admin, null otherwise
 *
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object|null>} Decoded token if admin, null otherwise
 */
async function verifyAdmin(req) {
  try {
    const token = extractToken(req);
    if (!token) return null;

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken || !decodedToken.admin) return null;

    req.user = decodedToken;
    return decodedToken;
  } catch (error) {
    console.error('⚠️ verifyAdmin failed:', error.message);
    return null;
  }
}

export {
  // Main middleware functions
  requireAuth,
  requireAdmin,
  requireRole,
  optionalAuth,
  verifyAdmin,

  // Utility functions
  extractToken,
  isAdmin,
  hasRole,
  getCurrentUserId,

  // CORS utilities
  setCorsHeaders,
  handleCors
};
