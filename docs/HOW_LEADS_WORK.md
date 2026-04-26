# 🎯 How Lead Capture Works

## ✅ Leads Are Saved IMMEDIATELY

When a user enters their contact information, the lead is saved **BEFORE** they make payment.

### Flow:

```
1. User fills quiz (age, height, budget, etc.)
   ↓
2. User enters Name & Phone
   ↓
3. ✅ LEAD SAVED TO ADMIN PANEL (paymentStatus: "unpaid")
   ↓
4. User sees payment page
   ↓
5. If user pays: paymentStatus updated to "paid"
   If user doesn't pay: lead remains as "unpaid"
```

## 📊 How to View Leads

### Access Admin Panel:
```
https://www.bharathcyclehub.store/admin
```

**Login:**
- Username: `admin`
- Password: `admin123`

### What You'll See:

The admin panel shows ALL leads, whether they paid or not:

| Column | Description |
|--------|-------------|
| **Date** | When the lead was created |
| **Name** | Customer's name |
| **Phone** | Customer's phone (clickable to call) |
| **Requirements** | Quiz answers (age, height, budget, etc.) |
| **Payment** | Payment ID if paid, or "—" if not |
| **Status** | "Payment Done" (green) or "Not Yet Done" (orange) |

### Filter Leads:
- Click "All" to see all leads
- Click "Paid" to see only paid customers
- Click "Unpaid" to see leads who didn't complete payment

## 🔍 Testing

### Test the lead capture:

1. Go to: https://www.bharathcyclehub.store/test-5-get-1/
2. Click "BOOK EXPERT HOME VISIT"
3. Fill the quiz with any answers
4. Enter test data:
   - Name: "Test User"
   - Phone: "9999999999"
5. Click "Continue to Payment"

**At this point, the lead is saved!**

6. Open admin panel in new tab: https://www.bharathcyclehub.store/admin
7. You should see the lead with status "Not Yet Done"

8. Go back and complete test payment
9. Refresh admin panel
10. Lead status should now show "Payment Done"

## 🐛 Debugging

### If you don't see leads:

**1. Check Browser Console**
```
Open browser DevTools (F12)
Go to Console tab
Submit a lead
Look for: "✅ Lead saved to admin panel:"
```

**2. Check localStorage**
```
Open browser DevTools (F12)
Go to Application tab → Storage → Local Storage
Select your domain
Look for key: "leads"
```

**3. Verify Same Browser**
⚠️ **Important:** localStorage is browser-specific!
- Leads saved in Chrome won't appear in Firefox
- Leads saved on phone won't appear on laptop
- Use the SAME browser for testing lead capture AND viewing admin

## ⚠️ Current Limitations

### localStorage-based Storage:

**What this means:**
- ✅ Works perfectly for testing
- ✅ No server setup required
- ✅ Fast and reliable
- ❌ Data stored in browser only (not shared across devices)
- ❌ Data lost if browser cache is cleared
- ❌ Can't access from different computers

### For Production Use:

You'll need to replace localStorage with a real database. Options:

**Option 1: Firebase (Easiest)**
- Free tier available
- Real-time database
- Works across all devices
- 5-minute setup

**Option 2: MongoDB Atlas (Scalable)**
- Free tier: 512MB storage
- More flexible queries
- Better for large datasets

**Option 3: Vercel Postgres (Integrated)**
- Built into Vercel
- SQL database
- $20/month

## 📧 Getting Notified

### Current Setup:
- Leads appear in admin panel immediately
- You need to check admin panel manually

### Recommended: Add Email Notifications

When a lead is saved, automatically send email to you:

```javascript
// In api.js, after lead is saved:
await fetch('/api/send-email', {
  method: 'POST',
  body: JSON.stringify({
    to: 'support@bharathcyclehub.store',
    subject: 'New Lead: ' + leadData.name,
    body: `
      Name: ${leadData.name}
      Phone: ${leadData.phone}
      Requirements: ${JSON.stringify(leadData.quizAnswers)}
    `
  })
});
```

Tools for sending emails:
- **SendGrid** (Free: 100 emails/day)
- **Mailgun** (Free: 10,000 emails/month)
- **Resend** (Free: 3,000 emails/month)

## 📱 WhatsApp Notifications

Even better - get WhatsApp notifications when new leads arrive:

```javascript
// Using WhatsApp Business API or Twilio
await fetch('/api/send-whatsapp', {
  method: 'POST',
  body: JSON.stringify({
    to: '+918892031480',
    message: `New Lead!\nName: ${leadData.name}\nPhone: ${leadData.phone}`
  })
});
```

## 🔐 Security Notes

### Current Admin Access:
- Username: `admin`
- Password: `admin123`

⚠️ **Change this before going live!**

### To Change Admin Password:

1. Open: `src/components/Admin/AdminLogin.jsx`
2. Find line: `if (credentials.username === 'admin' && credentials.password === 'admin123')`
3. Change to your secure password
4. Commit and deploy

Or better: use environment variables:
```javascript
if (credentials.username === process.env.VITE_ADMIN_USER &&
    credentials.password === process.env.VITE_ADMIN_PASS)
```

## 📊 Summary

✅ **Leads are saved IMMEDIATELY when user enters contact info**
✅ **Appears in admin panel with "unpaid" status**
✅ **Payment status updates if they complete payment**
✅ **You can see all leads (paid and unpaid) in admin**
✅ **Works perfectly for collecting customer information**

The system is designed to capture every single lead, even if they don't complete payment!

---

**Questions?** Check the browser console for detailed logs when testing.
