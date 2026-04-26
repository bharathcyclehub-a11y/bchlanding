import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EMICalculator({ price }) {
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(12);

  // Only show for products >= ₹10,000
  if (price < 10000) {
    return null;
  }

  const calculateEMI = (tenure) => Math.ceil(price / tenure);

  const emiOptions = [
    { months: 3, label: '3 Months' },
    { months: 6, label: '6 Months' },
    { months: 12, label: '12 Months' }
  ];

  return (
    <>
      {/* Quick EMI Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-4 rounded-xl mb-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">or pay in EMI</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">
              ₹{calculateEMI(12).toLocaleString('en-IN')}
              <span className="text-xs sm:text-base text-gray-600">/month</span>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              with 0% interest • 12 months
            </p>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-3 sm:px-4 py-2 bg-white border-2 border-primary text-primary rounded-full text-xs sm:text-sm font-bold hover:bg-primary hover:text-white transition-colors flex-shrink-0"
          >
            View Plans
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600 mt-2 sm:mt-3">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Available on Credit Cards & Bajaj Finserv</span>
        </div>
      </motion.div>

      {/* Detailed EMI Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCalculator(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                  <h3 className="text-xl font-bold text-dark">EMI Calculator</h3>
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto flex-1">
                  {/* Product Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* EMI Options */}
                  <h4 className="font-semibold mb-3 text-dark">Select Tenure</h4>
                  <div className="space-y-3 mb-6">
                    {emiOptions.map((option) => {
                      const emiAmount = calculateEMI(option.months);
                      const isSelected = selectedTenure === option.months;

                      return (
                        <button
                          key={option.months}
                          onClick={() => setSelectedTenure(option.months)}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Radio Button */}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-gray-300'
                              }`}>
                              {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-primary" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 text-left">
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="font-bold text-dark">{option.label}</span>
                                <span className="text-xl font-bold text-primary">
                                  ₹{emiAmount.toLocaleString('en-IN')}
                                  <span className="text-sm text-gray-600">/mo</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Total: ₹{price.toLocaleString('en-IN')}</span>
                                <span className="text-green-600 font-semibold">0% Interest</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-dark">Available On</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-sm">Credit Cards</p>
                          <p className="text-xs text-gray-600">All major banks</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-sm">Bajaj Finserv</p>
                          <p className="text-xs text-gray-600">EMI Card</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-gray-600">
                    <ul className="space-y-1">
                      <li>• 0% interest applicable on select banks</li>
                      <li>• Interest rate may vary for other banks (9-18% p.a.)</li>
                      <li>• EMI tenure subject to bank approval</li>
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex-shrink-0">
                  <button
                    onClick={() => setShowCalculator(false)}
                    className="w-full py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
