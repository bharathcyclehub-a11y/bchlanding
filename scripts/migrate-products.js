/**
 * Product Migration Script
 *
 * This script migrates products from src/data/products.js to Firestore
 * Run with: node scripts/migrate-products.js
 *
 * Prerequisites:
 * - .env.local file with Firebase Admin credentials
 * - Firebase project setup
 */

import { products } from '../src/data/products.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Initialize Firebase Admin SDK
import admin from 'firebase-admin';

try {
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      throw new Error('Missing Firebase Admin credentials in .env.local');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
    });

    console.log('✅ Firebase Admin SDK initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Migrate products to Firestore
 */
async function migrateProducts() {
  console.log(`\n🚀 Starting product migration...`);
  console.log(`📦 Found ${products.length} products in products.js\n`);

  const batch = db.batch();
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const product of products) {
    try {
      const productRef = db.collection('products').doc(product.id);

      // Transform product data
      const productData = {
        id: product.id,
        name: product.name,
        category: product.category,
        subCategory: product.subCategory || null,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        specs: product.specs || {},
        badge: product.badge || null,
        shortDescription: product.shortDescription || '',
        sizeGuide: product.sizeGuide || null,
        warranty: product.warranty || null,
        accessories: product.accessories || [],
        reviews: product.reviews || null,
        stock: product.stock || {
          quantity: 10, // Default stock
          status: 'in_stock'
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(productRef, productData);
      successCount++;

      console.log(`✅ ${successCount}/${products.length} - ${product.name} (${product.id})`);
    } catch (error) {
      errorCount++;
      errors.push({
        product: product.name,
        id: product.id,
        error: error.message,
      });
      console.error(`❌ Error with ${product.name}:`, error.message);
    }
  }

  // Commit the batch
  try {
    await batch.commit();
    console.log(`\n✅ Batch committed successfully!`);
  } catch (error) {
    console.error(`❌ Batch commit failed:`, error);
    process.exit(1);
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Migration Summary:`);
  console.log(`✅ Successfully migrated: ${successCount} products`);
  console.log(`❌ Failed: ${errorCount} products`);
  console.log(`${'='.repeat(50)}\n`);

  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(err => {
      console.log(`  - ${err.product} (${err.id}): ${err.error}`);
    });
  }

  console.log(`\n✅ Migration completed!`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Verify products in Firebase Console: https://console.firebase.google.com`);
  console.log(`   2. Test the admin panel at /admin`);
  console.log(`   3. Update frontend to fetch products from Firestore instead of products.js\n`);
}

// Run migration
migrateProducts()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
