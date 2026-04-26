# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Run development server with API endpoints (PREFERRED)
npm run dev

# Run frontend only (no API endpoints)
npm run dev:vite

# Build for production
npm run build

# Preview production build
npm run preview
```

**IMPORTANT**: Use `npm run dev` (not `npm run dev:vite`) for full-stack development. The custom dev server ([dev-server.js](dev-server.js)) provides:
- Vite dev server for frontend
- Express middleware for `/api/*` endpoints
- Loads `.env.local` environment variables
- Required for testing payment flows and lead creation locally

### Deployment
```bash
# Deploy to Vercel production
vercel --prod

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.vercel.production --environment=production
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Firebase Firestore (Admin SDK in backend only)
- **Authentication**: Firebase Auth (client in frontend, Admin SDK in backend)
- **Payments**: Razorpay (live)
- **Hosting**: Vercel

### Backend/Frontend Separation Pattern

**CRITICAL ARCHITECTURE RULE**: Firebase Admin SDK is ONLY used in backend serverless functions (`/api` directory). The frontend uses Firebase Client SDK ONLY for authentication.

```
Frontend (React)                    Backend (Vercel Functions)
├── Firebase Client SDK             ├── Firebase Admin SDK
│   └── Authentication only         │   ├── Firestore operations
├── API calls to /api/*             │   ├── User verification
└── No direct database access       │   └── Custom claims management
                                    └── Payment gateway integrations
```

**Why this pattern?**
- Security: Admin SDK credentials never exposed to frontend
- Firestore: All database operations centralized in backend
- Validation: Server-side validation of all data operations

### API Directory Structure

```
api/
├── _lib/                           # Shared backend utilities
│   ├── firebase-admin.js           # Firebase Admin SDK initialization (singleton)
│   ├── firestore-service.js        # Database operations layer
│   └── auth-middleware.js          # JWT verification & RBAC
├── leads/
│   ├── index.js                    # POST: Create lead (public), GET: List leads (admin)
│   └── [id].js                     # GET/PATCH/DELETE: Single lead operations (admin)
├── razorpay/
│   ├── create-order.js             # POST: Initialize Razorpay payment
│   └── verify-payment.js           # POST: Verify payment signature
└── admin/
    └── verify.js                   # GET: Verify admin JWT token
```

### Frontend Routing

Routes defined in [src/main.jsx](src/main.jsx):

- `/` - Main landing page (general bicycle sales)
- `/test-ride` - **Primary conversion funnel** (₹99 test ride booking with quiz → payment → lead creation)
- `/admin` - Admin dashboard (Firebase Auth protected)
- `/privacy-policy`, `/terms`, `/disclaimer` - Legal pages

## Critical Environment Variable Setup

### Firebase Admin Private Key Formatting

**MOST COMMON PRODUCTION ERROR**: The `FIREBASE_ADMIN_PRIVATE_KEY` environment variable in Vercel is extremely sensitive to formatting issues.

#### Correct Format in Vercel
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(full key)...\n-----END PRIVATE KEY-----\n
```

**Key points:**
- Must use `\n` (literal backslash-n), NOT actual newlines
- NO quotes around the value in Vercel UI
- Must include trailing `\n` after `-----END PRIVATE KEY-----`
- NO extra whitespace or newlines at start/end

#### Common Mistakes That Cause "UNAUTHENTICATED" Errors
```bash
# ❌ WRONG: Double quotes
""-----BEGIN PRIVATE KEY-----\n...""

# ❌ WRONG: Missing trailing \n
-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# ❌ WRONG: Actual newlines instead of \n
-----BEGIN PRIVATE KEY-----
MIIEvQI...

# ❌ WRONG: Wrong project ID in client email
firebase-adminsdk-fbsvc@bchlanding.iam.gserviceaccount.com
# Should be: @bchlanding-eaebb.iam.gserviceaccount.com
```

#### Fixing Environment Variables in Vercel
```bash
# Remove incorrect variable
vercel env rm FIREBASE_ADMIN_PRIVATE_KEY production --yes

# Add correct variable (reads from .env.local)
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production < <(grep "FIREBASE_ADMIN_PRIVATE_KEY" .env.local | cut -d'=' -f2-)

# Verify client email
echo "firebase-adminsdk-fbsvc@bchlanding-eaebb.iam.gserviceaccount.com" | vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production

# Redeploy
vercel --prod
```

### Required Environment Variables

See [.env.local](.env.local) for template. Key variables:

**Frontend (VITE_* variables - safe to expose):**
- `VITE_FIREBASE_*` - Firebase client SDK config
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

**Backend (NEVER expose to frontend):**
- `FIREBASE_ADMIN_PROJECT_ID` - Must match Firebase project
- `FIREBASE_ADMIN_CLIENT_EMAIL` - Service account email
- `FIREBASE_ADMIN_PRIVATE_KEY` - Service account private key (see formatting above)
- `RAZORPAY_KEY_ID` - Razorpay merchant key
- `RAZORPAY_KEY_SECRET` - Razorpay secret (CRITICAL)

## Payment System Architecture

### Current State (January 2026)
- **Active**: Razorpay (live payments)
- **Deprecated**: PhonePe (code exists but not in use)

### Payment Flow
```
User completes quiz in /test-ride
    ↓
User enters contact details (UserDataForm.jsx)
    ↓
Lead created in Firestore (status: UNPAID)
    ↓
POST /api/razorpay/create-order (creates Razorpay order)
    ↓
Razorpay checkout modal opens
    ↓
User pays ₹99
    ↓
POST /api/razorpay/verify-payment (validates signature)
    ↓
Lead updated in Firestore (status: PAID)
    ↓
Success screen with WhatsApp redirect
```

### Payment Components
- [src/components/RazorpayPayment.jsx](src/components/RazorpayPayment.jsx) - Main payment UI
- [src/components/PayButton.jsx](src/components/PayButton.jsx) - Payment trigger button
- [api/razorpay/create-order.js](api/razorpay/create-order.js) - Order creation
- [api/razorpay/verify-payment.js](api/razorpay/verify-payment.js) - Signature verification

## Database Schema (Firestore)

### Collections

**leads**
```javascript
{
  id: "lead_1234567890_abc123",
  name: "Customer Name",
  phone: "9876543210",
  email: "customer@example.com",
  quizAnswers: {
    userType: "teen",
    height: "5-2",
    timeline: "1-month",
    priority: "style"
  },
  payment: {
    status: "PAID" | "UNPAID" | "PENDING" | "FAILED",
    transactionId: "razorpay_payment_id",
    orderId: "razorpay_order_id",
    amount: 9900,  // paise (₹99)
    currency: "INR",
    method: "RAZORPAY",
    paidAt: Timestamp
  },
  source: "test-ride-landing",
  status: "NEW" | "CONTACTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**users** (admin users)
```javascript
{
  uid: "firebase_auth_uid",
  email: "admin@example.com",
  role: "admin",
  permissions: ["view_leads", "edit_leads"],
  isActive: true,
  lastLogin: Timestamp
}
```

## Key Files to Know

### Backend Critical Files
- [api/_lib/firebase-admin.js](api/_lib/firebase-admin.js) - Firebase Admin initialization (singleton pattern, handles key formatting)
- [api/_lib/firestore-service.js](api/_lib/firestore-service.js) - Database abstraction layer (createLead, updateLeadPayment, etc.)
- [api/_lib/auth-middleware.js](api/_lib/auth-middleware.js) - JWT verification, admin role checking

### Frontend Critical Files
- [src/pages/TestRideLandingPage.jsx](src/pages/TestRideLandingPage.jsx) - Main conversion funnel (quiz + payment flow)
- [src/components/UserDataForm.jsx](src/components/UserDataForm.jsx) - Lead capture form
- [src/components/Quiz/QuizContainer.jsx](src/components/Quiz/QuizContainer.jsx) - Quiz state management
- [src/config/firebase.js](src/config/firebase.js) - Firebase Client SDK initialization

### Configuration Files
- [dev-server.js](dev-server.js) - Custom Express + Vite dev server
- [vercel.json](vercel.json) - Vercel deployment config (SPA routing)
- [tailwind.config.js](tailwind.config.js) - Tailwind customization

## Testing Locally

### Testing Payment Flow
1. Start dev server: `npm run dev`
2. Visit `http://localhost:5175/test-ride`
3. Complete quiz
4. Enter test details
5. Click "Pay ₹99 Now"
6. Use Razorpay test cards:
   - Success: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Testing Admin Panel
1. Create admin user in Firebase Console → Authentication
2. Visit `http://localhost:5175/admin`
3. Login with admin credentials
4. View leads (requires backend to be running)

## Common Issues & Solutions

### "UNAUTHENTICATED" Error in Production
**Symptom**: Error creating leads, "Request had invalid authentication credentials"
**Cause**: Malformed `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel
**Solution**: Follow "Firebase Admin Private Key Formatting" section above

### API Endpoints Return 404 in Local Dev
**Symptom**: `/api/*` routes not found
**Cause**: Using `npm run dev:vite` instead of `npm run dev`
**Solution**: Use `npm run dev` (custom Express server)

### Payment Verification Fails
**Symptom**: Payment succeeds in Razorpay but lead stays UNPAID
**Cause**: Signature verification failing (wrong `RAZORPAY_KEY_SECRET`)
**Solution**: Verify secret in Vercel matches Razorpay Dashboard

### Firebase Initialization Failed
**Symptom**: Console error "Missing required Firebase environment variables"
**Cause**: `.env.local` not loaded or missing `VITE_FIREBASE_*` variables
**Solution**: Copy `.env.example` to `.env.local` and fill in values

## Design System

### Colors (Tailwind Config)
- Primary: Deep Navy (`#1a1f3c`)
- Accent: Warm Gold (`#d4a853`)
- Success: Green (Tailwind default)
- Error: Red (Tailwind default)

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Animation Library
- Framer Motion for all animations
- GPU-accelerated transforms
- Stagger animations for lists

## Additional Resources

- [README.md](README.md) - Project overview and features
- [SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [SECURITY_NOTES.md](docs/SECURITY_NOTES.md) - Credential management
- [DROPDOWN_DOCS.md](docs/DROPDOWN_DOCS.md) - Dropdown component usage
