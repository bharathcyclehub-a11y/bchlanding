require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    })
  });
}
const db = admin.firestore();

const action = process.argv[2]; // 'list' or 'delete-demo'

(async () => {
  const snap = await db.collection('leads').orderBy('createdAt', 'desc').limit(100).get();

  if (action === 'delete-demo') {
    // Delete leads with clearly fake/test names
    const demoNames = ['vvvv', 'test', 'demo', 'asdf', 'aaa', 'bbb', 'xxx', 'yyy', 'zzz', 'abc'];
    let deleted = 0;
    for (const doc of snap.docs) {
      const d = doc.data();
      const name = (d.name || '').toLowerCase().trim();
      const isDemo = demoNames.some(n => name === n || name.startsWith('test'));
      if (isDemo) {
        console.log('Deleting:', doc.id, '|', d.name, '|', d.phone);
        await doc.ref.delete();
        deleted++;
      }
    }
    console.log(`\nDeleted ${deleted} demo leads.`);
  } else {
    // List all
    snap.forEach(doc => {
      const d = doc.data();
      console.log(doc.id, '|', d.name, '|', d.phone, '|', d.payment?.status || 'N/A', '|', d.source);
    });
    console.log('\nTotal:', snap.size);
  }
  process.exit(0);
})();
