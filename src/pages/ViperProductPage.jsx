import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Check } from 'lucide-react';
import PreBookingModal from '../components/PreBookingModal';

// ─── EMotorad Viper — product detail page ─────────────────────────────
// Images + specs scraped from emotorad.com/bikes/viper (Stealth Black).
// Price intentionally not shown — only the refundable ₹999 reservation is taken.
const PHONE = '8892031480';
const WA_LINK = `https://wa.me/91${PHONE}?text=${encodeURIComponent(
  "Hi, I'm interested in pre-booking the EMotorad Viper for my child. Please share details."
)}`;

const GALLERY = [1, 2, 3, 6, 4, 5, 7, 8, 11].map((n) => `/viper-product-${n}.webp`);
const STATS = [
  { v: '85 km', k: 'Range · PAS' },
  { v: '25 km/h', k: 'Top speed' },
  { v: '48V 250W', k: 'Hub motor' },
  { v: '15.6 Ah', k: 'Battery' },
  { v: '7-speed', k: 'Shimano' },
  { v: 'Lifetime', k: 'Frame warranty' },
];
const SPECS = [
  ['Frame', 'High-tensile steel · moto-style'],
  ['Motor', '48V 250W rear hub'],
  ['Battery', '48V 15.6Ah Li-ion · removable'],
  ['Range', 'Up to 85 km PAS · 70 km throttle'],
  ['Top speed', 'Sealed at 25 km/h · road-legal'],
  ['Gears', 'Shimano Tourney · 7-speed'],
  ['Tyres', '20" × 4.0" fat tyres'],
  ['Suspension', 'Double-crown · 100mm front'],
  ['Display', 'Cluster C9 colour · NFC'],
  ['Fits', 'Riders 5′2″ & above · up to 110 kg'],
];
const KIT = [
  'ISI helmet + heavy-duty lock + 420-lux light set — fitted free',
  'Professional fitting + hands-on riding training',
  'Lifetime frame warranty + free first service',
  'Backed for life by Bicycle Care, Yelahanka',
];

