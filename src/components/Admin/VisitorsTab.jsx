import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AdminAPI } from '../../utils/auth-api';

const ACTION_CONFIG = {
  page_view: { label: 'Page View', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '👁' },
  popup_shown: { label: 'Popup Shown', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '💬' },
  whatsapp_click: { label: 'WhatsApp Click', color: 'bg-green-100 text-green-700 border-green-200', icon: '📱' },
  call_click: { label: 'Call Click', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '📞' },
  dismiss: { label: 'Dismissed', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '✕' }
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function VisitorsTab() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [togglingTracking, setTogglingTracking] = useState(false);

  const { getIdToken } = useAuth();
  const adminAPI = new AdminAPI(getIdToken);

  const fetchEvents = async () => {
    try {
      if (events.length === 0) setLoading(true);
      setError(null);
      const response = await adminAPI.getVisitorEvents(100, filter);
      if (response.success) {
        setEvents(response.events || []);
        setSummary(response.summary || null);
        if (response.trackingEnabled !== undefined) {
          setTrackingEnabled(response.trackingEnabled);
        }
      }
    } catch (err) {
      console.error('Failed to fetch visitor events:', err);
      setError(err.message || 'Failed to load visitor data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTracking = async () => {
    setTogglingTracking(true);
    try {
      const newState = !trackingEnabled;
      const response = await adminAPI.setTrackingStatus('visitor_tracking', newState);
      if (response.success) {
        setTrackingEnabled(newState);
        // Stop auto-refresh when paused
        if (!newState) setAutoRefresh(false);
      }
    } catch (err) {
      console.error('Failed to toggle tracking:', err);
    } finally {
      setTogglingTracking(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, filter]);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3"></div>
          <p className="text-gray-text text-sm font-medium">Loading visitor activity...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 text-center">
        <p className="text-red-800 font-bold mb-2">Failed to load data</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button onClick={fetchEvents} className="px-5 py-2 rounded-full bg-red-600 text-white font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Paused Banner */}
      {!trackingEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏸️</span>
            <div>
              <p className="font-bold text-amber-800 text-sm uppercase tracking-wide">Tracking Paused</p>
              <p className="text-amber-600 text-xs">New visitor events are not being recorded. Click "Go Live" to resume.</p>
            </div>
          </div>
          <button
            onClick={toggleTracking}
            disabled={togglingTracking}
            className="px-4 py-2 rounded-full bg-green-600 text-white font-bold text-xs uppercase tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {togglingTracking ? 'Starting...' : 'Go Live'}
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-dark uppercase tracking-wider">
            Visitors
          </h2>
          <p className="text-gray-text text-sm mt-1">
            {trackingEnabled ? 'Live feed of every visitor action on your site' : 'Tracking is paused — showing historical data'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pause/Live Toggle */}
          <button
            onClick={toggleTracking}
            disabled={togglingTracking}
            className={`px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border disabled:opacity-50 ${trackingEnabled
              ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200'
              : 'bg-red-100 text-red-700 border-red-200 hover:bg-green-100 hover:text-green-700 hover:border-green-200'
            }`}
            title={trackingEnabled ? 'Click to pause tracking' : 'Click to resume tracking'}
          >
            {togglingTracking ? '...' : trackingEnabled ? '● Live' : '⏸ Paused'}
          </button>
          {trackingEnabled && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${autoRefresh
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-text border-gray-200'
              }`}
            >
              {autoRefresh ? 'Auto-Refresh' : 'Manual'}
            </button>
          )}
          <button
            onClick={fetchEvents}
            className="px-4 py-2 rounded-full bg-dark text-white font-bold text-xs uppercase tracking-wide hover:bg-dark/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6">
          {[
            { label: 'Events', value: summary.total, color: 'border-gray-300' },
            { label: 'Visitors', value: summary.uniqueVisitors, color: 'border-primary' },
            { label: 'Page Views', value: summary.pageViews, color: 'border-blue-500' },
            { label: 'Popup', value: summary.popupShown, color: 'border-yellow-500' },
            { label: 'WhatsApp', value: summary.whatsappClicks, color: 'border-green-500' },
            { label: 'Calls', value: summary.callClicks, color: 'border-purple-500' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${stat.color}`}
            >
              <div className="text-[10px] font-bold text-gray-text uppercase tracking-wide">{stat.label}</div>
              <div className="text-xl sm:text-2xl font-display text-dark">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'page_view', label: 'Page Views' },
          { key: 'popup_shown', label: 'Popup' },
          { key: 'whatsapp_click', label: 'WhatsApp' },
          { key: 'call_click', label: 'Calls' },
          { key: 'dismiss', label: 'Dismissed' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === f.key
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-text hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Events Feed */}
      <div className="bg-white rounded-xl sm:rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-text text-sm">No visitor events yet. Data will appear as visitors browse your site.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map((event, i) => {
              const config = ACTION_CONFIG[event.action] || ACTION_CONFIG.page_view;
              return (
                <motion.div
                  key={event.id}
                  initial={i < 5 ? { opacity: 0, x: -10 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i < 5 ? i * 0.03 : 0 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Action icon */}
                  <span className="text-lg w-7 text-center shrink-0">{config.icon}</span>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-sm text-dark font-medium truncate">{event.page}</span>
                    </div>
                    {event.referrer && (
                      <p className="text-[11px] text-gray-text truncate mt-0.5">
                        from: {event.referrer}
                      </p>
                    )}
                  </div>

                  {/* Device badge */}
                  <span className="hidden sm:inline text-[10px] font-bold text-gray-text uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                    {event.device || '—'}
                  </span>

                  {/* Visitor ID */}
                  <span className="hidden lg:inline text-[10px] text-gray-text font-mono shrink-0">
                    {event.visitorId?.slice(-8) || '—'}
                  </span>

                  {/* Time */}
                  <span className="text-xs text-gray-text shrink-0 w-16 text-right">
                    {timeAgo(event.createdAt)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-text">
        Showing latest {events.length} events
        {trackingEnabled && autoRefresh && ' · Auto-refreshing every 30s'}
        {!trackingEnabled && ' · Tracking paused — no new events being recorded'}
      </div>
    </div>
  );
}
