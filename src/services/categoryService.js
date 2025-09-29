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
      return { data: categoriesCache };
    }

    const response = await getCategoriesOnly();
    
    // Update cache
    categoriesCache = response;
    categoriesCacheTime = Date.now();
    
    return { data: response };
  } catch (error) {
    
    // Return cached data if available, even if expired
    if (categoriesCache) {
      return { data: categoriesCache };
    }
    
    throw error;
  }
}

// Get categories with products
export async function getCategoriesWithProducts() {
  try {
    const response = await getAllCategories();
    return response;
  } catch (error) {
    throw error;
  }
}

// Get single category with products
export async function getCategoryWithProducts(categoryId) {
  try {
    const response = await getCategoryById(categoryId);
    return response;
  } catch (error) {
    throw error;
  }
}

// Create new categories (Admin only)
export async function createNewCategories(categoryNames) {
  try {
    const response = await createCategories(categoryNames);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Update category (Admin only)
export async function updateCategoryData(categoryId, categoryData) {
  try {
    const response = await updateCategory(categoryId, categoryData);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Delete category (Admin only)
export async function deleteCategoryData(categoryId) {
  try {
    const response = await deleteCategory(categoryId);
    
    // Clear cache to force refresh
    categoriesCache = null;
    categoriesCacheTime = null;
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Clear categories cache
export function clearCategoriesCache() {
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




