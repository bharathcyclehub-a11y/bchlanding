import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

const PHONE = '8892031480';
const WA_LINK = `https://wa.me/91${PHONE}?text=Hi%2C%20I%27m%20interested%20in%20the%20EMotorad%20Viper%20for%20my%20child.%20Please%20share%20details.`;

// ─── Animation helpers ───────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: d, ease: [0.25, 0.46, 0.45, 0.94] } }),
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

function SectionLabel({ kannada, english }) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      {kannada && <span className="text-orange-500 text-xs font-medium tracking-[0.15em] uppercase block mb-1">{kannada}</span>}
      <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight">{english}</h2>
      <div className="w-14 h-1 bg-orange-500 mx-auto mt-4 rounded-full" />
    </div>
  );
}

function CTABlock({ text, variant = 'call' }) {
  return (
    <div className="text-center mt-10 sm:mt-14">
      {text && <p className="text-gray-600 text-sm mb-4">{text}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`tel:${PHONE}`} className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02]">
          📞 Call {PHONE}
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-green-600/20">
          💬 WhatsApp Us
        </a>
      </div>
    </div>
  );
}

// ─── Lead Form ───────────────────────────────────────────────────
function LeadForm({ variant = 'light', buttonText = 'Book Free Test Ride for My Child' }) {
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
      <div className="text-center py-6 px-4 rounded-xl bg-green-50 border border-green-200">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-green-700">We'll call you within 5 minutes!</p>
        <p className="text-sm mt-1 text-gray-500">Check WhatsApp for test ride details</p>
      </div>
    );
  }

  const isDark = variant === 'dark';
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" placeholder="Parent's Name" value={name} onChange={(e) => setName(e.target.value)} required
        className={`w-full px-4 py-3.5 rounded-xl text-sm transition-all ${isDark ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-orange-400' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'} focus:outline-none focus:ring-2 focus:ring-orange-500/20`} />
      <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="[0-9]{10}" maxLength={10}
        className={`w-full px-4 py-3.5 rounded-xl text-sm transition-all ${isDark ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-orange-400' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'} focus:outline-none focus:ring-2 focus:ring-orange-500/20`} />
      <button type="submit" className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/25 text-sm">
        {buttonText}
      </button>
      <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        No spam. We call within 5 minutes. Your child can test ride for free.
      </p>
    </form>
  );
}

