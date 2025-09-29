import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia configuration from the demo
const searchClient = algoliasearch(
  'RUGQ6P8IPQ',
  '35d57c5cd4b02d8fca37ce06f445dd8d'
);

// Debounce function for search optimization
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Build Algolia filters from selected options
const buildAlgoliaFilters = (selectedCategory, selectedPrice) => {
  const filters = [];
  
  // Category filter
  if (selectedCategory && selectedCategory !== 'All') {
    filters.push(`categoryName:"${selectedCategory}"`);
  }
  
  // Price filter - handle numeric price values properly
  if (selectedPrice && selectedPrice !== 'All Price') {
    console.log('🔍 AlgoliaService: Processing price filter:', selectedPrice);
    
    // Handle predefined price ranges
    if (selectedPrice === '₦0.00 - 9,999.99') {
      filters.push('price:0 TO 9999.99');
    } else if (selectedPrice === '₦10,000.00 - 19,999.99') {
      filters.push('price:10000 TO 19999.99');
    } else if (selectedPrice === '₦20,000.00 - 29,999.99') {
      filters.push('price:20000 TO 29999.99');
    } else if (selectedPrice === '₦30,000.00 - 39,999.99') {
      filters.push('price:30000 TO 39999.99');
    } else if (selectedPrice === '₦40,000.00+') {
      filters.push('price >= 40000');
    } 
    // Handle custom price ranges from slider
    else if (selectedPrice.includes('+')) {
      // Handle "₦X,XXX+" format
      const minPrice = parseInt(selectedPrice.replace(/[₦,]/g, ''));
      filters.push(`price >= ${minPrice}`);
    } else if (selectedPrice.includes(' - ')) {
      // Handle "₦X,XXX - ₦Y,YYY" format
      const [minStr, maxStr] = selectedPrice.split(' - ');
      const minPrice = parseInt(minStr.replace(/[₦,]/g, ''));
      const maxPrice = parseInt(maxStr.replace(/[₦,]/g, ''));
      filters.push(`price:${minPrice} TO ${maxPrice}`);
    }
    
    console.log('🔍 AlgoliaService: Added price filter:', filters[filters.length - 1]);
  }
  
  console.log('🔍 AlgoliaService: Built filters:', filters);
  return filters.length > 0 ? filters.join(' AND ') : undefined;
};

// Transform Algolia hit to match our product format with highlighting
const transformHit = (hit) => ({
  id: hit.productId || hit.objectID,
  slug: hit.slug || hit.productId || hit.objectID, // Use slug if available, fallback to ID
  name: hit.name,
  description: hit.description,
  price: hit.price?.toString() || '0',
  stockQuantity: hit.stockQuantity || 0,
  categoryId: hit.categoryId,
  imageUrls: hit.imageUrls || [],
  createdAt: hit.createdAt,
  updatedAt: hit.updatedAt,
  category: { 
    id: hit.categoryId, 
    name: hit.categoryName 
  },
  seller: { 
    id: hit.sellerId, 
    catalogueName: hit.sellerName 
  },
  ratings: [], // Algolia doesn't have detailed ratings
  averageRating: hit.averageRating || 0,
  totalRatings: hit.totalRatings || 0,
  inStock: hit.inStock || (hit.stockQuantity > 0),
  // Add highlighting data
  _highlightResult: hit._highlightResult || {},
  _snippetResult: hit._snippetResult || {}
});

// Search products with Algolia
export const searchProductsAlgolia = async (query, page = 1, limit = 10, filters = {}) => {
  try {
    console.log('🔍 AlgoliaService: Searching products with query:', query);
    
    const searchParams = {
      query,
      page: page - 1, // Algolia uses 0-based pagination
      hitsPerPage: limit,
      filters: buildAlgoliaFilters(filters.category, filters.price),
      attributesToRetrieve: [
        'objectID', 'productId', 'slug', 'name', 'description', 'price', 
        'stockQuantity', 'categoryId', 'categoryName', 'sellerId', 
        'sellerName', 'imageUrls', 'createdAt', 'updatedAt', 
        'averageRating', 'totalRatings', 'inStock'
      ],
      // Enable search in product text, description, and seller name
      attributesToHighlight: ['name', 'description', 'sellerName', 'categoryName'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    };
    
    console.log('🔍 AlgoliaService: Search params:', searchParams);
    
    const response = await searchClient.search([
      {
        indexName: 'productIndex',
        ...searchParams
      }
    ]);
    
    const results = response.results[0];
    const products = results.hits.map(transformHit);
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(results.nbHits / limit),
      totalItems: results.nbHits,
      itemsPerPage: limit
    };
    
    console.log('✅ AlgoliaService: Search successful, found', results.nbHits, 'products');
    
    return {
      data: {
        products,
        pagination
      }
    };
  } catch (error) {
    console.error('❌ AlgoliaService: Search failed:', error);
    throw new Error('Search failed. Please try again.');
  }
};

