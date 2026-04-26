# 🚀 Deploy to Vercel Now

## Quick Deploy Commands

Run these commands one by one:

### Step 1: Navigate to project
```bash
cd /c/Users/user/Desktop/test/bchlanding
```

### Step 2: Login to Vercel (if not already logged in)
```bash
vercel login
```
- Visit the URL shown
- Authorize the CLI
- Press ENTER when done

### Step 3: Deploy to Production
```bash
vercel --prod --yes
```

That's it! Your site will be deployed.

---

## What Happens After Deployment

### 1. You'll Get a URL
Vercel will give you a URL like:
```
https://bchlanding-xyz123.vercel.app
```

### 2. Access Your Site
- **Landing Page**: https://your-url.vercel.app
- **Admin Panel**: https://your-url.vercel.app/admin
  - Username: `admin`
  - Password: `admin123`

### 3. Add Environment Variables

After deployment, you MUST add these variables in Vercel dashboard:

1. Go to: https://vercel.com/tech-2xgs-projects/[your-project]/settings/environment-variables

2. Add these variables (one by one):

| Variable Name | Value |
|--------------|--------|
| `VITE_PHONEPE_MERCHANT_ID` | Your Merchant ID (find in PhonePe dashboard) |
| `VITE_PHONEPE_API_KEY` | `fcf07904-45e3-486c-a658-255598645d23` |
| `VITE_PHONEPE_SALT_KEY` | Your Salt Key (find in PhonePe dashboard) |
| `VITE_PHONEPE_SALT_INDEX` | `1` |
| `VITE_PHONEPE_API_ENDPOINT` | `https://api.phonepe.com/apis/pg` |

3. Click "Save" for each variable

4. Redeploy:
```bash
vercel --prod
```

---

## Current Status

✅ **Working Now:**
- Landing page with social proof
- Quiz funnel
- Lead capture form
- Test payment mode
- Admin panel with CRM

⚠️ **Needs PhonePe Credentials:**
- Merchant ID
- Salt Key

See [MISSING_CREDENTIALS.md](MISSING_CREDENTIALS.md) for how to find them.

---

## Alternative: Deploy via GitHub (Recommended)

### Why GitHub?
- Automatic deployments on push
- Better version control
- Easy rollbacks
- Team collaboration

### Steps:

1. **Create GitHub repo**
   ```bash
   # Go to github.com and create new repository "bchlanding"
   ```

2. **Push code**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bchlanding.git
   git push -u origin master
   ```

3. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repo
   - Click "Deploy"

4. **Add environment variables in Vercel**
   - Same as above

---

## Troubleshooting

### Issue: "Vercel login" not working
**Solution**: Generate a token manually
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Run: `vercel --token YOUR_TOKEN`

### Issue: Build fails
**Solution**: Check Vercel logs
1. Go to your project dashboard
2. Click "Deployments"
3. Click on failed deployment
4. View build logs

### Issue: Admin panel shows 404
**Solution**: Check vercel.json
- Make sure `vercel.json` has the rewrite rule
- Redeploy if needed

### Issue: PhonePe not working
**Solution**: Check environment variables
1. Variables must start with `VITE_` to be accessible
2. Must be added in Vercel dashboard
3. Must redeploy after adding variables

---

## What's Next?

After successful deployment:

1. ✅ Test the landing page
2. ✅ Test the quiz flow
3. ✅ Test lead capture
4. ✅ Test admin panel login
5. ⏳ Add PhonePe credentials
6. ⏳ Test real payment
7. ✅ Share with customers!

---

**Ready to deploy?** Run the commands above! 🚀
