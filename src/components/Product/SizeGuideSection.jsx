import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '../Dropdown';

export default function SizeGuideSection({ sizeGuide, productName }) {
  if (!sizeGuide?.hasGuide) return null;

  const [openSection, setOpenSection] = useState('chart');
  const [height, setHeight] = useState('');
  const [inseam, setInseam] = useState('');
  const [fitFinderResult, setFitFinderResult] = useState(null);

  const heightOptions = [
    { label: '4\'10" - 5\'0"', value: '58-60' },
    { label: '5\'0" - 5\'4"', value: '60-64' },
    { label: '5\'4" - 5\'8"', value: '64-68' },
    { label: '5\'8" - 5\'10"', value: '68-70' },
    { label: '5\'10" - 6\'0"', value: '70-72' },
    { label: '6\'0" - 6\'2"', value: '72-74' },
    { label: '6\'2" - 6\'4"', value: '74-76' }
  ];

  const inseamOptions = [
    { label: '25" - 27"', value: '25-27' },
    { label: '27" - 29"', value: '27-29' },
    { label: '29" - 31"', value: '29-31' },
    { label: '31" - 33"', value: '31-33' },
    { label: '33" - 35"', value: '33-35' },
    { label: '35" - 37"', value: '35-37' }
  ];

  const calculateFit = () => {
    if (!height) return;

    // Parse height range midpoint
    const [min, max] = height.split('-').map(Number);
    const avgHeight = (min + max) / 2;

    // Find best size match
    let bestSize = sizeGuide.sizes[0];

    for (const size of sizeGuide.sizes) {
      // Extract height range from size
      const heightStr = size.riderHeight;
      const match = heightStr.match(/(\d+)'(\d+)" - (\d+)'(\d+)"/);
      if (match) {
        const [, minFt, minIn, maxFt, maxIn] = match;
        const minInches = parseInt(minFt) * 12 + parseInt(minIn);
        const maxInches = parseInt(maxFt) * 12 + parseInt(maxIn);
        const midInches = (minInches + maxInches) / 2;

        if (Math.abs(avgHeight - midInches) < Math.abs(avgHeight - ((parseInt(bestSize.riderHeight.match(/(\d+)'(\d+)"/)[1]) * 12 + parseInt(bestSize.riderHeight.match(/(\d+)'(\d+)"/)[2])) + (parseInt(bestSize.riderHeight.match(/(\d+)'(\d+)" - (\d+)'(\d+)"/)[3]) * 12 + parseInt(bestSize.riderHeight.match(/(\d+)'(\d+)" - (\d+)'(\d+)"/)[4]))) / 2)) {
          bestSize = size;
        }
      }
    }

    setFitFinderResult(bestSize);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 sm:mt-16"
    >
      <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider mb-6">
        Size <span className="text-primary">Guide</span>
      </h2>

      <div className="space-y-3">
        {/* Size Chart */}
        <AccordionItem
          title="📏 Size Chart"
          isOpen={openSection === 'chart'}
          onToggle={() => setOpenSection(openSection === 'chart' ? null : 'chart')}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-bg">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-dark">Size</th>
                  <th className="px-4 py-3 text-left font-bold text-dark">Frame</th>
                  <th className="px-4 py-3 text-left font-bold text-dark">Rider Height</th>
                  <th className="px-4 py-3 text-left font-bold text-dark">Inseam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizeGuide.sizes.map((size, i) => (
                  <motion.tr
                    key={size.size}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-primary text-base">{size.size}</td>
                    <td className="px-4 py-3 text-gray-700">{size.frame}</td>
                    <td className="px-4 py-3 text-gray-700">{size.riderHeight}</td>
                    <td className="px-4 py-3 text-gray-700">{size.inseam}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sizeGuide.fitTips && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="font-bold text-dark mb-2 flex items-center gap-2">
                <span>💡</span> Perfect Fit Tips
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {sizeGuide.fitTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AccordionItem>

        {/* Fit Finder */}
        <AccordionItem
          title="🎯 Find Your Perfect Size"
          isOpen={openSection === 'finder'}
          onToggle={() => setOpenSection(openSection === 'finder' ? null : 'finder')}
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-dark mb-2">Your Height *</label>
              <select
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setFitFinderResult(null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Select your height...</option>
                {heightOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-dark mb-2">Inseam Length (Optional)</label>
              <select
                value={inseam}
                onChange={(e) => {
                  setInseam(e.target.value);
                  setFitFinderResult(null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Select inseam...</option>
                {inseamOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={calculateFit}
            disabled={!height}
            className="w-full py-3 rounded-full bg-dark text-white font-bold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fitFinderResult ? 'Recalculate' : 'Find My Size'}
          </button>

          <AnimatePresence>
            {fitFinderResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mt-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-2xl p-6 text-center"
              >
                <div className="text-7xl font-bold text-primary mb-2">
                  {fitFinderResult.size}
                </div>
                <p className="text-lg font-bold text-dark mb-1">
                  Recommended Size for {productName}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Frame: {fitFinderResult.frame} | For riders {fitFinderResult.riderHeight}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-white/60 rounded-lg py-2 px-4 inline-flex">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">Perfect Match!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AccordionItem>

        {/* How to Measure */}
        <AccordionItem
          title="📐 How to Measure Yourself"
          isOpen={openSection === 'measure'}
          onToggle={() => setOpenSection(openSection === 'measure' ? null : 'measure')}
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📏</span>
              </div>
              <h4 className="font-bold text-dark mb-2">Measuring Height</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Stand barefoot against a wall</li>
                <li>Place a book flat on your head</li>
                <li>Mark the wall at the bottom of the book</li>
                <li>Measure from floor to the mark</li>
              </ol>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📖</span>
              </div>
              <h4 className="font-bold text-dark mb-2">Measuring Inseam</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Stand with your back against a wall</li>
                <li>Place a book between your legs, spine up</li>
                <li>Pull book up snugly (like sitting on saddle)</li>
                <li>Measure from top of book to floor</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700">
            <strong className="text-yellow-900">Pro Tip:</strong> Measure in the morning when your height is at its maximum. Wear the type of shoes you'll typically ride in for the most accurate fit.
          </div>
        </AccordionItem>
      </div>
    </motion.section>
  );
}

// Accordion Item Component
function AccordionItem({ title, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-dark text-left text-sm sm:text-base">{title}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-5 text-primary flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 pt-0 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
