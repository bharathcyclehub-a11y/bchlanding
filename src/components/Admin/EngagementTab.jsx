import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AdminAPI } from '../../utils/auth-api';

export default function EngagementTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const { getIdToken } = useAuth();
  const adminAPI = new AdminAPI(getIdToken);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getEngagementStats(days);
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Failed to fetch engagement stats:', err);
      setError(err.message || 'Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3"></div>
          <p className="text-gray-text text-sm font-medium">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 text-center">
        <p className="text-red-800 font-bold mb-2">Failed to load data</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-5 py-2 rounded-full bg-red-600 text-white font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const totals = stats?.totals || { popup_shown: 0, whatsapp_click: 0, call_click: 0, dismiss: 0, total: 0 };
  const daily = stats?.daily || [];
  const topPages = stats?.topPages || [];

  // Calculate conversion rate
  const conversionRate = totals.popup_shown > 0
    ? (((totals.whatsapp_click + totals.call_click) / totals.popup_shown) * 100).toFixed(1)
    : '0.0';

  return (
    <div>
      {/* Header + Period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-dark uppercase tracking-wider">
            Exit Intent Popup
          </h2>
          <p className="text-gray-text text-sm mt-1">
            Track how visitors interact with the exit popup
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${days === d
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-text hover:bg-gray-200'
              }`}
            >
              {d}D
            </button>
          ))}
          <button
            onClick={fetchStats}
            className="ml-2 px-4 py-2 rounded-full bg-dark text-white font-bold text-xs uppercase tracking-wide hover:bg-dark/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-5 border-l-4 border-blue-500 shadow-sm"
        >
          <div className="text-[10px] sm:text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Popup Shown</div>
          <div className="text-2xl sm:text-3xl font-display text-blue-600">{totals.popup_shown}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-5 border-l-4 border-green-500 shadow-sm"
        >
          <div className="text-[10px] sm:text-xs font-bold text-gray-text uppercase tracking-wide mb-1">WhatsApp Clicks</div>
          <div className="text-2xl sm:text-3xl font-display text-green-600">{totals.whatsapp_click}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-5 border-l-4 border-purple-500 shadow-sm"
        >
          <div className="text-[10px] sm:text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Call Clicks</div>
          <div className="text-2xl sm:text-3xl font-display text-purple-600">{totals.call_click}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-5 border-l-4 border-orange-500 shadow-sm"
        >
          <div className="text-[10px] sm:text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Dismissed</div>
          <div className="text-2xl sm:text-3xl font-display text-orange-600">{totals.dismiss}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-5 border-l-4 border-primary shadow-sm col-span-2 sm:col-span-1"
        >
          <div className="text-[10px] sm:text-xs font-bold text-gray-text uppercase tracking-wide mb-1">Conversion Rate</div>
          <div className="text-2xl sm:text-3xl font-display text-primary">{conversionRate}%</div>
        </motion.div>
      </div>

      {/* Daily Breakdown & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Daily breakdown table */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-[20px] p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-dark uppercase tracking-wide text-sm mb-4">Daily Breakdown</h3>
          {daily.length === 0 ? (
            <p className="text-gray-text text-sm text-center py-8">No data yet. Events will appear once visitors trigger the exit popup.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-xs font-bold text-gray-text uppercase tracking-wide">Date</th>
                    <th className="text-center py-2 px-2 text-xs font-bold text-gray-text uppercase tracking-wide">Shown</th>
                    <th className="text-center py-2 px-2 text-xs font-bold text-gray-text uppercase tracking-wide">WhatsApp</th>
                    <th className="text-center py-2 px-2 text-xs font-bold text-gray-text uppercase tracking-wide">Call</th>
                    <th className="text-center py-2 px-2 text-xs font-bold text-gray-text uppercase tracking-wide">Dismissed</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map(row => (
                    <tr key={row.date} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-2 font-medium text-dark">
                        {new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">{row.popup_shown || 0}</td>
                      <td className="py-2.5 px-2 text-center text-green-600 font-semibold">{row.whatsapp_click || 0}</td>
                      <td className="py-2.5 px-2 text-center text-purple-600 font-semibold">{row.call_click || 0}</td>
                      <td className="py-2.5 px-2 text-center text-orange-600 font-semibold">{row.dismiss || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl sm:rounded-[20px] p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-dark uppercase tracking-wide text-sm mb-4">Top Pages</h3>
          {topPages.length === 0 ? (
            <p className="text-gray-text text-sm text-center py-8">No page data yet.</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((item, i) => (
                <div key={item.page} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-text w-5 shrink-0">{i + 1}.</span>
                    <span className="text-sm text-dark font-medium truncate">{item.page}</span>
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
