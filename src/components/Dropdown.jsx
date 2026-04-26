import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dropdown({
  label = "Select Option",
  options = [],
  value,
  onChange,
  placeholder = "Choose an option...",
  className = "",
  variant = "default" // "default", "premium", "glass"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  // Variant styles
  const variantStyles = {
    default: {
      button: "bg-white border-2 border-dark/10 hover:border-primary/50",
      menu: "bg-white border-2 border-dark/10",
      item: "hover:bg-primary hover:text-white"
    },
    premium: {
      button: "bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 hover:border-primary shadow-lg hover:shadow-xl hover:shadow-primary/20",
      menu: "bg-gradient-to-br from-white to-gray-bg border-2 border-primary/20 shadow-2xl shadow-primary/10",
      item: "hover:bg-gradient-to-r hover:from-primary hover:to-primary-dark hover:text-white"
    },
    glass: {
      button: "bg-white/10 backdrop-blur-lg border border-white/20 hover:border-primary/50 shadow-xl",
      menu: "bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl",
      item: "hover:bg-primary/90 hover:text-white hover:backdrop-blur-sm"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-bold text-dark uppercase tracking-wide mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full px-5 py-4 rounded-[20px] text-left transition-all duration-300
          flex items-center justify-between gap-3
          ${styles.button}
          ${isOpen ? 'ring-2 ring-primary ring-offset-2' : ''}
        `}
      >
        <span className={`font-medium ${selectedOption ? 'text-dark' : 'text-gray-text'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Animated Chevron */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute z-50 w-full mt-2 rounded-[20px] overflow-hidden
              ${styles.menu}
            `}
          >
            <div className="max-h-64 overflow-y-auto py-2">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelect(option)}
                  whileHover={{ x: 4 }}
                  className={`
                    w-full px-5 py-3 text-left transition-all duration-200
                    ${styles.item}
                    ${value === option.value ? 'bg-primary text-white font-bold' : 'text-dark'}
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className={`text-sm mt-0.5 ${value === option.value ? 'text-white/80' : 'text-gray-text'}`}>
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* Selected indicator */}
                    {value === option.value && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
