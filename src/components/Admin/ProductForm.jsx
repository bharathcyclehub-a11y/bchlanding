import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AdminAPI } from '../../utils/auth-api';

// ─── Live Camera Capture Modal ───────────────────────────────────
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async (facing) => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setReady(false);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permission in your browser.'
          : 'Could not access camera. Make sure no other app is using it.'
      );
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onCapture(dataUrl);
  };

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[60] flex flex-col"
    >
      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {cameraError ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-white text-sm mb-4">{cameraError}</p>
            <button onClick={onClose} className="px-6 py-2 bg-white text-dark rounded-full font-bold text-sm">
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <canvas ref={canvasRef} className="hidden" />
      <div className="bg-black/90 px-6 py-5 flex items-center justify-between safe-bottom">
        {/* Close */}
        <button
          onClick={() => {
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            onClose();
          }}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Shutter */}
        <button
          onClick={handleCapture}
          disabled={!ready || !!cameraError}
          className="w-18 h-18 rounded-full bg-white border-4 border-white/30 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
          style={{ width: 72, height: 72 }}
        >
          <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-300" />
        </button>

        {/* Flip camera */}
        <button
          onClick={flipCamera}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default function ProductForm({ product, categories = [], onClose }) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState({ done: 0, total: 0 });
  const [cameraTarget, setCameraTarget] = useState(null); // null | 'main' | 'gallery'
  const [isMobile] = useState(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  const [formData, setFormData] = useState({
    id: product?.id || '',
    name: product?.name || '',
    category: product?.category || 'kids',
    subCategory: product?.subCategory || '',
    price: product?.price || 0,
    mrp: product?.mrp || 0,
    image: product?.image || '',
    cardImage: product?.cardImage || '',
    inStock: product?.inStock !== undefined ? product.inStock : true,
    badge: product?.badge || '',
    shortDescription: product?.shortDescription || '',
    specs: product?.specs || {},
    stock: product?.stock || { quantity: 0, status: 'out_of_stock' },
    colors: product?.colors || [],
    gallery: product?.gallery || [],
    sizeGuide: product?.sizeGuide || null,
    warranty: product?.warranty || null,
    accessories: product?.accessories || []
  });

  const { getIdToken } = useAuth();
  const adminAPI = new AdminAPI(getIdToken);

  // Update stock status based on quantity
  useEffect(() => {
    const quantity = formData.stock.quantity;
    let status = 'out_of_stock';
    if (quantity > 10) status = 'in_stock';
    else if (quantity > 0) status = 'low_stock';

    setFormData(prev => ({
      ...prev,
      stock: { ...prev.stock, status }
    }));
  }, [formData.stock.quantity]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Camera capture callback — sets main image or adds to gallery
  const handleCameraCapture = (dataUrl) => {
    if (cameraTarget === 'main') {
      handleChange('image', dataUrl);
    } else if (cameraTarget === 'gallery') {
      handleChange('gallery', [...formData.gallery, dataUrl]);
    }
    setCameraTarget(null);
  };

  const handleSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [field]: value }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate size (max 2MB for data URL storage)
    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Max 2MB for uploaded images. Use a URL for larger images.');
      return;
    }

    setUploading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      handleChange('image', reader.result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalid = files.filter(f => !allowedTypes.includes(f.type) || f.size > maxSize);
    if (invalid.length > 0) {
      setError(`${invalid.length} file(s) skipped — only JPG/PNG/WebP under 5MB allowed.`);
      const valid = files.filter(f => allowedTypes.includes(f.type) && f.size <= maxSize);
      if (valid.length === 0) return;
      files.length = 0;
      files.push(...valid);
    }

    setGalleryUploading(true);
    setGalleryUploadProgress({ done: 0, total: files.length });
    setError(null);

    const uploadedUrls = [];
    const failed = [];

    for (const file of files) {
      try {
        const url = await adminAPI.uploadProductImage(file);
        uploadedUrls.push(url);
      } catch (err) {
        failed.push(file.name);
      }
      setGalleryUploadProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }

    // Add uploaded URLs to gallery
    if (uploadedUrls.length > 0) {
      handleChange('gallery', [...formData.gallery, ...uploadedUrls]);
    }

    if (failed.length > 0) {
      setError(`Failed to upload: ${failed.join(', ')}`);
    }

    setGalleryUploading(false);
    // Reset file input
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.price || !formData.mrp || !formData.image) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.price > formData.mrp) {
        throw new Error('Price cannot be greater than MRP');
      }

      let response;
      if (isEditing) {
        response = await adminAPI.updateProduct(formData.id, formData);
      } else {
        response = await adminAPI.createProduct(formData);
      }

      if (response.success) {
        onClose();
      }
    } catch (error) {
      setError(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'specs', label: 'Specifications', icon: '⚙️' },
    { id: 'stock', label: 'Stock & Pricing', icon: '📦' },
    { id: 'additional', label: 'Additional', icon: '➕' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-t-2xl sm:rounded-[20px] w-full max-w-4xl sm:my-8 max-h-[95vh] sm:max-h-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="font-display text-lg sm:text-2xl text-dark uppercase tracking-wide">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-[20px] flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-2 sm:px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 sm:px-4 py-2.5 sm:py-3 font-bold text-[11px] sm:text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-text hover:text-dark'
                  }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto flex-1">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Sparrow 12T Kids Cycle"
                    className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    required
                  />
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Product ID (Read-only)
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      disabled
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 bg-gray-50 text-sm font-medium"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => handleChange('subCategory', e.target.value)}
                      placeholder="e.g., emotorad"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide">
                    In Stock
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('inStock', !formData.inStock)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.inStock ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${formData.inStock ? 'translate-x-6' : ''}`} />
                  </button>
                  <span className={`text-xs font-bold ${formData.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.inStock ? 'Available' : 'Out of Stock'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {formData.image && (
                      <div className="relative w-full h-48 rounded-[20px] overflow-hidden bg-gray-100">
                        <img
                          src={formData.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Image URL Input */}
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => { setError(null); handleChange('image', e.target.value); }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />

                    {/* Camera + File Upload */}
                    <div className="flex items-center gap-2">
                      {/* Native camera capture — mobile only */}
                      {isMobile && (
                        <>
                          <input
                            type="file"
                            id="image-camera"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-camera"
                            className={`flex-1 px-4 py-2.5 rounded-full border-2 border-primary/30 bg-primary/5 text-center text-sm font-bold text-primary cursor-pointer hover:bg-primary/10 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {uploading ? 'Processing...' : '📷 Take Photo'}
                          </label>
                        </>
                      )}
                      {/* File picker */}
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.jpe,.png,.webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex-1 px-4 py-2.5 rounded-full border-2 border-dark/10 text-center text-sm font-bold text-dark cursor-pointer hover:bg-gray-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? 'Processing...' : '📤 Upload File'}
                      </label>
                    </div>
                    <p className="text-xs text-gray-text">
                      Paste a URL, take a photo with camera, or upload from device (max 2MB, JPG/PNG/WebP)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Card Image (Thumbnail)
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.cardImage && (
                      <img src={formData.cardImage} alt="Card" className="w-16 h-16 object-cover rounded-lg border" />
                    )}
                    <input
                      type="url"
                      value={formData.cardImage}
                      onChange={(e) => handleChange('cardImage', e.target.value)}
                      placeholder="https://example.com/card-image.png"
                      className="flex-1 px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Badge (Optional)
                  </label>
                  <select
                    value={formData.badge || ''}
                    onChange={(e) => handleChange('badge', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                  >
                    <option value="">No Badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Top Pick">Top Pick</option>
                    <option value="Value Pick">Value Pick</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Brief description of the product..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-[20px] border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-text mb-4">
                  Add technical specifications for this product. Fields vary by category.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Wheel Size
                    </label>
                    <input
                      type="text"
                      value={formData.specs.wheelSize || ''}
                      onChange={(e) => handleSpecChange('wheelSize', e.target.value)}
                      placeholder='e.g., 26"'
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Frame Type
                    </label>
                    <input
                      type="text"
                      value={formData.specs.frameType || ''}
                      onChange={(e) => handleSpecChange('frameType', e.target.value)}
                      placeholder="e.g., Steel, Alloy"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Gear Count
                    </label>
                    <input
                      type="text"
                      value={formData.specs.gearCount || ''}
                      onChange={(e) => handleSpecChange('gearCount', e.target.value)}
                      placeholder="e.g., 21 Speed, Single Speed"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Brake Type
                    </label>
                    <input
                      type="text"
                      value={formData.specs.brakeType || ''}
                      onChange={(e) => handleSpecChange('brakeType', e.target.value)}
                      placeholder="e.g., Disc, V-Brake"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={formData.specs.weight || ''}
                      onChange={(e) => handleSpecChange('weight', e.target.value)}
                      placeholder="e.g., 15 kg"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                    />
                  </div>

                  {formData.category === 'kids' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                        Age Range
                      </label>
                      <input
                        type="text"
                        value={formData.specs.ageRange || ''}
                        onChange={(e) => handleSpecChange('ageRange', e.target.value)}
                        placeholder="e.g., 5-8 years"
                        className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      />
                    </div>
                  )}

                  {formData.category === 'electric' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Motor
                        </label>
                        <input
                          type="text"
                          value={formData.specs.motor || ''}
                          onChange={(e) => handleSpecChange('motor', e.target.value)}
                          placeholder="e.g., 250W Hub Motor"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Battery
                        </label>
                        <input
                          type="text"
                          value={formData.specs.battery || ''}
                          onChange={(e) => handleSpecChange('battery', e.target.value)}
                          placeholder="e.g., 36V 10Ah Li-ion"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Range
                        </label>
                        <input
                          type="text"
                          value={formData.specs.range || ''}
                          onChange={(e) => handleSpecChange('range', e.target.value)}
                          placeholder="e.g., 35-40 km"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Suspension
                        </label>
                        <input
                          type="text"
                          value={formData.specs.suspension || ''}
                          onChange={(e) => handleSpecChange('suspension', e.target.value)}
                          placeholder="e.g., 80mm Travel Fork"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Display
                        </label>
                        <input
                          type="text"
                          value={formData.specs.display || ''}
                          onChange={(e) => handleSpecChange('display', e.target.value)}
                          placeholder="e.g., Cluster C6+ Display"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Charging Time
                        </label>
                        <input
                          type="text"
                          value={formData.specs.chargingTime || ''}
                          onChange={(e) => handleSpecChange('chargingTime', e.target.value)}
                          placeholder="e.g., 5-7 hours"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                          Lights
                        </label>
                        <input
                          type="text"
                          value={formData.specs.lights || ''}
                          onChange={(e) => handleSpecChange('lights', e.target.value)}
                          placeholder="e.g., Front and Rear Light"
                          className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Stock & Pricing Tab */}
            {activeTab === 'stock' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                      placeholder="9999"
                      min="0"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                      MRP (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => handleChange('mrp', parseInt(e.target.value) || 0)}
                      placeholder="14999"
                      min="0"
                      className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {formData.mrp > 0 && formData.price > 0 && (
                  <div className="p-4 bg-primary/5 rounded-[20px] border border-primary/20">
                    <p className="text-sm font-bold text-primary">
                      Discount: {Math.round((1 - formData.price / formData.mrp) * 100)}% OFF
                    </p>
                    <p className="text-xs text-gray-text mt-1">
                      Savings: ₹{(formData.mrp - formData.price).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock.quantity}
                    onChange={(e) => handleChange('stock', {
                      ...formData.stock,
                      quantity: parseInt(e.target.value) || 0
                    })}
                    placeholder="10"
                    min="0"
                    className="w-full px-4 py-2 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                  />
                  <p className="text-xs text-gray-text mt-2">
                    Stock Status: <span className="font-bold">{formData.stock.status.replace('_', ' ').toUpperCase()}</span>
                    <br />
                    • 0 = Out of Stock
                    <br />
                    • 1-10 = Low Stock
                    <br />
                    • 11+ = In Stock
                  </p>
                </div>
              </div>
            )}

            {/* Additional Tab — Colors, Gallery, and more */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                {/* Colors Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide">
                      Color Variants
                    </label>
                    <button
                      type="button"
                      onClick={() => handleChange('colors', [
                        ...formData.colors,
                        { name: '', hex: '#000000', inStock: true }
                      ])}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      + Add Color
                    </button>
                  </div>
                  {formData.colors.length === 0 ? (
                    <p className="text-xs text-gray-text italic">No color variants added.</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.colors.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                          <input
                            type="color"
                            value={color.hex?.startsWith('#') ? color.hex : '#000000'}
                            onChange={(e) => {
                              const updated = [...formData.colors];
                              updated[idx] = { ...updated[idx], hex: e.target.value };
                              handleChange('colors', updated);
                            }}
                            className="w-8 h-8 rounded-full border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => {
                              const updated = [...formData.colors];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              handleChange('colors', updated);
                            }}
                            placeholder="Color name"
                            className="flex-1 px-3 py-1.5 rounded-full border border-dark/10 text-sm focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            value={color.hex}
                            onChange={(e) => {
                              const updated = [...formData.colors];
                              updated[idx] = { ...updated[idx], hex: e.target.value };
                              handleChange('colors', updated);
                            }}
                            placeholder="#hex or CSS"
                            className="w-32 px-3 py-1.5 rounded-full border border-dark/10 text-xs font-mono focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.colors];
                              updated[idx] = { ...updated[idx], inStock: !updated[idx].inStock };
                              handleChange('colors', updated);
                            }}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              color.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {color.inStock ? 'IN' : 'OUT'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange('colors', formData.colors.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gallery Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-gray-text uppercase tracking-wide">
                      Gallery Images
                    </label>
                    <div className="flex gap-2">
                      {/* Native camera capture for gallery — mobile only */}
                      {isMobile && (
                        <>
                          <input
                            type="file"
                            id="gallery-camera"
                            accept="image/*"
                            capture="environment"
                            onChange={handleGalleryUpload}
                            className="hidden"
                            disabled={galleryUploading}
                          />
                          <label
                            htmlFor="gallery-camera"
                            className={`px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer ${galleryUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            📷 Camera
                          </label>
                        </>
                      )}
                      {/* File picker for gallery */}
                      <input
                        type="file"
                        id="gallery-upload"
                        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.jpe,.png,.webp"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                        disabled={galleryUploading}
                      />
                      <label
                        htmlFor="gallery-upload"
                        className={`px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold hover:bg-green-200 transition-colors cursor-pointer ${galleryUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {galleryUploading
                          ? `Uploading ${galleryUploadProgress.done}/${galleryUploadProgress.total}...`
                          : '+ Upload Files'}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleChange('gallery', [...formData.gallery, ''])}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>

                  {/* Upload progress bar */}
                  {galleryUploading && (
                    <div className="mb-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${galleryUploadProgress.total > 0 ? (galleryUploadProgress.done / galleryUploadProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-text mt-1">
                        Uploading {galleryUploadProgress.done} of {galleryUploadProgress.total} images to Firebase Storage...
                      </p>
                    </div>
                  )}

                  {formData.gallery.length === 0 ? (
                    <p className="text-xs text-gray-text italic">No gallery images. Main image will be used.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.gallery.map((url, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {url && (
                            <img src={url} alt="" className="w-8 h-8 object-cover rounded border shrink-0" />
                          )}
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const updated = [...formData.gallery];
                              updated[idx] = e.target.value;
                              handleChange('gallery', updated);
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-1.5 rounded-full border border-dark/10 text-xs focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleChange('gallery', formData.gallery.filter((_, i) => i !== idx))}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-text mt-2">
                    {formData.gallery.length} image{formData.gallery.length !== 1 ? 's' : ''} in gallery.
                    Select multiple files at once to upload them all.
                  </p>
                </div>

                {/* Advanced Features Note */}
                <div className="p-4 bg-gray-50 rounded-[20px]">
                  <p className="text-sm font-bold text-dark mb-2">Advanced Features</p>
                  <ul className="text-xs text-gray-text space-y-1">
                    <li>Size Guide, Warranty, and Accessories can be configured by editing the product data directly.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full border-2 border-dark/10 text-dark hover:bg-gray-50 transition-all duration-300 font-bold text-sm uppercase tracking-wide disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || galleryUploading}
              className="flex-1 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
