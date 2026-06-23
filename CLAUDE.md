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
- **Database**: Supabase (Postgres) — service-role client, backend only
- **Authentication**: Supabase Auth (anon client in frontend, service-role in backend)
- **Storage**: Supabase Storage (`product-images` bucket)
- **Payments**: Razorpay (live)
- **Hosting**: Vercel

### Backend/Frontend Separation Pattern

**CRITICAL ARCHITECTURE RULE**: the Supabase service-role key is ONLY used in backend serverless functions (`/api` directory) — it bypasses Row Level Security. The frontend uses the Supabase anon client ONLY for authentication.

```
Frontend (React)                    Backend (Vercel Functions)
├── Supabase anon client            ├── Supabase service-role client
│   └── Authentication only         │   ├── All DB reads/writes (RLS bypass)
├── API calls to /api/*             │   ├── Token verification (getUser)
└── No direct database access       │   └── Storage uploads
                                    └── Payment gateway integrations
```

**Why this pattern?**
- Security: the service-role key is never exposed to the frontend
- All DB operations are centralized in the backend and go through RLS-protected tables
- Validation: server-side validation of all data operations
- RLS is ON for every table with NO policies → only the service-role key can read/write

### API Directory Structure

```
api/
├── _lib/                           # Shared backend utilities
│   ├── supabase-admin.js           # Supabase service-role client + token verify (singleton)
│   ├── db-service.js               # Database operations layer (DbService + named fns)
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
- `/admin` - Admin dashboard (Supabase Auth protected)
- `/privacy-policy`, `/terms`, `/disclaimer` - Legal pages

## Critical Environment Variable Setup

### Supabase

Dedicated project ref **`whrakxbrisgxilwdqpvk`** (region ap-south-1, Postgres 17).
DB access is server-side only via the service-role key; the frontend uses the anon key for auth.

### Required Environment Variables

See [.env.local](.env.local) / [.env.example](.env.example) for the template. Key variables:

**Frontend (VITE_* variables - safe to expose):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon (public) key
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key

**Backend (NEVER expose to frontend):**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service-role key — bypasses RLS (CRITICAL SECRET)
- `RAZORPAY_KEY_ID` - Razorpay merchant key
- `RAZORPAY_KEY_SECRET` - Razorpay secret (CRITICAL)

#### Setting them in Vercel
```bash
# Add each (repeat for preview/development as needed)
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod   # redeploy
```

### Admin users

Supabase Auth, admin flagged via `app_metadata.role = 'admin'` (set server-side only).
Create or promote an admin: `node scripts/create-admin.mjs <email> <password>`.
The schema lives in [scripts/supabase/schema.sql](scripts/supabase/schema.sql).

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
Lead created in Supabase (status: UNPAID)
    ↓
POST /api/razorpay/create-order (creates Razorpay order)
    ↓
Razorpay checkout modal opens
    ↓
User pays ₹99
    ↓
POST /api/razorpay/verify-payment (validates signature)
    ↓
Lead updated in Supabase (status: PAID)
    ↓
Success screen with WhatsApp redirect
```

### Payment Components
- [src/components/RazorpayPayment.jsx](src/components/RazorpayPayment.jsx) - Main payment UI
- [src/components/PayButton.jsx](src/components/PayButton.jsx) - Payment trigger button
- [api/razorpay/create-order.js](api/razorpay/create-order.js) - Order creation
- [api/razorpay/verify-payment.js](api/razorpay/verify-payment.js) - Signature verification

## Database Schema (Supabase / Postgres)

**doc-jsonb pattern**: each former Firestore "document" is stored in a `doc jsonb`
column, preserving the exact object shapes the API + admin UI already consume.
Generated columns (immutable casts from `doc`) power filtering/sorting, plus real
`created_at`/`updated_at`. All tables have RLS ON with no policies (service-role only).

Tables (public schema): `leads`, `products`, `categories`, `app_settings`,
`engagement`, `visitor_events`, `admin_users`. Full DDL: [scripts/supabase/schema.sql](scripts/supabase/schema.sql).

**leads** — `(id text pk, doc jsonb, category, payment_status, source, lead_status [generated], created_at, updated_at)`. The `doc` shape:
```javascript
{
  id: "lead_1234567890_abc123",
  name: "Customer Name",
  phone: "9876543210",
  email: "customer@example.com",
  area: "Yelahanka", childName: null, buyingFor: "child" | "self",
  quizAnswers: { userType: "teen", height: "5-2", timeline: "1-month", priority: "style" },
  payment: {
    status: "PAID" | "UNPAID" | "PENDING" | "FAILED",
    transactionId, orderId,
    amount: 999,        // rupees
    currency: "INR", method: "RAZORPAY",
    paidAt: "ISO string" | null
  },
  source: "viper-kids" | "test-ride-landing" | ...,
  category: "Pre-Booking" | "Test Ride" | "General" | ...,
  status: "NEW" | "CONTACTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED",
  createdAt: "ISO string", updatedAt: "ISO string"
}
```

**admin_users** — `(id uuid pk = auth.users id, doc jsonb, email [generated])`. The `doc` shape:
```javascript
{ uid, email, role: "admin", permissions: ["view_leads","edit_leads"], isActive: true, lastLogin: "ISO" }
```

## Key Files to Know

### Backend Critical Files
- [api/_lib/supabase-admin.js](api/_lib/supabase-admin.js) - Supabase service-role client (singleton) + `verifyIdToken` + auth-admin helpers
- [api/_lib/db-service.js](api/_lib/db-service.js) - Database abstraction layer (createLead, updateLeadPayment, etc.; exports `DbService` class + named fns)
- [api/_lib/auth-middleware.js](api/_lib/auth-middleware.js) - Token verification, admin role checking

### Frontend Critical Files
- [src/pages/TestRideLandingPage.jsx](src/pages/TestRideLandingPage.jsx) - Main conversion funnel (quiz + payment flow)
- [src/components/UserDataForm.jsx](src/components/UserDataForm.jsx) - Lead capture form
- [src/components/Quiz/QuizContainer.jsx](src/components/Quiz/QuizContainer.jsx) - Quiz state management
- [src/config/supabase.js](src/config/supabase.js) - Supabase anon client (auth only)

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
1. Create/promote an admin: `node scripts/create-admin.mjs <email> <password>`
2. Visit `http://localhost:5175/admin`
3. Login with admin credentials
4. View leads (requires backend to be running)

## Common Issues & Solutions

### "Supabase admin keys are missing" / 500 on data APIs
**Symptom**: Errors creating/listing leads or products
**Cause**: `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel/.env.local
**Solution**: Set both backend vars (see "Required Environment Variables") and redeploy

### API Endpoints Return 404 in Local Dev
**Symptom**: `/api/*` routes not found
**Cause**: Using `npm run dev:vite` instead of `npm run dev`
**Solution**: Use `npm run dev` (custom Express server)

### Payment Verification Fails
**Symptom**: Payment succeeds in Razorpay but lead stays UNPAID
**Cause**: Signature verification failing (wrong `RAZORPAY_KEY_SECRET`)
**Solution**: Verify secret in Vercel matches Razorpay Dashboard

### Supabase Auth not configured (frontend)
**Symptom**: Console error "Missing Supabase env variables"
**Cause**: `.env.local` not loaded or missing `VITE_SUPABASE_*` variables
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
