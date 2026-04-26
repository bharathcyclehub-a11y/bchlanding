import { motion } from 'framer-motion';

export default function StockStatus({ stock, recentPurchases }) {
  // Low stock warning (< 10 items)
  if (stock > 0 && stock < 10) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-orange-50 border-2 border-orange-300 p-3 rounded-xl mb-4 flex items-start gap-3"
      >
        <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="text-orange-800 font-bold block text-sm sm:text-base">
            Only {stock} left in stock!
          </span>
          <span className="text-orange-600 text-xs sm:text-sm">
            Order soon before it's gone
          </span>
        </div>
      </motion.div>
    );
  }

  // Out of stock
  if (stock === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-red-50 border-2 border-red-300 p-4 rounded-xl mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-800 font-bold">Currently Out of Stock</span>
        </div>
        <p className="text-red-700 text-sm mb-3">
          Expected back in stock soon
        </p>
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notify When Available
          </button>
        </div>
      </motion.div>
    );
  }

  // High demand indicator (if recent purchases data available)
  if (recentPurchases && recentPurchases > 10) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4 flex items-center gap-2"
      >
        <span className="text-red-500 text-xl animate-pulse">🔥</span>
        <span className="text-green-700 font-semibold text-xs sm:text-sm">
          {recentPurchases} customers bought this in the last 24 hours
        </span>
      </motion.div>
    );
  }

  // In stock - show simple indicator
  if (stock >= 10) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-4 text-sm text-green-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold">In Stock • Ready to Ship</span>
      </motion.div>
    );
  }

  return null;
}