// ─── S0: AUTO-POPUP ──────────────────────────────────────────────
function AutoPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return;
    const handler = (e) => { if (e.clientY <= 0) setShow(true); };
    document.addEventListener('mouseout', handler);
    return () => document.removeEventListener('mouseout', handler);
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => { setShow(false); setDismissed(true); }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-gray-100"
          onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setShow(false); setDismissed(true); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
          <div className="text-center mb-5">
            <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full mb-3">Only 5 Kids' Slots Left This Week</span>
            <h3 className="text-gray-900 text-xl font-bold mb-1">Let Your Child Test Ride Free</h3>
            <p className="text-gray-500 text-sm">Safe, supervised ride at BCH Yelahanka</p>
          </div>
          <LeadForm buttonText="Book My Child's Free Test Ride →" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 1: HERO — The emotional opening
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-gray-900">
      <motion.div className="absolute inset-0 bg-cover bg-center scale-110 opacity-30" style={{ backgroundImage: "url('/viper-kids-outdoor.jpg')", y: bgY }} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.2}>
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-medium tracking-wider uppercase mb-6">
              For Parents Who Want More for Their Child
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              This Is Not<br />
              <span className="text-orange-400">Just a Cycle.</span><br />
              <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-300 font-medium">
                {"It's Your Child's First Taste of Freedom."}
              </span>
            </h1>

            <p className="text-orange-400/90 text-lg font-medium mb-4">
              ನಿಮ್ಮ ಮಗುವಿಗೆ ಸ್ವಾತಂತ್ರ್ಯ ಕೊಡಿ.
            </p>

            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-lg">
              300+ Bangalore parents bought the EMotorad Viper for their teenagers this year.
              Not because it was trendy — because it got their kids off screens, out of the house,
              and back to being kids again.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {['🔒 Speed-locked at 25 km/h', '🛑 Stops in 1 second', '🛡️ 2-year warranty', '💰 ₹999/mo EMI'].map((t) => (
                <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/80 text-xs">{t}</span>
              ))}
            </div>

            <div className="flex gap-3 lg:hidden">
              <a href={`tel:${PHONE}`} className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl text-center text-sm">📞 Call Now</a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl text-center text-sm">💬 WhatsApp</a>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
            className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="text-white text-lg font-bold mb-1">Book a FREE Test Ride</h3>
            <p className="text-gray-400 text-sm mb-5">Bring your child. Supervised ride. 5 minutes. Zero pressure.</p>
            <LeadForm variant="dark" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm hidden lg:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase">Scroll to read the story</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </motion.div>
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2: THE PROBLEM — Screen addiction story
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProblemSection() {
  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ಇದು ನಿಮ್ಮ ಮನೆಯ ಕಥೆನಾ?" english="You Know This Scene." />

        {/* Full-width emotional image */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden mb-12 shadow-2xl">
          <img src="/viper-kids-screen.jpg" alt="Teenager glued to phone screen" className="w-full h-auto" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-snug max-w-2xl">
              6 hours of screen time. Zero outdoor activity.<br />
              <span className="text-orange-400">This is what "normal" looks like now.</span>
            </p>
          </div>
        </motion.div>

        {/* Pain grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '📱', title: 'Phone → Tablet → Laptop → TV', desc: 'The screen rotation never stops. You take one away, they pick up another. The cycle is unbreakable.' },
            { icon: '😤', title: 'Moody. Irritable. Always Tired.', desc: 'Poor sleep from blue light. Mood swings from dopamine crashes. Fights at home over screen limits.' },
            { icon: '🛋️', title: 'Zero Physical Activity', desc: "PE class once a week isn't exercise. Your child hasn't genuinely run, played, or been active in months." },
            { icon: '🚗', title: "You're Their Personal Uber", desc: "Tuition drop. Friend's house. Mall trip. Cricket ground. Your weekends are spent driving them around." },
            { icon: '👥', title: 'No Real Friends', desc: "Group chats and Instagram DMs aren't friendships. Your child hasn't made a real outdoor friend in over a year." },
            { icon: '🎓', title: 'Exam Stress, No Outlet', desc: '10th and 12th pressure is real. No sport, no hobby, no stress release. Just more screen time to cope.' },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-200 transition-all hover:shadow-md group">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{p.icon}</div>
              <h3 className="text-gray-900 font-bold text-base mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-800 text-lg font-medium">If you said <span className="text-orange-500 font-bold">YES</span> to even ONE of these — keep reading.</p>
        </div>
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3: THE TURNING POINT — Before/After transformation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TurningPointSection() {
  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ಬದಲಾವಣೆ ಸಾಧ್ಯ" english="What If This Could Be Your Child Instead?" />

        {/* Before/After side-by-side images */}
        <div className="grid md:grid-cols-2 gap-4 mb-14">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src="/viper-kids-screen.jpg" alt="Before - screen addiction" className="w-full h-72 sm:h-80 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-blue-900/40" />
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">BEFORE</div>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70">
              <p className="text-white font-bold text-lg">6 hours of screen time</p>
              <p className="text-gray-300 text-sm">Moody. Inactive. Isolated.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-lg">
            <img src="/viper-kids-outdoor.jpg" alt="After - riding outdoors" className="w-full h-72 sm:h-80 object-cover" loading="lazy" />
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">AFTER</div>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70">
              <p className="text-white font-bold text-lg">Riding every evening with friends</p>
              <p className="text-gray-300 text-sm">Happy. Active. Independent.</p>
            </div>
          </motion.div>
        </div>

        {/* Transformation list */}
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { before: 'Glued to phone all day', after: 'Riding with friends every evening', icon: '🚴' },
            { before: 'Moody, irritable, low energy', after: 'Happy, sleeping better, eating on time', icon: '😊' },
            { before: 'You drive them everywhere', after: 'They ride to tuition independently', icon: '🔓' },
            { before: 'No real friends, only online', after: 'Group rides every weekend', icon: '👥' },
            { before: 'Exam stress with no outlet', after: '30-min ride = complete reset', icon: '🧠' },
            { before: '₹30,000/year on auto fares', after: '₹350/month on charging', icon: '💰' },
          ].map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <span className="text-2xl shrink-0">{a.icon}</span>
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                <span className="text-red-400 text-sm line-through">{a.before}</span>
                <span className="text-gray-300 font-bold">→</span>
                <span className="text-green-600 text-sm font-semibold">{a.after}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <CTABlock text="300+ Bangalore parents saw this transformation." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: WHY ELECTRIC? — E-cycle beats everything else
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WhyElectricSection() {
  const comparisons = [
    { item: 'Normal Cycle', cons: ['Gets tiring fast — kids quit in 2 weeks', 'Hills and headwinds = torture', 'No lights, no safety features'], icon: '🚲' },
    { item: 'Auto/Uber', cons: ['₹30,000/year on fares', 'Surge pricing, cancelled rides', 'Zero independence for your child'], icon: '🛺' },
    { item: 'Scooter/Bike', cons: ['Illegal under 18', 'Dangerous — no speed limit', 'Insurance, fuel, license hassle'], icon: '🏍️' },
  ];

  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ಯಾಕೆ ಎಲೆಕ್ಟ್ರಿಕ್?" english="Why an Electric Cycle?" />

        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14">
          {"You've considered all the options. Here's why none of them work — and why an e-cycle is the answer."}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {comparisons.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-red-50/50 border border-red-100">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-gray-900 font-bold text-base mb-3">{c.item}</h3>
              <ul className="space-y-2">
                {c.cons.map((con, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-red-600">
                    <span className="mt-0.5">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* E-cycle wins */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
          <div className="text-center mb-6">
            <span className="text-3xl">⚡</span>
            <h3 className="text-gray-900 font-bold text-xl mt-2">EMotorad Viper E-Cycle</h3>
            <p className="text-green-700 text-sm font-medium">The answer to every problem above.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { text: 'Pedal-assist makes riding effortless — kids KEEP riding', icon: '✓' },
              { text: 'Speed-locked at 25 km/h — safer than a scooter', icon: '✓' },
              { text: '85 km range — tuition, friends, cricket, and back', icon: '✓' },
              { text: '₹350/month to charge — vs ₹30K/year on autos', icon: '✓' },
              { text: 'Legal for all ages — no license needed', icon: '✓' },
              { text: 'Exercise built in — pedal-assist is still pedaling', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">{item.icon}</span>
                <span className="text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <CTABlock text="Your child gets freedom. You get peace of mind." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 5: WHY VIPER? — Product deep-dive
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WhyViperSection() {
  const specs = [
    { label: 'Motor', value: '48V 250W Rear Hub', detail: 'Silent, powerful, hill-climbing' },
    { label: 'Battery', value: '48V 15.6Ah Samsung', detail: '85 km pedal-assist range' },
    { label: 'Brakes', value: 'Hydraulic Disc', detail: '160mm rotor, stops in 1 second' },
    { label: 'Gears', value: '7-Speed Shimano', detail: 'Smooth shifting for any terrain' },
    { label: 'Display', value: 'NFC-Enabled LCD', detail: 'Speed, battery, distance, mode' },
    { label: 'Lights', value: '420 Lux Front + Rear', detail: 'Visible from 200+ meters' },
    { label: 'Suspension', value: 'Dual (Front + Rear)', detail: 'Absorbs potholes and bumps' },
    { label: 'Speed Lock', value: '25 km/h Max', detail: 'Factory-locked, no override' },
  ];

  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ಯಾಕೆ ವೈಪರ್?" english="Why the EMotorad Viper?" />

        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14">
          Not all e-cycles are equal. The Viper was built for Indian roads, Indian weather, and Indian parents who worry about safety.
        </p>

        {/* Hero product image */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-14 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <img src="/viper-section-decoding.jpg" alt="EMotorad Viper - every component explained" className="w-full h-auto" loading="lazy" />
        </motion.div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {specs.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
              <div className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-gray-900 text-base font-bold mb-1">{s.value}</div>
              <div className="text-gray-400 text-xs">{s.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['/viper-bike.jpg', '/viper-frame-5.jpg', '/viper-frame-7.jpg', '/viper-frame-8.jpg'].map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden shadow-md aspect-[4/3]">
              <img src={src} alt="Viper detail" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        <CTABlock text="See it in person. One test ride is all it takes." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 6: SAFETY — Parents' #1 concern
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SafetySection() {
  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ನಿಮ್ಮ ಮಗುವಿನ ಸುರಕ್ಷತೆ ಮೊದಲು" english={"We Know Your #1 Fear: \"Is It Safe?\""} />

        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14">
          Every parent asks this question first. Here is why 300+ Bangalore mothers said yes.
        </p>

        {/* Brake image + safety features */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-xl">
            <img src="/viper-kids-safety-brakes.jpg" alt="Hydraulic disc brake close-up" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>

          <div className="space-y-5 flex flex-col justify-center">
            {[
              { icon: '🔒', title: 'Speed Lock: 25 km/h MAX', desc: 'Factory-locked by EMotorad. Physically cannot go faster. No hack, no override. Slower than a scooter in Bangalore traffic.' },
              { icon: '🛑', title: 'Hydraulic Disc Brakes', desc: '160mm rotor. Stops dead in under 1 second at full speed. Same braking tech as premium mountain bikes.' },
              { icon: '💡', title: '420 Lux Lights + Rear Horn', desc: 'Brighter than car low-beams. Rear light with integrated horn. Your child is visible from 200+ meters at dusk.' },
              { icon: '🛡️', title: 'Dual Suspension', desc: 'Front fork + rear shock absorbs every Bangalore pothole. No jarring impacts on your child.' },
              { icon: '🎁', title: 'Free Helmet + Lock Included', desc: 'ISI-certified helmet and heavy-duty lock worth ₹2,500 — included free with every Viper.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-4">
                <span className="text-2xl shrink-0 mt-1">{f.icon}</span>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm">{f.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-green-800 text-lg font-bold mb-2">The Safety Promise</p>
          <p className="text-green-700 text-sm max-w-xl mx-auto">
            Your child cannot go faster than 25 km/h. They can stop in 1 second. They are visible in the dark.
            They wear a free helmet. And 8 mechanics are a phone call away — even at 10 PM on Sunday.
          </p>
        </div>

        <CTABlock text="Still worried? Call us. We spend 30 minutes with every parent explaining safety." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 7: INDEPENDENCE — Tuition, friends, freedom
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function IndependenceSection() {
  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel english="The Gift of Independence" />

        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Tuition image */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-xl">
            <img src="/viper-kids-tuition.jpg" alt="Teen arriving at coaching centre on e-cycle" className="w-full h-80 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white font-bold text-lg">He rides to tuition alone now.</p>
              <p className="text-gray-300 text-sm">No more waiting for autos. No more begging you for a ride.</p>
            </div>
          </motion.div>

          {/* Parent proud image */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden shadow-xl">
            <img src="/viper-kids-parent-proud.jpg" alt="Proud parents watching child ride away" className="w-full h-80 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white font-bold text-lg">{"The proudest moment: watching them ride away."}</p>
              <p className="text-gray-300 text-sm">Independent. Confident. Growing up.</p>
            </div>
          </motion.div>
        </div>

        {/* Independence scenarios */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📚', title: 'Rides to Tuition', desc: 'No more auto fares. No more waiting. They leave on time, every time.' },
            { icon: '🏏', title: 'Cricket with Friends', desc: "Ground is 3 km away? No problem. They ride there and back." },
            { icon: '🛒', title: 'Runs Errands', desc: '"Amma, I\'ll get the milk." Words you never thought you\'d hear.' },
            { icon: '🌅', title: 'Evening Rides', desc: '30 minutes of cycling = gym session. Exercise built into their day.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm text-center">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h4 className="text-gray-900 font-bold text-sm mb-1">{s.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <CTABlock text="Give your child the independence they deserve." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 8: WHY BCH? — Store, trust, service
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function WhyBCHSection() {
  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ಯಾಕೆ ಭಾರತ್ ಸೈಕಲ್ ಹಬ್?" english="Why Buy From Bharath Cycle Hub?" />

        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14">
          {"You can buy a Viper online. But when it's your child riding it — you don't buy from a website. You buy from people you trust."}
        </p>

        {/* Showroom image - full width */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-2xl mb-14 border border-gray-200">
          <img src="/viper-kids-showroom.jpg" alt="BCH showroom - 6500 sqft, 300+ cycles" className="w-full h-auto" loading="lazy" />
        </motion.div>

        {/* Trust pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {[
            { icon: '🏪', title: '25 Years in Yelahanka', desc: "We opened when most of Bangalore was still villages. We've been here through 3 recessions, 2 floods, and 1 pandemic. We're not going anywhere.", stat: 'Since 1999' },
            { icon: '📏', title: 'We Fit the Bike to Your Child', desc: "We don't just sell. We sit with your child, adjust seat height, handlebar reach, brake lever position. We teach them braking. We make sure they're confident before they ride out.", stat: 'Free Fitting' },
            { icon: '🔧', title: '8 Full-Time Mechanics', desc: "Flat tyre at 9 PM? Motor acting up on Sunday? We answer the phone. We're not an online store that sends you to a FAQ page. We fix it.", stat: '7 Days a Week' },
            { icon: '📦', title: '6,500 Sqft Showroom', desc: '300+ cycles on display. Kids, electric, mountain, city, geared. Bring your child — let them sit on 5 different bikes before deciding.', stat: '300+ On Display' },
            { icon: '⭐', title: '4.7/5 Google Rating', desc: "2,122 reviews. Read them. Real parents, real names, real experiences. We don't delete bad reviews — we fix the problem.", stat: '2,122 Reviews' },
            { icon: '💰', title: 'We Charge ₹2,000 More', desc: "Yes, we're more expensive than online stores. Because the price includes fitting, training, first service, and a human who answers the phone at 10 PM. That's worth ₹2,000.", stat: 'Worth Every Rupee' },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">{p.stat}</span>
              </div>
              <h4 className="text-gray-900 font-bold text-base mb-2">{p.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Mechanic image */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-xl">
            <img src="/viper-kids-mechanic.jpg" alt="BCH mechanic servicing e-cycle with teen watching" className="w-full h-auto" loading="lazy" />
          </motion.div>
          <div>
            <h3 className="text-gray-900 text-2xl font-bold mb-4">{"When Something Goes Wrong — We're a Phone Call Away."}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {"Online stores ship a box. If something breaks, you're on your own — waiting for a replacement part that takes 2 weeks. At BCH, you bring the bike in. We diagnose it with professional tools. We fix it same-day. Your child rides home happy."}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="text-orange-500 text-2xl font-bold">8</div>
                <div className="text-gray-500 text-xs">Mechanics</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="text-orange-500 text-2xl font-bold">Same</div>
                <div className="text-gray-500 text-xs">Day Repair</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="text-orange-500 text-2xl font-bold">10 PM</div>
                <div className="text-gray-500 text-xs">We Answer</div>
              </div>
            </div>
          </div>
        </div>

        <CTABlock text="Visit us. See the showroom. Meet the team." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 9: PARENT STORIES — Real testimonials
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ParentStoriesSection() {
  const stories = [
    { name: 'Mother, Koramangala', text: "My son hasn't touched his phone in 2 weeks since we got the Viper. He rides to tuition and back — alone. He's eating dinner on time. Sleeping by 10 PM. Best ₹67K I ever spent as a parent.", highlight: "Hasn't touched his phone in 2 weeks" },
    { name: 'Father, Whitefield', text: "I was terrified about safety. Mr. Syed spent 30 minutes showing me the speed lock, the brakes, the lights. My daughter stops faster than I do on my Activa. She's been riding daily for 4 months now.", highlight: 'Stops faster than my Activa' },
    { name: 'Parent, Yelahanka', text: "Bought it as a 10th pass gift. My son now has 6 friends who ride together every evening. He's happier, more social, and actually helping around the house. The Viper changed our family dynamics.", highlight: '6 friends ride together daily' },
    { name: 'Mother, Hebbal', text: "I compared online prices — BCH is ₹2,000 more expensive. But they adjusted the seat, taught my daughter braking, and followed up after a week. When the tyre went flat at 8 PM, they picked up the phone. That's worth ₹2,000.", highlight: 'Worth every extra rupee' },
  ];

  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5">
        <SectionLabel kannada="ನಿಜವಾದ ಪೋಷಕರ ಕಥೆಗಳು" english="What Other Parents Are Saying" />

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {stories.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <span key={j} className="text-orange-400 text-sm">⭐</span>)}</div>
              <div className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                "{s.highlight}"
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{s.text}"</p>
              <p className="text-gray-400 text-xs font-medium">— {s.name}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
            <span className="text-orange-400 font-bold text-lg">⭐ 4.7/5</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 text-sm">2,122 Google Reviews</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 text-sm">300+ E-Cycles to Parents</span>
          </div>
        </div>

        <CTABlock text="Join 300+ Bangalore parents who made this choice." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 10: THE GIFT — Birthday/exam reward framing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GiftSection() {
  return (
    <Section className="py-20 sm:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-5">
        <SectionLabel english="The Best Gift You'll Ever Give Your Child" />

        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14">
          {"Birthday? 10th pass? Exam reward? Don't give them another screen. Give them the outdoors."}
        </p>

        {/* Comparison: What you already spend */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 mb-10">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-6 text-center">{"Things You've Already Bought That Keep Them Indoors:"}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { item: 'PlayStation 5', price: '₹49,990', icon: '🎮', effect: 'More screen time' },
              { item: 'iPhone', price: '₹59,900+', icon: '📱', effect: 'More screen time' },
              { item: 'iPad', price: '₹37,900', icon: '📱', effect: 'More screen time' },
              { item: 'Auto Fares/Year', price: '₹30,000', icon: '🛺', effect: 'Zero independence' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-white border border-gray-100 text-center opacity-60">
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="text-gray-800 font-bold text-sm">{c.item}</div>
                <div className="text-gray-500 text-lg font-bold">{c.price}</div>
                <div className="text-red-400 text-xs mt-1">{c.effect}</div>
              </motion.div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="mt-6 p-6 rounded-xl bg-orange-50 border-2 border-orange-300 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-gray-900 font-bold text-lg">EMotorad Viper E-Cycle</div>
              <div className="text-orange-500 text-3xl font-bold my-2">₹66,999</div>
              <div className="text-green-600 text-sm font-medium">Freedom + Fitness + Real Friends + 5 Years of Daily Use</div>
            </motion.div>
          </div>
        </div>

        {/* EMI breakdown */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-orange-50 text-center">
            <div className="text-orange-500 text-3xl font-bold">₹36</div>
            <div className="text-gray-600 text-sm">Per day over 5 years</div>
            <div className="text-gray-400 text-xs mt-1">Less than one auto ride</div>
          </div>
          <div className="p-5 rounded-xl bg-orange-50 text-center">
            <div className="text-orange-500 text-3xl font-bold">₹999</div>
            <div className="text-gray-600 text-sm">Per month EMI</div>
            <div className="text-gray-400 text-xs mt-1">Approved in 5 minutes</div>
          </div>
          <div className="p-5 rounded-xl bg-green-50 text-center">
            <div className="text-green-600 text-3xl font-bold">₹13,000</div>
            <div className="text-gray-600 text-sm">You save (MRP ₹79,999)</div>
            <div className="text-gray-400 text-xs mt-1">Limited time offer</div>
          </div>
        </div>

        <CTABlock />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 11: HOW IT WORKS — Simple 3 steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HowItWorksSection() {
  return (
    <Section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-4xl mx-auto px-5">
        <SectionLabel kannada="ಸರಳ 3 ಹಂತಗಳು" english="3 Simple Steps" />

        <div className="space-y-8 mb-12">
          {[
            { num: '01', title: 'Book a Free Test Ride', desc: "Call or WhatsApp. We confirm your slot in 5 minutes. Bring your child — it's a supervised ride.", icon: '📞', img: '/viper-frame-10.jpg' },
            { num: '02', title: 'Visit BCH With Your Child', desc: "We adjust the seat height. Teach them braking and controls. 5-minute supervised test ride. If they don't love it — shake hands and leave.", icon: '🚴', img: '/viper-frame-12.jpg' },
            { num: '03', title: 'Watch Them Light Up', desc: 'EMI from ₹999/month. Free helmet + lock + first service. Ride home the same day. Watch the phone disappear from their hands.', icon: '🎉', img: '/viper-gallery-1.jpg' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-center bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <img src={s.img} alt={s.title} className="w-full h-48 md:h-full object-cover" loading="lazy" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-orange-500 text-3xl font-bold">{s.num}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <CTABlock text="Start with Step 1. It takes 30 seconds." />
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 12: FAQ — Objection busters
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FAQSection() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'Is it safe for my 13-year-old?', a: "Speed lock at 25 km/h — physically cannot go faster. Hydraulic disc brakes stop in 1 second. 420 Lux lights make them visible at dusk. Dual suspension absorbs potholes. Free helmet included. 300+ Bangalore mothers trusted BCH with their child's first e-cycle." },
    { q: 'Will my child actually use it after 2 months?', a: "E-cycles retain interest 300% longer than normal cycles because pedal-assist makes every ride FUN, not exhausting. Plus BCH Riders Club organizes group rides — your child rides with friends, not alone. The social element is what keeps them going." },
    { q: '₹67,000 is a lot for a cycle...', a: "You've already spent ₹50K on a PlayStation and ₹60K on a phone that keeps them indoors. The Viper is ₹66,999 and gets them OUTSIDE for 5+ years. Auto fares alone cost ₹30K/year. The Viper pays for itself while giving your child freedom, fitness, and real friends." },
    { q: 'What if something breaks?', a: "8 full-time mechanics. 25 years in business. Free first service included. 2-year warranty on motor and battery. We're in Yelahanka — not an online store that disappears. When something goes wrong, bring it in. Same-day fix. We even answer the phone at 10 PM." },
    { q: 'Can they ride it to school/tuition?', a: '85 km range on pedal assist. Most tuition centres are under 5 km. Your child can ride to tuition, cricket ground, and back — all on one charge. Charge overnight like a phone.' },
    { q: 'What if my child is too short or tall?', a: "Bring them in. We adjust seat height, handlebar position, and brake lever reach to fit perfectly. Free adjustment, takes 10 minutes. The Viper fits riders from 5'0\" to 6'2\"." },
  ];

  return (
    <Section className="py-20 sm:py-28 bg-white" id="faq">
      <div className="max-w-3xl mx-auto px-5">
        <SectionLabel kannada="ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ" english="Every Parent Asks These Questions" />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all text-left">
                <span className="text-gray-900 text-sm font-semibold pr-4">{faq.q}</span>
                <span className="text-orange-500 text-xl font-bold shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-50">{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-5 py-4 text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                      <div className="mt-3">
                        <a href={`tel:${PHONE}`} className="text-orange-500 text-xs font-medium hover:underline">📞 Still have doubts? Call {PHONE}</a>
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 13: FINAL CTA — Urgency close
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src="/viper-frame-3.jpg" alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gray-900/85" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {['🔒 25 km/h Speed Lock', '🛡️ 2-Year Warranty', '🔧 8 Mechanics', '🎁 Free Helmet + Lock', '💳 ₹999/mo EMI', '⭐ 4.7/5 Rating'].map((b) => (
            <span key={b} className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full border border-white/10">{b}</span>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {"Your Child's First Ride Could Be This Weekend."}
          </h2>
          <p className="text-orange-400 text-lg font-medium mb-3">ನಿಮ್ಮ ಮಗುವಿಗೆ ಸ್ವಾತಂತ್ರ್ಯ ಕೊಡಿ — ಇಂದೇ ಬುಕ್ ಮಾಡಿ.</p>
          <p className="text-gray-300 text-base max-w-lg mx-auto">
            {"Bring your child to BCH Yelahanka. Supervised test ride. 5 minutes. If they don't love it — shake hands and leave. No pressure. No obligation."}
          </p>
        </div>

        <div className="max-w-sm mx-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8">
          <h3 className="text-white text-lg font-bold mb-1 text-center">{"Book Your Child's Free Test Ride"}</h3>
          <p className="text-gray-400 text-xs text-center mb-5">100% Free. Supervised. We call in 5 minutes.</p>
          <LeadForm variant="dark" buttonText="Book My Child's Test Ride — Free →" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <a href={`tel:${PHONE}`} className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-center transition-all text-sm shadow-lg">
            📞 Call {PHONE}
          </a>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-center transition-all text-sm shadow-lg">
            💬 WhatsApp Us
          </a>
        </div>

        <p className="text-gray-500 text-xs text-center mt-8">
          Bharath Cycle Hub, Yelahanka, Bangalore · Open 10 AM - 8 PM, All Days
        </p>
      </div>
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STICKY FOOTER (Mobile)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StickyFooter() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 p-2 sm:p-3 lg:hidden safe-bottom">
      <div className="flex gap-2 max-w-lg mx-auto">
        <a href={`tel:${PHONE}`} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl text-center text-sm shadow-md">📞 Call Now</a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl text-center text-sm shadow-md">💬 WhatsApp</a>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE — The Full Story
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function ViperKidsLandingPage() {
  return (
    <div className="bg-white">
      <AutoPopup />
      {/* Act 1: The Hook */}
      <HeroSection />
      {/* Act 2: The Problem */}
      <ProblemSection />
      {/* Act 3: The Transformation */}
      <TurningPointSection />
      {/* Act 4: Why This Solution? */}
      <WhyElectricSection />
      <WhyViperSection />
      <SafetySection />
      {/* Act 5: The Emotional Payoff */}
      <IndependenceSection />
      <WhyBCHSection />
      <ParentStoriesSection />
      {/* Act 6: The Decision */}
      <GiftSection />
      <HowItWorksSection />
      <FAQSection />
      {/* Act 7: The Close */}
      <FinalCTA />
      <StickyFooter />
    </div>
  );
}
