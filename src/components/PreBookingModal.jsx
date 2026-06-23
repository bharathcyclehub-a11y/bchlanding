import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageCircle, ShieldCheck, Lock, Download } from 'lucide-react';

/**
 * PreBookingModal — Viper Kids pre-booking flow.
 *
 * Collects parent name + phone + area (+ optional child name), creates a lead,
 * then runs the ₹999 refundable token payment through Razorpay and verifies it.
 *
 * On success the lead becomes a confirmed (PAID) pre-booking, which feeds the
 * live booking counter and the social-proof ticker via /api/prebookings.
 *
 * Props:
 *   open       - boolean, whether the modal is visible
 *   onClose    - () => void
 *   onBooked   - (info) => void   called after a verified payment
 *   tierLabel  - string, e.g. "Batch 2" or "Early Access" (display only)
 */

const PHONE = '8892031480';
const TOKEN_AMOUNT = 999; // ₹ — server re-validates against its whitelist
// Price intentionally not shown — only the refundable ₹999 reservation is charged here.
const WA_BASE = `https://wa.me/91${PHONE}`;

function loadRazorpaySdk() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById('razorpay-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PreBookingModal({ open, onClose, onBooked, tierLabel = 'Reservation' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [childName, setChildName] = useState('');
  const [buyingFor, setBuyingFor] = useState('child'); // 'child' | 'self' — who the Viper is for
  const [formStep, setFormStep] = useState(1); // 1 = who is it for, 2 = details + pay
  const [stage, setStage] = useState('form'); // form | processing | success
  const [error, setError] = useState('');
  const [bookedRef, setBookedRef] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [consent, setConsent] = useState(false);

  // Preload the SDK as soon as the modal opens to cut checkout latency.
  useEffect(() => {
    if (open) loadRazorpaySdk();
  }, [open]);

  const reset = useCallback(() => {
    setStage('form');
    setError('');
    setBookedRef('');
    setBookingId('');
    setDownloading(false);
    setConsent(false);
    setFormStep(1);
    setBuyingFor('child');
  }, []);

  const handleClose = () => {
    if (stage === 'processing') return; // don't let them close mid-payment
    reset();
    onClose?.();
  };

  const valid = name.trim().length >= 2 && /^[0-9]{10}$/.test(phone) && area.trim().length >= 2 && consent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Please accept the Privacy Policy to continue.');
      return;
    }
    if (!valid) {
      setError('Please enter your name, a 10-digit phone number, and your area.');
      return;
    }

    setStage('processing');

    try {
      const sdkOk = await loadRazorpaySdk();
      if (!sdkOk) throw new Error('Could not load the payment gateway. Please check your connection and retry.');

      // 1. Create the lead (pre-booking, UNPAID)
      const leadRes = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          buyingFor,
          childName: buyingFor === 'child' ? (childName.trim() || undefined) : undefined,
          category: 'Pre-Booking',
          source: 'viper-kids',
          message: `Viper reservation — ${buyingFor === 'child' ? 'for child' : 'for self'} · area: ${area.trim()}${buyingFor === 'child' && childName.trim() ? `, child: ${childName.trim()}` : ''}`
        })
      });
      const leadData = await leadRes.json();
      if (!leadRes.ok || !leadData.success || !leadData.leadId) {
        throw new Error(leadData.error || 'Could not start your reservation. Please try again.');
      }
      const leadId = leadData.leadId;
      setBookingId(leadData.lead?.bookingId || '');

      // 2. Create the Razorpay order for the ₹999 token
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, amount: TOKEN_AMOUNT, currency: 'INR' })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Could not create your payment order.');

      // 3. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Bharath Cycle Hub',
        description: 'EMotorad Viper — Pre-Booking (refundable token)',
        order_id: orderData.order.id,
        prefill: { name: name.trim(), contact: phone.trim() },
        notes: { area: area.trim(), childName: childName.trim() || '' },
        theme: { color: '#DC2626' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                leadId
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed.');

            setBookedRef(response.razorpay_payment_id);
            setStage('success');
            // VV-T15 — fire a purchase event so pixels optimise on conversions, not PageView
            if (window.dataLayer) {
              window.dataLayer.push({
                event: 'purchase_success',
                value: TOKEN_AMOUNT,
                currency: 'INR',
                transaction_id: response.razorpay_payment_id,
              });
            }
            onBooked?.({ paymentId: response.razorpay_payment_id, name: name.trim(), area: area.trim() });
          } catch (err) {
            setError(err.message || 'Payment verification failed. If money was deducted, contact us — we’ll confirm your slot.');
            setStage('form');
          }
        },
        modal: {
          ondismiss: () => {
            setStage('form');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(resp?.error?.description || 'Payment failed. Please try again.');
        setStage('form');
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStage('form');
    }
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const { downloadViperReceipt } = await import('../utils/receipt');
      await downloadViperReceipt({
        bookingId,
        paymentId: bookedRef,
        name: name.trim(),
        childName: childName.trim(),
        buyingFor,
        amount: TOKEN_AMOUNT,
      });
    } catch (err) {
      console.error('Download receipt failed:', err);
      setError(`Could not generate the receipt: ${err?.message || 'please try again'}`);
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  const waConfirm = `${WA_BASE}?text=${encodeURIComponent(
    `Hi, I just reserved the EMotorad Viper${buyingFor === 'child' ? ' for my child' : ''}. Name: ${name.trim()}, Area: ${area.trim()}. Please confirm my slot and delivery details.`
  )}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md my-8 rounded-3xl bg-[#141414] border border-[#DC2626]/30 shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Gold top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#DC2626] to-transparent" />

          {stage !== 'processing' && (
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 text-2xl leading-none z-10 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          )}

          <div className="p-5 sm:p-6">
            {stage === 'success' ? (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#DC2626] flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </motion.div>
                <h3 className="text-white text-3xl font-display tracking-wide uppercase mb-2">Your Viper is Reserved.</h3>
                <p className="text-[#DC2626] text-sm font-medium tracking-wide uppercase mb-4">{tierLabel} · Slot Confirmed</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Welcome to a list only 75 families in Bangalore will be on. Your batch price is locked.
                  We’ll personally call you within 24 hours, and your Viper is reserved for delivery by <span className="text-white font-semibold">31 July</span>.
                </p>
                <div className="rounded-xl bg-white/5 border border-[#DC2626]/30 p-4 mb-4 text-center">
                  <p className="text-gray-500 text-[11px] uppercase tracking-[0.18em] mb-1">Your Booking ID</p>
                  <p className="text-white font-mono text-2xl font-bold tracking-wider break-all">{bookingId || '—'}</p>
                  {bookedRef && <p className="text-gray-600 text-[10px] mt-2 break-all">Payment ref: {bookedRef}</p>}
                </div>
                {bookingId && (
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloading}
                    className="w-full py-3.5 bg-white text-[#141414] hover:bg-gray-200 font-bold rounded-xl text-sm mb-3 inline-flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {downloading
                      ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Preparing receipt…</>
                      : <><Download className="w-4 h-4" /> Download Receipt (PDF)</>}
                  </button>
                )}
                <a
                  href={waConfirm} target="_blank" rel="noopener noreferrer"
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm mb-3 inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Send me delivery details on WhatsApp
                </a>
                <button onClick={handleClose} className="text-gray-500 text-xs hover:text-gray-300">Close</button>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-[11px] font-semibold tracking-[0.18em] uppercase mb-2">
                    {tierLabel}
                  </span>
                  <h3 className="text-white text-3xl font-display tracking-wide uppercase leading-tight">Reserve Your Viper</h3>
                </div>

                {formStep === 1 ? (
                  /* STEP 1 — who is the Viper for? */
                  <div>
                    <p className="text-center text-gray-300 text-sm font-medium mb-4">Who is the Viper for?</p>
                    <div className="space-y-3">
                      {[{ k: 'child', t: 'For my child' }, { k: 'self', t: 'For myself' }].map((o) => (
                        <button key={o.k} type="button" onClick={() => { setBuyingFor(o.k); setFormStep(2); }}
                          className="group w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#DC2626] hover:bg-[#DC2626]/10 transition-all text-left">
                          <span className="text-white font-semibold text-base">{o.t}</span>
                          <span className="text-gray-500 group-hover:text-[#DC2626] text-xl transition-colors">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* STEP 2 — details + pay */
                  <>
                    {/* Order line */}
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-semibold">EMotorad Viper — {tierLabel}</div>
                        <div className="text-gray-500 text-[11px]">Refundable reservation · price confirmed before delivery</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">₹999</div>
                        <div className="text-gray-500 text-[10px]">to reserve now</div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2.5">
                      <button type="button" onClick={() => setFormStep(1)} disabled={stage === 'processing'}
                        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs disabled:opacity-50">
                        ← {buyingFor === 'child' ? 'For my child' : 'For myself'} · change
                      </button>
                      <div>
                        <label htmlFor="pb-name" className="block text-gray-300 text-xs font-medium mb-1.5">{buyingFor === 'child' ? "Parent's name" : 'Your name'}</label>
                        <input
                          id="pb-name" type="text" inputMode="text" autoComplete="name" placeholder="e.g. Anjali R" value={name}
                          onChange={(e) => setName(e.target.value)} maxLength={40} disabled={stage === 'processing'}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-gray-500 text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="pb-phone" className="block text-gray-300 text-xs font-medium mb-1.5">Phone number</label>
                        <input
                          id="pb-phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10} disabled={stage === 'processing'}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-gray-500 text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="pb-area" className="block text-gray-300 text-xs font-medium mb-1.5">Your area / locality</label>
                        <input
                          id="pb-area" type="text" autoComplete="address-level2" placeholder="e.g. Whitefield" value={area}
                          onChange={(e) => setArea(e.target.value)} maxLength={40} disabled={stage === 'processing'}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-gray-500 text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all disabled:opacity-50"
                        />
                      </div>
                      {buyingFor === 'child' && (
                        <div>
                          <label htmlFor="pb-child" className="block text-gray-300 text-xs font-medium mb-1.5">Child's name <span className="text-gray-600 font-normal">(optional)</span></label>
                          <input
                            id="pb-child" type="text" placeholder="e.g. Aarav" value={childName}
                            onChange={(e) => setChildName(e.target.value)} maxLength={40} disabled={stage === 'processing'}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-gray-500 text-base focus:outline-none focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all disabled:opacity-50"
                          />
                        </div>
                      )}

                      {/* DPDP consent (VV-T08) */}
                      <label className="flex items-start gap-2.5 text-[11px] text-gray-400 leading-relaxed pt-1">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={stage === 'processing'}
                          className="mt-0.5 w-4 h-4 shrink-0 accent-[#DC2626]" />
                        <span>I agree to be contacted about my reservation and accept the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-300 underline hover:text-white">Privacy Policy</a>.</span>
                      </label>

                      {error && (
                        <p className="text-red-400 text-xs leading-relaxed bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                      )}

                      <button
                        type="submit" disabled={stage === 'processing'}
                        className="w-full py-3.5 bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold rounded-xl text-sm transition-all hover:shadow-xl hover:shadow-[#DC2626]/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {stage === 'processing' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Opening secure checkout…
                          </>
                        ) : (
                          <>Pay ₹999 &amp; Reserve My Slot →</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
