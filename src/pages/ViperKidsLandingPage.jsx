import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

const PHONE = '8892031480';
const WA_LINK = `https://wa.me/91${PHONE}?text=Hi%2C%20I%27m%20interested%20in%20the%20EMotorad%20Viper%20for%20my%20child.%20Please%20share%20details.`;

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
function LeadForm({ variant = 'dark', source = 'hero', buttonText = 'Book Free Test Ride for My Child' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || phone.length < 10) return;
    const msg = encodeURIComponent(`Hi, I'm ${name}. I want to book a free test ride of the EMotorad Viper for my child. My number: ${phone}`);
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
        type="text" placeholder="Parent's Name" value={name} onChange={(e) => setName(e.target.value)} required
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
        No spam. We call within 5 minutes. Your child can test ride for free.
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
            <span className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 text-xs font-medium rounded-full mb-3">Only 5 Kids' Test Rides Left This Week</span>
            <h3 className="text-white text-xl font-bold mb-1">Let Your Child Test Ride Free</h3>
            <p className="text-gray-400 text-sm">Safe, supervised ride at BCH Yelahanka</p>
          </div>
          <LeadForm source="popup" buttonText="Book My Child's Free Test Ride →" />
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
          <div>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 text-xs font-medium tracking-wider uppercase mb-5">
              EMotorad Viper × For Your Child
            </motion.span>

            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Your Child Spends <span className="text-orange-400">6+ Hours on Screens.</span>
              <br />
              <span className="text-gray-300 text-2xl sm:text-3xl lg:text-4xl">Give Them the Outdoors Back.</span>
            </motion.h1>

            {/* Kannada line */}
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.4} className="text-orange-400/80 text-base sm:text-lg font-medium mb-4">
              ನಿಮ್ಮ ಮಕ್ಕಳಿಗೆ ಸ್ವಾತಂತ್ರ್ಯ ಕೊಡಿ — ಸ್ಕ್ರೀನ್ ಅಲ್ಲ, ಸೈಕಲ್.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5} className="flex flex-wrap items-center gap-3 mb-6">
              {['🔒 25 km/h Speed Lock', '🛑 Hydraulic Disc Brakes', '💡 420 Lux Lights', '🛡️ 2-Year Warranty'].map((t) => (
                <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/70 text-xs">{t}</span>
              ))}
            </motion.div>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.6} className="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">
              The EMotorad Viper is the e-cycle 300+ Bangalore parents chose for their teenagers.
              Speed-locked at 25 km/h. Hydraulic brakes that stop in 1 second. Front & rear lights.
              Not a toy — a real vehicle with real safety built in.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.7} className="flex flex-wrap gap-4 mb-6 text-xs text-gray-400">
              <span>⭐ 4.7/5 (2,122 reviews)</span>
              <span>👨‍👩‍👧 300+ Parents Trust BCH</span>
              <span>🔧 8 Full-Time Mechanics</span>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.8} className="flex gap-3 lg:hidden mb-8">
              <a href={`tel:${PHONE}`} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-lg text-center text-sm">📞 Call Now</a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg text-center text-sm">💬 WhatsApp</a>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            <h3 className="text-white text-lg font-bold mb-1">Book a FREE Test Ride for Your Child</h3>
            <p className="text-gray-400 text-sm mb-5">Safe, supervised ride. We'll call you in 5 minutes to confirm.</p>
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
    { value: '300+', label: 'Parents Trust Us', sub: "For Their Kids' E-Cycle" },
    { value: '25+', label: 'Years in Business', sub: 'Since 1999' },
    { value: '25 km/h', label: 'Speed Lock', sub: 'Built-in Safety Limit' },
    { value: '4.7/5', label: 'Google Rating', sub: '2,122 Reviews' },
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