export default function ViperProductPage() {
  const [open, setOpen] = useState(false);
  const openReserve = useCallback(() => setOpen(true), []);
  const [idx, setIdx] = useState(0);
  const [bonusLeft, setBonusLeft] = useState(50);

  useEffect(() => {
    let alive = true;
    fetch('/api/prebookings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d && d.success && typeof d.bonusRemaining === 'number') setBonusLeft(d.bonusRemaining); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const prev = () => setIdx((i) => (i === 0 ? GALLERY.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === GALLERY.length - 1 ? 0 : i + 1));

  return (
    <div className="viper-theme bg-[#0A0A0A] min-h-screen overflow-x-hidden pt-[72px] sm:pt-[80px]">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-5 pt-4">
        <Link to="/viper-kids" className="inline-flex items-center gap-1 text-gray-400 hover:text-primary text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Viper
        </Link>
      </div>

      {/* Gallery + buy panel */}
      <div className="max-w-6xl mx-auto px-5 mt-4 grid lg:grid-cols-2 gap-6 lg:gap-10 lg:items-start">
        {/* Side-scroll gallery (main image + arrows + thumbnail strip) */}
        <div className="min-w-0">
          <div className="relative bg-white/[0.04] rounded-2xl overflow-hidden shadow-sm border border-white/10">
            <img src={GALLERY[idx]} alt={`EMotorad Viper — view ${idx + 1}`} className="w-full h-auto max-h-[60vh] object-contain p-2 mx-auto" />
            <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-black/50 text-white">{idx + 1} / {GALLERY.length}</span>
            <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 shadow flex items-center justify-center transition-colors"><ChevronLeft className="w-5 h-5 text-white" /></button>
            <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 shadow flex items-center justify-center transition-colors"><ChevronRight className="w-5 h-5 text-white" /></button>
          </div>
          {/* Thumbnail strip — side scroll, like the main store */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {GALLERY.map((url, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`View image ${i + 1}`}
                className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-white/[0.04] transition-all ${i === idx ? 'border-primary shadow-md scale-105' : 'border-white/15 opacity-70 hover:opacity-100'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Buy panel */}
        <div className="min-w-0 bg-white/[0.04] rounded-2xl border border-white/10 shadow-sm p-5 sm:p-6">
          <span className="inline-block text-gray-300 text-xs font-medium tracking-[0.25em] uppercase mb-2">EMotorad · Limited Batch</span>
          <h1 className="font-display tracking-wide uppercase text-2xl sm:text-3xl text-white leading-[1.05] mb-1.5">The EMotorad <span className="text-primary">Viper</span></h1>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 text-sm tracking-tight">★★★★★</span>
            <span className="text-gray-300 text-sm font-medium">4.7 · loved by 300+ Bangalore families</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[11px] text-gray-400 uppercase tracking-[0.15em]">Colour</span>
            <span className="flex items-center gap-1.5 text-xs text-white font-semibold"><span className="w-4 h-4 rounded-full bg-[#1b1b1d] ring-1 ring-white/20" /> Stealth Black</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-4 h-4 rounded-full bg-[#2c4a78] ring-1 ring-white/20" /> Apex Blue</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 px-1.5 py-2.5 text-center">
                <div className="text-white text-sm sm:text-base font-bold leading-none">{s.v}</div>
                <div className="text-gray-400 text-[10px] sm:text-xs mt-1">{s.k}</div>
              </div>
            ))}
          </div>

          <button onClick={openReserve} className="group w-full bg-primary text-white font-bold text-sm sm:text-base rounded-full px-8 py-4 hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 inline-flex items-center justify-center gap-1.5">
            Reserve the Viper — ₹999 <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <p className="text-center text-[13px] text-gray-300 mt-3">
            <span className="text-primary font-bold">₹999 to reserve</span> · fully refundable · {bonusLeft > 0 ? `first 50 get 3 free accessories — ${bonusLeft} left` : 'price confirmed before delivery'}
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-gray-400 hover:text-primary text-xs underline underline-offset-4">
            <MessageCircle className="w-3.5 h-3.5" /> Questions? Talk to us on WhatsApp
          </a>
        </div>
      </div>

      {/* What's included */}
      <div className="max-w-6xl mx-auto px-5 mt-6 sm:mt-8">
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm p-5 sm:p-6 max-w-3xl mx-auto">
          <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-3">Every Viper includes</p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {KIT.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-primary" strokeWidth={3} /></span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Full spec sheet */}
      <div className="max-w-3xl mx-auto px-5 mt-6 sm:mt-8">
        <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Full specification</p>
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm overflow-hidden">
          {SPECS.map(([k, v], i) => (
            <div key={i} className="px-4 sm:px-5 py-2.5 border-b border-white/10 last:border-b-0 flex items-baseline gap-3">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.12em] w-20 sm:w-28 shrink-0">{k}</span>
              <span className="text-white text-[13px] sm:text-sm">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3">Specifications per EMotorad. Final price confirmed before delivery.</p>
      </div>

      {/* Spacer so the last content clears the floating sticky bar */}
      <div className="h-20" />

      {/* Sticky reserve bar (floating pill — no full-width backdrop) */}
      <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto flex items-center gap-3 rounded-2xl bg-[#141416] border border-white/15 shadow-xl shadow-black/40 px-3 py-2">
          <div className="leading-tight shrink-0 pl-1">
            <div className="text-white text-[13px] font-bold">₹999 to reserve</div>
            <div className="text-gray-400 text-[10px]">Fully refundable</div>
          </div>
          <button onClick={openReserve} className="flex-1 bg-primary text-white font-bold text-[13px] rounded-xl px-4 py-2.5 shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
            Reserve — ₹999 →
          </button>
        </div>
      </div>

      <PreBookingModal open={open} onClose={() => setOpen(false)} tierLabel="Batch 2" />
    </div>
  );
}
