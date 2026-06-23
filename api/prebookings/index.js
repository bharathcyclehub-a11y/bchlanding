/**
 * Public Pre-Booking Stats API
 *
 * GET /api/prebookings
 * Returns campaign progress + a privacy-safe recent-bookings feed for the
 * Viper Kids landing page social-proof ticker.
 *
 * Response: { success, count, target, bonusCap, remaining, recent: [{ name, area, ts }] }
 *
 * Notes:
 * - PUBLIC (no auth). Only first name + area + timestamp are exposed — never phone/email.
 * - Backed by a 30s server-side cache (see getPreBookingStats) so the polling
 *   ticker doesn't hammer Firestore.
 */

import { getPreBookingStats } from '../_lib/db-service.js';

const TARGET = 75;
const BONUS_CAP = 50;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Allow CDN/browser to cache briefly to smooth out polling bursts
  res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=20');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const stats = await getPreBookingStats({ target: TARGET, bonusCap: BONUS_CAP });
    const remaining = Math.max(0, stats.target - stats.count);
    const bonusRemaining = Math.max(0, stats.bonusCap - stats.count);

    return res.status(200).json({
      success: true,
      count: stats.count,
      target: stats.target,
      bonusCap: stats.bonusCap,
      remaining,
      bonusRemaining,
      recent: stats.recent
    });
  } catch (error) {
    console.error('❌ /api/prebookings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to load pre-booking stats' });
  }
}
