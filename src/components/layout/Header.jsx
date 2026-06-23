import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ContactFormModal from '../ContactFormModal';
import { categories, products } from '../../data/products';
import { accessories } from '../../data/accessories';

const COMING_SOON_CATEGORIES = ['kids', 'geared', 'mountain', 'city', 'accessories'];

export default function Header({ transparent = false, onCTAClick, logo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState(categories[0]?.slug || '');
  const [activeMenuSubCategory, setActiveMenuSubCategory] = useState('');
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState('');
  const [mobileActiveSubCategory, setMobileActiveSubCategory] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const megaMenuTimeout = useRef(null);
  const megaMenuRef = useRef(null);

  const isTestRidePage = location.pathname.startsWith('/test-ride');
  // On Viper pages the boss wants Contact to go straight to WhatsApp (no form/mailbox).
  const isViperPage = location.pathname.startsWith('/viper');
  const WHATSAPP_CONTACT = `https://wa.me/918892031480?text=${encodeURIComponent(
    "Hi! I'm interested in the EMotorad Viper for kids — please share the details."
  )}`;
  const openContact = () => {
    if (isViperPage) {
      window.open(WHATSAPP_CONTACT, '_blank', 'noopener,noreferrer');
    } else {
      setIsContactFormOpen(true);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileProductsOpen(false);
    setMobileActiveCategory('');
    setMobileActiveSubCategory('');
    setMegaMenuOpen(false);
  }, [location.pathname]);

  // Track scroll position for transparent header
  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  // Close mega menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMegaMenu = useCallback(() => {
    clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  }, []);

  const closeMegaMenu = useCallback(() => {
    megaMenuTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  }, []);

  const handleProductClick = useCallback((product) => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    // Accessories don't have detail pages — go to filtered list
    if (product.id?.startsWith('acc-')) {
      navigate('/products?category=accessories');
    } else {
      navigate(`/products/${product.id}`);
    }
  }, [navigate]);

  const handleCategoryClick = useCallback((slug) => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?category=${slug}`);
  }, [navigate]);

  const handleSubCategoryClick = useCallback((catSlug, subSlug) => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?category=${catSlug}&sub=${subSlug}`);
  }, [navigate]);

  const handleSectionClick = useCallback((e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  }, [location.pathname, navigate]);

  // Get products for a category (limit for mega menu)
  const getCategoryProducts = (categorySlug, subCategorySlug) => {
    if (categorySlug === 'accessories') {
      return accessories.slice(0, 6);
    }
    let filtered = products.filter((p) => p.category === categorySlug);
    if (subCategorySlug) {
      filtered = filtered.filter((p) => p.subCategory === subCategorySlug);
    }
    return filtered.slice(0, 6);
  };

  // Get the active category object
  const getActiveCategory = () => categories.find((c) => c.slug === activeMenuCategory);
  const activeCat = getActiveCategory();
  const hasSubCategories = activeCat?.subCategories?.length > 0;

  // Products to show in the mega menu
  const menuProducts = activeMenuSubCategory
    ? getCategoryProducts(activeMenuCategory, activeMenuSubCategory)
    : getCategoryProducts(activeMenuCategory);

  // Reset subcategory when category changes
  const handleCategoryHover = (slug) => {
    setActiveMenuCategory(slug);
    setActiveMenuSubCategory('');
  };

  const bgClass = transparent
    ? (isScrolled || mobileMenuOpen)
      ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
      : 'bg-gradient-to-b from-black/60 via-black/30 to-transparent'
    : 'bg-white/40 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.08)]';

  const textClass = transparent
    ? (isScrolled ? 'text-white' : 'text-white')
    : 'text-dark';

  const linkClass = transparent
    ? (isScrolled ? 'text-white/80 hover:text-white' : 'text-white/90 hover:text-white')
    : 'text-gray-text hover:text-dark';

  const hoverBgClass = transparent
    ? 'hover:bg-white/10'
    : 'hover:bg-gray-100';

  // Use different logo based on background
  const logoSrc = logo
    ? logo
    : transparent
    ? '/logo1.png'
    : '/BCHwebsitelogo.png';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center min-w-0">
            <img
              src={logoSrc}
              alt="Bharath Cycle Hub Logo"
              className="h-8 sm:h-14 w-auto max-w-[180px] sm:max-w-none object-contain"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="!hidden md:!flex items-center gap-4">
            <Link to="/" className={`font-medium transition-colors px-4 py-2 ${linkClass}`}>
              Home
            </Link>

            {/* Products with Mega Menu */}
            <div
              ref={megaMenuRef}
              className="relative"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenu}
            >
              <Link
                to="/products"
                className={`font-medium transition-colors px-4 py-2 inline-flex items-center gap-1 ${linkClass}`}
              >
                Products
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ${hasSubCategories ? 'w-[820px]' : 'w-[700px]'
                    }`}
                  onMouseEnter={openMegaMenu}
                  onMouseLeave={closeMegaMenu}
                >
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                  <div className="flex relative z-10">
                    {/* Column 1: Categories Sidebar */}
                    <div className="w-[200px] bg-gray-bg border-r border-gray-100 py-3 flex-shrink-0">
                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-text uppercase tracking-widest">
                        Categories
                      </p>
                      {categories.map((cat) => (
                        <button
                          key={cat.slug}
                          onMouseEnter={() => handleCategoryHover(cat.slug)}
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors duration-150 ${activeMenuCategory === cat.slug
                            ? 'bg-white text-dark font-semibold shadow-sm'
                            : 'text-gray-text hover:bg-white/60 hover:text-dark'
                            }`}
                        >
                          <span className="truncate flex-1">{cat.name}</span>
                          <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity duration-150 ${activeMenuCategory === cat.slug ? 'opacity-100 text-primary' : 'opacity-0'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                      {/* View All Link */}
                      <Link
                        to="/products"
                        onClick={() => setMegaMenuOpen(false)}
                        className="block px-4 py-2.5 mt-1 text-sm font-semibold text-primary hover:bg-white/60 transition-colors border-t border-gray-200"
                      >
                        View All Products →
                      </Link>
                    </div>

                    {/* Column 2: SubCategories (if category has them) */}
                    {hasSubCategories && (
                      <div className="w-[180px] border-r border-gray-100 py-3 flex-shrink-0">
                        <p className="px-4 py-1.5 text-[10px] font-bold text-gray-text uppercase tracking-widest">
                          Sub Categories
                        </p>
                        {/* "All" option for this category */}
                        <button
                          onMouseEnter={() => setActiveMenuSubCategory('')}
                          onClick={() => handleCategoryClick(activeMenuCategory)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors duration-150 ${!activeMenuSubCategory
                            ? 'bg-gray-bg text-dark font-semibold'
                            : 'text-gray-text hover:bg-gray-bg/50 hover:text-dark'
                            }`}
                        >
                          <span className="truncate flex-1">All {activeCat?.name}</span>
                        </button>
                        {activeCat.subCategories.map((sub) => (
                          <button
                            key={sub.slug}
                            onMouseEnter={() => setActiveMenuSubCategory(sub.slug)}
                            onClick={() => handleSubCategoryClick(activeMenuCategory, sub.slug)}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors duration-150 ${activeMenuSubCategory === sub.slug
                              ? 'bg-gray-bg text-dark font-semibold'
                              : 'text-gray-text hover:bg-gray-bg/50 hover:text-dark'
                              }`}
                          >
                            <span className="truncate flex-1">{sub.name}</span>
                            {activeMenuSubCategory === sub.slug && (
                              <svg className="w-3.5 h-3.5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Column 3 (or 2): Products Grid or Coming Soon */}
                    <div className="flex-1 p-4">
                      <p className="text-xs font-bold text-gray-text uppercase tracking-widest mb-3">
                        {activeMenuSubCategory
                          ? activeCat?.subCategories?.find((s) => s.slug === activeMenuSubCategory)?.name
                          : activeCat?.name || 'Products'}
                      </p>

                      {COMING_SOON_CATEGORIES.includes(activeMenuCategory) ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-dark mb-1">Coming Soon</p>
                          <p className="text-xs text-gray-text max-w-[200px]">
                            We're updating our {activeCat?.name} collection. Stay tuned!
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {menuProducts.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-bg transition-colors text-left group"
                              >
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-dark truncate leading-tight">
                                    {product.name}
                                  </p>
                                  <p className="text-sm font-bold text-primary mt-0.5">
                                    ₹{product.price.toLocaleString('en-IN')}
                                    {product.mrp > product.price && (
                                      <span className="text-[10px] text-gray-text line-through ml-1 font-normal">
                                        ₹{product.mrp.toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                          {/* Category CTA */}
                          <button
                            onClick={() => activeMenuSubCategory
                              ? handleSubCategoryClick(activeMenuCategory, activeMenuSubCategory)
                              : handleCategoryClick(activeMenuCategory)
                            }
                            className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                          >
                            See all{' '}
                            {activeMenuSubCategory
                              ? activeCat?.subCategories?.find((s) => s.slug === activeMenuSubCategory)?.name
                              : activeCat?.name}{' '}
                            →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/test-ride" className={`font-medium transition-colors px-4 py-2 ${linkClass}`}>
              Test Ride
            </Link>
            <a
              href="#offers"
              onClick={(e) => handleSectionClick(e, 'offers')}
              className={`font-medium transition-colors px-4 py-2 ${linkClass}`}
            >
              Offers
            </a>
            <a
              href="#why-us"
              onClick={(e) => handleSectionClick(e, 'why-us')}
              className={`font-medium transition-colors px-4 py-2 ${linkClass}`}
            >
              Why Us
            </a>

            {/* Contact Button — WhatsApp on Viper pages, contact form elsewhere */}
            <button
              onClick={openContact}
              aria-label={isViperPage ? 'Chat with us on WhatsApp' : 'Contact us'}
              className="flex items-center justify-center bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>

            {/* Book Now Button - only on test ride page */}
            {isTestRidePage && onCTAClick && (
              <button
                onClick={onCTAClick}
                className="bg-primary text-white font-bold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-all shadow-lg"
              >
                BOOK NOW
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={openContact}
              aria-label={isViperPage ? 'Chat with us on WhatsApp' : 'Contact us'}
              className="flex items-center gap-1 bg-green-600 text-white font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-sm"
            >
              {isViperPage ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              )}
              {isViperPage ? 'WHATSAPP' : 'CONTACT'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${transparent ? 'bg-white/10 text-white' : 'bg-gray-100 text-dark'}`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 border-t max-h-[calc(100vh-80px)] overflow-y-auto ${transparent ? 'border-white/20' : 'border-gray-200'}`}>
            <div className="flex flex-col gap-1 pt-4">
              <Link
                to="/"
                className={`font-medium px-4 py-2.5 rounded-lg ${linkClass} ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Products Accordion */}
              <div>
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className={`w-full font-medium px-4 py-2.5 rounded-lg flex items-center justify-between ${linkClass} ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <span>Products</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileProductsOpen && (
                  <div className="mt-1 ml-2 border-l-2 border-primary/30 pl-2">
                    {/* View All */}
                    <Link
                      to="/products"
                      className={`block px-3 py-2 rounded-lg text-sm font-semibold ${transparent ? 'text-white' : 'text-primary'
                        } hover:bg-white/10`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      View All Products
                    </Link>

                    {/* Category Accordions */}
                    {categories.map((cat) => {
                      const isCatExpanded = mobileActiveCategory === cat.slug;
                      const hasSubs = cat.subCategories?.length > 0;
                      const catProducts = getCategoryProducts(cat.slug);
                      return (
                        <div key={cat.slug}>
                          <button
                            onClick={() => {
                              setMobileActiveCategory(isCatExpanded ? '' : cat.slug);
                              setMobileActiveSubCategory('');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${isCatExpanded
                              ? transparent ? 'text-white font-semibold' : 'text-dark font-semibold'
                              : transparent ? 'text-white/70' : 'text-gray-text'
                              } ${hoverBgClass}`}
                          >
                            <span className="flex-1 truncate">{cat.name}</span>
                            <svg
                              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isCatExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isCatExpanded && (
                            <div className="ml-3 mb-1">
                              {COMING_SOON_CATEGORIES.includes(cat.slug) ? (
                                <div className="px-3 py-4 text-center">
                                  <p className={`text-xs font-semibold ${transparent ? 'text-white/80' : 'text-dark'} mb-1`}>Coming Soon</p>
                                  <p className={`text-[11px] ${transparent ? 'text-white/50' : 'text-gray-text'}`}>
                                    Updating {cat.name} collection. Stay tuned!
                                  </p>
                                </div>
                              ) : hasSubs ? (
                                <>
                                  {cat.subCategories.map((sub) => {
                                    const isSubExpanded = mobileActiveSubCategory === sub.slug;
                                    const subProducts = getCategoryProducts(cat.slug, sub.slug);
                                    return (
                                      <div key={sub.slug}>
                                        <button
                                          onClick={() =>
                                            setMobileActiveSubCategory(isSubExpanded ? '' : sub.slug)
                                          }
                                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${isSubExpanded
                                            ? transparent ? 'text-white font-semibold' : 'text-dark font-semibold'
                                            : transparent ? 'text-white/70' : 'text-gray-text'
                                            } ${hoverBgClass}`}
                                        >
                                          <span className="flex-1 truncate">{sub.name}</span>
                                          <svg
                                            className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>

                                        {isSubExpanded && (
                                          <div className="ml-3 mb-1">
                                            {subProducts.map((product) => (
                                              <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product)}
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg ${hoverBgClass} transition-colors`}
                                              >
                                                <div className="w-10 h-8 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                                  <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                  />
                                                </div>
                                                <div className="min-w-0 flex-1 text-left">
                                                  <p className={`text-xs font-medium truncate ${transparent ? 'text-white/90' : 'text-dark'}`}>
                                                    {product.name}
                                                  </p>
                                                  <p className="text-xs font-bold text-primary">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                  </p>
                                                </div>
                                              </button>
                                            ))}
                                            <button
                                              onClick={() => handleSubCategoryClick(cat.slug, sub.slug)}
                                              className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                                            >
                                              See all {sub.name} →
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  <button
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                                  >
                                    See all {cat.name} →
                                  </button>
                                </>
                              ) : (
                                <>
                                  {catProducts.map((product) => (
                                    <button
                                      key={product.id}
                                      onClick={() => handleProductClick(product)}
                                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg ${hoverBgClass} transition-colors`}
                                    >
                                      <div className="w-10 h-8 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                        <img
                                          src={product.image}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1 text-left">
                                        <p className={`text-xs font-medium truncate ${transparent ? 'text-white/90' : 'text-dark'}`}>
                                          {product.name}
                                        </p>
                                        <p className="text-xs font-bold text-primary">
                                          ₹{product.price.toLocaleString('en-IN')}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="block w-full text-left px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                                  >
                                    See all {cat.name} →
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                to="/test-ride"
                className={`font-medium px-4 py-2.5 rounded-lg ${linkClass} ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Test Ride
              </Link>
              <a
                href="#offers"
                onClick={(e) => handleSectionClick(e, 'offers')}
                className={`font-medium px-4 py-2.5 rounded-lg ${linkClass} ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                Offers
              </a>
              <a
                href="#why-us"
                onClick={(e) => handleSectionClick(e, 'why-us')}
                className={`font-medium px-4 py-2.5 rounded-lg ${linkClass} ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                Why Us
              </a>
              {isTestRidePage && onCTAClick && (
                <button
                  onClick={() => { onCTAClick(); setMobileMenuOpen(false); }}
                  className="bg-primary text-white font-bold px-6 py-3 rounded-full mt-2"
                >
                  BOOK NOW
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        title="Contact Us"
      />
    </header>
  );
}
