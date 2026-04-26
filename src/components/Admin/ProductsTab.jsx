import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AdminAPI } from '../../utils/auth-api';
import { LayoutGrid, Table, Download, Upload, Image, X, FileSpreadsheet } from 'lucide-react';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';
import ProductDataGrid from './ProductDataGrid';
import { categories as localCategories, products as localProducts } from '../../data/products';
import { invalidateProductsCache } from '../../utils/productsCache';

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importExcelFile, setImportExcelFile] = useState(null);
  const [importImageFiles, setImportImageFiles] = useState([]);
  const [importProgress, setImportProgress] = useState('');
  const [importUploaded, setImportUploaded] = useState(0);  // count of uploaded images
  const [importFailed, setImportFailed] = useState(0);      // count of failed uploads
  const [importUnmatched, setImportUnmatched] = useState([]); // image names not found in Excel
  const [importTotalToUpload, setImportTotalToUpload] = useState(0); // matched images count
  const [importMethod, setImportMethod] = useState('auto'); // 'auto' | 'row-order' | 'filename'
  const fileInputRef = useRef(null);
  const importExcelRef = useRef(null);
  const importImageRef = useRef(null);
  const [filters, setFilters] = useState({
    category: 'all',
    subCategory: 'all',
    status: 'all',
    search: ''
  });

  const { getIdToken } = useAuth();
  const adminAPI = new AdminAPI(getIdToken);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success && data.data?.length > 0) {
        setCategories(data.data);
      } else {
        // Fallback to local categories
        setCategories(localCategories);
      }
    } catch (error) {
      console.error('❌ Error fetching categories, using local fallback:', error);
      setCategories(localCategories);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {};
      if (filters.category !== 'all') filterParams.category = filters.category;
      if (filters.subCategory !== 'all') filterParams.subCategory = filters.subCategory;
      if (filters.status !== 'all') filterParams.status = filters.status;

      let filteredProducts = [];

      try {
        const response = await adminAPI.getProducts(filterParams);
        const deletedIds = response.deletedIds || [];
        if (response.success && (response.products?.length > 0 || deletedIds.length > 0)) {
          // Merge: API products override local, but local-only products are included
          // Products in deletedIds are excluded from both sources
          filteredProducts = mergeProducts(response.products || [], getLocalFilteredProducts(), deletedIds);
        } else {
          // No API products — use local catalog as source of truth
          filteredProducts = getLocalFilteredProducts();
        }
      } catch {
        // API failed, use local products
        filteredProducts = getLocalFilteredProducts();
      }

      // Client-side subcategory filter (API doesn't support it)
      if (filters.subCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.subCategory === filters.subCategory);
      }

      // Client-side search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower)
        );
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Merge API (Firestore) products with local products.js catalog.
  // API products take priority for matching IDs (they have real-time data).
  // Local-only products (new additions) get included so they always appear.
  // Products whose IDs are in deletedIds are excluded from both sources.
  const mergeProducts = (apiProducts, localProds, deletedIds = []) => {
    const deletedSet = new Set(deletedIds);
    const apiMap = new Map(apiProducts.map(p => [p.id, p]));
    const merged = [...apiProducts];

    for (const local of localProds) {
      if (!apiMap.has(local.id) && !deletedSet.has(local.id)) {
        merged.push(local);
      }
    }

    return merged;
  };

  // Get filtered products from local data
  const getLocalFilteredProducts = () => {
    let result = [...localProducts];
    if (filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.subCategory !== 'all') {
      result = result.filter(p => p.subCategory === filters.subCategory);
    }
    return result;
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.deleteProduct(productId);
      if (response.success) {
        invalidateProductsCache();
        await fetchProducts();
        setSuccess(`Product "${productName}" deleted successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      setError(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    invalidateProductsCache();
    fetchProducts();
  };

  // ============ Import Modal Handlers ============

  // Simple CSV line parser that handles quoted fields (e.g., "a,b" stays as one field)
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Extract image filenames referenced in the Excel/CSV file (client-side parsing)
  const extractReferencedImages = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.name.match(/\.csv$/i)) {
        // CSV: parse as text
        reader.onload = (e) => {
          try {
            const text = e.target.result.replace(/^\uFEFF/, ''); // strip BOM
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            if (lines.length < 2) { resolve(new Set()); return; }

            const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
            const imagesIdx = headers.indexOf('images');
            if (imagesIdx === -1) { resolve(new Set()); return; }

            const filenames = new Set();
            for (let i = 1; i < lines.length; i++) {
              const cols = parseCSVLine(lines[i]);
              const cell = cols[imagesIdx] || '';
              cell.split(',').forEach(name => {
                const t = name.trim();
                if (t && !t.startsWith('http://') && !t.startsWith('https://')) {
                  filenames.add(t);
                }
              });
            }
            resolve(filenames);
          } catch (err) { reject(err); }
        };
        reader.readAsText(file);
      } else {
        // XLSX/XLS: use xlsx library (dynamic import, lazy loaded)
        reader.onload = async (e) => {
          try {
            const XLSX = (await import('xlsx')).default || (await import('xlsx'));
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

            const filenames = new Set();
            rows.forEach(row => {
              const cell = String(row.images || row.Images || '');
              cell.split(',').forEach(name => {
                const t = name.trim();
                if (t && !t.startsWith('http://') && !t.startsWith('https://')) {
                  filenames.add(t);
                }
              });
            });
            resolve(filenames);
          } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Upload images to Firebase Storage in batches, returns imageMap { filename: url }
  const uploadImagesBatch = async (images, token) => {
    const imageMap = {};
    let uploaded = 0;
    let failed = 0;
    const BATCH_SIZE = 5;

    setImportTotalToUpload(images.length);
    setImportProgress(`Uploading 0/${images.length} images...`);

    const uploadSingleImage = async (imgFile) => {
      try {
        const imgFormData = new FormData();
        imgFormData.append('image', imgFile);

        const imgResponse = await fetch('/api/products/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: imgFormData
        });

        const imgData = await imgResponse.json();

        if (imgData.success) {
          imageMap[imgFile.name] = imgData.imageUrl;
          imageMap[imgFile.name.toLowerCase()] = imgData.imageUrl;
          uploaded++;
        } else {
          console.warn(`Failed to upload "${imgFile.name}":`, imgData.error);
          failed++;
        }
      } catch (err) {
        console.warn(`Error uploading "${imgFile.name}":`, err);
        failed++;
      }
      setImportUploaded(uploaded);
      setImportFailed(failed);
      setImportProgress(`Uploading ${uploaded + failed}/${images.length} images...`);
    };

    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(uploadSingleImage));
    }

    return { imageMap, uploaded, failed };
  };

  const handleImportWithImages = async () => {
    if (!importExcelFile && importImageFiles.length === 0) {
      setError('Please select an Excel file or images to upload');
      return;
    }

    try {
      setUploadingExcel(true);
      setError(null);
      setSuccess(null);
      setImportUploaded(0);
      setImportFailed(0);
      setImportUnmatched([]);
      setImportTotalToUpload(0);
      const token = await getIdToken();

      const imageMap = {};
      const totalImages = importImageFiles.length;
      const unmatchedNames = [];

      // === Images-only mode (no Excel) ===
      if (!importExcelFile && totalImages > 0) {
        // Verify image filenames against existing products
        setImportProgress('Verifying images against product database...');

        // Build a set of known product identifiers (id, name lowercase, image filename from URL)
        const knownNames = new Set();
        products.forEach(p => {
          knownNames.add(p.id.toLowerCase());
          knownNames.add(p.name.toLowerCase());
          // Extract filename from image URL if present
          if (p.image) {
            const urlFilename = p.image.split('/').pop()?.split('?')[0]?.toLowerCase();
            if (urlFilename) knownNames.add(urlFilename);
          }
          // Check gallery images too
          if (p.gallery) {
            p.gallery.forEach(url => {
              const gf = url.split('/').pop()?.split('?')[0]?.toLowerCase();
              if (gf) knownNames.add(gf);
            });
          }
        });

        // Match images: filename (without extension) matches product id or name
        const matchedImages = [];
        const skippedNames = [];
        for (const imgFile of importImageFiles) {
          const nameNoExt = imgFile.name.replace(/\.[^.]+$/, '').toLowerCase();
          const nameLower = imgFile.name.toLowerCase();
          if (knownNames.has(nameNoExt) || knownNames.has(nameLower)) {
            matchedImages.push(imgFile);
          } else {
            skippedNames.push(imgFile.name);
          }
        }

        if (skippedNames.length > 0) {
          setImportUnmatched(skippedNames);
        }

        if (matchedImages.length === 0) {
          setError(`No images match existing products. Make sure image filenames match product IDs or names (e.g., "kids-001.jpg" for product ID "kids-001"). Unmatched: ${skippedNames.join(', ')}`);
          setUploadingExcel(false);
          setImportProgress('');
          return;
        }

        const result = await uploadImagesBatch(matchedImages, token);
        Object.assign(imageMap, result.imageMap);

        const uniqueCount = Object.keys(imageMap).length / 2;
        let msg = `Successfully uploaded ${uniqueCount} image${uniqueCount !== 1 ? 's' : ''} to storage`;
        if (result.failed > 0) msg += ` (${result.failed} failed)`;
        if (skippedNames.length > 0) msg += `. Skipped ${skippedNames.length} image(s) not matching any product`;
        setSuccess(msg + '!');

        // Reset modal
        setShowImportModal(false);
        setImportExcelFile(null);
        setImportImageFiles([]);
        setImportUploaded(0);
        setImportFailed(0);
        setImportUnmatched([]);
        setImportTotalToUpload(0);
        return;
      }

      // === Excel + optional images mode (filename matching only) ===
      if (totalImages > 0 && importMethod === 'filename') {
        // Parse Excel to find which image filenames are referenced
        setImportProgress('Reading Excel file to match images...');
        let referencedNames;
        try {
          referencedNames = await extractReferencedImages(importExcelFile);
        } catch (parseErr) {
          console.warn('Could not parse Excel for image names, uploading all:', parseErr);
          referencedNames = null;
        }

        // Split images into matched vs unmatched
        let matchedImages;
        if (referencedNames && referencedNames.size > 0) {
          matchedImages = [];
          for (const imgFile of importImageFiles) {
            if (referencedNames.has(imgFile.name) || referencedNames.has(imgFile.name.toLowerCase())) {
              matchedImages.push(imgFile);
            } else {
              unmatchedNames.push(imgFile.name);
            }
          }
          setImportUnmatched(unmatchedNames);
        } else {
          matchedImages = [...importImageFiles];
        }

        if (matchedImages.length === 0 && unmatchedNames.length > 0) {
          setError(`None of the selected images match filenames in the Excel. Unmatched images: ${unmatchedNames.join(', ')}. Make sure the "images" column in Excel has the exact filenames.`);
          setUploadingExcel(false);
          setImportProgress('');
          return;
        }

        if (matchedImages.length > 0) {
          const result = await uploadImagesBatch(matchedImages, token);
          Object.assign(imageMap, result.imageMap);
        }
      }

      // Send Excel + imageMap to import API
      if (importMethod === 'auto') {
        setImportProgress('Extracting embedded images & importing products...');
      } else {
        setImportProgress('Importing products from Excel...');
      }

      const formData = new FormData();
      formData.append('file', importExcelFile);
      formData.append('importMethod', importMethod);
      formData.append('imageMap', JSON.stringify(imageMap));

      // For row-order mode, append images in order
      if (importMethod === 'row-order' && importImageFiles.length > 0) {
        formData.append('rowOrderImages', 'true');
        importImageFiles.forEach((file, i) => {
          formData.append(`rowImage_${i}`, file);
        });
      }

      const response = await fetch('/api/products/import-excel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        invalidateProductsCache();
        const imgCount = Object.keys(imageMap).length / 2;
        let msg = `Successfully imported ${data.data.created} products`;
        // Show embedded image count if applicable
        if (data.data?.embeddedImagesFound > 0) {
          msg += ` with ${data.data.embeddedImagesFound} auto-extracted images`;
        } else if (imgCount > 0) {
          msg += ` with ${imgCount} images`;
        }
        if (data.data.failed > 0) msg += ` (${data.data.failed} products failed)`;
        if (unmatchedNames.length > 0) {
          msg += `. Skipped ${unmatchedNames.length} image(s) not in Excel: ${unmatchedNames.join(', ')}`;
        }
        setSuccess(msg + '!');
        if (data.data.failed > 0) {
          console.error('Failed imports:', data.data.errors);
        }
        // Reset modal
        setShowImportModal(false);
        setImportExcelFile(null);
        setImportImageFiles([]);
        setImportUploaded(0);
        setImportFailed(0);
        setImportUnmatched([]);
        setImportTotalToUpload(0);
        fetchProducts();
      } else {
        throw new Error(data.error || 'Failed to import Excel file');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import');
    } finally {
      setUploadingExcel(false);
      setImportProgress('');
    }
  };

  const handleImportExcelSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Invalid file type. Please select an Excel file (.xlsx, .xls, or .csv)');
      return;
    }

    setImportExcelFile(file);
  };

  const handleImportImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) return false;
      if (file.size > maxSize) return false;
      return true;
    });

    setImportImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImportImage = (index) => {
    setImportImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle inline product update (for DataGrid)
  const handleUpdateProduct = async (productId, updates) => {
    try {
      // Merge full product data with updates so backend upsert has complete data
      const fullProduct = products.find(p => p.id === productId);
      const payload = fullProduct ? { ...fullProduct, ...updates } : updates;
      // Remove timestamp fields that shouldn't be overwritten
      delete payload.createdAt;
      delete payload.updatedAt;

      const response = await adminAPI.updateProduct(productId, payload);
      if (response.success) {
        invalidateProductsCache();
        setSuccess('Product updated successfully!');
        await fetchProducts();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      setError(error.message || 'Failed to update product');
    }
  };

  // Handle bulk delete (for DataGrid)
  const handleBulkDelete = async (productIds) => {
    try {
      setLoading(true);
      setError(null);

      // Delete products one by one
      const deletePromises = productIds.map(id => adminAPI.deleteProduct(id));
      await Promise.all(deletePromises);

      invalidateProductsCache();
      setSuccess(`Successfully deleted ${productIds.length} products!`);
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('❌ Error bulk deleting products:', error);
      setError(error.message || 'Failed to delete products');
    } finally {
      setLoading(false);
    }
  };

  // Download Excel template with correct headers + sample rows
  const handleDownloadTemplate = () => {
    const headers = [
      'name', 'category', 'price', 'mrp', 'stock', 'stockStatus',
      'description', 'brand', 'ageRange', 'tags', 'images',
      'frameSize', 'wheelSize', 'gears', 'weight', 'maxLoad',
      'brakeType', 'suspension', 'material',
      'isFeatured', 'isNew'
    ];

    const sampleRows = [
      [
        'Hero Sprint Pro 26T', 'geared', '8999', '12999', '25', 'in_stock',
        '21 speed geared cycle for adults', 'Hero', '12+', 'geared,adult,hero',
        'hero-sprint.jpg,hero-sprint-side.jpg',
        '18 inch', '26 inch', '21', '14.5 kg', '100 kg',
        'Disc Brake', 'Front Suspension', 'Steel',
        'true', 'false'
      ],
      [
        'BSA Champ Toonz 16T', 'kids', '4599', '5999', '15', 'in_stock',
        'Colorful kids bicycle with training wheels', 'BSA', '4-6 years', 'kids,bsa,training wheels',
        'bsa-toonz.jpg',
        '10 inch', '16 inch', '', '8 kg', '35 kg',
        'Caliper', '', 'Steel',
        'false', 'true'
      ]
    ];

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row =>
        row.map(cell => {
          // Wrap in quotes if cell contains commas
          if (String(cell).includes(',')) return `"${cell}"`;
          return cell;
        }).join(',')
      )
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStockBadge = (stock) => {
    if (!stock) return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

    switch (stock.status) {
      case 'in_stock':
        return { color: 'bg-green-100 text-green-800', label: `In Stock (${stock.quantity})` };
      case 'low_stock':
        return { color: 'bg-yellow-100 text-yellow-800', label: `Low Stock (${stock.quantity})` };
      case 'out_of_stock':
        return { color: 'bg-red-100 text-red-800', label: 'Out of Stock' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: stock.status };
    }
  };

  return (
    <div>
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="font-display text-lg sm:text-2xl text-dark uppercase tracking-wide shrink-0">Products</h2>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 font-bold text-[10px] sm:text-sm uppercase tracking-wide"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Import
          </button>

          {/* Add Category */}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-dark text-white hover:bg-dark/90 transition-all duration-300 font-bold text-[10px] sm:text-sm uppercase tracking-wide"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Category
          </button>

          {/* View Toggle - desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm uppercase tracking-wide ${viewMode === 'table'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-text hover:text-dark'
                }`}
            >
              <Table className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-bold text-sm uppercase tracking-wide ${viewMode === 'grid'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-text hover:text-dark'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
          </div>

          {/* Add Product */}
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-[10px] sm:text-sm uppercase tracking-wide"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="sm:hidden">Product</span>
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[20px] flex items-center gap-3"
        >
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-bold text-green-800">Success</p>
            <p className="text-sm text-green-600">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[20px] flex items-center gap-3"
        >
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-bold text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Filter Toggle + Search */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => setShowFilters(prev => !prev)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 border-2 ${showFilters
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-dark border-gray-200 hover:border-primary'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden sm:inline">Filters</span>
          {(() => {
            const count = [
              filters.category !== 'all',
              filters.subCategory !== 'all',
              filters.status !== 'all',
              filters.search
            ].filter(Boolean).length;
            return count > 0 ? (
              <span className={`ml-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${showFilters ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                {count}
              </span>
            ) : null;
          })()}
        </button>

        {/* Search inline - always visible */}
        <div className="flex-1 sm:max-w-xs">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none text-xs sm:text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[20px] p-5 sm:p-6 mb-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark uppercase tracking-wide text-sm">Filter Products</h3>
                <button
                  onClick={() => setFilters({ category: 'all', subCategory: 'all', status: 'all', search: filters.search })}
                  className="text-xs text-primary hover:underline font-bold uppercase tracking-wide"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: 'all' })}
                    className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">Sub Category</label>
                  {(() => {
                    const selectedCat = localCategories.find(c => c.slug === filters.category);
                    const subCats = selectedCat?.subCategories || [];
                    return (
                      <select
                        value={filters.subCategory}
                        onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
                        disabled={subCats.length === 0}
                        className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="all">{subCats.length > 0 ? 'All Sub Categories' : 'No Sub Categories'}</option>
                        {subCats.map(sub => (
                          <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {/* Stock Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">Stock Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Display - Table or Grid View */}
      {viewMode === 'table' ? (
        /* Excel-like Data Grid View */
        <ProductDataGrid
          products={products}
          categories={categories}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onBulkDelete={handleBulkDelete}
          onUpdateProduct={handleUpdateProduct}
          loading={loading && products.length === 0}
        />
      ) : (
        /* Card Grid View */
        <>
          {loading && products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[20px]">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-text font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[20px]">
              <svg className="w-16 h-16 mx-auto text-gray-text mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-text font-medium">No products found</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-sm uppercase tracking-wide"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => {
                const stockBadge = getStockBadge(product.stock);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-dark text-sm mb-1">{product.name}</h3>
                          <p className="text-xs text-gray-text uppercase tracking-wide">
                            {categories.find(c => c.slug === product.category)?.name || product.category}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-text line-through">₹{product.mrp.toLocaleString()}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs font-bold text-green-600 ml-auto">
                            {Math.round((1 - product.price / product.mrp) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Color Swatches */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3">
                          {product.colors.slice(0, 6).map((c, ci) => (
                            <span
                              key={ci}
                              title={c.name}
                              className="w-5 h-5 rounded-full border border-gray-300"
                              style={{
                                background: c.hex?.startsWith('linear') ? c.hex : c.hex || '#ccc',
                                opacity: c.inStock === false ? 0.4 : 1,
                              }}
                            />
                          ))}
                          {product.colors.length > 6 && (
                            <span className="text-[10px] text-gray-text font-bold">+{product.colors.length - 6}</span>
                          )}
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="mb-3">
                        {product.stock ? (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${stockBadge.color}`}>
                            {stockBadge.label}
                          </span>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            product.inStock !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 px-4 py-2 rounded-full bg-dark text-white hover:bg-dark/90 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="px-4 py-2 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onClose={handleFormClose}
          />
        )}
      </AnimatePresence>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryManager && (
          <CategoryManager
            onClose={() => {
              setShowCategoryManager(false);
              fetchCategories();
              fetchProducts();
            }}
          />
        )}
      </AnimatePresence>

      {/* Import Modal - Excel + Images Together */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => { if (!uploadingExcel) setShowImportModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-[20px] w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl sm:rounded-t-[20px]">
                <div>
                  <h3 className="font-display text-base sm:text-lg text-dark uppercase tracking-wide">Import Products</h3>
                  <p className="text-[10px] sm:text-xs text-gray-text mt-0.5 sm:mt-1">Upload Excel file with product images</p>
                </div>
                <button
                  onClick={() => { if (!uploadingExcel) setShowImportModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-text" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                {/* Download Template Link */}
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 text-sm text-green-700 font-bold hover:text-green-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>

                {/* Hidden file inputs */}
                <input
                  ref={importExcelRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcelSelect}
                  className="hidden"
                />
                <input
                  ref={importImageRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpe"
                  multiple
                  onChange={handleImportImageSelect}
                  className="hidden"
                />

                {/* Image Matching Method */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-dark uppercase tracking-wide mb-2.5">
                    Image Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMethod"
                        value="auto"
                        checked={importMethod === 'auto'}
                        onChange={(e) => setImportMethod(e.target.value)}
                        className="mt-0.5 accent-green-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-dark">
                          Auto-Detect Embedded Images <span className="text-green-600">(Recommended)</span>
                        </p>
                        <p className="text-[10px] text-gray-text">
                          Paste images directly into Excel cells. They'll be auto-extracted &amp; uploaded.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMethod"
                        value="row-order"
                        checked={importMethod === 'row-order'}
                        onChange={(e) => setImportMethod(e.target.value)}
                        className="mt-0.5 accent-green-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-dark">Match Images by Row Order</p>
                        <p className="text-[10px] text-gray-text">
                          Upload images separately — 1st image goes to row 1, 2nd to row 2, etc.
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMethod"
                        value="filename"
                        checked={importMethod === 'filename'}
                        onChange={(e) => setImportMethod(e.target.value)}
                        className="mt-0.5 accent-green-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-dark">Match by Filename</p>
                        <p className="text-[10px] text-gray-text">
                          Image filenames must match the "images" column in Excel (e.g., bike1.jpg).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 1: Excel File */}
                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wide mb-2">
                    {importMethod === 'auto' ? 'Select Excel File (.xlsx with embedded images)' : '1. Select Excel File'}
                  </label>
                  <div
                    onClick={() => importExcelRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 ${
                      importExcelFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                    }`}
                  >
                    {importExcelFile ? (
                      <div className="flex items-center gap-3 justify-center">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-green-700">{importExcelFile.name}</p>
                          <p className="text-xs text-green-600">{(importExcelFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setImportExcelFile(null); }}
                          className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200"
                        >
                          <X className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                        <p className="text-sm font-bold text-gray-text">Click to select Excel file</p>
                        <p className="text-[10px] text-gray-text">.xlsx, .xls, or .csv</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Product Images (only for row-order or filename mode) */}
                {importMethod !== 'auto' && (
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wide mb-2">
                      2. Add Product Images <span className="text-gray-text font-normal">
                        {importMethod === 'row-order' ? '(select in same order as Excel rows)' : '(optional)'}
                      </span>
                    </label>
                    <div
                      onClick={() => importImageRef.current?.click()}
                      className="border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Image className="w-8 h-8 text-gray-400" />
                        <p className="text-sm font-bold text-gray-text">Click to select images</p>
                        <p className="text-[10px] text-gray-text">JPEG, PNG, WebP (max 5MB each)</p>
                      </div>
                    </div>

                    {/* Selected images summary + list */}
                    {importImageFiles.length > 0 && (
                      <div className="mt-3">
                        {/* Summary bar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-xl border border-blue-200 mb-1.5">
                          <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-bold text-blue-700">
                              {importImageFiles.length} image{importImageFiles.length > 1 ? 's' : ''} selected
                              <span className="font-normal text-blue-500 ml-1">
                                ({(importImageFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1)} MB total)
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => importImageRef.current?.click()}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
                            >
                              + Add More
                            </button>
                            <button
                              onClick={() => setImportImageFiles([])}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wide ml-2"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Image grid - compact thumbnails for large quantities */}
                        <div className={`${importImageFiles.length > 10 ? 'max-h-32' : 'max-h-48'} overflow-y-auto rounded-xl border border-gray-200 p-2`}>
                          {importImageFiles.length <= 8 ? (
                            /* Detailed list for small quantities */
                            <div className="space-y-1.5">
                              {importImageFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-dark truncate">
                                      {importMethod === 'row-order' ? `Row ${index + 1}: ` : ''}{file.name}
                                    </p>
                                    <p className="text-[10px] text-gray-text">{(file.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                  <button
                                    onClick={() => removeImportImage(index)}
                                    className="w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-text hover:text-red-500 transition-colors flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Compact grid for large quantities */
                            <div className="flex flex-wrap gap-1.5">
                              {importImageFiles.map((file, index) => (
                                <div key={index} className="relative group" title={importMethod === 'row-order' ? `Row ${index + 1}: ${file.name}` : file.name}>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                  {importMethod === 'row-order' && (
                                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] text-center rounded-b-lg">{index + 1}</span>
                                  )}
                                  <button
                                    onClick={() => removeImportImage(index)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white items-center justify-center text-[8px] hidden group-hover:flex"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* How it works */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-800 mb-1">How it works:</p>
                  {importMethod === 'auto' ? (
                    <ol className="text-[11px] text-amber-700 space-y-0.5 list-decimal list-inside">
                      <li>Open Excel (.xlsx), fill in product details (name, price, category, etc.)</li>
                      <li><strong>Paste/insert images directly into any cell</strong> in the image row</li>
                      <li>Upload the .xlsx file — images are auto-extracted &amp; matched to rows</li>
                      <li>Everything imports at once: product data + images from one file!</li>
                    </ol>
                  ) : importMethod === 'row-order' ? (
                    <ol className="text-[11px] text-amber-700 space-y-0.5 list-decimal list-inside">
                      <li>Fill Excel template with product details</li>
                      <li>Select images in the <strong>same order</strong> as your Excel rows</li>
                      <li>1st selected image = Row 1, 2nd = Row 2, and so on</li>
                      <li>No renaming needed — just keep the order right!</li>
                    </ol>
                  ) : (
                    <ol className="text-[11px] text-amber-700 space-y-0.5 list-decimal list-inside">
                      <li>Fill template, add image filenames in <code className="bg-amber-100 px-1 rounded">images</code> column</li>
                      <li>Upload images with matching filenames (e.g., <code className="bg-amber-100 px-1 rounded">bike1.jpg</code>)</li>
                      <li>Or use full URLs in the images column</li>
                    </ol>
                  )}
                </div>

                {/* Unmatched images warning */}
                {importUnmatched.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-bold text-red-700 mb-1">
                      {importUnmatched.length} image(s) skipped — not found in Excel:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {importUnmatched.map((name, i) => (
                        <span key={i} className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                          {name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-red-500 mt-1">
                      These images were not uploaded. Make sure the filenames match the "images" column in Excel exactly.
                    </p>
                  </div>
                )}

                {/* Progress */}
                {importProgress && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <p className="text-xs font-bold text-blue-700">{importProgress}</p>
                    </div>
                    {/* Progress bar for image uploads */}
                    {importTotalToUpload > 0 && (importUploaded + importFailed) > 0 && (
                      <div>
                        <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${Math.round(((importUploaded + importFailed) / importTotalToUpload) * 100)}%`,
                              background: importFailed > 0
                                ? 'linear-gradient(90deg, #22c55e, #ef4444)'
                                : '#22c55e'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-blue-600 font-bold">
                            {Math.round(((importUploaded + importFailed) / importTotalToUpload) * 100)}% complete
                          </p>
                          <div className="flex items-center gap-2">
                            {importUploaded > 0 && (
                              <span className="text-[10px] text-green-600 font-bold">{importUploaded} uploaded</span>
                            )}
                            {importFailed > 0 && (
                              <span className="text-[10px] text-red-500 font-bold">{importFailed} failed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Button */}
                {!importExcelFile && importImageFiles.length === 0 && (
                  <p className="text-xs text-red-500 font-bold text-center">Select an Excel file to continue</p>
                )}
                {importMethod === 'auto' && importExcelFile && !importExcelFile.name.toLowerCase().endsWith('.xlsx') && (
                  <p className="text-xs text-amber-600 font-bold text-center">
                    Embedded images only work with .xlsx files. Non-.xlsx files will import without images.
                  </p>
                )}
                <button
                  onClick={handleImportWithImages}
                  disabled={(!importExcelFile && importImageFiles.length === 0) || uploadingExcel}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 font-bold text-xs sm:text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingExcel ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {importMethod === 'auto' ? 'Extracting & Importing...' : 'Importing...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {importMethod === 'auto' && importExcelFile
                        ? 'Import Excel (Auto-Extract Images)'
                        : importMethod === 'row-order' && importExcelFile && importImageFiles.length > 0
                          ? `Import (${importImageFiles.length} images by row order)`
                          : importExcelFile && importImageFiles.length > 0
                            ? `Import (${importImageFiles.length} images + Excel)`
                            : importExcelFile
                              ? 'Import Excel'
                              : `Upload ${importImageFiles.length} Image${importImageFiles.length !== 1 ? 's' : ''}`
                      }
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
