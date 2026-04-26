import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import LazyImage from '../components/LazyImage';
// Phase 1 Components
import ReviewSummary from '../components/Product/ReviewSummary';
import StockStatus from '../components/Product/StockStatus';
import EMICalculator from '../components/Product/EMICalculator';
import ProductTabs from '../components/Product/ProductTabs';
// Phase 2 Components
import SizeGuideSection from '../components/Product/SizeGuideSection';
import WarrantyServiceSection from '../components/Product/WarrantyServiceSection';
import { getCachedProducts } from '../utils/productsCache';
import { api } from '../utils/api';

// Lazy load booking flow components
const UserDataForm = lazy(() => import('../components/UserDataForm'));
const RazorpayPayment = lazy(() => import('../components/RazorpayPayment'));
const SuccessScreen = lazy(() => import('../components/SuccessScreen'));

const WHATSAPP_NUMBER = '918892031480';

// Human-readable spec labels
const specLabels = {
  wheelSize: 'Wheel Size',
  frameType: 'Frame',
  gearCount: 'Gears',
  brakeType: 'Brakes',
  weight: 'Weight',
  ageRange: 'Age Range',
  suspension: 'Suspension',
  motor: 'Motor',
  battery: 'Battery',
  range: 'Range',
};

const badgeStyles = {
  Bestseller: 'bg-primary text-white',
  'New Arrival': 'bg-green-500 text-white',
  'Top Pick': 'bg-primary-dark text-white',
  'Value Pick': 'bg-orange-500 text-white',
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [productsList, setProductsList] = useState([]); // Dynamic products list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const navType = useNavigationType();

  // Booking flow state (inline modal)
  const [bookingStage, setBookingStage] = useState(null); // null | 'userdata' | 'payment' | 'success'
  const [bookingUserData, setBookingUserData] = useState(null);
  const [bookingLeadId, setBookingLeadId] = useState(null);

  // Parents FAQ toggle state
  const [openFaq, setOpenFaq] = useState(null);

  const category = useMemo(
    () => (product ? categories.find((c) => c.slug === product.category) : null),
    [product]
  );

  const similarProducts = useMemo(() => {
    if (!product || productsList.length === 0) return [];
    return productsList
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, productsList]);

  // Build full gallery: main image + gallery images (deduplicated)
  const allGalleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = [product.image];
    if (product.gallery?.length) {
      product.gallery.forEach((url) => {
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    return imgs;
  }, [product]);

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
    setSelectedColor(null);
    setSelectedImageIdx(0);
  }, [productId, navType]);

  // Load product from shared cache (single API call, shared across pages)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // getCachedProducts returns merged list (API + local), cached for 5 min
        const allProds = await getCachedProducts();
        if (cancelled) return;

        const COMING_SOON = ['kids', 'geared', 'mountain', 'city', 'accessories'];
        const realProds = allProds.filter((p) => !COMING_SOON.includes(p.category));
        setProductsList(realProds);

        const found = allProds.find((p) => p.id === productId);
        if (!found) {
          setError('Product not found');
        } else if (COMING_SOON.includes(found.category)) {
          setError('Product not found');
        } else {
          setProduct(found);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId]);

  // Match gallery images to a color using urlKey (exact substring) or color name keywords (fallback)
  const getImagesForColor = (colorName) => {
    if (!colorName || allGalleryImages.length <= 1) return allGalleryImages;
    const colorObj = product?.colors?.find((c) => c.name === colorName);
    let matched;
    if (colorObj?.urlKey) {
      const key = colorObj.urlKey.toLowerCase();
      matched = allGalleryImages.filter((url) => url.toLowerCase().includes(key));
    } else {
      const keywords = colorName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
      matched = allGalleryImages.filter((url) => {
        const urlLower = url.toLowerCase();
        return keywords.some((kw) => kw.length >= 3 && urlLower.includes(kw));
      });
    }
    if (matched.length === 0) return allGalleryImages;
    if (matched.length >= 3) return matched;
    const rest = allGalleryImages.filter((url) => !matched.includes(url));
    return [...matched, ...rest];
  };

  // Active gallery based on selected color
  const activeGallery = selectedColor ? getImagesForColor(selectedColor) : allGalleryImages;

  // Preload all gallery images so switching is instant
  useEffect(() => {
    activeGallery.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [activeGallery]);

  // Loading state - skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-bg px-4 py-8 pt-[72px] sm:pt-[80px]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] w-full aspect-square rounded-2xl" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
            <div className="space-y-4">
              <div className="animate-pulse bg-gray-200 h-8 w-3/4 rounded" />
              <div className="animate-pulse bg-gray-200 h-5 w-1/2 rounded" />
              <div className="animate-pulse bg-gray-200 h-10 w-32 rounded" />
              <div className="space-y-2">
                <div className="animate-pulse bg-gray-200 h-4 w-full rounded" />
                <div className="animate-pulse bg-gray-200 h-4 w-5/6 rounded" />
                <div className="animate-pulse bg-gray-200 h-4 w-4/6 rounded" />
              </div>
              <div className="flex gap-3 pt-4">
                <div className="animate-pulse bg-gray-200 h-12 w-40 rounded-full" />
                <div className="animate-pulse bg-gray-200 h-12 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 404 — product not found
  if (!product || error) {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center px-4 pt-[72px] sm:pt-[80px]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-dark mb-4">404</h1>
          <p className="text-gray-text text-lg mb-6">
            {error || 'Product not found'}
          </p>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/products');
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-white rounded-full font-semibold hover:bg-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in the ${product.name} (₹${product.price.toLocaleString('en-IN')}). Please share more details.`
  )}`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} — BCH`,
          text: `Check out ${product.name} at ₹${product.price.toLocaleString('en-IN')} on Bharath Cycle Hub!`,
          url: shareUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard?.writeText(shareUrl);
    }
  };

  // Handle color selection
  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    setSelectedImageIdx(0);
  };

  // ── Booking flow handlers ──
  const handleStartBooking = () => {
    setBookingLeadId(null);
    setBookingUserData(null);
    setBookingStage('userdata');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingUserDataSubmit = async (data) => {
    setBookingUserData(data);

    const leadData = {
      name: data.name,
      phone: data.phone,
      category: 'Test Ride',
      source: 'product-detail',
      quizAnswers: {
        interestedProduct: product.name,
        productId: product.id,
        category: product.category,
        price: product.price,
      },
    };

    try {
      const lead = await api.saveLead(leadData);
      setBookingLeadId(lead.id);
    } catch (err) {
      console.error('Error creating lead:', err);
      alert('Something went wrong. Please try again.');
      return;
    }

    setBookingStage('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingPaymentSuccess = (paymentData) => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-11326000229/O5i-CNWt6-kbEOWY1Jgq',
        'transaction_id': paymentData.paymentId || '',
        'value': 99.0,
        'currency': 'INR'
      });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'event': 'purchase_success' });
    setBookingStage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingPaymentError = (err) => {
    if (err.code === 'PAYMENT_CANCELLED') return;
    console.error('Payment error:', err);
    alert('Payment failed: ' + err.description + '. Please try again.');
  };

  const handleCloseBooking = () => {
    setBookingStage(null);
    setBookingUserData(null);
    setBookingLeadId(null);
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20 lg:pb-0 pt-[72px] sm:pt-[80px]">
      {/* Back Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/products');
              }
            }}
            className="flex items-center gap-2 text-sm font-semibold text-dark hover:text-primary transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-semibold text-dark hover:text-primary transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 pb-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
          {/* Left — Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:sticky lg:top-[140px]"
          >
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeGallery[selectedImageIdx] || activeGallery[0]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LazyImage
                    src={activeGallery[selectedImageIdx] || activeGallery[0]}
                    alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
                    className={`w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] ${(activeGallery[selectedImageIdx] || activeGallery[0])?.toLowerCase().endsWith('.png') ? 'p-4' : ''}`}
                    objectFit={(activeGallery[selectedImageIdx] || activeGallery[0])?.toLowerCase().endsWith('.png') ? 'contain' : 'cover'}
                    eager
                  />
                </motion.div>
              </AnimatePresence>
              {product.badge && (
                <span
                  className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${badgeStyles[product.badge] || 'bg-gray-500 text-white'}`}
                >
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500 text-white">
                  {discount}% OFF
                </span>
              )}
              {/* Image counter */}
              {activeGallery.length > 1 && (
                <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-black/50 text-white">
                  {selectedImageIdx + 1} / {activeGallery.length}
                </span>
              )}
              {/* Prev/Next arrows */}
              {activeGallery.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx((prev) => prev === 0 ? activeGallery.length - 1 : prev - 1)}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx((prev) => prev === activeGallery.length - 1 ? 0 : prev + 1)}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {activeGallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {activeGallery.map((url, idx) => (
                  <button
                    key={url + idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImageIdx
                      ? 'border-primary shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Color Swatches */}
            {product.colors?.length > 0 && (
              <div className="mt-2 bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-bold text-dark uppercase tracking-wide mb-2">
                  Colour: <span className="text-primary font-semibold normal-case">{selectedColor || 'All'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(selectedColor === color.name ? null : color.name)}
                      className={`group relative w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color.name
                        ? 'border-primary scale-110 shadow-md'
                        : 'border-gray-300 hover:border-gray-500 hover:scale-105'
                        }`}
                      title={color.name}
                    >
                      <span
                        className="absolute inset-1 rounded-full"
                        style={{ background: color.hex?.startsWith('linear') ? color.hex : color.hex }}
                      />
                      {selectedColor === color.name && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 lg:mt-0"
          >
            {/* Category breadcrumb */}
            {category && (
              <Link
                to={`/products?category=${category.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-3 hover:underline"
              >
                {category.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="font-display text-lg sm:text-3xl lg:text-4xl font-bold text-dark tracking-wide uppercase mb-1 sm:mb-2 break-words">
              {product.name}
            </h1>

            {/* Emotional tagline */}
            {(() => {
              const taglines = {
                electric: 'The fastest e-cycle in your friend group',
                kids: 'Built for the coolest kid on the block',
                mountain: 'Built for trails your friends won\'t dare',
                geared: 'Shift gears. Shift status.',
                city: 'Your city. Your rules.',
              };
              const tagline = taglines[product.category];
              return tagline ? <p className="text-sm font-bold text-accent mb-1">{tagline}</p> : null;
            })()}

            {/* Short description */}
            <p className="text-gray-text text-sm sm:text-base mb-2 sm:mb-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* PHASE 1: Review Summary */}
            {product.reviews && (
              <ReviewSummary
                averageRating={product.reviews.averageRating}
                totalReviews={product.reviews.totalReviews}
              />
            )}

            {/* Social proof line */}
            {(() => {
              if (['kids', 'electric'].includes(product.category)) {
                return <p className="text-xs text-gray-text mb-2">Popular with 14–17 yr olds · Families' top choice this season</p>;
              }
              if (['city', 'geared'].includes(product.category)) {
                return <p className="text-xs text-gray-text mb-2">Trusted by daily commuters across Bangalore</p>;
              }
              if (product.category === 'mountain') {
                return <p className="text-xs text-gray-text mb-2">Trail-tested by weekend warriors across Karnataka</p>;
              }
              return null;
            })()}

            {/* Price */}
            <div className="flex items-baseline gap-2 sm:gap-3 mb-3 flex-wrap">
              <span className="text-2xl sm:text-4xl font-bold text-primary">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-base sm:text-lg text-gray-text line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-green-600">
                    Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
              {product.price >= 10000 && (
                <span className="text-sm text-blue-600 font-semibold">
                  or ₹{Math.ceil(product.price / 12).toLocaleString('en-IN')}/mo EMI
                </span>
              )}
            </div>


            {/* PHASE 1: Stock Status */}
            <StockStatus
              stock={product.stock || 20}
              recentPurchases={product.recentPurchases}
            />

            {/* PHASE 1: EMI Calculator */}
            <EMICalculator price={product.price} />

            {/* Trust bar */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-3 mb-3 text-[10px] sm:text-[11px] text-gray-text">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Free Helmet
              </span>
              {product.category === 'electric' && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Speed Lock 25 kmph
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                2-Year Warranty
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                8 Full-Time Mechanics
              </span>
            </div>

            {/* Urgency signal */}
            <p className="text-xs text-primary font-bold mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Book by tonight for same-week visit
            </p>

            {/* Screen time swap — kids & electric only */}
            {['kids', 'electric'].includes(product.category) && (
              <p className="text-xs text-gray-text mb-2">Trade 2 hours of screen time for outdoor adventure</p>
            )}

            {/* CTA buttons - visible on desktop, hidden on mobile (shown in sticky bar) */}
            <div className="hidden lg:flex flex-col gap-3 mb-4">
              <div className="flex gap-3">
                <button
                  onClick={handleStartBooking}
                  className="flex-1 py-3.5 rounded-full bg-primary text-white font-bold text-base transition-all hover:bg-primary-dark hover:shadow-lg text-center"
                >
                  Feel the Power — Test Ride ₹99
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-green-500 text-white font-bold text-base hover:bg-green-600 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.549-.678-6.413-1.848l-.446-.291-2.651.889.889-2.651-.291-.446A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="tel:+918892031480"
                  className="flex items-center justify-center w-[52px] py-3.5 rounded-full bg-dark text-white hover:bg-primary transition-colors flex-shrink-0"
                  aria-label="Call us"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </a>
              </div>
              <p className="text-[10px] text-gray-text">₹99 fully adjusted on purchase · Zero risk</p>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="text-sm text-gray-text hover:text-primary transition-colors font-medium text-left"
              >
                Have questions? Send an enquiry
              </button>
            </div>

            {/* How It Works — desktop */}
            <div className="hidden lg:flex items-center gap-0 mt-4 mb-4 bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <p className="text-xs font-bold text-dark leading-tight">Book for ₹99</p>
                  <p className="text-[10px] text-gray-text leading-tight">Zero risk · Adjusted on purchase</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <div className="flex-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <p className="text-xs font-bold text-dark leading-tight">Expert Picks Your Ride</p>
                  <p className="text-[10px] text-gray-text leading-tight">Personalized recommendation</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <div className="flex-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <p className="text-xs font-bold text-dark leading-tight">Feel the Throttle Magic</p>
                  <p className="text-[10px] text-gray-text leading-tight">88% of families buy same day</p>
                </div>
              </div>
            </div>

            {/* Mobile inline CTA */}
            <div className="flex flex-col gap-1.5 lg:hidden mb-4">
              <div className="flex gap-2">
                <button
                  onClick={handleStartBooking}
                  className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-sm transition-all active:scale-[0.98] text-center min-h-[44px] flex items-center justify-center"
                >
                  Test Ride — ₹99
                </button>
                <a
                  href="tel:+918892031480"
                  className="flex items-center justify-center w-[44px] py-3 rounded-full bg-dark text-white active:bg-primary transition-colors flex-shrink-0 min-h-[44px]"
                  aria-label="Call us"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-[44px] py-3 rounded-full bg-green-500 text-white active:bg-green-600 transition-colors flex-shrink-0 min-h-[44px]"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.549-.678-6.413-1.848l-.446-.291-2.651.889.889-2.651-.291-.446A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </a>
              </div>
              <p className="text-[10px] text-gray-text">₹99 adjusted on purchase · Zero risk</p>
            </div>

            {/* How It Works — mobile */}
            <div className="flex lg:hidden items-center gap-0 mt-2 mb-4 bg-red-50 rounded-xl p-3 border border-red-200">
              <div className="flex-1 text-center">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] mx-auto mb-1">1</div>
                <p className="text-[10px] font-bold text-dark leading-tight">Book ₹99</p>
                <p className="text-[9px] text-gray-text leading-tight">Zero risk</p>
              </div>
              <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <div className="flex-1 text-center">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] mx-auto mb-1">2</div>
                <p className="text-[10px] font-bold text-dark leading-tight">Expert Picks</p>
                <p className="text-[9px] text-gray-text leading-tight">Personalized</p>
              </div>
              <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <div className="flex-1 text-center">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] mx-auto mb-1">3</div>
                <p className="text-[10px] font-bold text-dark leading-tight">Feel the Magic</p>
                <p className="text-[9px] text-gray-text leading-tight">88% buy same day</p>
              </div>
            </div>

          </motion.div>
        </div>

        {/* PHASE 1: Product Tabs (replaces old specs table) */}
        <ProductTabs product={product} allProducts={productsList} />

        {/* Parents Ask, We Answer — kids, electric, mountain only */}
        {['kids', 'electric', 'mountain'].includes(product.category) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider mb-6">
              Parents Ask, <span className="text-primary">We Answer</span>
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Won't my kid stop using it after a month?",
                  a: "20% of our riders clock 300+ km/month. The trick is the test ride — once they feel the throttle, it's not a bicycle anymore, it's freedom. We also see siblings and parents stealing rides regularly."
                },
                {
                  q: "Is it really safe for my child?",
                  a: "Speed locked at 25 kmph (government regulation). Free helmet included with every purchase. Disc brakes for instant stopping. Plus our 8 full-time mechanics ensure your cycle is always in perfect condition."
                },
                {
                  q: "What if something breaks? What about service?",
                  a: "8 full-time mechanics, 6-day turnaround guarantee. Free first 3 services included. We're not an online brand that disappears — we're a Bangalore store you can walk into anytime."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-bold text-dark pr-4">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-gray-text leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* PHASE 2: Size Guide Section */}
        {product.sizeGuide?.hasGuide && (
          <SizeGuideSection sizeGuide={product.sizeGuide} productName={product.name} />
        )}

        {/* PHASE 2: Warranty & Service Section — not for electric (info is in BCH tab) */}
        {product.category !== 'electric' && (
          <WarrantyServiceSection warranty={product.warranty} category={product.category} />
        )}

        {/* Birthday Gift Banner — kids & electric only */}
        {['kids', 'electric'].includes(product.category) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-12 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-dark font-semibold text-center sm:text-left">
              Perfect Birthday Gift · Free gift wrapping · Same-week delivery
            </p>
            <button
              onClick={handleStartBooking}
              className="px-5 py-2 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors flex-shrink-0"
            >
              Book Now
            </button>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16"
          >
            <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider mb-6">
              Similar <span className="text-primary">Bikes</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch">
              {similarProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`} className="flex flex-col h-full">
                  <ProductCard
                    product={p}
                    onEnquire={(prod) => {
                      navigate(`/products/${prod.id}`);
                    }}
                  />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] safe-bottom">
        <p className="text-[9px] text-gray-text text-center pt-1.5 px-4">₹99 fully adjusted on purchase · Zero risk</p>
        <div className="flex gap-2 px-4 py-2">
          <button
            onClick={handleStartBooking}
            className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all min-h-[44px] flex items-center justify-center text-center"
          >
            Feel the Power — ₹99
          </button>
          <a
            href="tel:+918892031480"
            className="flex items-center justify-center w-[44px] py-3 rounded-full bg-dark text-white active:bg-primary transition-colors flex-shrink-0 min-h-[44px]"
            aria-label="Call us"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-[44px] py-3 rounded-full bg-green-500 text-white active:bg-green-600 transition-colors flex-shrink-0 min-h-[44px]"
            aria-label="WhatsApp"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.549-.678-6.413-1.848l-.446-.291-2.651.889.889-2.651-.291-.446A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Booking Flow Modals */}
      {bookingStage === 'userdata' && (
        <Suspense fallback={null}>
          <UserDataForm
            onSubmit={handleBookingUserDataSubmit}
            onBack={handleCloseBooking}
            skipConfirmation={true}
            submitLabel="Continue to Payment"
            stepLabel="Step 1 of 2"
            selectedProduct={product}
          />
        </Suspense>
      )}

      {bookingStage === 'payment' && bookingUserData && (
        <Suspense fallback={null}>
          <RazorpayPayment
            userData={bookingUserData}
            quizAnswers={{ interestedProduct: product.name, productId: product.id, category: product.category, price: product.price }}
            leadId={bookingLeadId}
            onSuccess={handleBookingPaymentSuccess}
            onError={handleBookingPaymentError}
            onBack={() => setBookingStage('userdata')}
            onCancel={handleCloseBooking}
            selectedProduct={product}
          />
        </Suspense>
      )}

      {bookingStage === 'success' && (
        <Suspense fallback={null}>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <SuccessScreen userData={bookingUserData} />
            <div className="fixed top-4 right-4 z-50">
              <button
                onClick={handleCloseBooking}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </Suspense>
      )}

      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryOpen && (
          <EnquiryModal
            product={product}
            onClose={() => setEnquiryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────
// Enquiry Modal (same pattern as ProductsPage)
// ────────────────────────────────────────

function EnquiryModal({ product, onClose }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    return errs;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errs = validate();
      setErrors((prev) => ({ ...prev, [field]: errs[field] || '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors((prev) => ({ ...prev, [field]: errs[field] || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ name: true, phone: true });
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    try {
      await api.saveLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        source: 'product-detail',
        quizAnswers: {
          interestedProduct: product.name,
          category: product.category,
          price: product.price,
        },
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in the ${product.name} (₹${product.price.toLocaleString('en-IN')}). Please share more details.`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <LazyImage src={product.image} alt={product.name} className="w-16 h-12 rounded-lg flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-dark truncate">{product.name}</h3>
            <p className="text-base font-bold text-primary">
              ₹{product.price.toLocaleString('en-IN')}
              {product.mrp > product.price && (
                <span className="text-xs text-gray-text line-through ml-2 font-normal">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="p-5">
          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">Thank you!</h3>
              <p className="text-gray-text text-sm mb-6">We'll contact you shortly about the {product.name}.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.549-.678-6.413-1.848l-.446-.291-2.651.889.889-2.651-.291-.446A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                Chat on WhatsApp
              </a>
              <button onClick={onClose} className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">Close</button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">Something went wrong</h3>
              <p className="text-gray-text text-sm mb-6">Please try again or contact us on WhatsApp.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStatus('idle')} className="px-5 py-2.5 bg-dark text-white rounded-full font-semibold text-sm hover:bg-primary transition-colors">Try Again</button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors">WhatsApp</a>
              </div>
            </motion.div>
          )}

          {(status === 'idle' || status === 'loading') && (
            <>
              <h2 className="text-lg font-bold text-dark mb-1">Enquire Now</h2>
              <p className="text-sm text-gray-text mb-4">Fill in your details and we'll get back to you.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="detail-name" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">Name <span className="text-red-500">*</span></label>
                  <input id="detail-name" type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} className={`w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 text-sm transition-colors outline-none ${errors.name && touched.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'}`} placeholder="Your full name" autoComplete="name" disabled={status === 'loading'} />
                  {errors.name && touched.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="detail-phone" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+91</span>
                    <input id="detail-phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={() => handleBlur('phone')} className={`w-full pl-12 pr-3 py-2.5 rounded-xl bg-gray-50 border-2 text-sm transition-colors outline-none ${errors.phone && touched.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'}`} placeholder="9876543210" autoComplete="tel" maxLength="10" disabled={status === 'loading'} />
                  </div>
                  {errors.phone && touched.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="detail-email" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">Email <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                  <input id="detail-email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-primary text-sm transition-colors outline-none" placeholder="you@example.com" autoComplete="email" disabled={status === 'loading'} />
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full py-3 rounded-full bg-dark text-white font-bold text-sm transition-colors hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {status === 'loading' ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />Sending...</>) : 'Get Expert Advice'}
                </button>
              </form>
              <p className="text-[10px] text-gray-text text-center mt-3">Your information is secure and will only be used to assist your purchase.</p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
