/**
 * Firebase Client SDK Configuration
 *
 * IMPORTANT NOTES:
 * - This file uses ONLY Firebase Client SDK (NOT Admin SDK)
 * - Safe to use in frontend React code
 * - Only handles authentication, NOT Firestore operations
 * - All database operations go through backend API
 *
 * Environment Variables Required (in .env):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    '❌ Missing required Firebase environment variables:',
    missingVars
  );
  console.error('Please add these to your .env.local file. See .env.example for template.');
  throw new Error(`Missing Firebase config: ${missingVars.join(', ')}`);
}

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Connect to Firebase Auth Emulator in development (optional)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔧 Connected to Firebase Auth Emulator');
  }

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export { app, auth };
