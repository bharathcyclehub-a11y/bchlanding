/**
 * Analytics API Hub
 * Handles Visitor tracking, Engagement stats, and Tracking settings
 *
 * Routes:
 * /api/analytics/visitor    - POST (track), GET (events feed)
 * /api/analytics/engagement - POST (track), GET (stats)
 * /api/analytics/settings   - GET (status), POST (toggle)
 */

import { requireAdmin } from '../_lib/auth-middleware.js';
import {
    recordVisitorEvent,
    getVisitorEvents,
    recordEngagementEvent,
    getEngagementStats,
    getTrackingSetting,
    setTrackingSetting
} from '../_lib/firestore-service.js';

export default async function handler(req, res) {
    // Set permissive CORS for public tracking endpoints (visitor/engagement POST)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { slug } = req.query;

    // --- TRACKING SETTINGS ---
    if (slug === 'settings') {
        const admin = await requireAdmin(req, res);
        if (!admin) return;

        // GET - Get tracking status
        if (req.method === 'GET') {
            try {
                const visitor = await getTrackingSetting('visitor_tracking');
                const engagement = await getTrackingSetting('engagement_tracking');
                return res.status(200).json({ success: true, visitor, engagement });
            } catch (error) {
                console.error('❌ Failed to get tracking settings:', error);
                return res.status(500).json({ success: false, error: 'Failed to get settings' });
            }
        }

        // POST - Update tracking status
        if (req.method === 'POST') {
            try {
                let body = req.body;
                if (typeof body === 'string') body = JSON.parse(body);

                const { key, enabled } = body || {};
                const validKeys = ['visitor_tracking', 'engagement_tracking'];

                if (!key || !validKeys.includes(key) || typeof enabled !== 'boolean') {
                    return res.status(400).json({ success: false, error: 'Invalid key or enabled value' });
                }

                await setTrackingSetting(key, enabled);
                return res.status(200).json({ success: true, key, enabled });
            } catch (error) {
                console.error('❌ Failed to update tracking setting:', error);
                return res.status(500).json({ success: false, error: 'Failed to update setting' });
            }
        }
    }

    // --- VISITOR ANALYTICS ---
    if (slug === 'visitor') {
        // POST - Record event
        if (req.method === 'POST') {
            try {
                // Check if visitor tracking is paused
                const setting = await getTrackingSetting('visitor_tracking');
                if (!setting.enabled) {
                    return res.status(200).json({ success: true, paused: true });
                }

                let body = req.body;
                if (typeof body === 'string') body = JSON.parse(body);

                const { visitorId, action, page, referrer, screenWidth } = body || {};
                const validActions = ['page_view', 'popup_shown', 'whatsapp_click', 'call_click', 'dismiss'];

                if (!action || !validActions.includes(action)) {
                    return res.status(400).json({ success: false, error: 'Invalid action' });
                }

                await recordVisitorEvent({ visitorId, action, page, referrer, screenWidth });

                // Update daily aggregates for exit intent actions
                if (action !== 'page_view') {
                    await recordEngagementEvent({ action, page });
                }

                return res.status(200).json({ success: true });
            } catch (error) {
                console.error('❌ Visitor tracking error:', error);
                return res.status(200).json({ success: true });
            }
        }

        // GET - Retrieve events (admin only)
        if (req.method === 'GET') {
            const admin = await requireAdmin(req, res);
            if (!admin) return;

            try {
                const limit = parseInt(req.query.limit) || 100;
                const action = req.query.action || 'all';
                const result = await getVisitorEvents({ limit, action });
                // Include tracking status in response
                const setting = await getTrackingSetting('visitor_tracking');
                return res.status(200).json({ success: true, ...result, trackingEnabled: setting.enabled });
            } catch (error) {
                console.error('❌ Failed to get visitor events:', error);
                return res.status(500).json({ success: false, error: 'Failed to retrieve visitor events' });
            }
        }
    }

    // --- ENGAGEMENT ANALYTICS ---
    if (slug === 'engagement') {
        // POST - Record event
        if (req.method === 'POST') {
            try {
                let body = req.body;
                if (typeof body === 'string') body = JSON.parse(body);

                const { action, page } = body || {};
                const validActions = ['popup_shown', 'whatsapp_click', 'call_click', 'dismiss'];

                if (!action || !validActions.includes(action)) {
                    return res.status(400).json({ success: false, error: 'Invalid action' });
                }

                await recordEngagementEvent({ action, page: page || '/' });
                return res.status(200).json({ success: true });
            } catch (error) {
                console.error('❌ Engagement tracking error:', error);
                return res.status(200).json({ success: true });
            }
        }

        // GET - Get stats (admin only)
        if (req.method === 'GET') {
            const admin = await requireAdmin(req, res);
            if (!admin) return;

            try {
                const days = parseInt(req.query.days) || 30;
                const stats = await getEngagementStats({ days });
                return res.status(200).json({ success: true, stats });
            } catch (error) {
                console.error('❌ Failed to get engagement stats:', error);
                return res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
            }
        }
    }

    return res.status(404).json({ success: false, error: `Not found: slug=${slug}, method=${req.method}` });
}
