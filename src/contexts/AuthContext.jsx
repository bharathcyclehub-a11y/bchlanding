/**
 * Authentication Context Provider (Supabase Auth)
 *
 * Provides authentication state + methods for the admin panel.
 *
 * Admin verification is done SERVER-SIDE: after sign-in we send the Supabase
 * access token to GET /api/admin/verify, which validates the token and checks
 * the admin role server-side (the source of truth). isAdmin reflects that
 * server response — not anything the client could forge. The data-write APIs
 * independently re-authorize every request via the same server middleware.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Pull a normalized user + token out of a Supabase session.
// NOTE: admin status is NOT trusted from here — it is confirmed server-side
// via /api/admin/verify (see verifyAdminWithServer below).
function deriveUser(session) {
  const u = session?.user;
  if (!u) return { user: null, token: null };

  const meta = u.app_metadata || {};
  const role = meta.role || null;

  return {
    user: {
      uid: u.id,
      email: u.email,
      displayName: u.user_metadata?.displayName || (u.email ? u.email.split('@')[0] : ''),
      emailVerified: !!u.email_confirmed_at,
      role,
    },
    token: session?.access_token || null,
  };
}

// Authoritative admin check — asks the backend to validate the token + role.
async function verifyAdminWithServer(token) {
  if (!token) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data?.success && (data.user?.admin || data.user?.role));
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize from the persisted session + subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const apply = async (session) => {
      const { user: u, token } = deriveUser(session);
      const admin = await verifyAdminWithServer(token);
      if (!mounted) return;
      setUser(u ? { ...u, admin } : null);
      setIdToken(token);
      setIsAdmin(admin);
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data }) => apply(data.session))
      .catch((err) => {
        console.error('❌ Failed to load session:', err);
        if (mounted) { setError(err.message); setLoading(false); }
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  /**
   * Login with email + password.
   * Admin status is checked client-side from the session's app_metadata.
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        let msg = 'Login failed. Please try again.';
        if (/invalid login credentials/i.test(signInError.message)) msg = 'Invalid email or password.';
        else if (/email not confirmed/i.test(signInError.message)) msg = 'Email not confirmed. Contact support.';
        else if (signInError.message) msg = signInError.message;
        setError(msg);
        return { success: false, error: msg };
      }

      const token = data.session?.access_token;
      const admin = await verifyAdminWithServer(token);
      if (!admin) {
        await supabase.auth.signOut();
        const msg = 'You do not have admin privileges. Please contact support.';
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true, user: data.user, token };
    } catch (err) {
      console.error('❌ Login failed:', err);
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIdToken(null);
      setIsAdmin(false);
      return { success: true };
    } catch (err) {
      console.error('❌ Logout failed:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get the current access token. Supabase auto-refreshes; pass forceRefresh
   * to force a refresh when needed.
   */
  const getIdToken = async (forceRefresh = false) => {
    if (forceRefresh) {
      const { data, error: refErr } = await supabase.auth.refreshSession();
      if (refErr) throw refErr;
      const token = data.session?.access_token || null;
      setIdToken(token);
      return token;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || null;
    if (token && token !== idToken) setIdToken(token);
    return token;
  };

  // Kept for API compatibility — re-reads admin status from the refreshed session.
  const refreshClaims = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      const { user: u, token } = deriveUser(data.session);
      const admin = await verifyAdminWithServer(token);
      setUser(u ? { ...u, admin } : null);
      setIsAdmin(admin);
      setIdToken(token);
    } catch (err) {
      console.error('❌ Failed to refresh claims:', err);
    }
  };

  const value = { user, loading, error, idToken, isAdmin, login, logout, getIdToken, refreshClaims };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
