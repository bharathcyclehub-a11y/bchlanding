
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import admin from 'firebase-admin';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin (Inline directly to avoid import issues or dependency on other files)
// We use the logic from api/lib/firebase-admin.js somewhat, but simplified for this script.

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

console.log('--- Firebase Admin User Verification ---');
console.log(`Checking project: ${projectId}`);
console.log(`Checking email: ${clientEmail}`);

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

// Fix private key format
privateKey = privateKey.trim();
if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

const auth = admin.auth();
const targetEmail = 'admin@bch.com';

async function verifyUser() {
  try {
    console.log(`Searching for user: ${targetEmail}...`);
    const user = await auth.getUserByEmail(targetEmail);
    console.log('✅ USER FOUND:');
    console.log(`  UID: ${user.uid}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    console.log(`  Disabled: ${user.disabled}`);
    
    // Check custom claims
    const userRecord = await auth.getUser(user.uid);
    console.log(`  Custom Claims:`, userRecord.customClaims);

    if (userRecord.customClaims && userRecord.customClaims.admin) {
        console.log('✅ User has ADMIN claim.');
    } else {
        console.log('⚠️ User exists but DOES NOT have admin claim.');
        console.log('Attempting to add admin claim...');
        await auth.setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
        console.log('✅ Admin claim added.');
    }

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User NOT found.');
      console.log('creating user...');
      try {
        // We set a temporary password or just create it. 
        // We can't set password cleanly without knowing what the user wants.
        // But we can create it with a default one and tell the user.
        const password = 'admin123'; // Default password
        const newUser = await auth.createUser({
            email: targetEmail,
            emailVerified: true,
            password: password,
            displayName: 'Admin User',
            disabled: false
        });
        console.log(`✅ User created successfully with password: ${password}`);
        await auth.setCustomUserClaims(newUser.uid, { admin: true, role: 'admin' });
        console.log('✅ Admin claim set for new user.');
        
      } catch (createError) {
        console.error('❌ Failed to create user:', createError.message);
      }
    } else {
      console.error('❌ Error fetching user:', error);
    }
  }
}

verifyUser();
