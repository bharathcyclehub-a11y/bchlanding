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

// Real customer lead IDs to KEEP (identified by real names + real phone numbers)
const KEEP_IDS = new Set([
  'lead_1769600475109_fpidkw4ox',  // NEETHA
  'lead_1769564527657_0gd21ings',  // p.n.ramesh
  'lead_1769562913438_b879v4vm3',  // Hareesh Ramappa Annigeri
  'lead_1769562912654_kfjs21kyg',  // Hareesh Ramappa Annigeri
  'lead_1769562912404_yoglygeki',  // Hareesh Ramappa Annigeri
  'lead_1769562911141_e7xym2e32',  // Hareesh Ramappa Annigeri
  'lead_1769528273051_2hz4dl22r',  // ShashiKumar H Lakkanagoudra
  'lead_1769528270069_1lehdu2ma',  // ShashiKumar H Lakkanagoudra
  'lead_1769528269041_wsyrmqgx2',  // ShashiKumar H Lakkanagoudra
  'lead_1769526423330_8eoogd6ff',  // Gundaya Gundaya
  'lead_1769524095074_tfs5ztbjm',  // Rani devi devi
  'lead_1769515246803_nozi9ye3j',  // Hanumantha
  'lead_1769515242286_r37fr7alu',  // Hanumantha
  'lead_1769498262498_1gs4fbp1d',  // J Haripriya
  'lead_1769482232153_frtocsvnr',  // ShashiKumar (contact form)
  'lead_1769546763602_oq1x8om75',  // Arsalan test (real person)
]);

(async () => {
  const snap = await db.collection('leads').get();
  let deleted = 0;
  let kept = 0;

  const batch = db.batch();

  for (const doc of snap.docs) {
    if (KEEP_IDS.has(doc.id)) {
      const d = doc.data();
      console.log('KEEP:', doc.id, '|', d.name);
      kept++;
    } else {
      batch.delete(doc.ref);
      deleted++;
    }
  }

  if (deleted > 0) {
    // Firestore batches max 500 ops
    await batch.commit();
  }

  console.log(`\nDone: Deleted ${deleted} demo leads, kept ${kept} real leads.`);
  process.exit(0);
})();
