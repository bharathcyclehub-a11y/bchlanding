/**
 * Create First Admin User Script
 *
 * This script creates an admin user in Firebase Authentication
 * and grants them admin privileges via custom claims.
 *
 * Run: node scripts/create-admin-user.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Admin credentials to create
const ADMIN_EMAIL = 'admin@bch.com';
const ADMIN_PASSWORD = 'admin@123';  // Match your Firebase password

console.log('🔐 Creating Admin User for Bharat Cycle Hub\n');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    })
  });
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('📧 Creating user:', ADMIN_EMAIL);

    // Check if user already exists
    let user;
    try {
      user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('⚠️  User already exists:', user.uid);
      console.log('   Using existing user and updating claims...\n');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        user = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          emailVerified: true,
          displayName: 'Admin User'
        });
        console.log('✅ User created successfully!');
        console.log('   User ID:', user.uid);
        console.log('   Email:', user.email);
        console.log('');
      } else {
        throw error;
      }
    }

    // Set custom claims to grant admin privileges
    console.log('🔑 Granting admin privileges...');
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'super_admin'
    });
    console.log('✅ Admin privileges granted!\n');

    // Create user document in Firestore
    console.log('💾 Creating user document in Firestore...');
    const db = admin.firestore();
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      role: 'super_admin',
      permissions: ['view_leads', 'edit_leads', 'delete_leads', 'manage_users'],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ User document created in Firestore\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Admin Login Credentials:');
    console.log('   Email:    ', ADMIN_EMAIL);
    console.log('   Password: ', ADMIN_PASSWORD);
    console.log('');
    console.log('🌐 Admin Panel URL:');
    console.log('   Local:      http://localhost:5173/admin');
    console.log('   Production: https://bharathcyclehub.store/admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    console.log('');
    console.log('✅ You can now login to the admin panel with these credentials.');
    console.log('═══════════════════════════════════════════════════════');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    console.error('\nDetails:', error.message);

    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n💡 Make sure Firestore database is created in Firebase Console');
    }

    process.exit(1);
  }
}

createAdminUser();
