import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getCachedProducts } from '../utils/productsCache';

// Critical above-the-fold components (load immediately)
import Hero from '../components/Hero';
import BrandsMarquee from '../components/BrandsMarquee';
import CTAButton from '../components/CTAButton';

// Lazy load conditional components (only shown when needed)
const QuizContainer = lazy(() => import('../components/Quiz/QuizContainer'));
const ExpertPromise = lazy(() => import('../components/ExpertPromise'));
const UserDataForm = lazy(() => import('../components/UserDataForm'));
const RazorpayPayment = lazy(() => import('../components/RazorpayPayment'));
const SuccessScreen = lazy(() => import('../components/SuccessScreen'));

// Lazy load below-the-fold components (visible after scroll)
const ProcessVideo = lazy(() => import('../components/ProcessVideo'));
const ScreenTimeReplacement = lazy(() => import('../components/ScreenTimeReplacement'));
const Accessories = lazy(() => import('../components/Accessories'));
const ValueProposition = lazy(() => import('../components/ValueProposition'));
const WhyUs = lazy(() => import('../components/WhyUs'));
const Community = lazy(() => import('../components/Community'));
const SocialProof = lazy(() => import('../components/SocialProof'));
const FAQ = lazy(() => import('../components/FAQ'));

// Loading fallback component
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function TestRideLandingPage({ onCTAClick: externalCTAClick }) {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(() => sessionStorage.getItem('test_ride_stage') || 'landing');
  const [quizAnswers, setQuizAnswers] = useState(() => {
    const saved = sessionStorage.getItem('test_ride_quiz');
    return saved ? JSON.parse(saved) : null;
  });
  const [userData, setUserData] = useState(null);
  const [leadId, setLeadId] = useState(() => sessionStorage.getItem('test_ride_lead_id'));
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [ctaSource, setCtaSource] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const heroRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // If restored to payment/success stage but missing required data, reset to userdata
  useEffect(() => {
    if ((currentStage === 'payment' || currentStage === 'success') && !userData) {
      setCurrentStage('userdata');
    }
  }, []);

  // Sync state to session storage
  useEffect(() => {
    sessionStorage.setItem('test_ride_stage', currentStage);
  }, [currentStage]);

  useEffect(() => {
    if (quizAnswers) sessionStorage.setItem('test_ride_quiz', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  useEffect(() => {
    if (leadId) sessionStorage.setItem('test_ride_lead_id', leadId);
  }, [leadId]);

  // Handle ?product=xxx — product-specific test ride flow (skip quiz)
  useEffect(() => {
    const productParam = searchParams.get('product');
    if (productParam) {
      (async () => {
        try {
          const allProducts = await getCachedProducts();
          const found = allProducts.find((p) => p.id === productParam);
          if (found) {
            setSelectedProduct(found);
            setCtaSource('product-detail');
            // Clear stale data for fresh lead
            setLeadId(null);
            setQuizAnswers(null);
            setUserData(null);
            sessionStorage.removeItem('test_ride_lead_id');
            sessionStorage.removeItem('test_ride_quiz');
            setCurrentStage('userdata');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (err) {
          console.error('Failed to load product for test ride:', err);
        }
      })();
      setSearchParams({}, { replace: true });
      return;
    }

    if (searchParams.get('open') === 'true') {
      handleStartQuiz('direct-nav');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Sticky CTA visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current && currentStage === 'landing') {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyCTA(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentStage]);

  const handleStartQuiz = (source = 'test-ride-landing') => {
    setCtaSource(source);
    // Clear stale data so a fresh lead is always created
    setLeadId(null);
    setQuizAnswers(null);
    setUserData(null);
    sessionStorage.removeItem('test_ride_lead_id');
    sessionStorage.removeItem('test_ride_quiz');
    setCurrentStage('userdata');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Expose handleStartQuiz to parent via callback
  useEffect(() => {
    if (externalCTAClick) {
      // This allows the header to trigger the quiz
    }
  }, [externalCTAClick]);

  const handleQuizComplete = async (answers) => {
    setQuizAnswers(answers);

    // Update lead with quiz answers
    if (leadId) {
      try {
        await api.updateLead(leadId, {
          quizAnswers: answers
        });
        console.log('✅ Lead updated successfully with quiz answers:', leadId, answers);
      } catch (error) {
        console.error('❌ Error updating lead with quiz answers:', error);
        // We continue anyway even if update fails, to not block the user
      }
    } else {
      console.warn('⚠️ No leadId found, cannot update lead with quiz answers');
    }

    // Progress to payment
    setCurrentStage('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToUserData = () => {
    setCurrentStage('userdata');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserDataSubmit = async (data) => {
    setUserData(data);

    // Build lead data — include product info if coming from product page
    const leadData = {
      name: data.name,
      phone: data.phone,
      category: 'Test Ride',
      source: ctaSource || 'test-ride-landing',
    };

    if (selectedProduct) {
      leadData.quizAnswers = {
        interestedProduct: selectedProduct.name,
        productId: selectedProduct.id,
        category: selectedProduct.category,
        price: selectedProduct.price,
      };
    }

    // If lead already exists, update it instead of creating a new one
    if (leadId) {
      try {
        await api.updateLead(leadId, {
          name: data.name,
          phone: data.phone,
          ...(selectedProduct ? { quizAnswers: leadData.quizAnswers } : {})
        });
        console.log('✅ Lead updated with new contact info:', leadId);
      } catch (error) {
        console.error('❌ Error updating lead info:', error);
      }
    } else {
      // Create lead immediately after contact info is submitted
      try {
        const lead = await api.saveLead(leadData);
        setLeadId(lead.id);
        console.log('✅ Lead created early:', lead.id, lead);
      } catch (error) {
        console.error('❌ Error creating lead early:', error);
        alert('Something went wrong. Please try again.');
        return;
      }
    }

    // If product-specific flow, skip quiz → go straight to payment
    if (selectedProduct) {
      setQuizAnswers(leadData.quizAnswers);
      setCurrentStage('payment');
    } else {
      setCurrentStage('quiz');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);

    // Track Google Ads conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11326000229/O5i-CNWt6-kbEOWY1Jgq',
        'transaction_id': paymentData.paymentId || '',
        'value': 99.0,
        'currency': 'INR'
      });
      console.log('Google Ads conversion tracked:', paymentData.paymentId);
    }

    // Track Google Tag Manager purchase success event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'purchase_success'
    });
    console.log('GTM purchase_success event tracked');

    setCurrentStage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentError = (error) => {
    if (error.code === 'PAYMENT_CANCELLED') return;
    console.error('Payment error:', error);
    alert('Payment failed: ' + error.description + '. Please try again.');
  };

  const handleBackToLanding = () => {
    setCurrentStage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render success screen as full page replacement (optional, but keeps it clean)
  if (currentStage === 'success') {
    return (
      <Suspense fallback={<ComponentLoader />}>
        <SuccessScreen userData={userData} />
      </Suspense>
    );
  }

  // Landing page (with layout) - Quiz shows as overlay on top
  return (
    <div className="relative">
      {/* Modal Overlays */}
      {currentStage === 'expertPromise' && (
        <Suspense fallback={<ComponentLoader />}>
          <ExpertPromise
            quizAnswers={quizAnswers}
            onContinue={handleContinueToUserData}
          />
        </Suspense>
      )}

      {currentStage === 'userdata' && (
        <Suspense fallback={<ComponentLoader />}>
          <UserDataForm
            onSubmit={handleUserDataSubmit}
            onBack={() => { if (selectedProduct) { navigate(`/products/${selectedProduct.id}`); } else { setCurrentStage('landing'); } }}
            skipConfirmation={true}
            submitLabel={selectedProduct ? 'Continue to Payment' : 'Continue'}
            stepLabel={selectedProduct ? 'Step 1 of 2' : 'Step 1 of 3'}
            selectedProduct={selectedProduct}
          />
        </Suspense>
      )}

      {currentStage === 'quiz' && (
        <Suspense fallback={<ComponentLoader />}>
          <QuizContainer
            onComplete={handleQuizComplete}
            onBack={() => setCurrentStage('userdata')}
          />
        </Suspense>
      )}

      {currentStage === 'payment' && userData && (
        <Suspense fallback={<ComponentLoader />}>
          <RazorpayPayment
            userData={userData}
            quizAnswers={quizAnswers}
            leadId={leadId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onBack={() => setCurrentStage(selectedProduct ? 'userdata' : 'quiz')}
            onCancel={() => { if (selectedProduct) { navigate(`/products/${selectedProduct.id}`); } else { setCurrentStage('landing'); } }}
            selectedProduct={selectedProduct}
          />
        </Suspense>
      )}
      {/* Main landing sections */}
      <div ref={heroRef}>
        <Hero onCTAClick={() => handleStartQuiz('test-ride-hero')} />
      </div>
      <BrandsMarquee />

      {/* Below-the-fold sections - lazy loaded */}
      <Suspense fallback={<ComponentLoader />}>
        {/* Phase 2: Process Video - How Home Test Ride Works */}
        <ProcessVideo onCTAClick={() => handleStartQuiz('test-ride-process')} />

        {/* Phase 2: Screen Time Replacement */}
        <ScreenTimeReplacement />

        {/* Phase 3: Accessories */}
        <Accessories onCTAClick={() => handleStartQuiz('test-ride-accessories')} />

        <ValueProposition />

        <WhyUs />

        {/* Phase 3: Community */}
        <div className="hidden md:block">
          <Community onCTAClick={() => handleStartQuiz('test-ride-community')} />
        </div>

        <SocialProof onCTAClick={() => handleStartQuiz('test-ride-final-cta')} />

        <FAQ />
      </Suspense>

      {/* Sticky mobile CTA */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-bottom">
          <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex justify-center">
            <CTAButton
              onClick={() => handleStartQuiz('test-ride-sticky-cta')}
              className="w-full"
            >
              BOOK NOW
            </CTAButton>
          </div>
          <p className="text-center text-xs text-gray-text mt-2 font-medium">
            ₹99 BOOKING FEE • ADJUSTABLE ON PURCHASE
          </p>
        </div>
      )}
    </div>
  );
}
