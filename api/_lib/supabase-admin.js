/**
 * Supabase Admin (service-role) client
 *
 * CRITICAL SECURITY NOTES:
 * - This file should ONLY be imported in backend/serverless functions.
 * - NEVER import this in React components or frontend code — it holds the
 *   service-role key, which bypasses Row Level Security.
 * - Singleton pattern to reuse the client across warm invocations.
 *
 * Replaces the old Firebase Admin SDK. The service-role client is used for
 * all database + storage work; auth tokens issued by Supabase Auth are
 * verified with `verifyIdToken()` below.
 */

import { createClient } from '@supabase/supabase-js';

let _client = null;

/**
 * Get the singleton service-role Supabase client.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabase() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    const missing = [
      !url && 'SUPABASE_URL',
      !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY'
    ].filter(Boolean).join(', ');
    throw new Error(`Supabase admin keys are missing: ${missing}`);
  }

  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return _client;
}

/**
 * Verify a Supabase access token (JWT) and return a normalized user object.
 * Mirrors the old Firebase `verifyIdToken` return shape so downstream code
 * keeps working: { uid, email, email_verified, admin, role }.
 *
 * Admin status comes from app_metadata.role === 'admin' (or admin === true),
 * which is set server-side only (never writable by the user).
 *
 * @param {string} idToken - Supabase access token
 * @returns {Promise<Object>} Decoded user
 */
async function verifyIdToken(idToken) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(idToken);

  if (error || !data?.user) {
    console.error('❌ Token verification failed:', error?.message || 'no user');
    throw new Error('Invalid or expired token');
  }

  const u = data.user;
  const meta = u.app_metadata || {};
  const isAdmin = meta.admin === true || meta.role === 'admin' || meta.role === 'super_admin';

  return {
    uid: u.id,
    email: u.email,
    email_verified: !!u.email_confirmed_at,
    admin: isAdmin,
    role: meta.role || (isAdmin ? 'admin' : null)
  };
}

// ============================================
// AUTH ADMIN HELPERS (used by setup scripts)
// ============================================

async function getUserByEmail(email) {
  const supabase = getSupabase();
  // listUsers is paginated; for the small admin pool a single page is enough.
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function createUser(email, password, { role = 'admin', ...meta } = {}) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role, admin: true },
    user_metadata: meta
  });
  if (error) throw error;
  return data.user;
}

async function setUserRole(uid, role = 'admin') {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.admin.updateUserById(uid, {
    app_metadata: { role, admin: role === 'admin' || role === 'super_admin' }
  });
  if (error) throw error;
  return data.user;
}

async function deleteUser(uid) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.admin.deleteUser(uid);
  if (error) throw error;
}

export {
  getSupabase,
  verifyIdToken,
  getUserByEmail,
  createUser,
  setUserRole,
  deleteUser
};