// Get all products with filters from Algolia
export const getAllProductsAlgolia = async (page = 1, limit = 10, filters = {}) => {
  try {
    console.log('🔍 AlgoliaService: Fetching all products with filters:', filters);
    
    const searchParams = {
      page: page - 1, // Algolia uses 0-based pagination
      hitsPerPage: limit,
      filters: buildAlgoliaFilters(filters.category, filters.price),
      attributesToRetrieve: [
        'objectID', 'productId', 'slug', 'name', 'description', 'price', 
        'stockQuantity', 'categoryId', 'categoryName', 'sellerId', 
        'sellerName', 'imageUrls', 'createdAt', 'updatedAt', 
        'averageRating', 'totalRatings', 'inStock'
      ],
      // Enable highlighting for better search experience
      attributesToHighlight: ['name', 'description', 'sellerName', 'categoryName'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    };
    
    console.log('🔍 AlgoliaService: Search params:', searchParams);
    
    const response = await searchClient.search([
      {
        indexName: 'productIndex',
        ...searchParams
      }
    ]);
    
    const results = response.results[0];
    const products = results.hits.map(transformHit);
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(results.nbHits / limit),
      totalItems: results.nbHits,
      itemsPerPage: limit
    };
    
    console.log('✅ AlgoliaService: Products fetched successfully, found', results.nbHits, 'products');
    
    return {
      data: {
        products,
        pagination
      }
    };
  } catch (error) {
    console.error('❌ AlgoliaService: Failed to fetch products:', error);
    throw new Error('Failed to load products. Please try again.');
  }
};

// Get categories from Algolia
export const getCategoriesAlgolia = async () => {
  try {
    console.log('🔍 AlgoliaService: Fetching categories...');
    
    // Get all products to extract unique categories
    const response = await searchClient.search([
      {
        indexName: 'productIndex',
        hitsPerPage: 1000, // Get all products to extract categories
        attributesToRetrieve: ['categoryName', 'categoryId']
      }
    ]);
    
    const results = response.results[0];
    
    // Extract unique categories
    const categoryMap = new Map();
    results.hits.forEach(hit => {
      if (hit.categoryName && hit.categoryId) {
        categoryMap.set(hit.categoryId, {
          id: hit.categoryId,
          name: hit.categoryName
        });
      }
    });
    
    const categories = Array.from(categoryMap.values());
    
    console.log('✅ AlgoliaService: Categories fetched successfully:', categories);
    
    return {
      data: categories
    };
  } catch (error) {
    console.error('❌ AlgoliaService: Failed to fetch categories:', error);
    throw new Error('Failed to load categories. Please try again.');
  }
};

// Debounced search function for real-time search
export const debouncedSearch = debounce(async (query, callback) => {
  if (!query.trim()) {
    // Return empty result for empty queries
    callback({ data: { products: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } } });
    return;
  }
  
  try {
    console.log('🔍 AlgoliaService: Debounced search for:', query);
    const result = await searchProductsAlgolia(query, 1, 10);
    console.log('✅ AlgoliaService: Debounced search result:', result);
    callback(result);
  } catch (error) {
    console.error('❌ AlgoliaService: Debounced search failed:', error);
    callback({ data: { products: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } } });
  }
}, 150); // Faster debounce for more responsive search

export default {
  searchProductsAlgolia,
  getAllProductsAlgolia,
  getCategoriesAlgolia,
  debouncedSearch
};

