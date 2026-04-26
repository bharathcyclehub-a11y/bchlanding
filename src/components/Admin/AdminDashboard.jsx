import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AdminAPI } from '../../utils/auth-api';
import ProductsTab from './ProductsTab';
import LeadsTable from './LeadsTable';
import EngagementTab from './EngagementTab';
import VisitorsTab from './VisitorsTab';

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    paymentStatus: 'all',      // all, paid, unpaid
    category: 'all',           // all, Contact, Test Ride, EMI, Exchange, General
    source: 'all',             // all, product, test-ride-landing, etc.
    fromDate: '',              // Date string (YYYY-MM-DD)
    toDate: ''                 // Date string (YYYY-MM-DD)
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'product', or 'products'
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { user, logout, getIdToken } = useAuth();
  const adminAPI = new AdminAPI(getIdToken);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch leads on mount and when filters/activeTab change
  useEffect(() => {
    fetchLeads(true);
  }, [filters, activeTab]);

  const fetchLeads = async (isReset = false) => {
    try {
      if (isReset) {
        setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Build filter object for API
      const apiFilters = {
        limit: 20 // Fetch 20 at a time
      };

      if (!isReset && nextCursor) {
        apiFilters.cursor = nextCursor;
      }

      if (filters.paymentStatus !== 'all') {
        apiFilters.status = filters.paymentStatus.toUpperCase();
      }
      if (filters.category !== 'all') {
        apiFilters.category = filters.category;
      }

      // Handle source filtering based on active tab
      if (activeTab === 'product') {
        apiFilters.source = 'product';
      } else if (activeTab === 'all') {
        // Show ALL leads (no source filter) so contact, test-ride, and other leads are visible
      } else if (filters.source !== 'all') {
        apiFilters.source = filters.source;
      }

      if (filters.fromDate) {
        apiFilters.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        apiFilters.toDate = filters.toDate;
      }

      const response = await adminAPI.getLeads(apiFilters);

      if (response.success) {
        const newLeads = response.leads || [];

        if (isReset) {
          setLeads(newLeads);
        } else {
          setLeads(prev => [...prev, ...newLeads]);
        }

        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor && newLeads.length > 0);

        // Always update stats
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      setError(error.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteLead = async (leadId, leadName) => {
    if (!window.confirm(`Are you sure you want to delete the lead for "${leadName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.deleteLead(leadId);
      if (response.success) {
        // Refresh leads list
        // Refresh leads list
        await fetchLeads(true);
        console.log(`✅ Lead deleted: ${leadId}`);
      }
    } catch (error) {
      console.error('❌ Error deleting lead:', error);
      setError(error.message || 'Failed to delete lead');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PAID': 'bg-green-100 text-green-800 border-green-300',
      'UNPAID': 'bg-orange-100 text-orange-800 border-orange-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'FAILED': 'bg-red-100 text-red-800 border-red-300'
    };

    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      'Test Ride': {
        classes: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'TEST RIDE'
      },
      '99 Offer': {
        classes: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'TEST RIDE'
      },
      'Contact': {
        classes: 'bg-red-100 text-red-800 border-red-400',
        label: 'CONTACT'
      },
      'EMI': {
        classes: 'bg-green-100 text-green-800 border-green-300',
        label: 'EMI'
      },
      'Exchange': {
        classes: 'bg-purple-100 text-purple-800 border-purple-300',
        label: 'EXCHANGE'
      },
      'General': {
        classes: 'bg-gray-100 text-gray-800 border-gray-300',
        label: 'GENERAL'
      }
    };

    // If source is test-ride-landing, always treat as Test Ride for visual consistency
    const effectiveCategory = (category === 'General' || !category) &&
      (arguments[1]?.source === 'test-ride-landing') // We'll pass lead object as 2nd arg
      ? 'Test Ride'
      : category;

    const badge = badges[effectiveCategory] || badges[category] || badges['General'];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${badge.classes}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 md:sticky md:top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
              <div>
                <p className="text-sm font-bold text-primary uppercase tracking-wide mb-1">
                  Welcome, {user?.displayName || (user?.email?.split('@')[0])}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-normal text-dark uppercase tracking-wider">
                  CRM Dashboard
                </h1>
              </div>
              <div className="hidden sm:block border-l border-gray-200 h-10 mx-2"></div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-gray-text uppercase tracking-widest">
                  Current Session
                </p>
                <p className="text-sm font-bold text-dark flex items-center gap-2">
                  <span className="text-primary">📅</span>
                  {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                  <span className="mx-1 opacity-20">|</span>
                  <span className="text-primary">🕒</span>
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[20px] flex items-center gap-3"
          >
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-bold text-red-800">Error loading data</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-6 border-l-4 border-primary shadow-sm"
          >
            <div className="text-xs sm:text-sm font-bold text-gray-text uppercase tracking-wide mb-1 sm:mb-2">Total Leads</div>
            <div className="text-2xl sm:text-3xl font-display text-dark">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-6 border-l-4 border-green-500 shadow-sm"
          >
            <div className="text-xs sm:text-sm font-bold text-gray-text uppercase tracking-wide mb-1 sm:mb-2">Paid</div>
            <div className="text-2xl sm:text-3xl font-display text-green-600">{stats.paid}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-6 border-l-4 border-orange-500 shadow-sm"
          >
            <div className="text-xs sm:text-sm font-bold text-gray-text uppercase tracking-wide mb-1 sm:mb-2">Unpaid</div>
            <div className="text-2xl sm:text-3xl font-display text-orange-600">{stats.unpaid}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-6 border-l-4 border-blue-500 shadow-sm"
          >
            <div className="text-xs sm:text-sm font-bold text-gray-text uppercase tracking-wide mb-1 sm:mb-2">Revenue</div>
            <div className="text-2xl sm:text-3xl font-display text-blue-600">₹{stats.revenue || 0}</div>
          </motion.div>
        </div>



        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-text hover:text-dark'
              }`}
          >
            All Leads
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'product'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-text hover:text-dark'
              }`}
          >
            Product Leads
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-text hover:text-dark'
              }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'engagement'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-text hover:text-dark'
              }`}
          >
            Engagement
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'visitors'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-text hover:text-dark'
              }`}
          >
            Visitors
          </button>
        </div>

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <ProductsTab />
        )}

        {/* Engagement Tab Content */}
        {activeTab === 'engagement' && (
          <EngagementTab />
        )}

        {/* Visitors Tab Content */}
        {activeTab === 'visitors' && (
          <VisitorsTab />
        )}

        {/* Filter Toggle + Refresh (Only show for leads tabs) */}
        {activeTab !== 'products' && activeTab !== 'engagement' && activeTab !== 'visitors' && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 border-2 ${showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-dark border-gray-200 hover:border-primary'
                }`}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {/* Active filter count badge */}
              {(() => {
                const count = [
                  filters.paymentStatus !== 'all',
                  filters.category !== 'all',
                  filters.fromDate,
                  filters.toDate
                ].filter(Boolean).length;
                return count > 0 ? (
                  <span className={`ml-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${showFilters ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                    {count}
                  </span>
                ) : null;
              })()}
            </button>

            <button
              onClick={() => fetchLeads(true)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark text-white font-bold text-sm uppercase tracking-wide hover:bg-dark/90 transition-all duration-300 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}

        {/* Collapsible Filters Panel (Only show for leads tabs) */}
        {activeTab !== 'products' && activeTab !== 'engagement' && activeTab !== 'visitors' && (
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-[20px] p-5 sm:p-6 mb-6 shadow-sm border border-gray-200">
                  {/* Header with Clear All */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-dark uppercase tracking-wide text-sm">Filter Leads</h3>
                    <button
                      onClick={() => setFilters({ paymentStatus: 'all', category: 'all', source: 'all', fromDate: '', toDate: '' })}
                      className="text-xs text-primary hover:underline font-bold uppercase tracking-wide"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Payment Status Pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <button
                      onClick={() => setFilters({ ...filters, paymentStatus: 'all' })}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filters.paymentStatus === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-text hover:bg-gray-200'
                        }`}
                    >
                      All ({stats.total || 0})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, paymentStatus: 'paid' })}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filters.paymentStatus === 'paid'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-text hover:bg-gray-200'
                        }`}
                    >
                      Paid ({stats.paid || 0})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, paymentStatus: 'unpaid' })}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filters.paymentStatus === 'unpaid'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-text hover:bg-gray-200'
                        }`}
                    >
                      Unpaid ({stats.unpaid || 0})
                    </button>
                  </div>

                  {/* Category + Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      >
                        <option value="all">All Categories</option>
                        <option value="Test Ride">Test Ride</option>
                        <option value="Contact">Contact</option>
                        <option value="EMI">EMI Inquiry</option>
                        <option value="Exchange">Exchange</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">From Date</label>
                      <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">To Date</label>
                      <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Leads Table - Responsive (Only show for leads tabs) */}
        {activeTab !== 'products' && activeTab !== 'engagement' && activeTab !== 'visitors' && (
          <LeadsTable
            leads={leads}
            loading={loading && leads.length === 0}
            activeTab={activeTab}
            formatDate={formatDate}
            getCategoryBadge={getCategoryBadge}
            getStatusBadge={getStatusBadge}
            handleDeleteLead={handleDeleteLead}
          />
        )}

        {/* Load More Button (Only show for leads tabs) */}
        {activeTab !== 'products' && activeTab !== 'engagement' && hasMore && leads.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchLeads(false)}
              disabled={loadingMore}
              className="px-6 py-3 rounded-full bg-white border border-gray-200 text-dark font-bold text-sm uppercase tracking-wide hover:bg-gray-50 hover:border-primary transition-all duration-300 shadow-sm flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                  Loading More...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Load More Leads
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer (Only show for leads tabs) */}
        {activeTab !== 'products' && activeTab !== 'engagement' && activeTab !== 'visitors' && (
          <div className="mt-6 text-center text-sm text-gray-text">
            <p>Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
            <p className="mt-2">
              🔒 Secured with Firebase Authentication
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
