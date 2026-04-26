import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContinueButton from './ContinueButton';

const quizLabels = {
  user: {
    child_3_6: "Child (3-6 years)",
    child_7_12: "Child (7-12 years)",
    teen: "Teenager",
    adult: "Adult"
  },
  height: {
    under_3ft: "Under 3 feet",
    "3_4ft": "3 - 4 feet",
    "4_5ft": "4 - 5 feet",
    above_5ft: "Above 5 feet"
  },
  timeline: {
    this_week: "This week",
    this_month: "This month",
    exploring: "Just exploring"
  },
  priority: {
    safety: "Safety",
    style: "Style",
    durability: "Durability",
    value: "Value"
  },
  experience: {
    beginner: "Absolute Beginner",
    training_wheels: "Training Wheels",
    confident: "Confident",
    advanced: "Advanced"
  },
  terrain: {
    community: "Gated Community",
    roads: "Paved Roads",
    trails: "Off-road / Trails",
    versatile: "All-terrain"
  },
  usage: {
    daily: "Daily Use",
    weekends: "Weekend Leisure",
    occasional: "Occasional"
  },
  braking: {
    coaster: "Coaster Brakes",
    hand_brakes: "Hand Brakes",
    disc_brakes: "Disc Brakes",
    safest: "Safest Recommended"
  },
  accessory: {
    safety_gear: "Safety Gear",
    training_wheels: "Training Wheels",
    basket: "Basket/Carrier",
    lock: "Security Lock"
  },
  growth: {
    high: "Critically Important",
    moderate: "Moderately Important",
    low: "Not Primary Concern"
  }
};

const quizQuestionLabels = {
  user: "Target User",
  height: "Rider Height",
  timeline: "Purchase Window",
  priority: "Primary Need",
  experience: "Skill Level",
  terrain: "Primary Terrain",
  usage: "Frequency",
  braking: "Braking System",
  accessory: "Main Accessory",
  growth: "Adjustability"
};

