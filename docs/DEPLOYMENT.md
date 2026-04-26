# Deployment Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to project settings
   - Add variables from `.env.example`
   - Redeploy

**Benefits**: Auto-SSL, CDN, instant deployments, zero config

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure**
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/bchlanding"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: AWS S3 + CloudFront

1. **Build**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

## Payment Integration

### Razorpay Setup (India)

1. **Install Razorpay**
   ```bash
   npm install razorpay
   ```

2. **Update PaymentConfirmation.jsx**
   ```javascript
   const handlePayment = () => {
     const options = {
       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
       amount: 9900, // ₹99 in paise
       currency: "INR",
       name: "Bicycle Home Test Ride",
       description: "Expert Consultation Booking Fee",
       handler: function (response) {
         // Handle success
         console.log(response.razorpay_payment_id);
         setCurrentStage('success');
       },
       prefill: {
         name: "",
         email: "",
         contact: ""
       },
       theme: {
         color: "#d4a853"
       }
     };

     const razorpay = new window.Razorpay(options);
     razorpay.open();
   };
   ```

3. **Add Razorpay Script to index.html**
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

## Analytics Setup

### Google Analytics 4

1. **Add to index.html**
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

2. **Track Events in Components**
   ```javascript
   // On quiz completion
   gtag('event', 'quiz_completed', {
     'event_category': 'engagement',
     'event_label': 'user_completed_quiz'
   });

   // On payment
   gtag('event', 'purchase', {
     'transaction_id': 'unique_id',
     'value': 99,
     'currency': 'INR'
   });
   ```

### Meta Pixel (Facebook/Instagram)

1. **Add to index.html**
   ```html
   <!-- Meta Pixel Code -->
   <script>
     !function(f,b,e,v,n,t,s)
     {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
     n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];
     s.parentNode.insertBefore(t,s)}(window, document,'script',
     'https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'YOUR_PIXEL_ID');
     fbq('track', 'PageView');
   </script>
   ```

2. **Track Conversions**
   ```javascript
   // On quiz start
   fbq('track', 'Lead');

   // On payment
   fbq('track', 'Purchase', {value: 99, currency: 'INR'});
   ```

## Performance Optimization

### 1. Enable Compression
Add to `vercel.json` or netlify config:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Image Optimization
- Use WebP format
- Compress images with tools like TinyPNG
- Add lazy loading to below-fold images

### 3. Code Splitting
Already optimized with Vite's default configuration.

## Domain Configuration

### Custom Domain on Vercel
1. Go to project settings → Domains
2. Add your domain (e.g., `bicycle.yourdomain.com`)
3. Update DNS records as shown
4. SSL auto-configured

### Custom Domain on Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS or use Netlify DNS
4. SSL auto-configured

## Monitoring & Maintenance

### Error Tracking (Sentry)

1. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

2. **Initialize in main.jsx**
   ```javascript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [new Sentry.BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

### Uptime Monitoring
- Use services like UptimeRobot or Pingdom
- Set up alerts for downtime

## Pre-Launch Checklist

- [ ] Test on multiple devices (iOS, Android)
- [ ] Test on multiple browsers
- [ ] Verify payment flow (use test mode)
- [ ] Check all links and CTAs
- [ ] Test quiz flow completely
- [ ] Verify mobile sticky CTA
- [ ] Set up analytics tracking
- [ ] Configure error monitoring
- [ ] Test form submissions
- [ ] Verify WhatsApp link
- [ ] Check page load speed (use Lighthouse)
- [ ] Verify SEO meta tags
- [ ] Set up custom domain
- [ ] Configure SSL
- [ ] Test checkout on real payment gateway

## Post-Launch

### A/B Testing Ideas
- Hero headline variations
- CTA button text
- Quiz question order
- Color scheme variations
- Pricing presentation

### Conversion Tracking
Monitor:
- Landing → Quiz start rate
- Quiz → Payment rate
- Payment → Success rate
- Overall conversion rate
- Average time on page

## Support & Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor performance metrics
- Review user feedback
- Test payment integrations
- Backup configuration

### Scaling Considerations
- Add backend API for booking management
- Implement CRM integration
- Add SMS notifications
- Create admin dashboard
- Set up webhook handlers

---

**Need help?** Check React, Vite, and Tailwind CSS documentation for additional configuration options.
