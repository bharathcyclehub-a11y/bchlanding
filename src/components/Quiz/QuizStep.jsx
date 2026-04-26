import { motion } from 'framer-motion';

export default function QuizStep({ question, options, onSelect, selectedValue }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <h3 className="font-display text-3xl sm:text-4xl font-normal text-dark mb-8 text-center uppercase tracking-wide">
        {question}
      </h3>

      <div className="grid gap-3 sm:gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              group relative w-full p-5 sm:p-6 rounded-[20px] text-left transition-all duration-300
              ${selectedValue === option.value
                ? 'bg-primary text-white shadow-lg scale-[1.02]'
                : 'bg-white border-2 border-dark/10 hover:border-primary/50 hover:shadow-md'
              }
            `}
            aria-pressed={selectedValue === option.value}
          >
            <div className="flex items-start gap-4">
              {/* Radio indicator */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all
                ${selectedValue === option.value
                  ? 'border-white bg-white'
                  : 'border-dark/30 group-hover:border-primary'
                }
              `}>
                {selectedValue === option.value && (
                  <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`
                  text-lg font-bold mb-1 transition-colors uppercase tracking-wide
                  ${selectedValue === option.value ? 'text-white' : 'text-dark group-hover:text-primary'}
                `}>
                  {option.label}
                </div>
                {option.description && (
                  <div className={`
                    text-sm leading-relaxed transition-colors
                    ${selectedValue === option.value ? 'text-white/80' : 'text-gray-text group-hover:text-dark'}
                  `}>
                    {option.description}
                  </div>
                )}
              </div>

              {/* Selection indicator icon */}
              {selectedValue === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
