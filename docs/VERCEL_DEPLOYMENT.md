# Vercel Deployment Guide

## Current Status
Your project is ready for deployment to Vercel.

## Step 1: Complete Vercel Authentication

Visit this URL to authorize the Vercel CLI:
```
https://vercel.com/oauth/device?user_code=FHXG-HWTM
```

## Step 2: Deploy to Vercel

After authentication, the deployment will proceed automatically to:
```
https://vercel.com/tech-2xgs-projects
```

## Step 3: Configure Environment Variables in Vercel

After deployment, add these environment variables in your Vercel project settings:

1. Go to: `https://vercel.com/tech-2xgs-projects/[your-project]/settings/environment-variables`

2. Add the following variables:

### PhonePe Configuration

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_PHONEPE_MERCHANT_ID` | Your Merchant ID | Get from PhonePe Dashboard |
| `VITE_PHONEPE_API_KEY` | `fcf07904-45e3-486c-a658-255598645d23` | Your API Key |
| `VITE_PHONEPE_SALT_KEY` | Your Salt Key | Get from PhonePe Dashboard |
| `VITE_PHONEPE_SALT_INDEX` | `1` | Your Key Index |
| `VITE_PHONEPE_API_ENDPOINT` | `https://api.phonepe.com/apis/pg` | Production Endpoint |

## Step 4: Where to Find PhonePe Credentials

Login to your PhonePe Business Dashboard:
1. Go to **Settings** → **API Keys**
2. You'll find:
   - **Merchant ID** (e.g., M123456789)
   - **Salt Key** (a long string used for encryption)
   - **API Key** (you already have this)
   - **Salt Index** (you already have this: 1)

## Step 5: Update PhonePePayment Component

The component is already set up to use environment variables. Once you add the variables to Vercel and redeploy, PhonePe will work automatically.

## Step 6: Enable PhonePe Button

After adding environment variables:

1. Open `src/components/PhonePePayment.jsx`
2. Uncomment the PhonePe button (around line 186)
3. Comment out or remove the test payment button
4. Commit and push changes

```bash
git add .
git commit -m "Enable PhonePe production payment"
vercel --prod
```

## Important URLs

### Your Vercel Project
- Dashboard: https://vercel.com/tech-2xgs-projects
- Deployments: https://vercel.com/tech-2xgs-projects/[project-name]/deployments

### Admin Panel Access
- URL: https://[your-domain].vercel.app/admin
- Username: `admin`
- Password: `admin123`

### PhonePe Endpoints
- Production: `https://api.phonepe.com/apis/pg/<Endpoint>`
- Sandbox: `https://api-preprod.phonepe.com/apis/pg-sandbox/<Endpoint>`

## Testing Before Production

1. **Use Sandbox First**: Switch to sandbox endpoint for testing
   ```
   VITE_PHONEPE_API_ENDPOINT=https://api-preprod.phonepe.com/apis/pg-sandbox
   ```

2. **Test the Flow**:
   - Complete the booking form
   - Test payment with PhonePe sandbox
   - Verify success page shows
   - Check admin panel for lead

3. **Switch to Production**: Once testing is complete
   ```
   VITE_PHONEPE_API_ENDPOINT=https://api.phonepe.com/apis/pg
   ```

## Backend API Required

⚠️ **IMPORTANT**: PhonePe integration requires server-side implementation.

You need to create backend endpoints for:

### 1. Initiate Payment (`POST /api/phonepe/initiate`)
```javascript
// Server-side only - DO NOT expose salt key in frontend
const crypto = require('crypto');

app.post('/api/phonepe/initiate', async (req, res) => {
  const payload = req.body.payload;
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

  // Create checksum
  const checksum = crypto
    .createHash('sha256')
    .update(base64Payload + '/pg/v1/pay' + SALT_KEY)
    .digest('hex') + '###' + SALT_INDEX;

  // Call PhonePe API
  const response = await axios.post(
    'https://api.phonepe.com/apis/pg/v1/pay',
    { request: base64Payload },
    { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum } }
  );

  res.json(response.data);
});
```

### 2. Payment Callback (`POST /api/phonepe/callback`)
```javascript
app.post('/api/phonepe/callback', async (req, res) => {
  const { response } = req.body;

  // Verify signature
  const signature = req.headers['x-verify'];
  const calculatedSignature = crypto
    .createHash('sha256')
    .update(response + SALT_KEY)
    .digest('hex') + '###' + SALT_INDEX;

  if (signature === calculatedSignature) {
    const data = JSON.parse(Buffer.from(response, 'base64').toString());

    if (data.code === 'PAYMENT_SUCCESS') {
      // Update database - payment successful
      await updateLeadPaymentStatus(data.data.merchantTransactionId, 'paid');
    }
  }

  res.json({ success: true });
});
```

## Recommended Backend Options

1. **Vercel Serverless Functions** (Easiest for Vercel deployment)
   - Create `api/phonepe/initiate.js`
   - Create `api/phonepe/callback.js`
   - Automatic deployment with frontend

2. **Separate Node.js Server**
   - Deploy on Railway, Render, or DigitalOcean
   - Update API endpoints in frontend

3. **Firebase Cloud Functions**
   - Good for serverless backend
   - Easy integration with Firestore

## Database Setup

Replace localStorage with a real database:

### Option 1: Firebase Firestore (Recommended for quick setup)
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, doc } from 'firebase/firestore';

// Save lead
await addDoc(collection(db, 'leads'), leadData);

// Update payment status
await updateDoc(doc(db, 'leads', leadId), { paymentStatus: 'paid' });
```

### Option 2: MongoDB Atlas (Recommended for scalability)
```javascript
const { MongoClient } = require('mongodb');

// Save lead
await db.collection('leads').insertOne(leadData);

// Update payment status
await db.collection('leads').updateOne(
  { _id: leadId },
  { $set: { paymentStatus: 'paid' } }
);
```

## Security Checklist

- [ ] Add environment variables to Vercel
- [ ] Never expose Salt Key in frontend
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Validate webhook signatures
- [ ] Store payment logs
- [ ] Set up monitoring and alerts

## Post-Deployment Steps

1. **Test admin panel**: Visit `/admin` and verify login works
2. **Test form submission**: Complete a test booking
3. **Test payment flow**: Process a ₹1 test payment
4. **Verify webhook**: Check if callback updates lead status
5. **Monitor errors**: Check Vercel logs for any issues

## Support

- Vercel Support: https://vercel.com/support
- PhonePe Support: merchantsupport@phonepe.com
- PhonePe Docs: https://developer.phonepe.com/docs
