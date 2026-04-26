import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function CategoryManager({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    order: ''
  });

  const { getIdToken } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = await getIdToken();
      const url = editingCategory
        ? `/api/categories/${editingCategory.slug}`
        : '/api/categories';

      const response = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          icon: formData.icon || '🚲',
          description: formData.description,
          order: parseInt(formData.order) || 99
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({ name: '', icon: '', description: '', order: '' });
        setEditingCategory(null);
        fetchCategories();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('❌ Error saving category:', error);
      setError(error.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '',
      description: category.description || '',
      order: category.order?.toString() || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: '', description: '', order: '' });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (slug, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" category? This action cannot be undone if there are no products in this category.`)) {
      return;
    }

    try {
      const token = await getIdToken();
      const response = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        fetchCategories();
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      setError(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[30px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-3xl text-dark uppercase tracking-wide">Manage Categories</h2>
            <p className="text-sm text-gray-text mt-1">Create, edit, and organize product categories</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Success/Error Banners */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[20px] flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-600 flex-1">{success}</p>
              <button onClick={() => setSuccess(null)} className="text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[20px] flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Category Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-[20px]">
            <h3 className="font-bold text-dark text-lg mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mountain Bikes"
                  className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🚲"
                  maxLength={2}
                  className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-full border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-text uppercase tracking-wide mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-[20px] border-2 border-dark/10 focus:border-primary focus:outline-none text-sm font-medium resize-none"
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-300 font-bold text-sm uppercase tracking-wide"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2.5 rounded-full border-2 border-dark/20 text-dark hover:bg-gray-100 transition-all duration-300 font-bold text-sm uppercase tracking-wide"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="font-bold text-dark text-lg mb-4">Existing Categories</h3>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-[20px]">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-text font-medium">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-[20px]">
                <p className="text-gray-text font-medium">No categories yet. Create your first category above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon || '🚲'}</span>
                        <div>
                          <h4 className="font-bold text-dark">{category.name}</h4>
                          <p className="text-xs text-gray-text uppercase">{category.slug}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-text bg-gray-100 px-2 py-1 rounded-full">
                        #{category.order || 99}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-text mb-3 line-clamp-2">{category.description}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 px-4 py-2 rounded-full bg-dark text-white hover:bg-dark/90 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.slug, category.name)}
                        className="px-4 py-2 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all duration-300 font-bold text-xs uppercase tracking-wide"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