export default function UserDataForm({ onSubmit, onBack, quizAnswers, skipConfirmation = false, submitLabel = "Continue", stepLabel = "Step 1 of 3", selectedProduct }) {
  const [step, setStep] = useState(1); // 1 = contact info, 2 = confirmation
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should contain only letters';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return 'Enter a valid 10-digit Indian mobile number';
    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (touched[field]) {
      const error = field === 'name' ? validateName(value) : validatePhone(value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field];
    const error = field === 'name' ? validateName(value) : validatePhone(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleContinueToStep2 = (e) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);

    setErrors({ name: nameError, phone: phoneError });
    setTouched({ name: true, phone: true });

    if (!nameError && !phoneError) {
      if (skipConfirmation) {
        onSubmit(formData);
      } else {
        setStep(2);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto safe-bottom"
      onClick={(e) => {
        if (e.target === e.currentTarget && onBack) {
          onBack();
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-lg"
            >
              {/* Card - Step 1: Contact Info */}
              <div className="bg-white rounded-[20px] shadow-2xl p-6 sm:p-8 border-t-6 border-primary">
                {/* Back button */}
                {onBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-text hover:text-primary transition-colors mb-4 group"
                  >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-semibold">Back</span>
                  </button>
                )}

                {/* Product info card — shown when booking from product page */}
                {selectedProduct && (
                  <div className="flex items-center gap-3 p-3 mb-5 bg-gray-bg rounded-xl border border-gray-200">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-dark truncate">{selectedProduct.name}</p>
                      <p className="text-xs text-gray-text">Test ride this bike at our store</p>
                    </div>
                    <span className="ml-auto text-sm font-bold text-primary flex-shrink-0">
                      ₹{selectedProduct.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-3"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.div>

                  <h2 className="font-display text-2xl sm:text-3xl font-normal text-dark mb-2 uppercase tracking-wider">
                    {selectedProduct ? 'Book Your Test Ride' : 'Contact Details'}
                  </h2>
                  <p className="text-gray-text text-sm">
                    {selectedProduct ? 'Enter your details to book for ₹99' : 'Share your details so our expert can reach you'}
                  </p>
                </div>

                <form onSubmit={handleContinueToStep2} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-dark mb-1.5 uppercase tracking-wide">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`
                          w-full px-4 py-3 rounded-[15px] bg-gray-bg border-2 text-dark placeholder-gray-text transition-all duration-300 text-base font-medium
                          ${errors.name && touched.name
                            ? 'border-primary focus:border-primary focus:ring-4 focus:ring-primary/20'
                            : 'border-dark/10 focus:border-primary focus:ring-4 focus:ring-primary/20'
                          }
                          outline-none
                        `}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                      {!errors.name && formData.name && touched.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    {errors.name && touched.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-primary flex items-center gap-1 font-medium"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-dark mb-1.5 uppercase tracking-wide">
                      Mobile Number <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-text">
                        <span className="text-base">IN</span>
                        <span className="text-base font-bold">+91</span>
                        <div className="w-px h-5 bg-dark/10" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onBlur={() => handleBlur('phone')}
                        className={`
                          w-full pl-24 pr-4 py-3 rounded-[15px] bg-gray-bg border-2 text-dark placeholder-gray-text transition-all duration-300 text-base font-medium
                          ${errors.phone && touched.phone
                            ? 'border-primary focus:border-primary focus:ring-4 focus:ring-primary/20'
                            : 'border-dark/10 focus:border-primary focus:ring-4 focus:ring-primary/20'
                          }
                          outline-none
                        `}
                        placeholder="9876543210"
                        autoComplete="tel"
                        maxLength="10"
                      />
                      {!errors.phone && formData.phone.length === 10 && touched.phone && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    {errors.phone && touched.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-primary flex items-center gap-1 font-medium"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* Privacy note */}
                  <div className="p-3 rounded-[15px] bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-dark leading-relaxed font-medium">
                        Your information is secure and will only be used to coordinate your home visit
                      </p>
                    </div>
                  </div>

                  {/* Continue button */}
                  <ContinueButton
                    type="submit"
                    disabled={!formData.name || !formData.phone || errors.name || errors.phone}
                  >
                    {submitLabel}
                  </ContinueButton>
                </form>

                {/* Form progress indicator */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  {(selectedProduct ? [1, 2] : [1, 2, 3]).map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${s === 1 ? 'w-8 bg-primary' : 'w-4 bg-dark/20'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-text mt-2 font-bold uppercase tracking-wide">
                  {stepLabel}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-lg"
            >
              {/* Card - Step 2: Confirmation */}
              <div className="bg-white rounded-[20px] shadow-2xl p-8 sm:p-10 border-t-6 border-primary">
                {/* Back button */}
                <button
                  onClick={handleBackToStep1}
                  className="flex items-center gap-2 text-gray-text hover:text-primary transition-colors mb-6 group"
                >
                  <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-semibold">Back</span>
                </button>

                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>

                  <h2 className="font-display text-3xl sm:text-4xl font-normal text-dark mb-3 uppercase tracking-wider">
                    Confirm Details
                  </h2>
                  <p className="text-gray-text text-base">
                    Review your information before proceeding
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Contact Info Summary */}
                  <div className="p-4 rounded-[16px] bg-gray-bg border border-dark/10">
                    <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-text text-sm">Name</span>
                        <span className="text-dark font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-text text-sm">Phone</span>
                        <span className="text-dark font-medium">+91 {formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Answers Summary */}
                  {quizAnswers && (
                    <div className="p-4 rounded-[16px] bg-gray-bg border border-dark/10">
                      <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wide flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Your Preferences
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(quizAnswers).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-gray-text text-sm">{quizQuestionLabels[key] || key}</span>
                            <span className="text-dark font-medium text-sm">
                              {quizLabels[key]?.[value] || value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Info */}
                  <div className="p-4 rounded-[16px] bg-primary/5 border border-primary/20">
                    <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      What Happens Next
                    </h3>
                    <ul className="space-y-2 text-sm text-dark">
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Our expert will call you within 5 minutes
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Schedule a convenient home visit time
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Test ride 5 premium e-cycles at your home
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Continue to Payment button */}
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 rounded-[50px] font-bold text-lg transition-all duration-300 shadow-lg uppercase tracking-wide bg-primary text-white hover:bg-primary-dark hover:shadow-xl"
                >
                  Continue to Payment
                </motion.button>

                {/* Form progress indicator */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${s <= 2 ? 'w-8 bg-primary' : 'w-4 bg-dark/20'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-text mt-2 font-bold uppercase tracking-wide">
                  Step 2 of 3 • Payment next
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
