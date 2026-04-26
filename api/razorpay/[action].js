/**
 * Razorpay Payment API Hub
 * Merged into single serverless function to save Vercel function slots
 *
 * POST /api/razorpay/create-order  - Create a new Razorpay order
 * POST /api/razorpay/verify-payment - Verify payment signature
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { handleCors } from '../_lib/auth-middleware.js';
import { getLeadById, updateLeadPayment } from '../_lib/firestore-service.js';

// Initialize Razorpay instance lazily
let razorpay = null;

function getRazorpay() {
  if (razorpay) return razorpay;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing from environment variables');
  }

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  return razorpay;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { action } = req.query;

  // --- CREATE ORDER ---
  if (action === 'create-order') {
    try {
      const { leadId } = req.body;
      const amount = 99;
      const currency = 'INR';

      if (!leadId) {
        return res.status(400).json({ success: false, error: 'leadId is required' });
      }

      const lead = await getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const shortId = leadId.substring(leadId.length - 8);
      const timestamp = Date.now().toString().substring(0, 10);
      const receipt = `rcpt_${timestamp}_${shortId}`;

      const options = {
        amount: amount * 100,
        currency,
        receipt,
        notes: {
          leadId,
          customerName: lead.name,
          customerPhone: lead.phone,
          customerEmail: lead.email || ''
        }
      };

      const rzp = getRazorpay();
      const order = await rzp.orders.create(options);

      console.log('✅ Razorpay order created:', { orderId: order.id, leadId, amount });

      await updateLeadPayment(leadId, {
        status: 'PENDING',
        orderId: order.id,
        amount,
        currency,
        method: 'RAZORPAY'
      }, { skipExistenceCheck: true });

      return res.status(200).json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt
        },
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error('❌ Razorpay Order Creation Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to create payment order. Please try again.' });
    }
  }

  // --- VERIFY PAYMENT ---
  if (action === 'verify-payment') {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Missing required payment verification parameters' });
      }

      if (!leadId) {
        return res.status(400).json({ success: false, error: 'leadId is required' });
      }

      const lead = await getLeadById(leadId);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.error('❌ Payment signature verification failed:', { orderId: razorpay_order_id, paymentId: razorpay_payment_id, leadId });

        await updateLeadPayment(leadId, {
          status: 'FAILED',
          orderId: razorpay_order_id,
          transactionId: razorpay_payment_id,
          method: 'RAZORPAY',
          errorMessage: 'Payment signature verification failed'
        }, { skipExistenceCheck: true });

        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
      }

      const updatedLead = await updateLeadPayment(leadId, {
        status: 'PAID',
        orderId: razorpay_order_id,
        transactionId: razorpay_payment_id,
        method: 'RAZORPAY'
      }, { skipExistenceCheck: true });

      console.log('✅ Payment verified successfully:', { orderId: razorpay_order_id, paymentId: razorpay_payment_id, leadId });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        lead: updatedLead,
        paymentId: razorpay_payment_id
      });
    } catch (error) {
      console.error('❌ Payment Verification Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to verify payment. Please contact support.' });
    }
  }

  return res.status(404).json({ success: false, error: 'Unknown action' });
}
