import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quizQuestions = [
  {
    id: 'user',
    question: "Who is the bicycle for?",
    placeholder: "Select an option...",
    options: [
      { label: "Child (3-6 years)", value: "child_3_6" },
      { label: "Child (7-12 years)", value: "child_7_12" },
      { label: "Teenager", value: "teen" },
      { label: "Adult", value: "adult" }
    ]
  },
  {
    id: 'height',
    question: "What is the approximate height of the rider?",
    placeholder: "Select height range...",
    options: [
      { label: "Under 3 feet", value: "under_3ft" },
      { label: "3 - 4 feet", value: "3_4ft" },
      { label: "4 - 5 feet", value: "4_5ft" },
      { label: "Above 5 feet", value: "above_5ft" }
    ]
  },
  {
    id: 'timeline',
    question: "What is your preferred purchase window?",
    placeholder: "Select timeline...",
    options: [
      { label: "Immediate (This week)", value: "this_week" },
      { label: "Planned (This month)", value: "this_month" },
      { label: "Researching / Exploring", value: "exploring" }
    ]
  },
  {
    id: 'priority',
    question: "What is your primary requirement?",
    placeholder: "Select priority...",
    options: [
      { label: "Safety First", value: "safety" },
      { label: "Modern Style", value: "style" },
      { label: "Long-term Durability", value: "durability" },
      { label: "Optimal Value", value: "value" }
    ]
  },
  {
    id: 'experience',
    question: "What is the rider's current cycling experience?",
    placeholder: "Select experience level...",
    options: [
      { label: "Absolute Beginner", value: "beginner" },
      { label: "Using Training Wheels", value: "training_wheels" },
      { label: "Confident Rider", value: "confident" },
      { label: "Advanced / Enthusiast", value: "advanced" }
    ]
  },
  {
    id: 'terrain',
    question: "Where will the bicycle primarily be used?",
    placeholder: "Select primary terrain...",
    options: [
      { label: "Gated Community / Parks", value: "community" },
      { label: "Paved City Roads", value: "roads" },
      { label: "Off-road / Trails", value: "trails" },
      { label: "Versatile (Mixed Surfaces)", value: "versatile" }
    ]
  },
  {
    id: 'usage',
    question: "How frequently do you anticipate use?",
    placeholder: "Select usage frequency...",
    options: [
      { label: "Everyday Commute/Play", value: "daily" },
      { label: "Weekend Leisure", value: "weekends" },
      { label: "Occasional Use", value: "occasional" }
    ]
  },
  {
    id: 'braking',
    question: "What is your preference for braking systems?",
    placeholder: "Select braking type...",
    options: [
      { label: "Coaster Brakes (Backpedal)", value: "coaster" },
      { label: "Standard Hand Brakes", value: "hand_brakes" },
      { label: "Advanced Disc Brakes", value: "disc_brakes" },
      { label: "Recommend the Safest Option", value: "safest" }
    ]
  },
  {
    id: 'accessory',
    question: "Which accessory is most important to you?",
    placeholder: "Select primary accessory...",
    options: [
      { label: "Complete Safety Gear Set", value: "safety_gear" },
      { label: "Supportive Training Wheels", value: "training_wheels" },
      { label: "Utility Basket/Carrier", value: "basket" },
      { label: "Heavy-duty Security Lock", value: "lock" }
    ]
  },
  {
    id: 'growth',
    question: "How important is adjustability for future growth?",
    placeholder: "Select importance...",
    options: [
      { label: "Critically Important", value: "high" },
      { label: "Moderately Important", value: "moderate" },
      { label: "Not a Primary Concern", value: "low" }
    ]
  }
];

// ============================================
// SIMPLE DROPDOWN COMPONENT
// ============================================
function SimpleDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  questionNumber
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
        } else {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prev => prev < options.length - 1 ? prev + 1 : 0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : options.length - 1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  }, [isOpen, focusedIndex, options, onChange]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div ref={dropdownRef} className="w-full" onKeyDown={handleKeyDown}>
      {/* Question label with number */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
          {questionNumber}
        </span>
        <span className="text-dark font-semibold uppercase tracking-wide text-sm">
          {quizQuestions[questionNumber - 1]?.question}
        </span>
      </div>

      {/* Dropdown trigger */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        whileTap={{ scale: 0.99 }}
        className={`
          w-full px-5 py-4 rounded-xl text-left
          transition-all duration-200
          bg-white border-2
          ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary/50'}
          flex items-center justify-between gap-3
        `}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-primary'}>
          {selectedOption?.label || placeholder}
        </span>

        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-primary flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown menu - inline, not absolute */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl bg-white border-2 border-gray-100 shadow-lg overflow-hidden"
              role="listbox"
            >
              {options.map((option, index) => {
                const isSelected = value === option.value;
                const isFocused = focusedIndex === index;

                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`
                      w-full px-5 py-3 text-left transition-all duration-150
                      flex items-center justify-between
                      ${isSelected
                        ? 'bg-primary text-white'
                        : isFocused
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {option.label}
                    </span>

                    {isSelected && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MAIN QUIZ CONTAINER
// ============================================
export default function QuizContainer({ onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedValue = answers[currentQuestion.id];
  const isComplete = Object.keys(answers).length === quizQuestions.length;

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Auto-advance to next question after selection
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  const handleSubmit = (e) => {
    e.stopPropagation();
    if (isComplete) {
      setIsSubmitting(true);
      setTimeout(() => {
        onComplete(answers);
      }, 400);
    }
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
      onClick={onBack}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

        {/* Content */}
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary uppercase tracking-wide text-center mb-6">
            Find Your Perfect Bike
          </h2>

          {/* Dropdown */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SimpleDropdown
                options={currentQuestion.options}
                value={selectedValue}
                onChange={handleSelect}
                placeholder={currentQuestion.placeholder}
                questionNumber={currentQuestionIndex + 1}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            {/* Previous */}
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`
                flex items-center gap-2 text-sm font-medium transition-all
                ${currentQuestionIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${index === currentQuestionIndex
                      ? 'bg-primary w-4'
                      : index < currentQuestionIndex
                        ? 'bg-primary'
                        : 'bg-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            {/* Submit (only when complete) */}
            {isComplete ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Wait...
                  </>
                ) : (
                  <>
                    Submit
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </motion.button>
            ) : (
              <div className="w-20" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
