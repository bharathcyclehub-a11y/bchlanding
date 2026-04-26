import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DropdownAdvanced({
  label = "Select Option",
  options = [],
  value,
  onChange,
  placeholder = "Choose an option...",
  className = "",
  searchable = false,
  showIcons = false,
  multiSelect = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  const selectedOption = multiSelect
    ? options.filter(opt => value?.includes(opt.value))
    : options.find(opt => opt.value === value);

  const filteredOptions = searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (option) => {
    if (multiSelect) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiSelect ? [] : '');
  };

  const displayText = () => {
    if (multiSelect && selectedOption?.length > 0) {
      return selectedOption.length === 1
        ? selectedOption[0].label
        : `${selectedOption.length} selected`;
    }
    return selectedOption?.label || placeholder;
  };

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
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative w-full px-6 py-4 rounded-[20px] text-left transition-all duration-300
          flex items-center justify-between gap-3 overflow-hidden
          bg-gradient-to-br from-white via-gray-bg/30 to-white
          border-2 border-dark/10 hover:border-primary/50
          shadow-lg hover:shadow-xl hover:shadow-primary/10
          ${isOpen ? 'ring-2 ring-primary ring-offset-2 border-primary' : ''}
        `}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
          animate={{
            x: isOpen ? ['-100%', '100%'] : '0%',
          }}
          transition={{
            duration: 1.5,
            repeat: isOpen ? Infinity : 0,
            ease: "linear"
          }}
        />

        <div className="relative flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          {showIcons && selectedOption && !multiSelect && selectedOption.icon && (
            <span className="text-2xl flex-shrink-0">{selectedOption.icon}</span>
          )}

          <span className={`font-medium truncate ${selectedOption ? 'text-dark' : 'text-gray-text'}`}>
            {displayText()}
          </span>
        </div>

        <div className="relative flex items-center gap-2">
          {/* Clear button */}
          {(value && (multiSelect ? value.length > 0 : true)) && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleClear}
              className="p-1 hover:bg-primary/10 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-text hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}

          {/* Animated Chevron */}
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="w-5 h-5 text-primary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="absolute z-50 w-full mt-2 rounded-[20px] overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl shadow-primary/20"
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-3 border-b border-dark/10">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 rounded-[15px] bg-gray-bg border border-dark/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto py-2">
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-text">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No options found</p>
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiSelect
                    ? value?.includes(option.value)
                    : value === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(option)}
                      whileHover={{ x: 4, backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
                      className={`
                        relative w-full px-5 py-3 text-left transition-all duration-200
                        ${isSelected ? 'bg-gradient-to-r from-primary to-primary-dark text-white' : 'text-dark'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Multi-select checkbox */}
                        {multiSelect && (
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                            ${isSelected ? 'bg-white border-white' : 'border-dark/30'}
                          `}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}

                        {/* Icon */}
                        {showIcons && option.icon && (
                          <span className="text-2xl flex-shrink-0">{option.icon}</span>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className={`text-sm mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-text'}`}>
                              {option.description}
                            </div>
                          )}
                        </div>

                        {/* Selected indicator (single select) */}
                        {!multiSelect && isSelected && (
                          <motion.svg
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </motion.svg>
                        )}
                      </div>

                      {/* Hover indicator line */}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        initial={{ scaleY: 0 }}
                        whileHover={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Multi-select footer */}
            {multiSelect && value?.length > 0 && (
              <div className="p-3 border-t border-dark/10 bg-gray-bg/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-text">
                    {value.length} item{value.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition-colors text-xs uppercase tracking-wide"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
