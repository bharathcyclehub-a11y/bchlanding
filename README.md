# Premium Bicycle Home Test Ride Landing Page

A production-ready React landing page for a premium bicycle home test ride service in Bangalore. Designed as a behavioral filter and authority positioning engine for converting cold Instagram/YouTube traffic into committed ₹99 bookings.

## Features

### Core Experience
- **Authority-First Design** - Expert-guided selection over product catalogs
- **Mobile-Native** - Optimized for Instagram/YouTube Reels traffic
- **Anxiety Reduction** - Clean, confident, premium minimalism
- **Interactive Quiz** - 4-step guided questionnaire with progress tracking
- **Smooth Animations** - Framer Motion powered micro-interactions

### Technical Highlights
- React 18+ with functional components
- Tailwind CSS for responsive design
- Framer Motion for animations
- Mobile-first approach with sticky CTAs
- Semantic HTML with ARIA labels
- Optimized performance with lazy loading

## Project Structure

```
src/
├── components/
│   ├── Hero.jsx                    # Above-fold hero section
│   ├── ValueProposition.jsx        # ₹99 fee explanation
│   ├── WhyHomeTestRide.jsx        # Problem-solution messaging
│   ├── HowItWorks.jsx             # 4-step process timeline
│   ├── SocialProof.jsx            # Social media trust signals
│   ├── FAQ.jsx                    # Accordion-style objection handling
│   ├── Quiz/
│   │   ├── QuizContainer.jsx      # Quiz state management
│   │   ├── QuizStep.jsx           # Individual quiz questions
│   │   └── QuizProgress.jsx       # Progress bar component
│   ├── ExpertPromise.jsx          # Post-quiz authority screen
│   ├── PaymentConfirmation.jsx    # ₹99 payment screen
│   └── SuccessScreen.jsx          # Post-payment confirmation
├── App.jsx                        # Main flow orchestration
├── main.jsx                       # React entry point
└── index.css                      # Global styles + Tailwind
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Design Philosophy

### 1. Authority Over Choice
Users don't browse catalogs - experts curate options based on quiz answers.

### 2. Anxiety Reduction
Every section calms rather than overwhelms:
- Clear value proposition
- Simple 4-step process
- Transparent pricing
- No hidden terms

### 3. Mobile-Native
- One emotion per viewport
- Thumb-first interactions
- Sticky bottom CTA on mobile
- Full-width sections

### 4. Premium Minimalism
- Deep navy (#1a1f3c) + warm gold (#d4a853)
- Clean typography hierarchy
- Subtle animations
- No product clutter

## User Flow

```
Landing Page
    ↓
Quiz (4 questions)
    ↓
Expert Promise Screen
    ↓
Payment (₹99)
    ↓
Success + Next Steps
```

## Key Sections

### Hero
- Expert-guided positioning
- Trust badge (10,000+ parents)
- Single clear CTA
- Premium gradient background

### ₹99 Explanation
- Reframes fee as quality filter
- 3 benefit points with icons
- Confident, non-apologetic tone

### Quiz Flow
- User type (child/teen/adult)
- Height selector
- Purchase timeline
- Priority (safety/style/durability/value)

### Social Proof
- Instagram/YouTube stats
- Featured reel thumbnails
- Community messaging

### Payment
- Clear fee breakdown
- Trust badges
- Transparent terms
- Secure payment CTA

## Color Palette

```css
Navy: #1a1f3c (primary)
Navy Light: #2a2f4c
Navy Dark: #0f1220
Gold: #d4a853 (accent)
Gold Light: #e5c584
Gold Dark: #b88f3f
```

## Responsive Breakpoints

- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)

## Performance Optimizations

- Lazy loading for below-fold sections
- Optimized animations with GPU acceleration
- Minimal JavaScript bundle
- Efficient re-renders with React best practices

## Customization

### Update Content
Edit text directly in component files:
- Hero messaging: `src/components/Hero.jsx`
- Quiz questions: `src/components/Quiz/QuizContainer.jsx`
- FAQ items: `src/components/FAQ.jsx`

### Update Colors
Modify Tailwind config: `tailwind.config.js`

### Add Payment Integration
Replace mock payment in `App.jsx` → `handlePayment()` function with actual gateway (Razorpay, Stripe, etc.)

## Production Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect repository
2. Build command: `npm run build`
3. Output directory: `dist`

### Environment Variables
Add `.env` file for:
- Payment gateway keys
- WhatsApp business number
- Analytics IDs

## Browser Support

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all clickable elements
- Sufficient color contrast ratios

## License

Proprietary - Built for premium bicycle home test ride service

## Contact

For questions or support, reach out via WhatsApp in the success screen.

---

**Built with precision for conversion optimization** 🚴‍♂️
