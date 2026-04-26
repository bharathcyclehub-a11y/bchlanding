import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * LazyImage - Performance-optimized image component with lazy loading
 *
 * Features:
 * - Intersection Observer API for lazy loading
 * - Loading placeholder
 * - Fade-in animation on load
 * - Error handling
 * - eager prop: skips lazy loading + shows instantly if cached
 *
 * Usage:
 * <LazyImage src="/path/to/image.jpg" alt="Description" className="..." />
 * <LazyImage src="/hero.jpg" alt="Hero" eager />
 */

// Track images that have been successfully loaded this session
const loadedCache = new Set();

export default function LazyImage({
  src,
  alt,
  className = '',
  objectFit = 'cover',
  placeholder = 'blur',
  eager = false,
  onLoad,
  ...props
}) {
  // If eager and already cached, start fully visible — no flash
  const alreadyCached = eager && loadedCache.has(src);
  const [imageSrc, setImageSrc] = useState(eager ? src : null);
  const [imageLoaded, setImageLoaded] = useState(alreadyCached);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Skip IntersectionObserver for eager (above-the-fold) images
    if (eager) {
      setImageSrc(src);
      if (loadedCache.has(src)) {
        setImageLoaded(true);
      } else {
        setImageLoaded(false);
      }
      setImageError(false);
      return;
    }

    // Reset state for new src
    setImageLoaded(false);
    setImageError(false);
    setImageSrc(null);

    // Use Intersection Observer to load image when it's near viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px' // Start loading 200px before image enters viewport
      }
    );

    const node = imgRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
    };
  }, [src, eager]);

  const handleLoad = useCallback(() => {
    loadedCache.add(src);
    setImageLoaded(true);
    onLoad?.();
  }, [src, onLoad]);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: placeholder === 'blur' ? '#f3f4f6' : 'transparent' }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={props.fetchpriority || (eager ? 'high' : 'auto')}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full ${imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${alreadyCached ? '' : 'transition-opacity duration-300'
            } ${objectFit === 'contain' ? 'object-contain' : 'object-cover'
            }`}
          {...props}
        />
      )}

      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-full h-full bg-gray-200"></div>
        </div>
      )}

      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8 mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
