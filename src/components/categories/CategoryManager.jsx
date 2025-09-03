import { useState, useEffect } from 'react';
import { getCategories, createNewCategories, updateCategoryData, deleteCategoryData } from '../../services/categoryService';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 CategoryManager: Loading categories...');
      
      const response = await getCategories();
      setCategories(response.data);
      console.log('✅ CategoryManager: Categories loaded:', response.data);
    } catch (error) {
      console.error('❌ CategoryManager: Failed to load categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setError(null);
      console.log('🔍 CategoryManager: Creating category:', newCategoryName);
      
      await createNewCategories([newCategoryName.trim()]);
      setSuccess(`Category "${newCategoryName}" created successfully!`);
      setNewCategoryName('');
      setShowCreateForm(false);
      
      // Reload categories
      await loadCategories();
    } catch (error) {
      console.error('❌ CategoryManager: Failed to create category:', error);
      setError(error.message || 'Failed to create category. Please try again.');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCategory) return;

    try {
      setError(null);
      console.log('🔍 CategoryManager: Updating category:', { id: editingCategory.id, name: editCategoryName });
      
      await updateCategoryData(editingCategory.id, { name: editCategoryName.trim() });
      setSuccess(`Category updated to "${editCategoryName}" successfully!`);
      setEditingCategory(null);
      setEditCategoryName('');
      
      // Reload categories
      await loadCategories();
    } catch (error) {
      console.error('❌ CategoryManager: Failed to update category:', error);
      setError(error.message || 'Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      console.log('🔍 CategoryManager: Deleting category:', categoryId);
      
      await deleteCategoryData(categoryId);
      setSuccess(`Category "${categoryName}" deleted successfully!`);
      
      // Reload categories
      await loadCategories();
    } catch (error) {
      console.error('❌ CategoryManager: Failed to delete category:', error);
      setError(error.message || 'Failed to delete category. Please try again.');
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Category Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateCategory} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Create New Category</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No categories found. Create your first category to get started.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              {editingCategory?.id === category.id ? (
                // Edit Form
                <form onSubmit={handleUpdateCategory} className="flex-1 flex gap-3">
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                // Category Display
                <>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}




