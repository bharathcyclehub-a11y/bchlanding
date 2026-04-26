import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import LazyImage from './LazyImage';

const badgeStyles = {
  'Bestseller': 'bg-dark/90 text-white backdrop-blur-sm',
  'New Arrival': 'bg-dark/90 text-white backdrop-blur-sm',
  'Top Pick': 'bg-primary/90 text-white backdrop-blur-sm',
  'Value Pick': 'bg-dark/90 text-white backdrop-blur-sm',
  'Top Rated': 'bg-dark/90 text-white backdrop-blur-sm',
};

function ProductCard({ product, onEnquire, onClick }) {
  const { name, price, mrp, image, specs, badge, shortDescription, colors, subCategory, gallery } = product;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const [selectedColor, setSelectedColor] = useState(0);

  // Find the first gallery image matching the selected color
  // Skip color swatch images (short filenames in /uploads/ root like "Dual Silver Red.jpg")
  const isProductPhoto = (url) => {
    const lower = url.toLowerCase();
    // Product photos use hashed filenames or are in subdirectories (mobile/, thumbs/)
    return lower.includes('/image_new/') || lower.includes('/uploads/mobile/') || lower.includes('/uploads/thumbs/') || /\/[a-f0-9]{20,}\.\w+$/.test(lower);
  };

  const getImageForColor = (colorIdx) => {
    if (!colors?.length || !gallery?.length) return image;
    const color = colors[colorIdx];
    if (!color) return image;
    const productPhotos = gallery.filter(isProductPhoto);
    if (color.urlKey) {
      const key = color.urlKey.toLowerCase();
      const match = productPhotos.find((url) => url.toLowerCase().includes(key));
      if (match) return match;
    }
    const keywords = color.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
    const match = productPhotos.find((url) => {
      const urlLower = url.toLowerCase();
      return keywords.some((kw) => kw.length >= 3 && urlLower.includes(kw));
    });
    return match || image;
  };

  const displayImage = getImageForColor(selectedColor);

  // Check if this is a Hercules product (uses illustration-style images)
  const isHercules = subCategory === 'hercules';

  const displaySpecs = [
    { label: specs.wheelSize, key: 'wheelSize' },
    { label: specs.gearCount, key: 'gearCount' },
    { label: specs.frameType, key: 'frameType' },
    { label: specs.brakeType, key: 'brakeType' },
  ].filter((s) => s.label);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group bg-[#FAFAFA] rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-shadow duration-700"
      onClick={() => onClick && onClick(product)}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isHercules ? 'bg-[#F5F5F7]' : 'bg-[#F5F5F7]'}`}>
        <div className="overflow-hidden">
          <LazyImage
            src={displayImage}
            alt={name}
            className="w-full aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-105"
            objectFit="cover"
          />
        </div>
        {badge && (
          <span className={`absolute top-3 left-3 text-[10px] sm:text-[11px] font-medium px-3 py-1 rounded-full tracking-wide ${badgeStyles[badge] || 'bg-dark/80 text-white backdrop-blur-sm'}`}>
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/90 text-white backdrop-blur-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-2">
        {/* Name */}
        <h3 className="text-sm sm:text-[15px] font-semibold text-dark line-clamp-2 leading-snug tracking-tight">
          {name}
        </h3>

        {/* Short description */}
        {shortDescription && (
          <p className="text-[11px] sm:text-xs text-gray-text/70 leading-relaxed line-clamp-1">
            {shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap mt-1">
          <span className="text-lg sm:text-xl font-semibold text-dark tracking-tight">
            {'\u20b9'}{price.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <span className="text-[11px] sm:text-xs text-gray-text/50 line-through font-light">
              {'\u20b9'}{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {colors?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            {colors.map((color, idx) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(idx);
                }}
                className={`w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full transition-all duration-300 flex-shrink-0 ${
                  selectedColor === idx
                    ? 'ring-2 ring-dark/30 ring-offset-2 ring-offset-[#FAFAFA] scale-110'
                    : 'ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="text-[10px] sm:text-[11px] text-gray-text/60 ml-1 truncate font-light">
              {colors[selectedColor]?.name}
            </span>
          </div>
        )}

        {/* Specs chips */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {displaySpecs.slice(0, 3).map((spec) => (
            <span
              key={spec.key}
              className="inline-flex items-center text-[9px] sm:text-[11px] text-gray-text/60 font-light"
            >
              {spec.label}
              {spec.key !== displaySpecs.slice(0, 3).at(-1)?.key && (
                <span className="ml-1.5 text-gray-200">|</span>
              )}
            </span>
          ))}
        </div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1" />

        {/* CTAs */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(product);
            }}
            className="flex-1 py-2.5 rounded-full border border-gray-200 text-dark text-[11px] sm:text-xs font-medium transition-all duration-300 hover:border-dark hover:bg-dark hover:text-white min-h-[40px]"
          >
            Details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnquire(product);
            }}
            className="flex-1 py-2.5 rounded-full bg-dark text-white text-[11px] sm:text-xs font-medium transition-all duration-300 hover:bg-primary min-h-[40px]"
          >
            Enquire
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCard, (prev, next) => prev.product.id === next.product.id);
