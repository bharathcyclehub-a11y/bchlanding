# 🌐 Custom Domain Setup for bharathcyclehub.store

## Current Status
✅ Site deployed to: https://bchlanding.vercel.app
✅ Routes configured:
- `/` → Main website (existing Bharath Cycle Hub site)
- `/test-5-get-1/` → New bicycle landing page
- `/admin` → Admin CRM panel

## Next Step: Add Custom Domain

### Option 1: Transfer Domain to This Project (Recommended)

**Step 1: Go to Vercel Project Settings**
1. Visit: https://vercel.com/tech-2xgs-projects/bchlanding/settings/domains
2. Click "Add Domain"

**Step 2: Add Your Domain**
1. Enter: `bharathcyclehub.store`
2. Click "Add"
3. Also add: `www.bharathcyclehub.store`

**Step 3: Remove Domain from Old Project**
If the domain is already connected to another Vercel project:
1. Find the old project (probably `bch-store`)
2. Go to Settings → Domains
3. Remove `bharathcyclehub.store` from that project
4. Return to `bchlanding` project and add the domain

**Step 4: Verify DNS (if needed)**
Vercel will show if DNS is already configured. If not:
- Add A record: `76.76.21.21`
- Add CNAME for www: `cname.vercel-dns.com`

### Option 2: Use CLI to Add Domain

```bash
cd /c/Users/user/Desktop/test/bchlanding
vercel domains add bharathcyclehub.store
vercel domains add www.bharathcyclehub.store
```

## After Adding Domain

Once the domain is added, these URLs will work:

### Main Website (Existing)
- `https://www.bharathcyclehub.store/` → Your current Bharath Cycle Hub website

### New Landing Page
- `https://www.bharathcyclehub.store/test-5-get-1/` → New bicycle landing page

### Admin Panel
- `https://www.bharathcyclehub.store/admin` → CRM dashboard
  - Username: `admin`
  - Password: `admin123`

## Testing Before Domain Transfer

Test the routes on the Vercel URL first:

**Main Site:**
```
https://bchlanding.vercel.app/
```

**Landing Page:**
```
https://bchlanding.vercel.app/test-5-get-1/
```

**Admin:**
```
https://bchlanding.vercel.app/admin
```

## Troubleshooting

### Issue: Domain already in use
**Solution:** Remove from old project first
1. Find which project has the domain
2. Go to that project's Settings → Domains
3. Click the three dots (•••) next to domain
4. Click "Remove Domain"
5. Add to new `bchlanding` project

### Issue: DNS not configured
**Solution:** Vercel shows exact DNS settings needed
1. Login to your domain registrar
2. Update DNS records as shown by Vercel
3. Wait 24-48 hours for propagation

### Issue: Root path shows wrong content
**Solution:** Check vercel.json routing
- Make sure `index-main.html` is in `/public` folder
- Verify vercel.json has correct rewrite rules

## Important Notes

- ⚠️ Before transferring the domain, the main site HTML is a static copy
- 🔄 If you update the main site, you'll need to update `public/index-main.html`
- ✅ The landing page `/test-5-get-1/` is fully dynamic and will update automatically
- 🔐 Don't forget to change admin password in production!

## Security Recommendation

After domain is live, update admin credentials:
1. Change admin username and password
2. Store in secure location
3. Consider adding IP whitelist for admin panel

---

**Ready to add domain?** Use Option 1 or 2 above!
