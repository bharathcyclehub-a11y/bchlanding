# Bharath Cycle Hub - Project Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase project with Firestore and Authentication enabled
- PhonePe merchant account (for payments)
- Vercel account (for deployment)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/GitMercenary/Bharath-Cycle-Hub.git
cd Bharath-Cycle-Hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env.local` file in the root directory:

```env
# ========================================
# PHONEPE PAYMENT GATEWAY
# ========================================
VITE_PAYMENT_MODE=LIVE
VITE_PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID

PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
PHONEPE_SALT_KEY=YOUR_SALT_KEY
PHONEPE_SALT_INDEX=1
PHONEPE_API_ENDPOINT=https://api.phonepe.com/apis/hermes

# ========================================
# FIREBASE FRONTEND (Client-side)
# ========================================
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ========================================
# FIREBASE ADMIN SDK (Server-side)
# ========================================
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note:** API endpoints (`/api/*`) require Vercel CLI for local testing:

```bash
npm install -g vercel
vercel dev
```

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Add Environment Variables

Go to Vercel Dashboard > Your Project > Settings > Environment Variables

Add ALL the following variables:

#### Frontend Variables (Build-time)
| Variable | Example Value |
|----------|---------------|
| `VITE_PAYMENT_MODE` | `LIVE` |
| `VITE_PHONEPE_MERCHANT_ID` | `YOURMECHANTID` |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` |

#### Backend Variables (Runtime)
| Variable | Example Value |
|----------|---------------|
| `PHONEPE_MERCHANT_ID` | `YOURMECHANTID` |
| `PHONEPE_SALT_KEY` | `your-salt-key-uuid` |
| `PHONEPE_SALT_INDEX` | `1` |
| `PHONEPE_API_ENDPOINT` | `https://api.phonepe.com/apis/hermes` |
| `FIREBASE_ADMIN_PROJECT_ID` | `your-project-id` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk@project.iam.gserviceaccount.com` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | See note below |

#### ⚠️ CRITICAL: Private Key Format in Vercel

The `FIREBASE_ADMIN_PRIVATE_KEY` is the most common source of errors. Follow these steps exactly:

**Option 1: Using the raw JSON value (Recommended)**

1. Open your Firebase service account JSON file
2. Find the `"private_key"` field
3. Copy the ENTIRE value including the quotes
4. In Vercel, paste it WITHOUT the surrounding quotes
5. The value should look like:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(long string)...\n-----END PRIVATE KEY-----\n
   ```

**Option 2: Manual formatting**

1. The key must start with `-----BEGIN PRIVATE KEY-----`
2. The key must end with `-----END PRIVATE KEY-----\n`
3. All line breaks in the key must be `\n` (literal backslash-n, not actual newlines)
4. Do NOT wrap the value in quotes in Vercel

**Common mistakes to avoid:**
- ❌ Adding extra quotes around the value in Vercel
- ❌ Having actual newlines instead of `\n`
- ❌ Missing the trailing `\n` after END PRIVATE KEY
- ❌ Copying with extra whitespace

**Testing the private key:**

After setting the env var, visit:
```
https://your-domain.vercel.app/api/firebase-test
```

Check the response for:
- `privateKeyHasBegin: true`
- `privateKeyHasEnd: true`
- `privateKeyLength` should be around 1700-1800 characters

### 5. Redeploy After Adding Env Vars

```bash
vercel --prod
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password)

### 2. Get Frontend Config

1. Project Settings > General > Your apps > Add web app
2. Copy the config values to your `VITE_FIREBASE_*` variables

### 3. Get Admin SDK Credentials

1. Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract values for `FIREBASE_ADMIN_*` variables

### 4. Create Admin User

1. Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter email and password for admin access

---

## PhonePe Setup

### 1. Register as Merchant

1. Go to [PhonePe Business](https://business.phonepe.com)
2. Complete KYC verification
3. Get approved as a merchant

### 2. Get API Credentials

1. Login to PhonePe Business Dashboard
2. Go to Developer Settings
3. Copy:
   - Merchant ID
   - Salt Key
   - Salt Index (usually `1`)

### 3. Configure Callback URLs

In PhonePe Dashboard, whitelist your callback URLs:
- `https://your-domain.vercel.app/api/phonepe/callback`
- `https://your-domain.vercel.app/payment-callback`

---

## Project Structure

```
├── api/                    # Vercel Serverless Functions
│   ├── phonepe/           # PhonePe payment endpoints
│   │   ├── initiate.js    # Start payment
│   │   ├── callback.js    # Payment webhook
│   │   └── status.js      # Check payment status
│   ├── leads/             # Lead management API
│   └── lib/               # Shared utilities
│       ├── firebase-admin.js
│       └── firestore-service.js
├── src/                   # React Frontend
│   ├── components/        # UI Components
│   ├── pages/            # Page components
│   ├── config/           # Firebase client config
│   └── utils/            # Utilities
├── .env.local            # Local environment variables
├── .env.example          # Environment template
└── vercel.json           # Vercel configuration
```

---

## Testing

### Test Payment Flow

1. Go to `/test-ride`
2. Complete the quiz
3. Enter test user details
4. Click "Pay with PhonePe"
5. Complete payment on PhonePe
6. Verify redirect to success page

### Test Admin Panel

1. Go to `/admin`
2. Login with Firebase admin credentials
3. View leads and payment status

---

## Troubleshooting

### "Firebase initialization failed" or "UNAUTHENTICATED"

**Error: "16 UNAUTHENTICATED: Request had invalid authentication credentials"**

This almost always means the private key is incorrectly formatted. To fix:

1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. **Delete** the existing `FIREBASE_ADMIN_PRIVATE_KEY`
3. Re-add it following the exact format below:

```bash
# From your service account JSON, copy the private_key value
# It should look like this (all on ONE line):
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n
```

4. Redeploy: `vercel --prod`
5. Test: `curl https://your-domain.vercel.app/api/firebase-test`

**Other checks:**
- Ensure `FIREBASE_ADMIN_PROJECT_ID` matches your Firebase project
- Ensure `FIREBASE_ADMIN_CLIENT_EMAIL` ends with `.iam.gserviceaccount.com`
- Verify the service account has "Firebase Admin SDK Administrator Service Agent" role

### "Payment initiation failed"
- Check `PHONEPE_*` variables are set
- Verify merchant ID and salt key are correct
- Check PhonePe dashboard for API errors

### "Lead not saving"
- Check Firestore rules allow write access
- Verify Firebase Admin SDK is initialized
- Check Vercel function logs for errors

---

## Support

For issues, create a GitHub issue at:
https://github.com/GitMercenary/Bharath-Cycle-Hub/issues