// ─── S3: PAIN AGITATION (Parent's fears) ──────────────────────────
function PainSection() {
  const pains = [
    { icon: '📱', title: 'Glued to Screens 6+ Hours/Day', desc: 'Phone → tablet → laptop → TV. The cycle never breaks. You\'ve tried everything. Nothing works.' },
    { icon: '🛋️', title: 'Zero Physical Activity', desc: 'PE class once a week isn\'t enough. Your child hasn\'t run, cycled, or played outdoors in months.' },
    { icon: '😤', title: 'Moody, Irritable, Low Energy', desc: 'Screen addiction → poor sleep → mood swings → fights at home. Doctors say: "Get them outdoors."' },
    { icon: '🚗', title: 'You\'re Their Personal Uber', desc: 'Tuition drop. Friend\'s house pickup. Mall trip. Your entire weekend revolves around driving them.' },
    { icon: '👥', title: 'No Real Friends, Only Online', desc: 'Group chats ≠ friendships. Your child hasn\'t made a real outdoor friend in over a year.' },
    { icon: '🎓', title: 'Exam Stress With No Outlet', desc: '10th/12th pressure is real. No sport, no outdoor hobby, no stress release. Just more screen time.' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]" id="pain">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ಇದು ನಿಮ್ಮ ಮನೆಯ ಕಥೆನಾ?</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Is This Happening in Your Home?</h2>
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
          <p className="text-gray-300 text-sm mb-4">If you said YES to even ONE — <span className="text-orange-400 font-semibold">the Viper is the answer.</span></p>
          <a href={`tel:${PHONE}`} className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
            📞 Call {PHONE} — Talk to a Parent Expert
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S4: TRANSFORMATION BRIDGE ────────────────────────────────────
function TransformationSection() {
  const aspirations = [
    { before: 'Glued to phone all day', after: 'Riding with friends every evening', icon: '🚴' },
    { before: 'Moody, irritable, low energy', after: 'Happy, active, sleeping better', icon: '😊' },
    { before: 'You drive them everywhere', after: 'They ride to tuition & friends independently', icon: '🔓' },
    { before: 'No real friends, only online', after: 'BCH Riders Club group rides every weekend', icon: '👥' },
    { before: 'Exam stress with no outlet', after: '30 min ride = complete stress reset', icon: '🧠' },
    { before: '₹30,000/year on auto fares', after: '₹350/month on charging', icon: '💰' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ಬದಲಾವಣೆ ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Imagine Your Child Like This Instead</h2>
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
          <p className="text-gray-300 text-sm mb-4">300+ Bangalore parents saw this transformation in their kids.</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm">
            💬 WhatsApp Us — Ask Any Question
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S5: SAFETY SECTION (Parents' #1 concern) ────────────────────
function SafetySection() {
  const features = [
    { icon: '🔒', title: 'Speed Lock at 25 km/h', desc: 'Physically cannot go faster. Factory-locked by EMotorad. No override possible. Slower than a scooter in traffic.' },
    { icon: '🛑', title: 'Hydraulic Disc Brakes', desc: '160mm rotor. Stops in under 1 second at full speed. Same braking system used in premium mountain bikes.' },
    { icon: '💡', title: '420 Lux Front Light + Rear Light', desc: 'Bright enough to ride at dusk. Rear light with integrated horn. Visible from 200+ meters.' },
    { icon: '🛡️', title: 'Dual Suspension', desc: 'Front fork + rear suspension absorbs potholes and speed bumps. No jarring impacts on your child\'s spine.' },
    { icon: '🔧', title: '8 Mechanics on Call', desc: 'Flat tyre? Motor issue? We answer the phone even at 10 PM on Sunday. 25 years — we don\'t disappear.' },
    { icon: '🎁', title: 'Free Helmet + Lock', desc: 'ISI-certified helmet included free. Heavy-duty combination lock. ₹2,500 value — on us.' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ನಿಮ್ಮ ಮಗುವಿನ ಸುರಕ್ಷತೆ ಮೊದಲು</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Built for Safety. Designed for Parents' Peace of Mind.</h2>
          <div className="w-12 h-0.5 bg-orange-500 mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-green-500/10 hover:border-green-500/30 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href={`tel:${PHONE}`} className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm">
            📞 Call {PHONE} — Ask About Safety Features
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S6: WHO IS THIS FOR? ─────────────────────────────────────────
function WhoIsThisFor() {
  const personas = [
    { title: 'Parent of a Screen-Addicted Teen', desc: 'Your 13-18 year old lives on their phone. You\'ve tried limiting screen time — nothing sticks. The Viper gives them a reason to go outside.', match: '40% of our buyers' },
    { title: 'Parent Looking for a Birthday/Exam Gift', desc: '10th pass? Birthday? Something that says "I\'m proud of you" — not another phone or PlayStation.', match: '25% of our buyers' },
    { title: 'Parent Tired of Being a Taxi', desc: 'Tuition, friends\' houses, cricket ground. You spend weekends driving. Give them independence.', match: '20% of our buyers' },
    { title: 'Parent Who Wants Their Child Active', desc: 'Doctor said more outdoor time. Sports didn\'t stick. Cycling is the one activity kids actually love.', match: '15% of our buyers' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Is This You?</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">This E-Cycle Is For Your Child If...</h2>
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
            📞 Call {PHONE} — Let's Find the Right Fit
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S7: SOCIAL PROOF (Parent testimonials) ──────────────────────
function SocialProofSection() {
  const testimonials = [
    { name: 'Mother, Koramangala', text: 'My son hasn\'t touched his phone in 2 weeks since we got the Viper. He rides to tuition and back — alone. Best ₹67K I ever spent as a parent.', rating: 5 },
    { name: 'Father, Whitefield', text: 'I was terrified about safety. But the speed lock at 25 km/h and those hydraulic brakes — my daughter stops faster than I do on my scooter. She\'s been riding daily for 4 months.', rating: 5 },
    { name: 'Parent, Yelahanka', text: 'Bought it as a 10th pass gift. My son now has 6 friends who ride together every evening. He\'s happier, sleeping better, and actually eating dinner on time.', rating: 5 },
    { name: 'Mother, Hebbal', text: 'Mr. Syed at BCH spent 30 minutes explaining every safety feature to me. They adjusted the seat height, taught my daughter how to brake, and even followed up after a week. 25 years of trust shows.', rating: 5 },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ನಿಜವಾದ ಪೋಷಕರು. ನಿಜವಾದ ಫಲಿತಾಂಶ.</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">300+ Bangalore Parents Made This Choice</h2>
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

        <div className="grid grid-cols-3 gap-2 mt-8 rounded-xl overflow-hidden">
          {['/viper-frame-5.jpg', '/viper-frame-7.jpg', '/viper-frame-8.jpg'].map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="aspect-video bg-gray-900">
              <img src={src} alt="Viper e-cycle" loading="lazy" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">Want the same transformation for your child?</p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm">
            💬 WhatsApp {PHONE} — Talk to a Parent Expert
          </a>
        </div>
      </div>
    </Section>
  );
}

// ─── S8: HOW IT WORKS ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '1', title: 'Book a Free Test Ride', desc: 'Call or WhatsApp. We\'ll confirm your slot in 5 minutes. Bring your child — it\'s a supervised ride.', icon: '📞' },
    { num: '2', title: 'Visit BCH With Your Child', desc: 'We adjust the seat to your child\'s height. Teach them braking & controls. Supervised 5-min test ride. If they don\'t love it — no pressure.', icon: '🚴' },
    { num: '3', title: 'Watch Them Light Up', desc: 'EMI from ₹999/month. Free helmet + lock + first service. Ride home the same day.', icon: '🎉' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ಸರಳ 3 ಹಂತಗಳು</span>
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

// ─── S9: BCH STORE STORY ──────────────────────────────────────────
function StoreStory() {
  return (
    <Section className="py-16 sm:py-20 bg-[#111]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">Why Parents Choose BCH</span>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mt-2 mb-4">25 Years. 300+ Parents.<br />One Promise: Your Child's Safety.</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>Bharath Cycle Hub isn't an online store that ships a box. <span className="text-white font-medium">We sit with you and your child</span>, adjust the seat height, teach them braking, and make sure they're confident before they ride out.</p>
              <p><span className="text-white font-medium">6,500 sqft showroom. 300+ cycles on display. 8 full-time mechanics.</span> When something needs fixing — call us. Even at 10 PM on a Sunday. We've been here since 1999.</p>
              <p><span className="text-white font-medium">300+ parents chose BCH this year</span> for their child's e-cycle. Not because we're cheapest — we charge ₹2,000 more than online stores. Because when it's your child riding, you don't compromise on after-sales.</p>
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

// ─── S10: PRICING (Gift framing) ─────────────────────────────────
function PricingSection() {
  return (
    <Section className="py-16 sm:py-20 bg-[#0a0a0a]" id="pricing">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-10">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">The Best Gift You'll Ever Give</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Less Than ₹36/Day for Your Child's Freedom</h2>
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
              <div className="text-gray-400 text-xs">Over 5 years. Less than one auto ride.</div>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.03]">
              <div className="text-orange-400 text-2xl font-bold">₹999/mo EMI</div>
              <div className="text-gray-400 text-xs">Less than your child's monthly mobile recharge</div>
            </div>
          </div>

          {/* Compare: what parents spend */}
          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10 mb-6">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">What You're Already Spending on Your Child:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>PlayStation 5</span><span className="text-white font-medium">₹49,990</span></div>
              <div className="flex justify-between text-gray-400"><span>iPhone</span><span className="text-white font-medium">₹59,900+</span></div>
              <div className="flex justify-between text-gray-400"><span>Auto fares (1 year)</span><span className="text-white font-medium">₹30,000</span></div>
              <div className="flex justify-between text-gray-400"><span>Tuition + hobby classes</span><span className="text-white font-medium">₹60,000+</span></div>
              <div className="border-t border-white/10 my-2" />
              <div className="flex justify-between text-orange-400 font-bold"><span>EMotorad Viper E-Cycle</span><span>₹66,999</span></div>
              <p className="text-gray-500 text-xs mt-1">Gives them freedom, fitness, real friends, and 5+ years of daily use.</p>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {[
              'Free ISI-certified helmet + heavy-duty lock (₹2,500 value)',
              '2-year warranty on motor & battery',
              '8 full-time mechanics — we answer even at 10 PM',
              'EMI approved in 5 minutes — no paperwork hassle',
              'Speed lock at 25 km/h — built-in safety',
              'Free first service + seat height adjustment',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                <svg className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <a href={`tel:${PHONE}`} className="block w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-center transition-all text-sm">
              📞 Call {PHONE} — Book Free Test Ride
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center transition-all text-sm">
              💬 WhatsApp Us
            </a>
          </div>
          <p className="text-gray-500 text-xs text-center mt-4">Test ride is free. No obligation. Bring your child and let them decide.</p>
        </div>
      </div>
    </Section>
  );
}

// ─── S11: FAQ / OBJECTION HANDLER ─────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Is it safe for my 13-year-old?', a: 'Speed lock at 25 km/h — physically cannot go faster. Hydraulic disc brakes with 160mm rotor — stops in under 1 second. 420 Lux front light + rear light with horn. Dual suspension for pothole absorption. 300+ Bangalore mothers trusted BCH with their child\'s first e-cycle.' },
    { q: 'Will my child actually use it after 2 months?', a: 'E-cycles retain interest 300% longer than normal cycles because pedal-assist makes every ride fun, not tiring. Plus, BCH Riders Club organizes group rides — kids ride with friends, not alone. The 20% who ride daily are the happiest kids we know.' },
    { q: '₹67,000 is a lot for a "cycle"...', a: 'You\'ve already spent ₹50K on a PlayStation and ₹60K on a phone that keeps them indoors. The Viper costs ₹66,999 and gets them OUTSIDE for 5+ years. Auto fares alone cost ₹30K/year. The Viper pays for itself while giving your child freedom, fitness, and real friends.' },
    { q: 'What if something breaks? Who will fix it?', a: '8 full-time mechanics. 25 years in business. We\'re not an online store — we\'re in Yelahanka and we answer the phone at 10 PM. Free first service included. 2-year warranty on motor and battery. If anything goes wrong — bring it in, we fix it same day.' },
    { q: 'Can they ride it to school/tuition?', a: 'Absolutely. 85 km range on pedal assist. Most tuition centres are under 5 km. Your child can ride to tuition, friend\'s house, cricket ground, and back — all on one charge. Charge overnight like a phone.' },
    { q: 'What if my child is too short/tall?', a: 'Bring them in. We adjust the seat height, handlebar position, and brake lever reach to fit your child perfectly. Free adjustment, takes 10 minutes. The Viper fits riders from 5\'0" to 6\'2".' },
  ];

  return (
    <Section className="py-16 sm:py-20 bg-[#111]" id="faq">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-xs font-medium tracking-[0.15em] uppercase">ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ</span>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3">Every Parent Asks These Questions</h2>
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

// ─── S12: URGENCY CLOSE ──────────────────────────────────────────
function UrgencyClose() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src="/viper-frame-3.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {['🔒 25 km/h Speed Lock', '🛡️ 2-Year Warranty', '🔧 8 Mechanics', '🎁 Free Helmet + Lock', '💳 EMI ₹999/mo'].map((b) => (
            <span key={b} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full border border-white/10">{b}</span>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Only 5 Kids' Test Ride Slots Left This Week</h2>
          <p className="text-orange-400/80 text-base font-medium mb-2">ನಿಮ್ಮ ಮಗುವಿಗೆ ಸ್ವಾತಂತ್ರ್ಯ ಕೊಡಿ — ಇಂದೇ ಬುಕ್ ಮಾಡಿ.</p>
          <p className="text-gray-300 text-sm max-w-lg mx-auto">
            Bring your child to BCH Yelahanka. Supervised test ride. 5 minutes.
            If they don't love it — shake hands and leave. No pressure.
          </p>
        </div>

        <div className="max-w-sm mx-auto bg-white/[0.06] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-white text-lg font-bold mb-1 text-center">Book Your Child's Free Test Ride</h3>
          <p className="text-gray-400 text-xs text-center mb-5">100% Free. Supervised. Your number is safe.</p>
          <LeadForm source="final" buttonText="Book My Child's Test Ride — Free" />
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
          Bharath Cycle Hub, Yelahanka, Bangalore · Open 10 AM - 8 PM, All Days · Bring your child for a free supervised test ride
        </p>
      </div>
    </section>
  );
}

// ─── S13: STICKY FOOTER BAR (Mobile) ─────────────────────────────
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
export default function ViperKidsLandingPage() {
  return (
    <div className="bg-[#0a0a0a]">
      <AutoPopup />
      <HeroSection />
      <AuthorityBar />
      <PainSection />
      <TransformationSection />
      <SafetySection />
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
