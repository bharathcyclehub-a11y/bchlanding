# Security Notes - Credentials to Keep Secure

## CRITICAL: Never Commit These to Git

The following credentials must NEVER be committed to the repository. They should only be stored in:
- `.env.local` (local development - already in .gitignore)
- Vercel Environment Variables (production)

---

## Sensitive Credentials List

### 1. PhonePe Payment Gateway (HIGHLY SENSITIVE)

| Variable | Description | Risk if Exposed |
|----------|-------------|-----------------|
| `PHONEPE_SALT_KEY` | Used to sign payment requests | Attackers could forge payments |
| `PHONEPE_MERCHANT_ID` | Your merchant identifier | Medium risk |

**Where to find:** PhonePe Business Dashboard > Developer Settings

---

### 2. Firebase Admin SDK (HIGHLY SENSITIVE)

| Variable | Description | Risk if Exposed |
|----------|-------------|-----------------|
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account private key | FULL DATABASE ACCESS - attackers can read/write/delete all data |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account email | Medium risk |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase project ID | Low risk (public) |

**Where to find:** Firebase Console > Project Settings > Service Accounts > Generate New Private Key

**If exposed:** Immediately:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Delete the compromised service account
3. Generate a new private key
4. Update all environment variables

---

### 3. Firebase Frontend Config (LOW SENSITIVITY)

These are designed to be public (embedded in frontend code):

| Variable | Description | Risk Level |
|----------|-------------|------------|
| `VITE_FIREBASE_API_KEY` | Client API key | LOW - protected by Firebase Security Rules |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | LOW |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | LOW |
| `VITE_FIREBASE_*` | Other frontend config | LOW |

**Note:** These are safe to expose because Firebase Security Rules protect your data. However, don't share them unnecessarily.

---

## Vercel Environment Variables

### Variables Currently Set in Your Vercel Project

Go to: https://vercel.com/git-mercenarys-projects/bharath-cycle-hub/settings/environment-variables

#### Backend (Keep Secret - Never expose)
- `PHONEPE_MERCHANT_ID`
- `PHONEPE_SALT_KEY` ⚠️ CRITICAL
- `PHONEPE_SALT_INDEX`
- `PHONEPE_API_ENDPOINT`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` ⚠️ CRITICAL

#### Frontend (Public - OK to expose)
- `VITE_PAYMENT_MODE`
- `VITE_PHONEPE_MERCHANT_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Best Practices

### 1. Rotate Credentials Regularly
- Change PhonePe Salt Key every 6 months
- Regenerate Firebase service account keys annually

### 2. Use Different Credentials for Dev/Prod
- Create separate Firebase projects for development
- Use PhonePe sandbox for testing

### 3. Monitor for Unauthorized Access
- Check Firebase Console > Usage for unusual activity
- Monitor PhonePe dashboard for unexpected transactions

### 4. Backup Credentials Securely
- Store credentials in a password manager (1Password, Bitwarden)
- Never share via email or chat
- Use secure channels only

---

## If Credentials Are Compromised

### PhonePe Salt Key Exposed:
1. Login to PhonePe Business Dashboard
2. Generate new Salt Key
3. Update Vercel environment variable
4. Redeploy: `vercel --prod`

### Firebase Admin Key Exposed:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click the three dots next to your service account
3. Select "Manage keys"
4. Delete the compromised key
5. Generate new private key
6. Update Vercel environment variable
7. Redeploy: `vercel --prod`

---

## Your Current Credentials (Reference Only)

**DO NOT SHARE THIS FILE**

| Credential | Value (masked) |
|------------|----------------|
| PhonePe Merchant ID | `BHARATCYCLEONLINE` |
| PhonePe Salt Key | `fcf07904-****-****-****-************` |
| Firebase Project | `bchlanding-eaebb` |
| Firebase Admin Email | `firebase-adminsdk-fbsvc@bchlanding-eaebb.iam.gserviceaccount.com` |

---

## Quick Checklist Before Going Live

- [ ] All environment variables set in Vercel
- [ ] Firebase Security Rules configured
- [ ] PhonePe callback URLs whitelisted
- [ ] Admin user created in Firebase Auth
- [ ] Test payment completed successfully
- [ ] Private key NOT in git history
- [ ] `.env.local` in `.gitignore`
