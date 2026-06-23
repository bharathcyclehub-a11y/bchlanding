import { useRef, useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { Bike, Moon, Unlock, Users, ArrowRight, MessageCircle, Phone, Lock, Disc3, Lightbulb, Waves, Gift, HardHat, Ruler, ShieldCheck, Wrench, Cog, Truck, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BATCH, BOOKINGS } from '../data/viper-bookings';

// ─── Brand constants ─────────────────────────────────────────────
const PHONE = '8892031480';
const DELIVERY_DATE = '31 July 2026';
const TOTAL_UNITS = 75;
const BONUS_CAP = 50;
// Price intentionally not shown — EMotorad pricing is being reconfirmed; the page
// takes a refundable ₹999 reservation only, with the final price confirmed before delivery.
const WA_LINK = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi, I'm interested in pre-booking the EMotorad Viper for my child. Please share details."
)}`;

// Top-performing channel video (EM Viper BCH) — vertical Short, 1.4M+ views.
// Used in the scroll-dock reveal below the hero.
const TOP_VIDEO_ID = 'nTYg3SuX0FU';
const TOP_VIDEO_VIEWS = '1.4M';

// Cinematic palette (no external theme dependency — page is self-contained)
// ink #0A0A0A · panel #111113 · gold #DC2626 · gold-lite #EF4444

// ─── Reserve flow context (avoids prop-drilling the CTA through 14 sections) ──
const ReserveContext = createContext(() => {});
const useReserve = () => useContext(ReserveContext);

// ─── Pre-booking stats hook (live counter + social-proof feed) ───
function usePreBookingStats() {
  const [stats, setStats] = useState({
    count: 0, target: TOTAL_UNITS, bonusCap: BONUS_CAP,
    remaining: TOTAL_UNITS, bonusRemaining: BONUS_CAP, recent: []
  });

  useEffect(() => {
    let alive = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/prebookings');
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data.success) setStats(data);
      } catch { /* keep last known values */ }
    };
    fetchStats();
    const id = setInterval(fetchStats, 45000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return stats;
}

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

// Thin scroll-progress bar pinned to the very top of the page.
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[100]" />;
}

// Image with a gentle scroll-parallax — drifts vertically inside its (overflow-hidden)
// frame as the section scrolls through the viewport, adding depth. Scaled up slightly
// so the drift never reveals an edge.
function ParallaxImage({ src, alt = '', className = '', amount = 24 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  return <motion.img ref={ref} src={src} alt={alt} style={{ y, scale: 1.22 }} className={className} loading="lazy" />;
}

function Kicker({ children }) {
  return (
    <span className="inline-block text-gray-300 text-xs font-medium tracking-[0.25em] uppercase mb-2 sm:mb-3">
      {children}
    </span>
  );
}

function SectionHeading({ kicker, title, sub, light = true }) {
  return (
    <div className="text-center mb-4 sm:mb-6 max-w-3xl mx-auto px-2">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className={`font-display tracking-wide uppercase text-2xl sm:text-3xl md:text-4xl leading-[1.05] ${light ? 'text-white' : 'text-white'}`}>{title}</h2>
      {sub && <p className={`mt-3 text-sm sm:text-lg leading-relaxed ${light ? 'text-gray-300' : 'text-gray-400'}`}>{sub}</p>}
      <div className="w-12 h-[3px] bg-primary mx-auto mt-4 rounded-full" />
    </div>
  );
}

// Primary "Reserve" CTA — used everywhere
function ReserveButton({ label = "Reserve My Child’s Viper — ₹999", className = '', sub, subClassName = 'text-gray-300' }) {
  const openReserve = useReserve();
  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <button
        onClick={openReserve}
        className="group relative max-w-full px-6 sm:px-9 py-3.5 sm:py-4 rounded-full bg-primary text-white font-bold text-sm sm:text-base tracking-wide whitespace-nowrap transition-all hover:scale-[1.03] hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/30"
      >
        {label}
        <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
      </button>
      {sub && <p className={`${subClassName} text-xs mt-3 font-medium`}>{sub}</p>}
    </div>
  );
}

function SecondaryCTAs() {
  return (
    <div className="flex gap-4 justify-center">
      <a href={`tel:+91${PHONE}`} aria-label="Call a Viper Specialist"
        className="w-12 h-12 rounded-full overflow-hidden shadow-lg hover:scale-105 transition-transform">
        <img src="/icon-call.png" alt="Call" className="w-full h-full object-cover" />
      </a>
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" aria-label="Ask on WhatsApp"
        className="w-12 h-12 rounded-full overflow-hidden shadow-lg hover:scale-105 transition-transform">
        <img src="/social-whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover" />
      </a>
    </div>
  );
}

// VV-B01 / VV-P01 — persistent sticky bottom buy bar (appears once past the hero).
function StickyBuyBar({ stats }) {
  const openReserve = useReserve();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      // Hide the floating bar once the footer scrolls into view so it never covers it.
      const footer = document.querySelector('footer');
      const footerInView = footer && footer.getBoundingClientRect().top < window.innerHeight - 40;
      setShow(pastHero && !footerInView);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  const { count, target, remaining } = stats;
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed inset-x-0 z-[70] px-4 pointer-events-none"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-md mx-auto pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#141416]/95 backdrop-blur-md border border-white/10 shadow-xl shadow-black/40 px-4 py-2.5 pr-16 sm:pr-4">
            <div className="leading-tight">
              <div className="text-white text-sm font-bold">₹999 to reserve</div>
              <div className="text-gray-400 text-[10px]">Fully refundable</div>
            </div>
            <button onClick={openReserve}
              className="shrink-0 ml-auto bg-primary text-white font-bold text-sm rounded-xl px-5 py-2.5 shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
              Reserve →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIVE BOOKING TICKER — honest social proof (real bookings only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function timeAgo(iso) {
  if (!iso) return 'just now';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(diffMs / 60000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

function LiveBookingTicker({ stats }) {
  const { recent } = stats;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show real bookings — never fabricate names.
    if (!recent || recent.length === 0) return;
    setVisible(true);
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % recent.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [recent]);

  if (!recent || recent.length === 0) return null;
  const b = recent[idx];

  return (
    <div className="fixed bottom-20 left-3 sm:bottom-6 sm:left-6 z-[80] pointer-events-none">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 bg-[#111113]/95 backdrop-blur-md border border-white/12 rounded-full pl-2 pr-4 py-2 shadow-xl shadow-black/40 max-w-[78vw]"
          >
            <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><Bike className="w-4 h-4 text-white" /></span>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {b.name}{b.area ? ` · ${b.area}` : ''}
              </p>
              <p className="text-gray-400 text-[10px]">Reserved a Viper · {timeAgo(b.ts)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERO — cinematic arrival
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function HeroSection() {
  const openReserve = useReserve();
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Full-bleed cinematic hero video (muted autoplay loop) — 720p on phones, 1080p on desktop. */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-center"
        poster="/viper-hero-poster.webp"
        autoPlay muted loop playsInline preload="metadata"
        aria-hidden="true"
      >
        <source media="(max-width:768px)" src="/viper-hero-720.webm?v=25s" type="video/webm" />
        <source media="(max-width:768px)" src="/viper-hero-720.mp4?v=25s" type="video/mp4" />
        <source media="(min-width:769px)" src="/viper-hero.webm?v=25s" type="video/webm" />
        <source src="/viper-hero.mp4?v=25s" type="video/mp4" />
      </video>
      {/* DESKTOP scrim: darken the right side where the tagline + CTA sit */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/75" />
      {/* MOBILE scrim: darken top (tagline) + bottom (CTA), keep the middle of the video clear */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/90" />

      {/* Overlay: tagline pinned to the TOP, CTA pinned to the BOTTOM on mobile; grouped on the right on desktop */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-8 flex-1 flex flex-col justify-between pt-24 pb-10 lg:justify-between lg:pt-32 lg:pb-20">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.25}
          className="text-center lg:text-right lg:ml-auto">
          <h1 className="font-display tracking-wide uppercase whitespace-nowrap text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[0.95] [text-shadow:0_2px_28px_rgba(0,0,0,0.8)]">
            Born to <span className="text-primary">Ride.</span>
          </h1>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="flex lg:justify-end">
          <button onClick={openReserve}
            className="group w-full sm:w-auto bg-primary text-white font-bold text-[15px] sm:text-base lg:text-xl rounded-full px-5 sm:px-9 py-3.5 sm:py-4 lg:px-12 lg:py-5 hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap">
            Pay ₹999 &amp; Book Now
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Most-watched Short embed — used by the Manifesto dock-scroll video.
const VIDEO_EMBED = `https://www.youtube.com/embed/${TOP_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${TOP_VIDEO_ID}&controls=1&rel=0&playsinline=1&modestbranding=1`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MANIFESTO — "What is the Viper?", with our most-watched Short on the right.
// The video starts inline in the right column, then on scroll smoothly shrinks
// and glides into the bottom-right corner (one fixed iframe, scroll-linked —
// no pop-up window). It hides once you scroll past #video-dock-end.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ManifestoSection() {
  const slotRef = useRef(null);   // inline placeholder (reserves the right-column space)
  const videoRef = useRef(null);  // the single fixed player that morphs to the corner
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const slot = slotRef.current;
      const vid = videoRef.current;
      if (!slot || !vid) return;
      const s = slot.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Docked target: a small player tucked into the bottom-right corner. Keep it compact on phones
      // (a portrait clip is tall) and pin it low so it never sits over the middle of a section.
      const dockW = vw < 1024 ? Math.min(88, vw * 0.22) : 132;
      const dockH = dockW * (16 / 9);
      const cornerLeft = vw - 12 - dockW;
      const cornerTop = vh - 72 - dockH;

      // Progress 0→1 as the inline slot scrolls from just under the nav up and away.
      const startY = 120;
      const endY = -s.height * 0.45;
      let p = (startY - s.top) / (startY - endY);
      p = Math.max(0, Math.min(1, p));
      const e = p * p * (3 - 2 * p); // smoothstep

      // Lerp the fixed player from exactly overlaying its slot → docked corner.
      vid.style.left = (s.left + (cornerLeft - s.left) * e) + 'px';
      vid.style.top = (s.top + (cornerTop - s.top) * e) + 'px';
      vid.style.width = (s.width + (dockW - s.width) * e) + 'px';
      vid.style.height = (s.height + (dockH - s.height) * e) + 'px';
      vid.style.borderRadius = (24 - 12 * e) + 'px';
      // Stays docked and playing — never auto-hides.
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <>
      <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-12 gap-4 sm:gap-8 lg:gap-12 items-center">
          {/* TEXT — left (always beside the video, never stacked) */}
          <div className="col-span-7 lg:col-span-6">
            <Kicker>What Is The Viper?</Kicker>
            <h2 className="font-display tracking-wide uppercase text-xl sm:text-3xl md:text-4xl text-white leading-[1.02] mb-3 sm:mb-4">
              Some <span className="text-primary">products</span> are bought.<br />
              The <span className="text-primary">Viper</span> is remembered.
            </h2>
            <p className="text-gray-300 text-sm sm:text-lg leading-relaxed">
              Not a cycle — it’s who your child becomes the day it arrives.
            </p>
          </div>

          {/* VIDEO SLOT — right. Reserves the space; the fixed player below overlays it. */}
          <div className="col-span-5 lg:col-span-6 flex justify-end">
            <div ref={slotRef} className="w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[360px] aspect-[9/16]" />
          </div>
        </div>
      </Section>

      {/* The single fixed player — scroll-linked from the inline slot to the corner */}
      <div
        ref={videoRef}
        style={{ position: 'fixed', left: -9999, top: -9999, width: 280, height: 498, zIndex: 40, visibility: hidden ? 'hidden' : 'visible' }}
        className="overflow-hidden bg-black shadow-2xl shadow-black/40 ring-1 ring-black/10"
      >
        <iframe
          src={VIDEO_EMBED}
          title="EMotorad Viper — our most-watched ride"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE MACHINE — specs as desire
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MachineSection() {
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-4 sm:mb-8 max-w-3xl mx-auto">
          <Kicker>The Machine</Kicker>
          <h2 className="font-display tracking-wide uppercase text-xl sm:text-3xl lg:text-4xl text-white leading-[1.05]">Engineered Without Compromise</h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300">Built for Indian roads, weather, and parents who refuse to compromise on safety.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-10 items-stretch">
          {/* The whole spec sheet, in one labelled picture — left */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-sm border border-white/10 bg-white/[0.04] flex items-center justify-center p-2 sm:p-5">
            <img src="/viper-decoding.webp" alt="Decoding the Viper — frame, battery, Cluster C9 NFC display, lights, suspension, Shimano 7-speed gears" className="w-full h-auto max-h-[420px] object-contain" loading="lazy" />
          </motion.div>

          {/* Scannable spec table beside the image (VV-X07 / VV-W08) */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm overflow-hidden">
            {[
              { k: 'Motor', v: '48V 250W hub', b: 'Effortless on every Bangalore hill' },
              { k: 'Range', v: 'Up to 85 km', b: 'School, tuition & cricket on one charge' },
              { k: 'Charge', v: 'Overnight, any wall socket', b: 'Plug in like a phone' },
              { k: 'Brakes', v: 'Hydraulic disc', b: 'Stops in about a second, even in rain' },
              { k: 'Gears', v: 'Shimano 7-speed', b: 'Smooth on flats and climbs' },
              { k: 'Top speed', v: 'Sealed at 25 km/h', b: 'Road-legal — can’t go faster' },
              { k: 'Suspension', v: 'Front + rear', b: 'Soaks up the potholes' },
              { k: 'Display', v: 'Cluster C9 · NFC', b: 'Tap-to-wake dashboard, own key' },
              { k: 'Fits', v: 'Riders ~5′0″–6′2″', b: 'Adjusted free to your child' },
              { k: 'Weight', v: '41.2 kg', b: 'Planted and stable' },
            ].map((s, i) => (
              <div key={i} className="px-2.5 sm:px-5 py-1.5 sm:py-2.5 border-b border-white/10 last:border-b-0 flex items-baseline gap-2 sm:gap-3">
                <span className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] w-12 sm:w-[4.5rem] shrink-0">{s.k}</span>
                <div className="min-w-0">
                  <span className="text-white text-[11px] sm:text-sm font-semibold">{s.v}</span>
                  <span className="hidden sm:inline text-gray-400 text-xs"> — {s.b}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE PRODUCT — the real EMotorad Viper (official shots + specs, no price)
// Images & specs scraped from emotorad.com/bikes/viper (Stealth Black).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProductSection() {
  const stats = [
    { v: '85 km', k: 'Range · PAS' },
    { v: '25 km/h', k: 'Top speed' },
    { v: '48V 250W', k: 'Hub motor' },
    { v: '15.6 Ah', k: 'Battery' },
    { v: '7-speed', k: 'Shimano' },
    { v: 'Lifetime', k: 'Frame warranty' },
  ];
  const openReserve = useReserve();
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-3 sm:mb-5 max-w-3xl mx-auto">
          <Kicker>The Machine</Kicker>
          <h2 className="font-display tracking-wide uppercase text-xl sm:text-3xl lg:text-4xl text-white leading-[1.05]">Meet the <span className="text-primary">EMotorad Viper</span></h2>
        </div>

        {/* Hero shot + spec panel */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 shadow-sm p-2 sm:p-5">
            <img src="/viper-product-1.webp" alt="EMotorad Viper electric cycle — official product photo" className="w-full h-auto object-contain max-h-[180px] sm:max-h-[300px] mx-auto" loading="lazy" />
          </motion.div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400 text-sm tracking-tight">★★★★★</span>
              <span className="text-gray-300 text-sm font-medium">4.7 · loved by 300+ Bangalore families</span>
            </div>

            {/* Colour options */}
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-[0.15em]">Colour</span>
              <span className="flex items-center gap-1.5 text-xs text-white font-semibold"><span className="w-4 h-4 rounded-full bg-[#1b1b1d] ring-1 ring-white/20" /> Stealth Black</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-4 h-4 rounded-full bg-[#2c4a78] ring-1 ring-white/20" /> Apex Blue</span>
            </div>

            {/* Spec stat grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {stats.map((s, i) => (
                <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 shadow-sm px-1 py-2 text-center">
                  <div className="text-white text-sm sm:text-base font-bold leading-none">{s.v}</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs mt-0.5">{s.k}</div>
                </div>
              ))}
            </div>

            <ReserveButton label="Reserve My Child’s Viper — ₹999" sub="₹999 today · fully refundable · price confirmed before delivery" />
            <button onClick={openReserve} className="mt-3 w-full text-center text-xs text-gray-400 hover:text-primary underline underline-offset-4 transition-colors">
              See full specs &amp; gallery →
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFETY — the parent's #1 fear
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SafetySection() {
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-5 gap-4 sm:gap-8 lg:gap-12 items-center">
        {/* DESCRIPTION — left */}
        <div className="col-span-2 order-1">
          <Kicker>Your #1 Question</Kicker>
          <h2 className="font-display tracking-wide uppercase text-lg sm:text-3xl lg:text-4xl text-white leading-[1.05]">“But Is It Safe?”</h2>
          <p className="mt-2 sm:mt-4 text-white text-sm sm:text-xl font-semibold leading-snug">
            Engineered so you never have to wonder.
          </p>
          <p className="hidden sm:block mt-2 sm:mt-3 text-gray-300 text-xs sm:text-base leading-relaxed">
            Speed that can’t be unlocked. Brakes that stop on a coin. Lights built for
            the dark — and every Viper hand-checked before it reaches your child.
          </p>
          <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            {['Speed-locked at 25 km/h — it physically can’t go faster', 'Hydraulic disc brakes — stop in about a second', 'Free ISI helmet + 420-lux lights with every Viper'].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" strokeWidth={3} /></span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 sm:mt-5 text-gray-400 text-xs">Trusted by 300+ Bangalore families.</p>
        </div>

        {/* IMAGE — right (larger share so the labels stay readable) */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="col-span-3 order-2 rounded-2xl overflow-hidden bg-white/[0.04] shadow-sm border border-white/10 p-2 sm:p-5">
          <img src="/viper-safety-decoded.webp" alt="Safety, decoded — speed-locked at 25 km/h, hydraulic disc brakes, 420-lux front and rear lights, dual suspension, and a free ISI helmet plus lock with every Viper" className="w-full h-auto rounded-lg" loading="lazy" />
        </motion.div>
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORY SCROLL — full-screen sticky-stacking cinematic slides. Each panel pins
// while the next scrolls up over it. Real photos, one line each (image-led).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StoryScrollSection() {
  const slides = [
    { img: '/viper-kids-outdoor.webp', kicker: 'Three Weeks From Now', alt: 'Off the screen. Into the evening sun.', title: <>Off the screen.<br />Into the <span className="text-primary">evening sun.</span></>, sub: 'Pedal-assist turns the long way home into the whole point of going out.' },
    { img: '/viper-kids-group.webp', alt: 'A whole pack — every single evening.', title: <>A <span className="text-primary">whole pack</span> —<br />every single <span className="text-primary">evening.</span></>, sub: 'Real friends. Real weekends. Not a screen in sight.', cta: true },
  ];
  return (
    <section className="relative">
      {slides.map((s, i) => (
        <div key={i} className={`sticky top-0 h-[100svh] overflow-hidden ${i > 0 ? 'rounded-t-[2.5rem] shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.65)]' : ''}`}>
          <img src={s.img} alt={s.alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <div className="relative h-full flex flex-col items-center text-center px-6 py-20 sm:py-24 [text-shadow:0_2px_20px_rgba(0,0,0,0.85)]">
            {/* Heading pinned to the top */}
            <div className="flex flex-col items-center">
              {s.kicker && <span className="text-gray-300 text-xs font-semibold tracking-[0.28em] uppercase mb-4">{s.kicker}</span>}
              <h2 className="font-display tracking-wide uppercase text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.0] whitespace-pre-line">{s.title}</h2>
            </div>
            {/* Sub-line + CTA pushed to the bottom */}
            <div className="mt-auto flex flex-col items-center">
              <p className="text-gray-200 text-base sm:text-lg max-w-xl">{s.sub}</p>
              {s.cta && <div className="mt-6"><ReserveButton label="Reserve 1 of 75 — ₹999" /></div>}
            </div>
            {!s.cta && <span className="absolute bottom-8 text-white/70 text-[11px] tracking-[0.3em] uppercase animate-bounce">Scroll ↓</span>}
          </div>
        </div>
      ))}
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIMITED BATCH — real scarcity, hidden price (unlock by reserve/call),
// live bookings proof. No "Founders"/"numbered" claims (we're the retailer).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LimitedBatchSection() {
  const openReserve = useReserve();
  const booked = BATCH.bookedCount;
  const total = BATCH.total;
  const left = Math.max(0, total - booked);
  const pct = Math.min(100, Math.round((booked / total) * 100));
  const accessoryLeft = Math.max(0, BATCH.accessoryCap - booked);
  return (
    <Section className="py-5 sm:py-8 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-5">
        {/* Heading + narrative */}
        <div className="text-center mb-4">
          <Kicker>Limited Release</Kicker>
          <h2 className="font-display tracking-wide uppercase text-xl sm:text-3xl lg:text-4xl text-white leading-[1.05]">
            <span className="text-primary">{BATCH.label}</span> Is Open — <span className="text-primary">75</span> Bikes. That’s It.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
            Batch 1 sold out in <span className="text-white font-semibold">3 days</span>. The next batch is about{' '}
            <span className="text-white font-semibold">{BATCH.nextBatchMonths} months</span> away — this is the only way to get a Viper before then.
          </p>
        </div>

        {/* Merged PDP card — boy-on-Viper image with the price-unlock panel overlaid on its dark side */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-4 min-h-[380px] sm:min-h-[380px] flex items-end lg:items-center">
          <img src="/viper-hero-kid-dark.webp" alt="A young rider in full gear on the EMotorad Viper" className="absolute inset-0 w-full h-full object-cover object-[28%_top] lg:object-[18%_top]" loading="lazy" />
          {/* Mobile: fade up from the bottom so the rider fills the top half. Desktop: fade across to the right panel. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/5 lg:bg-gradient-to-r lg:from-black/10 lg:via-black/45 lg:to-black/90" />
          <div className="relative z-10 w-full lg:w-[54%] lg:ml-auto p-5 sm:p-6 flex flex-col justify-end lg:justify-center text-center lg:text-left">
            <p className="text-gray-300 text-[11px] font-bold tracking-[0.22em] uppercase">How Much Is It?</p>
            <div className="flex items-center justify-center lg:justify-start gap-3 my-2">
              <span className="text-amber-400 text-3xl sm:text-4xl tracking-[0.25em] leading-none [text-shadow:0_2px_12px_rgba(0,0,0,0.85)]">★★★★★★</span>
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
            </div>
            <p className="text-gray-200 text-xs sm:text-sm mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
              Reserve with <span className="text-white font-semibold">₹999 (fully refundable)</span> or just call — we’ll tell you the price right away.
            </p>
            <div className="flex flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
              <button onClick={openReserve}
                className="flex-1 lg:flex-none px-4 sm:px-7 py-3.5 rounded-full bg-primary text-white font-bold text-[13px] sm:text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                Reserve ₹999<span className="hidden sm:inline"> to unlock</span> <span>→</span>
              </button>
              <a href={`tel:+91${PHONE}`}
                className="flex-1 lg:flex-none px-4 sm:px-7 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[13px] sm:text-sm hover:bg-white/20 transition-all inline-flex items-center justify-center gap-1.5 backdrop-blur-sm whitespace-nowrap">
                <Phone className="w-4 h-4 shrink-0" /> Call<span className="sm:hidden"> us</span><span className="hidden sm:inline"> to hear the price</span>
              </a>
            </div>
          </div>
        </div>

        {/* Progress + first-50 accessory urgency */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline text-sm mb-2">
            <span className="text-white font-semibold">{booked} of {total} booked</span>
            <span className="text-primary font-semibold">{left} left in this batch</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.max(6, pct)}%` }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-full" />
          </div>
          {accessoryLeft > 0 && (
            <p className="text-gray-400 text-xs mt-2.5">
              <span className="text-amber-400">★</span> First {BATCH.accessoryCap} bookings get <span className="text-white font-semibold">3 surprise accessories</span> free — only {accessoryLeft} bonus spots left.
            </p>
          )}
        </div>

        {/* Already booked — side-scrolling rail of names (auto-marquee) */}
        <div>
          <p className="text-center text-sm text-gray-300 mb-3">
            <span className="text-white font-semibold">{booked} families</span> have already booked {BATCH.label}
          </p>
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]">
            <div className="flex gap-3 w-max animate-marquee hover:[animation-play-state:paused]">
              {[...BOOKINGS, ...BOOKINGS].map((b, i) => (
                <div key={i} className="shrink-0 flex items-center gap-2.5 rounded-full bg-white/[0.05] border border-white/10 pl-2 pr-4 py-2">
                  <img src="/avatar-boy.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="leading-tight">
                    <p className="text-white text-sm font-semibold whitespace-nowrap">{b.name}</p>
                    <p className="text-gray-400 text-[11px] whitespace-nowrap">{b.area}</p>
                  </div>
                  <Check className="w-4 h-4 text-green-500 shrink-0" strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <ReserveButton label="Reserve My Child’s Viper — ₹999" sub="₹999 today · fully refundable · price confirmed before delivery" />
        </div>
      </div>
    </Section>
  );
}

// VV — real Instagram reels from @emviper_bch, side-scroll rail.
// Only the TWO most-visible reels play at once; the rest stay paused.
function ReelsSection() {
  const reels = Array.from({ length: 9 }, (_, i) => ({ src: `/viper-reel-${i + 1}.mp4`, poster: `/viper-reel-${i + 1}.webp` }));
  const vidRefs = useRef([]);
  const railRef = useRef(null);
  const pausedUntil = useRef(0);

  // Infinite, still hand-scrollable: gently auto-advance and wrap seamlessly at the halfway point.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let raf;
    const tick = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (Date.now() > pausedUntil.current) el.scrollLeft += 0.6;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft < 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const pause = () => { pausedUntil.current = Date.now() + 2500; };
    el.addEventListener('pointerdown', pause);
    el.addEventListener('wheel', pause, { passive: true });
    el.addEventListener('touchmove', pause, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('wheel', pause);
      el.removeEventListener('touchmove', pause);
    };
  }, []);

  useEffect(() => {
    const ratios = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const idx = Number(e.target.dataset.idx);
        if (e.isIntersecting && e.intersectionRatio > 0.4) ratios.set(idx, e.intersectionRatio);
        else ratios.delete(idx);
      });
      const top2 = [...ratios.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
      vidRefs.current.forEach((v, i) => {
        if (!v) return;
        if (top2.includes(i)) v.play().catch(() => {});
        else v.pause();
      });
    }, { threshold: [0, 0.4, 0.6, 0.9] });
    vidRefs.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center mb-6">
        <span className="inline-flex items-center gap-2 mb-2 sm:mb-3">
          <img src="/social-instagram.png" alt="Instagram" className="w-5 h-5 object-contain" />
          <span className="text-gray-300 text-xs font-medium tracking-[0.25em] uppercase">On Instagram</span>
        </span>
        <h2 className="font-display tracking-wide uppercase text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.05]"><span className="text-primary">Real Kids.</span> Real Rides.</h2>
        <p className="mt-2 text-sm text-gray-300">Every reel is a real Viper from our floor — follow <a href="https://www.instagram.com/emviper_bch" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">@emviper_bch</a>.</p>
      </div>
      {/* Infinite, hand-scrollable rail — auto-advances and wraps round either way */}
      <div ref={railRef} className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {[...reels, ...reels].map((r, i) => (
          <div key={i} className="shrink-0 mr-3 sm:mr-4 w-[130px] sm:w-[155px] aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-sm border border-white/10">
            <video ref={(el) => (vidRefs.current[i] = el)} data-idx={i} poster={r.poster} muted loop playsInline preload="none" className="w-full h-full object-cover">
              <source src={r.src} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARENT STORIES (no price references)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function StoriesSection() {
  const railRef = useRef(null);
  const nudge = (dir) => railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  // Real owners (photo) + their review, merged into one card.
  const stories = [
    { name: 'Suresh M', area: 'Koramangala', photo: '/viper-owner-1.webp', text: 'My son hasn’t touched his phone in two weeks. He rides to tuition and back on his own. Best decision I’ve made as a parent.' },
    { name: 'Arjun R', area: 'Whitefield', photo: '/viper-owner-2.webp', text: 'I was terrified about safety. The team spent 30 minutes on the speed lock, brakes and lights. My son stops faster than I do on my Activa.' },
    { name: 'Deepak N', area: 'HSR Layout', photo: '/viper-owner-3.webp', text: 'Was worried he’d stop using it after a week. Six months later he still rides to school every day. The doorstep service is a lifesaver.' },
    { name: 'Praveen S', area: 'Indiranagar', photo: '/viper-owner-4.webp', text: 'Solid frame, real hydraulic brakes, proper suspension. Far more premium than I expected. My son shows it off to every friend.' },
    { name: 'Lokesh V', area: 'Jayanagar', photo: '/viper-owner-5.webp', text: 'Both my kids are outside every evening with the neighbourhood group now. No more screens, no more arguments.' },
    { name: 'Rahul K', area: 'Hebbal', photo: '/viper-owner-6.webp', text: 'Had a small display issue. One call, fixed the same day at their Yelahanka workshop. The after-sales is the best part.' },
    { name: 'Vinod P', area: 'Yelahanka', photo: '/viper-owner-7.webp', text: 'Bought it for my 13-year-old’s birthday. The moment he tried it, his face lit up. Now every kid in our society wants one.' },
    { name: 'Imran S', area: 'Banashankari', photo: '/viper-owner-8.webp', text: 'The pedal assist makes the hills easy. My son reaches class fresh, not tired. Charging it is just like a phone.' },
    { name: 'Karthik R', area: 'Marathahalli', photo: '/viper-owner-9.webp', text: 'Build quality genuinely surprised me — it feels like a proper machine, not a kids’ toy. Worth every rupee.' },
    { name: 'Manoj T', area: 'BTM Layout', photo: '/viper-owner-10.webp', text: 'Booked on a Sunday, fitted and trained the same week. The team treats you like family. Highly recommend.' },
  ];
  // Infinite, seamless auto-scroll — render the list twice and wrap at the halfway point.
  // Pauses while the user is touching/hovering so they can read.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    rail.addEventListener('pointerdown', pause);
    rail.addEventListener('pointerup', resume);
    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('mouseleave', resume);
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resume, { passive: true });
    const step = () => {
      if (!paused) {
        rail.scrollLeft += 0.5;
        const half = rail.scrollWidth / 2;
        if (rail.scrollLeft >= half) rail.scrollLeft -= half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      rail.removeEventListener('pointerdown', pause);
      rail.removeEventListener('pointerup', resume);
      rail.removeEventListener('mouseenter', pause);
      rail.removeEventListener('mouseleave', resume);
      rail.removeEventListener('touchstart', pause);
      rail.removeEventListener('touchend', resume);
    };
  }, []);
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
      {/* Header — left aligned with nav arrows */}
      <div className="px-5 sm:px-8 flex items-end justify-between gap-4 mb-5 sm:mb-7">
        <div>
          <Kicker>Real Parents</Kicker>
          <h2 className="font-display tracking-wide uppercase text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.04]">The <span className="text-primary">Families</span> Who Said Yes First</h2>
          <p className="mt-2 text-sm text-gray-300"><span className="text-amber-400">★</span> 4.7 from 300+ happy Bangalore families</p>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0 pb-1">
          <button onClick={() => nudge(-1)} aria-label="Previous reviews" className="w-11 h-11 rounded-full border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-white/30 flex items-center justify-center shadow-sm transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => nudge(1)} aria-label="Next reviews" className="w-11 h-11 rounded-full border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-white/30 flex items-center justify-center shadow-sm transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Infinite side-scroll rail of photo + review cards (list rendered twice for a seamless loop) */}
      <div ref={railRef} className="flex gap-3 sm:gap-4 overflow-x-auto px-5 sm:px-8 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {[...stories, ...stories].map((s, i) => (
          <article key={i} className="shrink-0 w-[210px] sm:w-[240px] relative rounded-2xl overflow-hidden shadow-md bg-gray-900">
            <img src={s.photo} alt={`${s.name} with their EMotorad Viper at Bharath Cycle Hub`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/5" />
            <div className="relative z-10 flex flex-col justify-end h-[300px] sm:h-[340px] p-3.5">
              <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}</div>
              <p className="text-white/95 text-[12.5px] leading-snug mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">“{s.text}”</p>
              <div className="flex items-center gap-2.5 border-t border-white/15 pt-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-[11px] flex items-center justify-center shrink-0">{s.name[0]}</span>
                <div className="min-w-0 leading-tight">
                  <p className="text-white text-sm font-bold truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-300">Parent · {s.area}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOCIAL PROOF — the Viper's own YouTube + Instagram (@emviper_bch)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SocialProofSection() {
  const channels = [
    {
      count: '18.4K', label: 'YouTube Subscribers', sub: 'EM Viper BCH · 15 videos',
      link: 'https://www.youtube.com/@emviper_bch',
      img: '/social-youtube.png',
    },
    {
      count: '23.2K', label: 'Instagram Followers', sub: 'Premium e-cycle lifestyle',
      link: 'https://www.instagram.com/emviper_bch',
      img: '/social-instagram.png',
    },
  ];
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <Kicker>Find Us Online</Kicker>
        <h2 className="font-display tracking-wide uppercase text-xl sm:text-3xl lg:text-4xl text-white leading-[1.05]">
          <span className="text-primary">40,000+</span> Already Follow <span className="text-primary">the Viper</span>
        </h2>
        <p className="mt-2 text-gray-400 text-sm max-w-xl mx-auto">
          Real rides, honest reviews and the latest Viper builds.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-5 mt-5 max-w-2xl mx-auto">
          {channels.map((c, i) => (
            <a key={i} href={c.link} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all text-left">
              <img src={c.img} alt={c.label} className="w-10 h-10 shrink-0 object-contain" />
              <div className="min-w-0">
                <div className="text-primary text-xl sm:text-3xl font-bold leading-none">{c.count}</div>
                <div className="text-white text-sm font-bold mt-1">{c.label}</div>
                <div className="text-gray-400 text-xs mt-0.5 truncate">{c.sub}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary ml-auto shrink-0 transition-colors" strokeWidth={2} />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OBJECTIONS — one answer per worry (price-free)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ObjectionsSection() {
  const [open, setOpen] = useState(null); // all answers collapsed by default
  const [showAll, setShowAll] = useState(false); // show only 2 questions until expanded
  // NOTE: ready to expand — drop more {q,a} objections in here as you send the list.
  const objections = [
    { q: 'Why a ₹999 reservation?', a: `This batch is just 75 bikes, prepared and fitted in the order they’re reserved. ₹999 holds your spot — fully refundable any time before delivery, or adjusted against the balance. Nothing else is charged today.` },
    { q: 'How much is it, and when do I pay?', a: `Today you pay only the ₹999 reservation. We’re finalising the latest pricing with EMotorad right now — your batch price is locked the moment you reserve and confirmed in writing before delivery, with the free kit, professional fitting and Bicycle Care for life included. ₹999 is fully refundable if you change your mind, so there’s no risk in holding your spot.` },
    { q: 'Is ₹999 actually refundable?', a: 'Yes — completely. If you change your mind before delivery, we refund it, no questions asked. If you go ahead, it’s deducted from the balance. It’s a placeholder for your slot, not a fee.' },
    { q: 'Is it safe — and road-legal for my 13-year-old?', a: 'Yes on both. Speed-locked at 25 km/h — physically cannot go faster — so it’s road-legal for under-16s with no licence and no RTO registration. Hydraulic disc brakes stop in one second, plus 420-lux lights, dual suspension, and a free ISI helmet. 300+ Bangalore parents trusted us with their child’s first e-cycle.' },
    { q: 'Will my child still use it after two months?', a: 'E-cycles hold interest far longer than ordinary cycles because pedal-assist makes every ride fun, not exhausting. Add the evening group rides forming across Bangalore, and the Viper becomes a social ritual — not a toy that gathers dust.' },
    { q: 'What if something breaks?', a: '8 full-time mechanics, 25 years in business, free first service, 2-year warranty on motor and battery, and lifetime backing from Bicycle Care. We’re in Yelahanka — bring it in, same-day fix. We even answer the phone at 10 PM.' },
    { q: 'What if it arrives damaged?', a: 'On delivery day you inspect the Viper with our team before paying a rupee of the balance. Anything wrong — a scratch, a fault — we fix or swap it on the spot. You pay only once you’re happy.' },
    { q: 'What if my child is too short or tall?', a: 'Bring them in. We adjust seat height, handlebar position and brake reach to fit perfectly — free, in ten minutes. The Viper fits riders from 5′0″ to 6′2″.' },
    { q: 'Can they ride it to school and tuition?', a: 'Up to 85 km on a single charge. Most tuition centres are under 5 km away — tuition, cricket ground and back, all on one charge. Charge it overnight like a phone.' },
  ];
  return (
    <Section className="py-6 sm:py-10 bg-[#0A0A0A]" id="faq">
      <div className="max-w-3xl mx-auto px-5">
        <SectionHeading kicker="Every Worry, Answered" title={<>The <span className="text-primary">Questions</span> Every <span className="text-primary">Parent</span> Asks</>} />
        <div className="space-y-2">
          {(showAll ? objections : objections.slice(0, 2)).map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="rounded-xl bg-white/[0.04] border border-white/10 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-3.5 text-left">
                <span className="text-white text-sm font-semibold pr-4">{o.q}</span>
                <span className="text-white text-lg font-bold shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10">{open === i ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed">
                      {o.a}
                      <div className="mt-3"><a href={`tel:+91${PHONE}`} className="text-[#EF4444] text-xs font-medium hover:underline inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Still unsure? Call {PHONE}</a></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {objections.length > 2 && (
          <div className="text-center mt-5">
            <button
              onClick={() => { setShowAll((v) => !v); setOpen(null); }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/15 text-gray-300 hover:border-primary hover:text-primary text-sm font-semibold transition-all"
            >
              {showAll ? 'Show fewer questions' : `See all ${objections.length} questions`}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FINAL CTA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FinalCTA({ stats }) {
  const { count, remaining } = stats;
  return (
    <section className="relative py-6 sm:py-8 overflow-hidden">
      <div className="absolute inset-0">
        <ParallaxImage src="/viper-frame-3.webp" alt="" className="w-full h-full object-cover" amount={36} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/55" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
        <h2 className="font-display tracking-wide uppercase text-white text-xl sm:text-3xl mb-2 leading-[1.0] [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]">
          <span className="text-primary">75 Kids Ride</span> Off This July.<br />
          <span className="text-white">Will Yours Be One?</span>
        </h2>
        <p className="text-gray-300 text-sm font-semibold mb-4">
          {count > 0 ? `${remaining} of ${TOTAL_UNITS} slots remain` : 'Reservations are now open'}
        </p>
        <ReserveButton label="Reserve My Child’s Viper — ₹999" sub="Fully refundable · adjusted on delivery" subClassName="text-gray-200" />
        <div className="mt-4"><SecondaryCTAs /></div>
      </div>
    </section>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function ViperKidsLandingPage() {
  const stats = usePreBookingStats();
  const navigate = useNavigate();
  // Reserve anywhere on the landing page → go to the Viper product detail page.
  const openReserve = useCallback(() => navigate('/viper-kids/product'), [navigate]);

  return (
    <ReserveContext.Provider value={openReserve}>
      <div className="viper-theme bg-[#0A0A0A]">
        <HeroSection stats={stats} />
        <ManifestoSection />
        <div id="video-dock-end" aria-hidden="true" />
        {/* Compact product teaser; full gallery + spec sheet live at /viper-kids/product */}
        <ProductSection />
        {/* <SafetySection /> — hidden per request */}
        <StoryScrollSection />
        <LimitedBatchSection />
        <ReelsSection />
        <StoriesSection />
        <ObjectionsSection />
        <SocialProofSection />
        <FinalCTA stats={stats} />
        <StickyBuyBar stats={stats} />
      </div>
    </ReserveContext.Provider>
  );
}
