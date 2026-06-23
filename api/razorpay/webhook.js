/**
 * Razorpay Webhook (server-to-server payment confirmation)
 *
 * POST /api/razorpay/webhook
 *
 * Authoritative payment source of truth — fires from Razorpay's servers even if
 * the customer's browser never completes the client-side verify-payment call
 * (tab closed, lost network, crash). Verifies the X-Razorpay-Signature HMAC
 * against RAZORPAY_WEBHOOK_SECRET over the RAW request body, then marks the
 * matching lead PAID. Idempotent and order-bound.
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:    https://<your-domain>/api/razorpay/webhook
 *   Events: payment.captured, payment.failed
 *   Secret: must equal RAZORPAY_WEBHOOK_SECRET
 */

import crypto from 'crypto';
import { getLeadById, updateLeadPayment } from '../_lib/db-service.js';

// Disable body parsing — signature must be computed over the exact raw bytes.
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  // dev-server mounts express.raw() → req.body is already a Buffer/string
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  // Vercel (bodyParser disabled) → read the stream
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('❌ RAZORPAY_WEBHOOK_SECRET is not set');
    return res.status(500).json({ success: false, error: 'Webhook not configured' });
  }

  // 1. Read raw body + verify HMAC signature (constant-time)
  let raw;
  try {
    raw = await getRawBody(req);
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Cannot read request body' });
  }

  const signature = req.headers['x-razorpay-signature'] || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.warn('⚠️ Razorpay webhook signature mismatch — rejecting');
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  // 2. Parse the (now-trusted) event
  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid JSON' });
  }

  try {
    const type = event.event;

    if (type === 'payment.captured' || type === 'order.paid') {
      const payment = event.payload?.payment?.entity || {};
      const leadId = payment.notes?.leadId;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = typeof payment.amount === 'number' ? Math.round(payment.amount / 100) : undefined;

      if (!leadId) {
        console.warn('⚠️ webhook: payment has no notes.leadId — ignoring');
        return res.status(200).json({ success: true, ignored: 'no leadId' });
      }

      const lead = await getLeadById(leadId);
      if (!lead) {
        console.warn(`⚠️ webhook: lead ${leadId} not found — acking`);
        return res.status(200).json({ success: true, ignored: 'lead not found' });
      }

      // Order binding: the captured order must match the one we created for this lead
      if (lead.payment?.orderId && orderId && lead.payment.orderId !== orderId) {
        console.warn(`⚠️ webhook: order mismatch for lead ${leadId} (${lead.payment.orderId} vs ${orderId})`);
        return res.status(200).json({ success: true, ignored: 'order mismatch' });
      }

      // Idempotent — webhooks can fire more than once
      if (lead.payment?.status === 'PAID') {
        return res.status(200).json({ success: true, alreadyPaid: true });
      }

      await updateLeadPayment(leadId, {
        status: 'PAID', orderId, transactionId: paymentId, amount, method: 'RAZORPAY'
      }, { skipExistenceCheck: true });

      console.log(`✅ webhook: lead ${leadId} marked PAID (payment ${paymentId})`);
      return res.status(200).json({ success: true });
    }

    if (type === 'payment.failed') {
      const payment = event.payload?.payment?.entity || {};
      const leadId = payment.notes?.leadId;
      if (leadId) {
        const lead = await getLeadById(leadId);
        if (lead && lead.payment?.status !== 'PAID') {
          await updateLeadPayment(leadId, {
            status: 'FAILED',
            orderId: payment.order_id,
            transactionId: payment.id,
            method: 'RAZORPAY',
            errorMessage: payment.error_description || 'Payment failed'
          }, { skipExistenceCheck: true });
        }
      }
      return res.status(200).json({ success: true });
    }

    // Unhandled event type — ack so Razorpay stops retrying
    return res.status(200).json({ success: true, ignored: type });
  } catch (error) {
    // Transient (e.g. DB) error → 500 so Razorpay retries with backoff
    console.error('❌ webhook processing error:', error);
    return res.status(500).json({ success: false, error: 'processing error' });
  }
}
