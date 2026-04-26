/**
 * Cleanup Old Firestore Products Script
 *
 * Deletes all emotorad products from Firestore so the fresh
 * products.js data is used instead of stale Firestore records.
 *
 * Run: node scripts/cleanup-firestore-products.cjs
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

console.log('🧹 Cleaning up old Firestore EMotorad products\n');

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

async function cleanup() {
  const db = admin.firestore();

  // Get all products from Firestore
  const snapshot = await db.collection('products').get();

  if (snapshot.empty) {
    console.log('No products found in Firestore.');
    return;
  }

  console.log(`Found ${snapshot.size} products in Firestore:\n`);

  const toDelete = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`  ${doc.id} → ${data.name || 'unnamed'} (₹${data.price || 0})`);

    // Delete all emotorad products (they'll be loaded fresh from products.js)
    if (doc.id.startsWith('emotorad-')) {
      toDelete.push(doc.id);
    }
  });

  if (toDelete.length === 0) {
    console.log('\nNo emotorad products to delete.');
    return;
  }

  console.log(`\n🗑️  Deleting ${toDelete.length} emotorad products...`);

  const batch = db.batch();
  for (const id of toDelete) {
    batch.delete(db.collection('products').doc(id));
  }

  await batch.commit();
  console.log(`✅ Deleted ${toDelete.length} products from Firestore.`);
  console.log('\nThe admin panel will now load EMotorad data from products.js.');
  console.log('When you edit & save a product, it will be synced to Firestore.');
}

cleanup()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
