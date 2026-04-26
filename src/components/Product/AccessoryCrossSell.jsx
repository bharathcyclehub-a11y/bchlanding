import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accessories } from '../../data/accessories';
import { bundles } from '../../data/bundles';
import AccessoryCard from './AccessoryCard';
import LazyImage from '../LazyImage';

export default function AccessoryCrossSell({ accessoryIds, productCategory, productPrice }) {
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);

  // Filter available accessories
  const availableAccessories = useMemo(() => {
    if (!accessoryIds || accessoryIds.length === 0) return [];

    return accessories.filter(acc =>
      accessoryIds.includes(acc.id) &&
      (acc.compatibleWith.includes('all') || acc.compatibleWith.includes(productCategory))
    );
  }, [accessoryIds, productCategory]);

  // Filter compatible bundles
  const compatibleBundles = useMemo(() => {
    return bundles.filter(b =>
      b.compatibleCategories.includes(productCategory) ||
      b.compatibleCategories.includes('all')
    );
  }, [productCategory]);

  // Don't render if no accessories or bundles
  if (availableAccessories.length === 0 && compatibleBundles.length === 0) {
    return null;
  }

  const toggleAccessory = (accId) => {
    setSelectedAccessories(prev =>
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
    setSelectedBundle(null); // Clear bundle selection when individual item selected
  };

  const selectBundle = (bundle) => {
    if (selectedBundle?.id === bundle.id) {
      setSelectedBundle(null);
      setSelectedAccessories([]);
    } else {
      setSelectedBundle(bundle);
      setSelectedAccessories(bundle.items);
    }
  };

  const calculateTotal = () => {
    if (selectedBundle) {
      return productPrice + selectedBundle.bundlePrice;
    }

    const accessoryTotal = selectedAccessories.reduce((sum, accId) => {
      const acc = accessories.find(a => a.id === accId);
      return sum + (acc?.price || 0);
    }, 0);

    return productPrice + accessoryTotal;
  };

  const getSavings = () => {
    if (selectedBundle) {
      return selectedBundle.savings;
    }

    return selectedAccessories.reduce((sum, accId) => {
      const acc = accessories.find(a => a.id === accId);
      return sum + ((acc?.mrp || 0) - (acc?.price || 0));
    }, 0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 sm:mt-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider">
            Complete Your <span className="text-primary">Bike</span>
          </h2>
          <p className="text-sm text-gray-text mt-1">
            Essential accessories for a better riding experience
          </p>
        </div>
      </div>

      {/* Bundle Deals */}
      {compatibleBundles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
            <span>🎁</span> Bundle & Save
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {compatibleBundles.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-72 sm:w-80 snap-start"
              >
                <BundleCard
                  bundle={bundle}
                  isSelected={selectedBundle?.id === bundle.id}
                  onSelect={() => selectBundle(bundle)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Accessories Grid */}
      <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
        <span>🛠️</span>
        {compatibleBundles.length > 0 ? 'Or Choose Individual Items' : 'Recommended Accessories'}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {availableAccessories.map((accessory, index) => (
          <motion.div
            key={accessory.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <AccessoryCard
              accessory={accessory}
              isSelected={selectedAccessories.includes(accessory.id)}
              onToggle={() => toggleAccessory(accessory.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Total & CTA */}
      <AnimatePresence>
        {(selectedAccessories.length > 0 || selectedBundle) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mt-6 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  {selectedBundle
                    ? `${selectedBundle.name} Bundle`
                    : `${selectedAccessories.length} ${selectedAccessories.length === 1 ? 'accessory' : 'accessories'} selected`}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold">
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </span>
                  {getSavings() > 0 && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                      Save ₹{getSavings().toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-75 mt-1">
                  Includes bike + {selectedBundle ? 'bundle' : 'selected accessories'}
                </p>
              </div>

              <button
                onClick={() => {
                  // TODO: Open enquiry modal with selected items
                  alert(`Total: ₹${calculateTotal().toLocaleString('en-IN')}\nSelected: ${selectedAccessories.length} items`);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white text-primary rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add All to Enquiry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

// Bundle Card Component
function BundleCard({ bundle, isSelected, onSelect }) {
  const discount = bundle.totalMrp > bundle.bundlePrice
    ? Math.round(((bundle.totalMrp - bundle.bundlePrice) / bundle.totalMrp) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        bg-white rounded-2xl overflow-hidden cursor-pointer transition-all border-2
        ${isSelected
          ? 'border-primary shadow-xl shadow-primary/30 ring-4 ring-primary/20'
          : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-orange-50 p-4 relative">
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {discount}% OFF
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎁</span>
          </div>
          <div>
            <h4 className="font-bold text-dark line-clamp-2 leading-snug">
              {bundle.name}
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {bundle.description}
            </p>
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
          Includes {bundle.items.length} items:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {bundle.items.slice(0, 4).map((itemId) => {
            const item = accessories.find(a => a.id === itemId);
            if (!item) return null;

            return (
              <div key={itemId} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <LazyImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-700 line-clamp-2 leading-tight">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
        {bundle.items.length > 4 && (
          <p className="text-xs text-gray-500 mt-2 italic">
            + {bundle.items.length - 4} more items
          </p>
        )}
      </div>

      {/* Pricing */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-primary">
            ₹{bundle.bundlePrice.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ₹{bundle.totalMrp.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-green-600 font-bold">
            Save ₹{bundle.savings.toLocaleString('en-IN')}
          </span>
          {isSelected && (
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full font-bold">
              ✓ Selected
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
