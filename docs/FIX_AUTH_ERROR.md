# Fixing Firebase Authentication Error

## Problem
You're getting `Firebase: Error (auth/invalid-credential)` when trying to login to the admin panel in production.

## Root Causes

1. **Email Mismatch** ✅ FIXED
   - The code was using `admin@bicyclehome.com`
   - The actual Firebase user is `admin@bch.com`
   - **Fixed:** Updated all scripts and components to use `admin@bch.com`

2. **Production Firebase Project is Different**
   - Your production site uses Firebase API key: `AIzaSyCxJV51kHNYxYBdd3GQCBOKwxz4FEbSY_A`
   - Your `.env.local` has a different API key: `AIzaSyA2zUqV1UzQ2STcCmMfvu8UiUBob6cNGwk`
   - This means the admin user doesn't exist in the production Firebase project

## Solutions

### Option 1: Create Admin User in Production Firebase (Recommended)

1. **Get Production Firebase Credentials**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Find the project that matches API key: `AIzaSyCxJV51kHNYxYBdd3GQCBOKwxz4FEbSY_A`
   - Go to Project Settings > Service Accounts
   - Generate a new private key (download JSON file)

2. **Update Vercel Environment Variables**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Update these variables with the production Firebase project values:
     - `FIREBASE_ADMIN_PROJECT_ID` - from the JSON file
     - `FIREBASE_ADMIN_CLIENT_EMAIL` - from the JSON file  
     - `FIREBASE_ADMIN_PRIVATE_KEY` - from the JSON file (see format below)
   - Also update the frontend variables:
     - `VITE_FIREBASE_API_KEY` - should match `AIzaSyCxJV51kHNYxYBdd3GQCBOKwxz4FEbSY_A`
     - `VITE_FIREBASE_AUTH_DOMAIN` - from Firebase Console
     - `VITE_FIREBASE_PROJECT_ID` - from Firebase Console
     - `VITE_FIREBASE_STORAGE_BUCKET` - from Firebase Console
     - `VITE_FIREBASE_MESSAGING_SENDER_ID` - from Firebase Console
     - `VITE_FIREBASE_APP_ID` - from Firebase Console

3. **Create Admin User in Production**
   - Run the create script locally with production credentials:
   ```bash
   # Temporarily update .env.local with production Firebase Admin credentials
   # Then run:
   node scripts/create-admin-user.cjs
   ```
   - Or use the Firebase Console:
     - Go to Authentication > Users
     - Click "Add user"
     - Email: `admin@bch.com`
     - Password: `BharathCycle@2024` (change after first login!)
     - Then set custom claims using Firebase Admin SDK or the verify script

4. **Redeploy to Vercel**
   - After updating environment variables, trigger a new deployment
   - Or wait for automatic redeploy

### Option 2: Use Firebase Console to Create User

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter:
   - Email: `admin@bch.com`
   - Password: (choose a secure password)
4. After creating, you need to set admin custom claims:
   - Use the `scripts/verify-admin-user.js` script
   - Or use Firebase Admin SDK in a serverless function

### Option 3: Update Production to Use Local Firebase Project

If you want to use the same Firebase project for both local and production:

1. Update Vercel environment variables to match your `.env.local`
2. Redeploy the application
3. Create the admin user using the create script

## Private Key Format for Vercel

When adding `FIREBASE_ADMIN_PRIVATE_KEY` to Vercel:

1. Open the service account JSON file
2. Copy the `private_key` value (the entire string including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
3. Paste it into Vercel WITHOUT quotes
4. Make sure all `\n` are literal (backslash-n), not actual newlines

Example format:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKnZ+2cimOBlY7\n...more lines...\n-----END PRIVATE KEY-----\n
```

## Verify the Fix

After creating the admin user:

1. Try logging in with:
   - Email: `admin@bch.com`
   - Password: `BharathCycle@2024` (or whatever you set)

2. If it still fails, check:
   - Browser console for detailed error messages
   - Firebase Console > Authentication > Users to confirm user exists
   - Firebase Console > Authentication > Users > [user] > Custom Claims to verify admin claim is set

## Quick Test Script

Run this to verify the admin user exists in your Firebase project:

```bash
node scripts/verify-admin-user.js
```

This will:
- Check if `admin@bch.com` exists
- Verify admin custom claims
- Create the user if it doesn't exist (with default password `admin123`)

## Security Note

⚠️ **IMPORTANT:** Change the default password after first login!
