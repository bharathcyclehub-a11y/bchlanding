import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PayButton from './PayButton';

export default function RazorpayPayment({ userData: rawUserData, quizAnswers, leadId, onSuccess, onError, onBack, onCancel, selectedProduct }) {
  const userData = rawUserData ?? {};
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      onError({
        code: 'SDK_LOAD_FAILED',
        description: 'Failed to load payment gateway. Please refresh the page.'
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initiateRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      onError({
        code: 'SDK_NOT_LOADED',
        description: 'Payment gateway is still loading. Please try again.'
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadId: leadId,
          amount: 99, // Amount in rupees
          currency: 'INR'
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Step 2: Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Bharath Cycle Hub',
        description: 'Test Ride Booking Fee',
        order_id: orderData.order.id,
        prefill: {
          name: userData.name,
          contact: userData.phone,
          email: userData.email || ''
        },
        theme: {
          color: '#FF4500'
        },
        handler: async function (response) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                leadId: leadId
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                userData: userData,
                quizAnswers: quizAnswers
              });
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError({
              code: 'VERIFICATION_FAILED',
              description: error.message || 'Payment verification failed. Please contact support.'
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            onError({
              code: 'PAYMENT_CANCELLED',
              description: 'Payment was cancelled. Please try again.'
            });
          }
        }
      };

      // Step 4: Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setLoading(false);
        onError({
          code: response.error.code || 'PAYMENT_FAILED',
          description: response.error.description || 'Payment failed. Please try again.'
        });
      });

      rzp.open();

    } catch (error) {
      console.error('Razorpay payment error:', error);
      onError({
        code: 'PAYMENT_INIT_FAILED',
        description: error.message || 'Failed to initiate payment. Please try again.'
      });
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto safe-bottom"
      onClick={(e) => {
        if (e.target === e.currentTarget && onCancel) {
          onCancel();
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-[20px] shadow-2xl p-8 sm:p-10 border-t-6 border-primary relative">
            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-gray-400 hover:text-dark transition-colors rounded-full hover:bg-gray-100"
                aria-label="Back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={onCancel}
                className="p-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                aria-label="Cancel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </motion.div>

              <h2 className="font-display text-3xl sm:text-4xl font-normal text-dark mb-3 uppercase tracking-wider">
                Secure Payment
              </h2>
              <p className="text-gray-text text-base">
                Complete your booking securely
              </p>
            </div>

            {/* Selected Product Card */}
            {selectedProduct && (
              <div className="flex items-center gap-3 p-3 mb-6 bg-gray-bg rounded-xl border border-gray-200">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-dark truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-text">Test ride this bike at our store</p>
                </div>
                <span className="ml-auto text-sm font-bold text-primary flex-shrink-0">₹{selectedProduct.price?.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-gray-bg rounded-[20px] p-6 mb-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark/10">
                <span className="text-gray-text font-medium">Booking Fee</span>
                <span className="text-2xl font-display text-dark">₹99</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-text">Adjustable on bicycle purchase</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-text">Expert home visit included</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-text">{selectedProduct ? 'Test ride at our store' : '5 curated bicycle options'}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-blue-50 rounded-[20px] p-4 mb-6 border border-blue-200">
              <div className="text-sm">
                <div className="font-bold text-dark mb-2">Booking for:</div>
                <div className="text-gray-text space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{userData.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>+91 {userData.phone}</span>
                  </div>
                </div>
              </div>
            </div>



            {/* Payment Button */}
            <div className="flex justify-center">
              <PayButton
                onClick={initiateRazorpayPayment}
                loading={loading}
                disabled={!razorpayLoaded}
              />
            </div>

            {/* Security badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-text">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">Secure</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">Encrypted</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {(selectedProduct ? [1, 2] : [1, 2, 3]).map((step) => (
                <div
                  key={step}
                  className="h-1.5 rounded-full transition-all duration-300 w-8 bg-primary"
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-text mt-2 font-bold uppercase tracking-wide">
              {selectedProduct ? 'Step 2 of 2' : 'Step 3 of 3'} • Almost Done
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
