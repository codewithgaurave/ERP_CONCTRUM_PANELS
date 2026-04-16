import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import assetCategoryAPI from '../apis/assetCategoryAPI';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, 
  Package, Tag, Calendar, User, AlertCircle, CheckCircle,
  X, Save
} from 'lucide-react';

const AssetCategoryManagement = () => {
  const { themeColors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await assetCategoryAPI.getAll({ search: searchTerm });
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Error fetching asset categories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCategories();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        code: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error('Name and code are required');
      return;
    }

    try {
      if (editingCategory) {
        await assetCategoryAPI.update(editingCategory._id, formData);
        toast.success('Asset category updated successfully');
      } else {
        await assetCategoryAPI.create(formData);
        toast.success('Asset category created successfully');
      }
      
      closeModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving asset category');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await assetCategoryAPI.toggleStatus(category._id);
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating category status');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await assetCategoryAPI.delete(category._id);
      toast.success('Asset category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting asset category');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
            <Package size={20} style={{ color: themeColors.primary }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
              Asset Categories
            </h2>
            <p className="text-sm" style={{ color: themeColors.textSecondary }}>
              Manage asset categories for better organization
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: themeColors.primary, color: 'white' }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border, 
            color: themeColors.text 
          }}
        />
      </div>

      {/* Categories List */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 opacity-50" style={{ color: themeColors.textSecondary }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>
              {searchTerm ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first asset category to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: themeColors.primary, color: 'white' }}
              >
                <Plus size={16} />
                Add First Category
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: themeColors.border }}>
            {filteredCategories.map((category) => (
              <div key={category._id} className="p-4 hover:bg-opacity-50 transition-colors" style={{ backgroundColor: `${themeColors.background}50` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                      <Tag size={20} style={{ color: themeColors.primary }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold" style={{ color: themeColors.text }}>
                          {category.name}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: `${themeColors.accent}20`, 
                          color: themeColors.accent 
                        }}>
                          {category.code}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.isActive ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: themeColors.textSecondary }}>
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          Created by {category.createdBy?.name?.first} {category.createdBy?.name?.last}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit category"
                    >
                      <Edit size={16} style={{ color: themeColors.textSecondary }} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {category.isActive ? (
                        <ToggleRight size={20} style={{ color: themeColors.primary }} />
                      ) : (
                        <ToggleLeft size={20} style={{ color: themeColors.textSecondary }} />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(category)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-xl shadow-lg max-w-md w-full" style={{ backgroundColor: themeColors.surface }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} style={{ color: themeColors.textSecondary }} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }}
                  placeholder="e.g., Laptops"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Category Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }}
                  placeholder="e.g., LAPTOP"
                  required
                />
                <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                  Unique code for this category (will be converted to uppercase)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }}
                  placeholder="Optional description for this category"
                />
              </div>
            </form>
            
            <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: themeColors.border }}>
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: themeColors.primary, color: 'white' }}
              >
                <Save size={16} />
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCategoryManagement;