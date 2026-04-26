/**
 * Lightweight visitor tracking utility
 * Sends events to /api/analytics/visitor via sendBeacon (non-blocking)
 *
 * Uses session-level sampling (1 in 5 sessions) for page_view events
 * to minimise API usage. Interaction events (clicks, popups) always tracked.
 */

// Generate a session-stable visitor ID
function getVisitorId() {
  let id = sessionStorage.getItem('bch_visitor_id');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    sessionStorage.setItem('bch_visitor_id', id);
  }
  return id;
}

// Determine once per session if this visitor is in the tracking sample
function isInSample() {
  let flag = sessionStorage.getItem('bch_track_sample');
  if (flag === null) {
    // 20% of sessions are sampled for page_view tracking
    flag = Math.random() < 0.2 ? '1' : '0';
    sessionStorage.setItem('bch_track_sample', flag);
  }
  return flag === '1';
}

/**
 * Track a visitor event
 * @param {string} action - page_view | popup_shown | whatsapp_click | call_click | dismiss
 * @param {string} page - Page pathname
 * @param {Object} [extra] - Optional extra data
 */
export function trackVisitor(action, page, extra = {}) {
  try {
    // Sample page_view events (20% of sessions) to reduce API calls
    // Always track interaction events (clicks, popups) — they are rare & valuable
    if (action === 'page_view' && !isInSample()) return;

    const payload = {
      visitorId: getVisitorId(),
      action,
      page: page || '/',
      referrer: document.referrer || null,
      screenWidth: window.innerWidth,
      ...extra
    };

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/visitor', blob);
  } catch (_) {
    // Silent fail — tracking should never break UX
  }
}
