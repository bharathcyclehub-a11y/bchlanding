/**
 * Reusable Skeleton loading components
 * Replace spinners with content-shaped placeholders
 */

function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <SkeletonBlock className="w-full aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-3 w-14" />
        </div>
        <SkeletonBlock className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Product Detail Skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <SkeletonBlock className="w-full aspect-square rounded-2xl" />
        {/* Info */}
        <div className="space-y-4">
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-5 w-1/2" />
          <SkeletonBlock className="h-10 w-32" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-4/6" />
          <div className="flex gap-3 pt-4">
            <SkeletonBlock className="h-12 w-40 rounded-full" />
            <SkeletonBlock className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Testimonial Skeleton
export function TestimonialSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <SkeletonBlock className="h-3 w-4/6" />
      </div>
    </div>
  );
}

// Page-level skeleton (replaces the spinner)
export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <SkeletonBlock className="w-full h-[60vh]" />
      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <SkeletonBlock className="h-8 w-64 mx-auto" />
          <SkeletonBlock className="h-4 w-96 mx-auto" />
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}

export default SkeletonBlock;
