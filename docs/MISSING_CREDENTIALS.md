# ⚠️ Missing PhonePe Credentials - Action Required

## What We Have ✅
- **API Key**: `fcf07904-45e3-486c-a658-255598645d23`
- **Key Index**: `1`
- **Merchant Name**: `BHARAT CYCLE HUB`

## What We Need ❌

### 1. Merchant ID
**Where to find it:**
- Login to https://business.phonepe.com
- Go to **Home** or **Settings**
- Look for "Merchant ID" (usually starts with `M` or `PGTESTPAY`)
- Example format: `M123456789` or `PGTESTPAY123`

### 2. Salt Key (CRITICAL)
**Where to find it:**
- Login to https://business.phonepe.com
- Go to **Developer Settings** → **API Keys** (where you are now)
- **Scroll down** on the current page
- OR click on the **eye icon** / **Show Salt** button
- OR look for a section titled "Salt Key" or "Merchant Salt"
- The Salt Key looks like: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399`

## How to Find Salt Key (Step-by-Step)

1. You're already on the right page: `business.phonepe.com/developer-settings/api-keys`
2. Look for one of these:
   - A "Show Salt Key" button
   - An eye icon (👁️) next to the API Key
   - A separate row showing "Salt Key"
   - A dropdown or expandable section

3. If you can't find it:
   - Try clicking on **Settings** → **API Credentials**
   - Or contact PhonePe support: merchantsupport@phonepe.com

## Once You Have the Credentials

### Option 1: Tell me the credentials
Share the Merchant ID and Salt Key, and I'll update the configuration for you.

### Option 2: Update manually
Add these to `.env.production`:

```env
VITE_PHONEPE_MERCHANT_ID=M123456789  # Your Merchant ID
VITE_PHONEPE_SALT_KEY=099eb0cd-...   # Your Salt Key
```

Then add the same variables to Vercel after deployment.

## Why Salt Key is Important

The Salt Key is used to:
- ✅ Create secure checksums for API requests
- ✅ Verify webhook signatures
- ✅ Prevent payment tampering
- ✅ Ensure transaction authenticity

**Without the Salt Key, PhonePe payment integration cannot work.**

## Alternative: Use Test Mode First

If you want to deploy now and add PhonePe later:

1. The site will work with **test payment mode** (currently active)
2. Users can complete bookings
3. You can see leads in admin panel
4. Add real PhonePe credentials later

## Next Steps

**Option A: Find credentials now**
1. Find Merchant ID and Salt Key
2. Share with me or update `.env.production`
3. Deploy to Vercel
4. Add environment variables in Vercel dashboard
5. PhonePe will work immediately

**Option B: Deploy first, add credentials later**
1. Deploy to Vercel now
2. Site works with test payments
3. Add PhonePe credentials when ready
4. Redeploy to enable real payments

---

**Need help?** Let me know which option you prefer!
