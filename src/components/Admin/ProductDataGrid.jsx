import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Edit3,
  Check,
  X,
  Package,
  PackageCheck,
  PackageX,
  Tag,
  Palette,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

/**
 * Responsive Product Data Grid
 * - Desktop: Full table with all columns, inline editing
 * - Mobile: Name, Price, Stock only
 * - Click/tap row to see full details in modal
 */
export default function ProductDataGrid({
  products,
  categories,
  onEdit,
  onDelete,
  onBulkDelete,
  onUpdateProduct,
  loading
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getSortedProducts = () => {
    if (!sortField) return products;
    return [...products].sort((a, b) => {
      let aVal = sortField === 'stock.quantity' ? (a.stock?.quantity ?? -1) : a[sortField];
      let bVal = sortField === 'stock.quantity' ? (b.stock?.quantity ?? -1) : b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedProducts = getSortedProducts();

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    const names = products.filter(p => selectedIds.has(p.id)).map(p => p.name).join(', ');
    if (window.confirm(`Delete ${ids.length} products?\n\n${names}`)) {
      onBulkDelete(ids);
      setSelectedIds(new Set());
    }
  };

  // Inline editing
  const handleStartEdit = (cellId, currentValue, e) => {
    e.stopPropagation();
    setEditingCell(cellId);
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = async (product, field) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    if (field === 'price') {
      await onUpdateProduct(product.id, { price: newValue });
    } else if (field === 'stock') {
      let status = 'out_of_stock';
      if (newValue > 10) status = 'in_stock';
      else if (newValue > 0) status = 'low_stock';
      await onUpdateProduct(product.id, {
        stock: { ...product.stock, quantity: Math.floor(newValue), status }
      });
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Stock badge helper
  const getStockBadge = (product) => {
    const stock = product.stock;
    const hasStockObj = stock && typeof stock.quantity === 'number';

    if (!hasStockObj) {
      const isInStock = product.inStock !== false;
      return {
        color: isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        label: isInStock ? 'In Stock' : 'Out of Stock',
        Icon: isInStock ? PackageCheck : PackageX
      };
    }

    const configs = {
      in_stock: { color: 'bg-green-100 text-green-800', Icon: PackageCheck },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', Icon: Package },
      out_of_stock: { color: 'bg-red-100 text-red-800', Icon: PackageX },
    };
    const config = configs[stock.status] || configs.out_of_stock;
    return {
      ...config,
      label: hasStockObj ? `${stock.quantity}` : stock.status?.replace('_', ' ') || 'Unknown'
    };
  };

  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-[20px]">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-text font-medium">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[20px]">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-text font-medium">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border-b border-blue-200 px-4 lg:px-6 py-3 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-blue-900">
                {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-4 py-2 rounded-full border-2 border-blue-300 text-blue-700 hover:bg-blue-100 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
              <tr>
                {/* Checkbox - always visible */}
                <th className="px-3 lg:px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                {/* Name - always visible */}
                <th className="px-3 lg:px-4 py-3 text-left">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-2 text-xs font-bold text-dark uppercase tracking-wider hover:text-primary transition-colors">
                    Product <SortIcon field="name" />
                  </button>
                </th>
                {/* Price - always visible */}
                <th className="px-3 lg:px-4 py-3 text-left">
                  <button onClick={() => toggleSort('price')} className="flex items-center gap-2 text-xs font-bold text-dark uppercase tracking-wider hover:text-primary transition-colors">
                    Price <SortIcon field="price" />
                  </button>
                </th>
                {/* Stock - always visible */}
                <th className="px-3 lg:px-4 py-3 text-left">
                  <button onClick={() => toggleSort('stock.quantity')} className="flex items-center gap-2 text-xs font-bold text-dark uppercase tracking-wider hover:text-primary transition-colors">
                    Stock <SortIcon field="stock.quantity" />
                  </button>
                </th>
                {/* Desktop-only columns */}
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-dark uppercase tracking-wider">Image</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-dark uppercase tracking-wider">Category</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-dark uppercase tracking-wider">Colors</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-dark uppercase tracking-wider">MRP</th>
                <th className="hidden lg:table-cell px-4 py-3 text-right text-xs font-bold text-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedProducts.map((product, index) => {
                const stockBadge = getStockBadge(product);
                const StockIcon = stockBadge.Icon;
                const isEditingPrice = editingCell === `${product.id}-price`;
                const isEditingStock = editingCell === `${product.id}-stock`;

                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${selectedIds.has(product.id) ? 'bg-blue-50' : ''}`}
                    title="Click for details"
                  >
                    {/* Checkbox */}
                    <td className="px-3 lg:px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={(e) => toggleSelect(product.id, e)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>

                    {/* Name - always visible */}
                    <td className="px-3 lg:px-4 py-3">
                      <div className="font-bold text-dark text-sm lg:text-base">{product.name}</div>
                      <div className="text-[11px] text-gray-text mt-0.5 lg:hidden">
                        {getCategoryName(product.category)}
                      </div>
                      <div className="text-[10px] text-gray-text hidden lg:block mt-0.5">ID: {product.id}</div>
                    </td>

                    {/* Price - always visible (inline editable on desktop) */}
                    <td className="px-3 lg:px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(product, 'price');
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-20 lg:w-24 px-2 py-1 border-2 border-primary rounded text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(product, 'price')} className="p-1 hover:bg-green-100 rounded text-green-600"><Check className="w-4 h-4" /></button>
                          <button onClick={handleCancelEdit} className="p-1 hover:bg-red-100 rounded text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div
                          onDoubleClick={(e) => handleStartEdit(`${product.id}-price`, product.price, e)}
                          className="group hidden lg:flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          title="Double-click to edit"
                        >
                          <span className="font-bold text-primary text-sm">₹{product.price.toLocaleString()}</span>
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </div>
                      )}
                      {/* Mobile price (not editable inline) */}
                      {!isEditingPrice && (
                        <span className="font-bold text-primary text-sm lg:hidden">₹{product.price.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Stock - always visible (inline editable on desktop) */}
                    <td className="px-3 lg:px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {isEditingStock ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(product, 'stock');
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-16 lg:w-20 px-2 py-1 border-2 border-primary rounded text-sm focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(product, 'stock')} className="p-1 hover:bg-green-100 rounded text-green-600"><Check className="w-4 h-4" /></button>
                          <button onClick={handleCancelEdit} className="p-1 hover:bg-red-100 rounded text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          {/* Desktop: double-click to edit */}
                          <div
                            onDoubleClick={(e) => {
                              if (product.stock && typeof product.stock.quantity === 'number') {
                                handleStartEdit(`${product.id}-stock`, product.stock.quantity, e);
                              }
                            }}
                            className="hidden lg:block cursor-pointer hover:bg-gray-100 px-1 py-1 rounded group"
                            title={product.stock?.quantity !== undefined ? 'Double-click to edit' : ''}
                          >
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stockBadge.color}`}>
                              <StockIcon className="w-3 h-3" />
                              {stockBadge.label}
                            </span>
                            {product.stock?.quantity !== undefined && (
                              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity inline ml-1" />
                            )}
                          </div>
                          {/* Mobile: badge only */}
                          <span className={`lg:hidden inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${stockBadge.color}`}>
                            <StockIcon className="w-3 h-3" />
                            {stockBadge.label}
                          </span>
                        </>
                      )}
                    </td>

                    {/* Image - desktop only */}
                    <td className="hidden lg:table-cell px-4 py-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                      />
                    </td>

                    {/* Category - desktop only */}
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium">
                        {getCategoryName(product.category)}
                      </span>
                      {product.subCategory && (
                        <span className="block text-[10px] text-gray-text uppercase tracking-wider mt-1 pl-1">
                          {product.subCategory}
                        </span>
                      )}
                    </td>

                    {/* Colors - desktop only */}
                    <td className="hidden lg:table-cell px-4 py-3">
                      {product.colors && product.colors.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          {product.colors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              title={`${c.name}${c.inStock === false ? ' (Out)' : ''}`}
                              className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
                              style={{
                                background: c.hex?.startsWith('linear') ? c.hex : c.hex || '#ccc',
                                opacity: c.inStock === false ? 0.4 : 1,
                              }}
                            />
                          ))}
                          {product.colors.length > 5 && (
                            <span className="text-[10px] text-gray-text font-bold">+{product.colors.length - 5}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-text">—</span>
                      )}
                    </td>

                    {/* MRP - desktop only */}
                    <td className="hidden lg:table-cell px-4 py-3">
                      <span className="text-sm text-gray-text line-through">₹{product.mrp?.toLocaleString()}</span>
                      {product.mrp > product.price && (
                        <span className="block text-xs font-bold text-green-600 mt-0.5">
                          {Math.round((1 - product.price / product.mrp) * 100)}% OFF
                        </span>
                      )}
                    </td>

                    {/* Actions - desktop only */}
                    <td className="hidden lg:table-cell px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id, product.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile hint */}
        <div className="lg:hidden bg-blue-50 border-t-2 border-blue-200 px-4 py-3 text-center">
          <p className="text-xs text-dark font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><span className="font-bold text-primary">Tap</span> any row to view full details</span>
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between text-sm text-gray-text">
          <span>Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}</span>
          {selectedIds.size > 0 && <span>{selectedIds.size} selected</span>}
        </div>
      </div>

      {/* Full-Screen Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full md:max-w-2xl md:rounded-[30px] rounded-t-[30px] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-[30px]">
                <h2 className="font-display text-2xl text-dark uppercase tracking-wide">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-dark" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Product Image */}
                <div className="relative rounded-[20px] overflow-hidden bg-gray-100 aspect-[4/3]">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  {selectedProduct.badge && (
                    <span className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-primary text-white text-sm font-bold uppercase tracking-wide">
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>

                {/* Basic Info */}
                <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                  <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                    Product Information
                  </h3>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">Name</p>
                      <p className="text-lg font-bold text-dark">{selectedProduct.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">Product ID</p>
                      <p className="text-sm font-mono text-dark">{selectedProduct.id}</p>
                    </div>
                  </div>

                  {selectedProduct.shortDescription && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Layers className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Description</p>
                        <p className="text-sm text-dark">{selectedProduct.shortDescription}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-[20px] p-4">
                    <p className="text-xs text-gray-text uppercase font-bold mb-2">Category</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 text-sm font-bold text-dark">
                      {getCategoryName(selectedProduct.category)}
                    </span>
                    {selectedProduct.subCategory && (
                      <p className="text-xs text-gray-text mt-2 uppercase tracking-wider">{selectedProduct.subCategory}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-[20px] p-4">
                    <p className="text-xs text-gray-text uppercase font-bold mb-2">Stock Status</p>
                    {(() => {
                      const badge = getStockBadge(selectedProduct);
                      const Icon = badge.Icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${badge.color}`}>
                          <Icon className="w-4 h-4" />
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                  <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                    Pricing
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IndianRupee className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Selling Price</p>
                        <p className="text-2xl font-bold text-primary">₹{selectedProduct.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pl-12">
                    <div>
                      <p className="text-xs text-gray-text uppercase font-bold">MRP</p>
                      <p className="text-base text-gray-text line-through">₹{selectedProduct.mrp?.toLocaleString()}</p>
                    </div>
                    {selectedProduct.mrp > selectedProduct.price && (
                      <div>
                        <p className="text-xs text-gray-text uppercase font-bold">Discount</p>
                        <p className="text-base font-bold text-green-600">
                          {Math.round((1 - selectedProduct.price / selectedProduct.mrp) * 100)}% OFF
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colors */}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                    <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                      Colors ({selectedProduct.colors.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                          <span
                            className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
                            style={{
                              background: c.hex?.startsWith('linear') ? c.hex : c.hex || '#ccc',
                              opacity: c.inStock === false ? 0.4 : 1,
                            }}
                          />
                          <span className="text-sm font-medium text-dark">{c.name}</span>
                          {c.inStock === false && (
                            <span className="text-[10px] text-red-500 font-bold uppercase">Out</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications */}
                {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                  <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                    <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                      Specifications
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedProduct.specs).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-text uppercase font-bold mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium text-dark">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {selectedProduct.gallery && selectedProduct.gallery.length > 0 && (
                  <div className="bg-gray-50 rounded-[20px] p-4 space-y-3">
                    <h3 className="font-bold text-dark uppercase text-sm tracking-wide border-b border-gray-200 pb-2">
                      Gallery ({selectedProduct.gallery.length} images)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.gallery.map((img, i) => (
                        <img
                          key={i}
                          src={typeof img === 'string' ? img : img.url}
                          alt={`Gallery ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onEdit(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      onDelete(selectedProduct.id, selectedProduct.name);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
