/**
 * Authentication Context Provider
 *
 * Provides Firebase Authentication state and methods throughout the app
 *
 * Features:
 * - User authentication state
 * - Login/logout methods
 * - Firebase ID token management
 * - Admin role verification
 * - Automatic token refresh
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Create context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Wrap your app with this to provide authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Initialize authentication state
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    if (!auth) {
      console.error('❌ Firebase auth not initialized. Check your VITE_FIREBASE_* env variables in .env.local');
      setLoading(false);
      setError('Firebase not configured. Please check environment variables.');
      return;
    }

    // Set persistence to LOCAL (survive page reloads)
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Auth persistence set to LOCAL
      })
      .catch((err) => {
        console.error('❌ Failed to set auth persistence:', err);
      });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          // User authenticated

          // Get ID token
          const token = await firebaseUser.getIdToken();
          setIdToken(token);

          // Get ID token result to check custom claims
          const tokenResult = await firebaseUser.getIdTokenResult();
          const adminClaim = tokenResult.claims.admin || false;
          const roleClaim = tokenResult.claims.role || null;

          setIsAdmin(adminClaim);

          // Set user state
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            admin: adminClaim,
            role: roleClaim
          });

          // Verify with backend
          await verifyAdminWithBackend(token);

        } else {
          // User is signed out
          // User signed out
          setUser(null);
          setIdToken(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('❌ Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  /**
   * Refresh ID token periodically
   * Tokens expire after 1 hour, refresh every 50 minutes
   */
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken(true); // Force refresh
          setIdToken(token);
          // Token refreshed
        }
      } catch (err) {
        console.error('❌ Token refresh failed:', err);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Verify admin role with backend
   * This ensures the custom claim is actually valid
   */
  const verifyAdminWithBackend = async (token) => {
    try {
      // Use /api directly - works in both dev (port 5175) and production
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Admin verification failed');
      }

      const data = await response.json();
      // Admin verified

    } catch (err) {
      // Expected to fail if user doesn't have admin role - not an error
      // User is not admin or token expired
      setIsAdmin(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Check if user has admin claim
      const tokenResult = await userCredential.user.getIdTokenResult();
      const adminClaim = tokenResult.claims.admin || false;

      if (!adminClaim) {
        // User exists but is not an admin
        await signOut(auth);
        throw new Error('You do not have admin privileges. Please contact support.');
      }

      // Login successful

      return {
        success: true,
        user: userCredential.user,
        token
      };

    } catch (err) {
      console.error('❌ Login failed:', err);

      // Handle specific error codes
      let errorMessage = 'Login failed. Please try again.';

      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message.includes('admin privileges')) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
      setIsAdmin(false);
      // Logout successful

      return { success: true };

    } catch (err) {
      console.error('❌ Logout failed:', err);
      setError(err.message);

      return {
        success: false,
        error: err.message
      };
    }
  };

  /**
   * Get current ID token
   * Force refresh if needed
   */
  const getIdToken = async (forceRefresh = false) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is signed in');
      }

      const token = await currentUser.getIdToken(forceRefresh);
      // Only update state when force-refreshing to avoid unnecessary re-renders
      if (forceRefresh) {
        setIdToken(token);
      }
      return token;

    } catch (err) {
      console.error('❌ Failed to get ID token:', err);
      throw err;
    }
  };

  /**
   * Refresh custom claims
   * Call this after admin role is granted
   */
  const refreshClaims = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Force token refresh to get new claims
      const token = await currentUser.getIdToken(true);
      setIdToken(token);

      const tokenResult = await currentUser.getIdTokenResult(true);
      const adminClaim = tokenResult.claims.admin || false;
      const roleClaim = tokenResult.claims.role || null;

      setIsAdmin(adminClaim);

      setUser(prev => ({
        ...prev,
        admin: adminClaim,
        role: roleClaim
      }));

      // Claims refreshed

    } catch (err) {
      console.error('❌ Failed to refresh claims:', err);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    idToken,
    isAdmin,
    login,
    logout,
    getIdToken,
    refreshClaims
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
