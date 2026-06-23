import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const PHONE = '8892031480';
const WA_LINK = `https://wa.me/91${PHONE}?text=Hi%2C%20I%27m%20interested%20in%20the%20EMotorad%20Viper.%20Please%20share%20details.`;

// ─── Animation ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: d, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

function Section({ children, className = '', id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section ref={ref} id={id} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp} className={className}>
      {children}
    </motion.section>
  );
}

// ─── Lead Form Component ──────────────────────────────────────────
function LeadForm({ variant = 'dark', source = 'hero', buttonText = 'Book Free Test Ride' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || phone.length < 10) return;
    // Send to WhatsApp with pre-filled message
    const msg = encodeURIComponent(`Hi, I'm ${name}. I want to book a free test ride for the EMotorad Viper. My number: ${phone}`);
    window.open(`https://wa.me/91${PHONE}?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`text-center py-6 px-4 rounded-xl ${variant === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
        <div className="text-2xl mb-2">✅</div>
        <p className={`font-semibold ${variant === 'dark' ? 'text-green-400' : 'text-green-700'}`}>We'll call you within 5 minutes!</p>
        <p className={`text-sm mt-1 ${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Check WhatsApp for test ride details</p>
      </div>
    );
  }

  const isDark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required
        className={`w-full px-4 py-3 rounded-lg text-sm transition-all ${isDark ? 'bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:border-orange-500/50' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'} focus:outline-none focus:ring-1 focus:ring-orange-500/30`}
      />
      <input
        type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="[0-9]{10}" maxLength={10}
        className={`w-full px-4 py-3 rounded-lg text-sm transition-all ${isDark ? 'bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:border-orange-500/50' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'} focus:outline-none focus:ring-1 focus:ring-orange-500/30`}
      />
      <button type="submit" className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/25 text-sm">
        {buttonText}
      </button>
      <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        No spam. We call within 5 minutes. ₹99 test ride fee adjusted on purchase.
      </p>
    </form>
  );
}

// ─── S0: AUTO-POPUP (3-second trigger) ────────────────────────────
function AutoPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Exit intent
  useEffect(() => {
    if (dismissed) return;
    const handler = (e) => {
      if (e.clientY <= 0) setShow(true);
    };
    document.addEventListener('mouseout', handler);
    return () => document.removeEventListener('mouseout', handler);
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => { setShow(false); setDismissed(true); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { setShow(false); setDismissed(true); }} className="absolute top-3 right-3 text-gray-500 hover:text-white text-xl">×</button>
          <div className="text-center mb-5">
            <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full mb-3">Limited Slots This Week</span>
            <h3 className="text-white text-xl font-bold mb-1">Book Your FREE Test Ride</h3>
            <p className="text-gray-400 text-sm">Experience the Viper at Bharath Cycle Hub, Yelahanka</p>
          </div>
          <LeadForm source="popup" buttonText="Book My Free Test Ride →" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── S1: HERO ─────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <motion.div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-40" style={{ backgroundImage: "url('/viper-section-hero.jpg')", y: bgY }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />

      <motion.div style={{ opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Pain-point headline */}
          <div>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-xs font-medium tracking-wider uppercase mb-5">
              EMotorad × Bharath Cycle Hub
            </motion.span>

            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              You're <span className="text-orange-400">Losing ₹1,26,000/Year</span> on Commuting.
              <br />
              <span className="text-gray-300 text-2xl sm:text-3xl lg:text-4xl">The Viper Costs ₹36/Day.</span>
            </motion.h1>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5} className="flex items-center gap-3 mb-6">
              {['85 Km Range', '48V 250W Motor', 'NFC Display', '₹66,999'].map((t) => (
                <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/70 text-xs">{t}</span>
              ))}
            </motion.div>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.6} className="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">
              Moto-inspired frame. NFC-enabled display. Dual suspension. 7-speed Shimano gears.
              Hydraulic disc brakes. 1,400+ e-cycles sold in Bangalore. 25 years of trust.
            </motion.p>

            {/* Trust markers */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.7} className="flex flex-wrap gap-4 mb-6 text-xs text-gray-400">
              <span>⭐ 4.7/5 (2,122 reviews)</span>
              <span>🏪 25+ Years in Business</span>
              <span>🔧 8 Full-Time Mechanics</span>
            </motion.div>

            {/* Mobile CTA */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.8} className="flex gap-3 lg:hidden mb-8">
              <a href={`tel:${PHONE}`} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-lg text-center text-sm">📞 Call Now</a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg text-center text-sm">💬 WhatsApp</a>
            </motion.div>
          </div>

          {/* Right: Lead Form */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h3 className="text-white text-lg font-bold mb-1">Book Your FREE Test Ride</h3>
            <p className="text-gray-400 text-sm mb-5">We'll call you within 5 minutes to confirm your slot</p>
            <LeadForm source="hero" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── S2: AUTHORITY BAR ────────────────────────────────────────────
function AuthorityBar() {
  const stats = [
    { value: '1,400+', label: 'E-Cycles Sold', sub: 'This Year' },
    { value: '25+', label: 'Years in Business', sub: 'Since 1999' },
    { value: '88%', label: 'Store Conversion', sub: 'Industry: 10-20%' },
    { value: '60%', label: 'Market Share', sub: 'Bangalore E-Cycles' },
  ];

  return (
    <section className="bg-[#0a0a0a] border-y border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-2xl sm:text-3xl font-bold text-orange-400">{s.value}</div>
              <div className="text-white text-xs font-medium uppercase tracking-wider mt-1">{s.label}</div>
              <div className="text-gray-500 text-[10px] mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-xs mt-5">
          Questions? Call <a href={`tel:${PHONE}`} className="text-orange-400 hover:underline">{PHONE}</a>
        </p>
      </div>
    </section>
  );
}

// ─── S3: PAIN AGITATION ───────────────────────────────────────────
function PainSection() {
  const pains = [
    { icon: '🚗', title: 'Stuck in Traffic 2 Hours/Day', desc: 'That\'s 480 hours a year — 20 FULL DAYS sitting in a car, going nowhere.' },
    { icon: '⛽', title: 'Burning ₹6,500/Month on Commute', desc: 'Petrol + parking + Uber surge. ₹78,000 a year. For the privilege of being stuck.' },
    { icon: '📱', title: 'Kid Glued to Screens All Day', desc: '40% of parents buy e-cycles because of screen addiction. It\'s not a toy — it\'s medicine.' },
    { icon: '😰', title: 'Auto Fares Keep Rising', desc: '₹150/day × 200 school days = ₹30,000/year. For your kid sitting in traffic.' },
    { icon: '🏋️', title: 'No Time for Fitness', desc: 'Your commute could BE your workout. 30 minutes of cycling = gym session.' },
    { icon: '💸', title: 'Everything Depends on Uber/Ola', desc: 'Surge pricing, cancelled rides, 20-minute waits. Your schedule in someone else\'s hands.' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]" id="pain">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Sound Familiar?</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Is This You?</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/20 transition-colors">
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-300 text-sm mb-4">If you said YES to even ONE — <span className="text-orange-400 font-semibold">we need to talk.</span></p>
          <a href={`tel:${PHONE}`} className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
            📞 Call {PHONE} — Free Consultation
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S4: TRANSFORMATION BRIDGE ────────────────────────────────────
function TransformationSection() {
  const aspirations = [
    { before: '2-hour commute', after: '35-minute ride', icon: '⏱️' },
    { before: '₹6,500/month on petrol', after: '₹350/month on charging', icon: '💰' },
    { before: 'Kid on phone all day', after: 'Kid riding with friends daily', icon: '🚴' },
    { before: 'Dependent on auto/Uber', after: 'Complete independence', icon: '🔓' },
    { before: 'Arriving stressed & late', after: 'Arriving fresh & early', icon: '😌' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">The Switch</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">What If Your Life Could Look Like This?</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="space-y-3">
          {aspirations.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-2xl shrink-0">{a.icon}</span>
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                <span className="text-red-400/80 text-sm line-through">{a.before}</span>
                <span className="text-gray-600">→</span>
                <span className="text-green-400 text-sm font-medium">{a.after}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-300 text-sm mb-4">1,400 Bangalore riders made this switch this year.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm">
            💬 WhatsApp Us — Start Your Transformation
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S5: WHO IS THIS FOR? ─────────────────────────────────────────
function WhoIsThisFor() {
  const personas = [
    { title: 'Bangalore Commuter', desc: 'Tired of Silk Board traffic and ₹6,500/month fuel bills. Want your 2 hours/day back.', match: '50% of our buyers' },
    { title: 'Parent of a Teenager', desc: 'Kid is glued to screens. Want them outdoors, active, and independent. Birthday or exam reward.', match: '75% of our buyers' },
    { title: 'Fitness-Conscious Professional', desc: 'No time for gym. Want exercise built into your commute. 30 min ride = workout done.', match: '15% of our buyers' },
    { title: 'Eco-Conscious Rider', desc: 'Want zero-emission commute. ₹7 per 100km. Zero carbon footprint.', match: 'Growing segment' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Is This For You?</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">The Viper Is Built For You If...</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {personas.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 rounded border-2 border-orange-500 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-2">{p.desc}</p>
                  <span className="text-orange-400/60 text-[10px] uppercase tracking-wider">{p.match}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href={`tel:${PHONE}`} className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
            📞 Call {PHONE} — Find Out How We Can Help
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S6: SOCIAL PROOF ─────────────────────────────────────────────
function SocialProofSection() {
  const testimonials = [
    { name: 'Software Engineer, HSR Layout', text: 'Switched from Uber 4 months ago. Saving ₹4,000/month. My commute went from 90 minutes to 35.', rating: 5 },
    { name: 'Parent, Koramangala', text: 'My son hasn\'t touched his phone in 2 weeks since we got the Viper. Best ₹67K I ever spent.', rating: 5 },
    { name: 'College Student, Jayanagar', text: 'All my friends are jealous. The NFC display and fat tyres make it look like a mini motorcycle.', rating: 5 },
    { name: 'IT Professional, Whitefield', text: 'The staff at BCH are incredibly knowledgeable. Mr. Syed helped me pick the perfect model. 25 years of experience shows.', rating: 5 },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Real Riders. Real Results.</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">1,400 Bangalore Families Made the Switch</h2>
          <p className="text-gray-400 text-sm">⭐ 4.7/5 average rating from 2,122 reviews</p>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto mt-4" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex gap-0.5 mb-3">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-orange-400 text-sm">⭐</span>)}</div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">"{t.text}"</p>
              <p className="text-gray-500 text-xs">— {t.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Action gallery */}
        <div className="grid grid-cols-3 gap-2 mt-8 rounded-xl overflow-hidden">
          {['/viper-frame-5.jpg', '/viper-frame-7.jpg', '/viper-frame-8.jpg'].map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="aspect-video bg-gray-900">
              <img src={src} alt="Viper in action" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">Want results like these?</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm">
            💬 WhatsApp {PHONE} — Let's Talk
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S7: HOW IT WORKS ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '1', title: 'Book Free Test Ride', desc: 'Call or WhatsApp us. We\'ll confirm your slot in 5 minutes. Zero obligation.', icon: '📞' },
    { num: '2', title: 'Visit & Ride the Viper', desc: 'Come to BCH Yelahanka. Test ride takes 5 minutes. If you don\'t love it — shake hands and leave.', icon: '🚴' },
    { num: '3', title: 'Ride Home Happy', desc: 'EMI from ₹999/month. Free helmet, lock, and first service. We handle everything.', icon: '🎉' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Dead Simple</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">3 Simple Steps</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{s.icon}</span>
              </div>
              <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">Step {s.num}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{s.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Decoding diagram */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 rounded-xl overflow-hidden bg-white">
          <img src="/viper-section-decoding.jpg" alt="EMotorad Viper - Component breakdown" className="w-full h-auto" loading="lazy" />
        </motion.div>

        <div className="text-center mt-8">
          <a href={`tel:${PHONE}`} className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
            📞 Start With Step 1 — Call {PHONE}
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S8: BCH STORE STORY ──────────────────────────────────────────
function StoreStory() {
  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Our Story</span>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mt-2 mb-4">25 Years. One Mission.<br />Get Bangalore Cycling.</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>Bharath Cycle Hub started in Yelahanka when most of Bangalore was still villages. <span className="text-white font-medium">25 years later</span>, we're the city's largest e-cycle dealer — 60% of Bangalore's e-cycles come from our store.</p>
              <p><span className="text-white font-medium">6,500 sqft showroom. 300+ cycles on display. 30 staff. 8 full-time mechanics.</span> When your motor needs service at 10 PM on a Sunday, we answer the phone.</p>
              <p>We've sold <span className="text-white font-medium">1,400+ e-cycles this year alone</span>. Not because we're the cheapest — we're not. We charge ₹2,000 more than competitors. Because when you buy from BCH, you're buying 25 years of trust, not just a cycle.</p>
            </div>
            <div className="mt-6">
              <a href={`tel:${PHONE}`} className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
                📞 Call Us — {PHONE}
              </a>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src="/viper-bike.jpg" alt="EMotorad Viper at BCH" className="w-full rounded-xl" loading="lazy" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {['/viper-frame-10.jpg', '/viper-frame-12.jpg', '/viper-gallery-1.jpg'].map((src, i) => (
                <img key={i} src={src} alt="BCH store" className="w-full aspect-video object-cover rounded-lg" loading="lazy" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── S9: PRICING ──────────────────────────────────────────────────
function PricingSection() {
  return (
    <Section className="py-16 sm:py-20 bg-[#111]" id="pricing">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">The Math</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">₹36/Day. Less Than Your Chai.</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-gray-500 text-lg line-through">₹79,999</span>
            <span className="text-white text-4xl sm:text-5xl font-bold">₹66,999</span>
          </div>
          <span className="inline-block bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">Save ₹13,000</span>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-white/[0.03]">
              <div className="text-orange-400 text-2xl font-bold">₹36/day</div>
              <div className="text-gray-400 text-xs">Over 5 years of daily use</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.03]">
              <div className="text-orange-400 text-2xl font-bold">₹999/mo EMI</div>
              <div className="text-gray-400 text-xs">Less than your Netflix + Spotify</div>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {['Free helmet + lock + first service (₹5,500 value)', '2-year warranty on motor & battery', '8 full-time mechanics for after-sales', 'EMI options available (approved in 5 mins)', 'Speed lock at 25 km/h for safety', '₹99 test ride fee adjusted on purchase'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <a href={`tel:${PHONE}`} className="block w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-center transition-all text-sm">
              📞 Call {PHONE} — Book Test Ride
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center transition-all text-sm">
              💬 WhatsApp Us
            </a>
          </div>
          <p className="text-gray-500 text-xs text-center mt-4">₹99 test ride fee adjusted on purchase. Zero risk.</p>
        </div>
      </div>
    </Section>
  );
}

// ─── S10: FAQ / OBJECTION HANDLER ─────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Is ₹67,000 really worth it for a cycle?', a: 'You\'re spending ₹1,26,000/year on commuting (petrol + parking + Uber). The Viper costs ₹66,999 ONCE. It pays for itself in 6 months. After that — free commute for 5+ years. 1,400 Bangalore families did this math already.' },
    { q: 'Will the battery actually last?', a: '48V 15.6Ah Samsung Li-Ion battery. 85 km on pedal assist, 70 km on throttle — tested on real Bangalore roads. 2-year warranty. If it dies within warranty — 100% free replacement, no questions.' },
    { q: 'Is it safe for my teenager?', a: 'Speed lock at 25 km/h (can\'t go faster). Hydraulic disc brakes with 160mm rotor (stops in 1 second). Front 420 Lux lights. Rear light with integrated horn. 300+ mothers in Bangalore trusted BCH with their child\'s first e-cycle.' },
    { q: 'What if my kid stops using it after 2 months?', a: 'E-cycles retain interest 300% longer than normal cycles. Plus, BCH Riders Club organizes group rides to keep kids engaged. The 20% who ride daily are the happiest — we\'ll help your kid be one of them.' },
    { q: 'Who will service it? What if something breaks?', a: '8 full-time mechanics. 25 years in business. Free first service. We\'re not an online brand that disappears — we\'ve been in Yelahanka since 1999. When your motor needs service at 10 PM, we answer the phone.' },
    { q: 'Can I try before I buy?', a: 'Absolutely. Book a FREE test ride — it takes 5 minutes. If you don\'t love it, shake hands and leave. 88% of people who test ride end up buying. The cycle sells itself.' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]" id="faq">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Got Questions?</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Your Doubts, Answered</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors text-left">
                <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                <span className="text-orange-400 text-lg shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-4 py-3 text-gray-400 text-sm leading-relaxed">
                      {faq.a}
                      <div className="mt-3">
                        <a href={`tel:${PHONE}`} className="text-orange-400 text-xs hover:underline">📞 Still have doubts? Call {PHONE}</a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── S11: URGENCY CLOSE + FINAL LEAD FORM ─────────────────────────
function UrgencyClose() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src="/viper-frame-3.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['🛡️ 2-Year Warranty', '🔧 8 Mechanics', '📦 Free Accessories', '💳 EMI ₹999/mo', '🏪 25+ Years'].map((b) => (
            <span key={b} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full border border-white/10">{b}</span>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3">We Only Take 15 Test Rides Per Week</h2>
          <p className="text-gray-300 text-sm max-w-lg mx-auto">
            Experience the Viper at Bharath Cycle Hub, Yelahanka.
            One test ride. 5 minutes. That's all it takes.
          </p>
        </div>

        <div className="max-w-sm mx-auto bg-white/[0.06] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-white text-lg font-bold mb-1 text-center">Book Your Slot Now</h3>
          <p className="text-gray-400 text-xs text-center mb-5">100% Free. No obligation. Your number is safe.</p>
          <LeadForm source="final" buttonText="Book My Test Ride — Free" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href={`tel:${PHONE}`} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-center transition-all text-sm">
            📞 Call {PHONE}
          </a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center transition-all text-sm">
            💬 WhatsApp Us
          </a>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Bharath Cycle Hub, Yelahanka, Bangalore · Open 10 AM - 8 PM, All Days · ₹99 test ride fee adjusted on purchase
        </p>
      </div>
    </section>
  );
}

// ─── S12: STICKY FOOTER BAR (Mobile) ─────────────────────────────
function StickyFooter() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-md border-t border-white/10 p-2 sm:p-3 lg:hidden safe-bottom">
      <div className="flex gap-2 max-w-lg mx-auto">
        <a href={`tel:${PHONE}`} className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-lg text-center text-sm">
          📞 Call Now
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg text-center text-sm">
          💬 WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function ViperLandingPage() {
  return (
    <div className="viper-theme bg-[#0a0a0a]">
      <AutoPopup />
      <HeroSection />
      <AuthorityBar />
      <PainSection />
      <TransformationSection />
      <WhoIsThisFor />
      <SocialProofSection />
      <HowItWorks />
      <StoreStory />
      <PricingSection />
      <FAQSection />
      <UrgencyClose />
      <StickyFooter />
    </div>
  );
}
