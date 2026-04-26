/**
 * Firebase Admin SDK Initialization
 *
 * CRITICAL SECURITY NOTES:
 * - This file should ONLY be imported in backend/serverless functions
 * - NEVER import this in React components or frontend code
 * - Uses singleton pattern to prevent multiple initializations
 * - Service account credentials come from environment variables
 */

import admin from 'firebase-admin';

// Singleton instance to prevent multiple initializations
let adminInstance = null;

/**
 * Initialize Firebase Admin SDK with service account credentials
 */
function initializeFirebaseAdmin() {
  if (adminInstance) {
    return adminInstance;
  }

  if (admin.apps.length > 0) {
    adminInstance = admin.app();
    return adminInstance;
  }

  try {
    const requiredEnvVars = [
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_PRIVATE_KEY',
      'FIREBASE_ADMIN_CLIENT_EMAIL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      const errorMsg = `Firebase Admin SDK keys are missing in Vercel: ${missingVars.join(', ')}`;
      console.error('❌', errorMsg);
      // Return a special error object that can be handled 
      throw new Error(errorMsg);
    }

    // Process private key - handle both escaped \n and actual newlines
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    if (privateKey) {
      // 1. First trim any outer whitespace
      privateKey = privateKey.trim();

      // 2. Handle double-quoting if user copied "key content" into Vercel
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1).trim();
      }

      // 3. CRITICAL: Handle double-escaped newlines (\\n) which often happens in Vercel
      privateKey = privateKey.replace(/\\n/g, '\n');

      // Debug info (safe) - Helps user verify if key is being mangled
      console.log('🔑 Key Format Check:', {
        length: privateKey.length,
        hasHeaders: privateKey.includes('BEGIN') && privateKey.includes('END'),
        hasInternalNewlines: privateKey.includes('\n'),
        first5: privateKey.substring(0, 5)
      });
    }

    // Trim all values to remove any trailing whitespace/newlines (common Vercel issue)
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID.trim();
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim();

    console.log('🔧 Project ID:', projectId);
    console.log('🔧 Client Email:', clientEmail);

    adminInstance = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        privateKey: privateKey,
        clientEmail: clientEmail,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });

    console.log('✅ Firebase Admin initialized successfully');
    return adminInstance;

  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    throw error;
  }
}

function getAdmin() {
  if (!adminInstance) {
    return initializeFirebaseAdmin();
  }
  return adminInstance;
}

function getFirestore() {
  const app = getAdmin();
  return app.firestore();
}

function getAuth() {
  const app = getAdmin();
  return app.auth();
}

async function verifyIdToken(idToken) {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken, true);
    return decodedToken;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
}

async function setCustomClaims(uid, claims) {
  try {
    const auth = getAuth();
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user ${uid}:`, claims);
  } catch (error) {
    console.error('❌ Failed to set custom claims:', error.message);
    throw error;
  }
}

async function getUserByEmail(email) {
  const auth = getAuth();
  return await auth.getUserByEmail(email);
}

async function createUser(email, password, additionalData = {}) {
  const auth = getAuth();
  return await auth.createUser({
    email,
    password,
    emailVerified: false,
    ...additionalData
  });
}

async function deleteUser(uid) {
  const auth = getAuth();
  return await auth.deleteUser(uid);
}

export {
  getAdmin,
  getFirestore,
  getAuth,
  verifyIdToken,
  setCustomClaims,
  getUserByEmail,
  createUser,
  deleteUser,
  admin
};
