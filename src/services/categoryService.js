import { getAllCategories, getCategoriesOnly, getCategoryById, createCategories, updateCategory, deleteCategory } from './authService';

// Category state management
let categoriesCache = null;
let categoriesCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get categories with caching
export async function getCategories(useCache = true) {
  try {
    // Check cache first
    if (useCache && categoriesCache && categoriesCacheTime && (Date.now() - categoriesCacheTime < CACHE_DURATION)) {
      console.log('🔍 CategoryService: Using cached categories');
      return categoriesCache;
    }

    console.log('🔍 CategoryService: Fetching fresh categories...');
    const response = await getCategoriesOnly();
    
    // Update cache
    categoriesCache = response.data;
    categoriesCacheTime = Date.now();
    
    console.log('✅ CategoryService: Categories fetched and cached:', categoriesCache);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch categories:', error);
    
    // Return cached data if available, even if expired
    if (categoriesCache) {
      console.log('⚠️ CategoryService: Using expired cache due to error');
      return { data: categoriesCache };
    }
    
    throw error;
  }
}

// Get categories with products
export async function getCategoriesWithProducts() {
  try {
    console.log('🔍 CategoryService: Fetching categories with products...');
    const response = await getAllCategories();
    console.log('✅ CategoryService: Categories with products fetched:', response.data);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch categories with products:', error);
    throw error;
  }
}

// Get single category with products
export async function getCategoryWithProducts(categoryId) {
  try {
    console.log('🔍 CategoryService: Fetching category with products:', categoryId);
    const response = await getCategoryById(categoryId);
    console.log('✅ CategoryService: Category with products fetched:', response.data);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to fetch category with products:', error);
    throw error;
  }
}

// Create new categories (Admin only)
export async function createNewCategories(categoryNames) {
  try {
    console.log('🔍 CategoryService: Creating new categories:', categoryNames);
    const response = await createCategories(categoryNames);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    console.log('✅ CategoryService: Categories created successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to create categories:', error);
    throw error;
  }
}

// Update category (Admin only)
export async function updateCategoryData(categoryId, categoryData) {
  try {
    console.log('🔍 CategoryService: Updating category:', { categoryId, categoryData });
    const response = await updateCategory(categoryId, categoryData);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    console.log('✅ CategoryService: Category updated successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to update category:', error);
    throw error;
  }
}

// Delete category (Admin only)
export async function deleteCategoryData(categoryId) {
  try {
    console.log('🔍 CategoryService: Deleting category:', categoryId);
    const response = await deleteCategory(categoryId);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    console.log('✅ CategoryService: Category deleted successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ CategoryService: Failed to delete category:', error);
    throw error;
  }
}

// Clear categories cache
export function clearCategoriesCache() {
  console.log('🔍 CategoryService: Clearing categories cache');
  categoriesCache = null;
  categoriesCacheTime = null;
}

// Get category name by ID
export function getCategoryNameById(categoryId, categories) {
  if (!categories || !categoryId) return 'Unknown';
  
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Unknown';
}

// Format categories for dropdown/select components
export function formatCategoriesForSelect(categories) {
  if (!categories) return [];
  
  return categories.map(category => ({
    value: category.id,
    label: category.name,
    id: category.id,
    name: category.name
  }));
}

// Search categories by name
export function searchCategories(categories, searchTerm) {
  if (!categories || !searchTerm) return categories;
  
  const term = searchTerm.toLowerCase();
  return categories.filter(category => 
    category.name.toLowerCase().includes(term)
  );
}




