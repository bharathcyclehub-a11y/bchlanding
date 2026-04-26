import { motion } from 'framer-motion';
import LazyImage from '../LazyImage';

export default function AccessoryCard({ accessory, isSelected, onToggle }) {
  const { name, price, mrp, image, badge } = accessory;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        bg-white rounded-xl overflow-hidden shadow-md border-2 transition-all cursor-pointer
        ${isSelected ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'}
      `}
      onClick={onToggle}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        {badge && (
          <span className="absolute top-2 left-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full bg-orange-500 text-white shadow-md">
            {badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-2 right-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white shadow-md">
            {discount}% OFF
          </span>
        )}

        {/* Selection Indicator */}
        <motion.div
          initial={false}
          animate={{
            scale: isSelected ? 1 : 0,
            opacity: isSelected ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
        >
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-xs sm:text-sm font-bold text-dark line-clamp-2 leading-snug mb-2 min-h-[2.5rem] sm:min-h-[2.8rem]">
          {name}
        </h4>

        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-primary">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] sm:text-xs text-green-600 font-bold">
                Save ₹{(mrp - price).toLocaleString('en-IN')}
              </span>
            </>
          )}
        </div>

        {/* Add to Selection CTA (shows on hover for desktop, always visible on mobile) */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs font-bold">
            {isSelected ? (
              <>
                <span className="text-primary">✓</span>
                <span className="text-primary">Selected</span>
              </>
            ) : (
              <>
                <span className="text-gray-400">+</span>
                <span className="text-gray-600">Add to Bundle</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
