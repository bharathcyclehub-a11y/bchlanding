import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
import { categories } from '../data/products';
import { accessories } from '../data/accessories';
import CategoryTabBar from '../components/CategoryTabBar';
import ProductCard from '../components/ProductCard';
import LazyImage from '../components/LazyImage';
import { getCachedProducts } from '../utils/productsCache';
import { api } from '../utils/api';

const allCategory = {
  name: 'All',
  slug: 'all',
  description: 'Browse our entire collection',
};

const tabCategories = [allCategory, ...categories];

const WHATSAPP_NUMBER = '918892031480';

// Categories that don't have real products yet — show "Coming Soon" banner
const COMING_SOON_CATEGORIES = ['kids', 'geared', 'mountain', 'city', 'accessories'];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSub = searchParams.get('sub') || 'all';
  const [activeCategory, setActiveCategory] = useState(
    tabCategories.some((c) => c.slug === initialCategory) ? initialCategory : 'all'
  );
  const [activeSubCategory, setActiveSubCategory] = useState(initialSub);
  const navigate = useNavigate();
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get subcategories for active category
  const activeSubCategories = useMemo(() => {
    const cat = categories.find((c) => c.slug === activeCategory);
    return cat?.subCategories || [];
  }, [activeCategory]);

  // Reset subcategory when main category changes and update URL
  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setActiveSubCategory('all');
    // Update URL
    if (slug === 'all') {
      navigate('/products', { replace: true });
    } else {
      navigate(`/products?category=${slug}`, { replace: true });
    }
  };

  const navType = useNavigationType();

  // Sync state with URL params (important for refresh and back/forward navigation)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlSub = searchParams.get('sub') || 'all';

    // Only update if different from current state
    if (urlCategory !== activeCategory) {
      setActiveCategory(tabCategories.some((c) => c.slug === urlCategory) ? urlCategory : 'all');
    }
    if (urlSub !== activeSubCategory) {
      setActiveSubCategory(urlSub);
    }
  }, [searchParams]);

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [navType]);

  // Load products (uses shared cache — avoids redundant Firestore reads)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const merged = await getCachedProducts();
        if (!cancelled) setProducts(merged);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Update URL when subcategory changes
  const handleSubCategoryChange = (subSlug) => {
    setActiveSubCategory(subSlug);
    // Update URL
    if (subSlug === 'all') {
      navigate(`/products?category=${activeCategory}`, { replace: true });
    } else {
      navigate(`/products?category=${activeCategory}&sub=${subSlug}`, { replace: true });
    }
  };

  const handleProductClick = useCallback((p) => {
    if (p.category === 'accessories') {
      setEnquiryProduct(p);
    } else {
      navigate(`/products/${p.id}`);
    }
  }, [navigate]);

  // Map accessories to product-like format for the grid
  const accessoryProducts = useMemo(() => {
    return accessories.map((acc) => ({
      id: acc.id,
      name: acc.name,
      price: acc.price,
      mrp: acc.mrp,
      image: acc.image,
      badge: acc.badge || null,
      shortDescription: acc.shortDescription,
      category: 'accessories',
      specs: {},
    }));
  }, []);

  const isComingSoon = COMING_SOON_CATEGORIES.includes(activeCategory);

  const filteredProducts = useMemo(() => {
    if (COMING_SOON_CATEGORIES.includes(activeCategory)) {
      return [];
    }
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    } else {
      // "All" tab — hide products from coming-soon categories
      result = result.filter((p) => !COMING_SOON_CATEGORIES.includes(p.category));
    }
    if (activeSubCategory !== 'all' && activeSubCategories.length > 0) {
      result = result.filter((p) => p.subCategory === activeSubCategory);
    }
    return result;
  }, [activeCategory, activeSubCategory, activeSubCategories, products]);

  return (
    <div className="min-h-screen bg-gray-bg">
      {/* Hero Section */}
      <section className="bg-dark text-white pt-[80px] sm:pt-[100px] pb-8 sm:pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider mb-2 sm:mb-4"
          >
            Our <span className="text-primary">Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-gray-light/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2"
          >
            Explore our wide range of bicycles — from kids' first rides to
            high-performance electric bikes. Find the perfect cycle for every
            rider and every road.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 sm:mt-6 mx-auto w-16 sm:w-20 h-1 bg-primary rounded-full"
          />
        </div>
      </section>

      {/* Category Tabs */}
      <CategoryTabBar
        categories={tabCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Subcategory Filter Chips */}
      {activeSubCategories.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleSubCategoryChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${activeSubCategory === 'all'
                ? 'bg-dark text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All
            </button>
            {activeSubCategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => handleSubCategoryChange(sub.slug)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${activeSubCategory === sub.slug
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 md:py-12">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] w-full aspect-[4/3]" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
                <div className="p-4 space-y-3">
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded" />
                  <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded" />
                  <div className="animate-pulse bg-gray-200 h-5 w-20 rounded" />
                  <div className="animate-pulse bg-gray-200 h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-text text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-dark text-white rounded-full font-semibold hover:bg-primary transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Coming Soon Banner for demo categories */}
        {!loading && !error && isComingSoon && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`coming-soon-${activeCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24 px-4"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>

              {/* Text */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl sm:text-3xl font-bold text-dark mb-3 text-center"
              >
                Coming <span className="text-primary">Soon</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-text text-sm sm:text-base max-w-md text-center mb-8 leading-relaxed"
              >
                We're updating our{' '}
                <span className="font-semibold text-dark">
                  {categories.find((c) => c.slug === activeCategory)?.name}
                </span>{' '}
                collection with exciting new models. Stay tuned!
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-16 h-1 bg-primary/30 rounded-full mb-8"
              />

              {/* CTA — browse electric bikes */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => handleCategoryChange('electric')}
                className="px-6 py-3 bg-dark text-white rounded-full font-semibold text-sm hover:bg-primary transition-colors"
              >
                Browse Electric Bikes
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Products Grid */}
        {!loading && !error && !isComingSoon && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-stretch"
              >
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                    className="flex flex-col"
                  >
                    <ProductCard
                      product={product}
                      onEnquire={setEnquiryProduct}
                      onClick={handleProductClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-text">
                <p className="text-lg font-sans">No products found in this category.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {enquiryProduct && (
          <EnquiryModal
            product={enquiryProduct}
            onClose={() => setEnquiryProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────
// Enquiry Modal
// ────────────────────────────────────────

function EnquiryModal({ product, onClose }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

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
        source: 'product-catalog',
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
    `Hi, I'm interested in the ${product.name} (${'\u20b9'}${product.price.toLocaleString('en-IN')}). Please share more details.`
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Preview */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-16 h-12 rounded-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-dark truncate">{product.name}</h3>
            <p className="text-base font-bold text-primary">
              {'\u20b9'}{product.price.toLocaleString('en-IN')}
              {product.mrp > product.price && (
                <span className="text-xs text-gray-text line-through ml-2 font-normal">
                  {'\u20b9'}{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Success State */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">Thank you!</h3>
              <p className="text-gray-text text-sm mb-6">We'll contact you shortly about the {product.name}.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.549-.678-6.413-1.848l-.446-.291-2.651.889.889-2.651-.291-.446A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Chat on WhatsApp
              </a>
              <button
                onClick={onClose}
                className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">Something went wrong</h3>
              <p className="text-gray-text text-sm mb-6">Please try again or contact us on WhatsApp.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2.5 bg-dark text-white rounded-full font-semibold text-sm hover:bg-primary transition-colors"
                >
                  Try Again
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          )}

          {/* Form (idle / loading) */}
          {(status === 'idle' || status === 'loading') && (
            <>
              <h2 className="text-lg font-bold text-dark mb-1">Enquire Now</h2>
              <p className="text-sm text-gray-text mb-4">Fill in your details and we'll get back to you.</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name */}
                <div>
                  <label htmlFor="enquiry-name" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="enquiry-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 text-sm transition-colors outline-none ${errors.name && touched.name
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-primary'
                      }`}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={status === 'loading'}
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="enquiry-phone" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">+91</span>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full pl-12 pr-3 py-2.5 rounded-xl bg-gray-50 border-2 text-sm transition-colors outline-none ${errors.phone && touched.phone
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-gray-200 focus:border-primary'
                        }`}
                      placeholder="9876543210"
                      autoComplete="tel"
                      maxLength="10"
                      disabled={status === 'loading'}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Email (optional) */}
                <div>
                  <label htmlFor="enquiry-email" className="block text-xs font-bold text-dark mb-1 uppercase tracking-wide">
                    Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="enquiry-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-primary text-sm transition-colors outline-none"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={status === 'loading'}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 rounded-full bg-dark text-white font-bold text-sm transition-colors hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    'Get Expert Advice'
                  )}
                </button>
              </form>

              <p className="text-[10px] text-gray-text text-center mt-3">
                Your information is secure and will only be used to assist your purchase.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
