import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

// Algolia configuration - use the same client for both search and sync
const searchClient = algoliasearch(
  'RUGQ6P8IPQ',
  '35d57c5cd4b02d8fca37ce06f445dd8d'
);

// Create InstantSearch instance
const search = instantsearch({
  searchClient,
  indexName: 'productIndex',
  insights: true,
});

// Debounce function for search optimization
export function debounce(func, wait) {
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

// Advanced search with Algolia
export async function advancedSearch(params) {
  try {
    
    const filterString = buildAlgoliaFilters(params.filters);
    
    const searchParams = {
      indexName: 'productIndex',
      query: params.query || '',
      page: (params.page || 1) - 1, // Algolia uses 0-based pagination
      hitsPerPage: params.limit || 10,
    };
    
    // Only add filters if we have valid ones
    if (filterString) {
      searchParams.filters = filterString;
    }
    
    // Use Algolia's search method
    const { results } = await searchClient.search([searchParams]);
    
    const hits = results[0]?.hits || [];
    const nbHits = results[0]?.nbHits || 0;
    const nbPages = results[0]?.nbPages || 0;
    
    
    return {
      data: {
        products: hits,
        pagination: {
          totalItems: nbHits,
          totalPages: nbPages,
          currentPage: params.page || 1,
          itemsPerPage: params.limit || 10
        }
      }
    };
  } catch (error) {
    throw new Error('Search failed. Please try again.');
  }
}

// Get products with Algolia filtering
export async function getProductsWithFilters(filters = {}, page = 1, limit = 10) {
  try {
    
    const filterString = buildAlgoliaFilters(filters);
    
    const searchParams = {
      indexName: 'productIndex',
      query: '',
      page: page - 1, // Algolia uses 0-based pagination
      hitsPerPage: limit,
    };
    
    // Only add filters if we have valid ones
    if (filterString) {
      searchParams.filters = filterString;
    }
    
    const { results } = await searchClient.search([searchParams]);
    
    const hits = results[0]?.hits || [];
    const nbHits = results[0]?.nbHits || 0;
    const nbPages = results[0]?.nbPages || 0;
    
    
    return {
      data: {
        products: hits,
        pagination: {
          totalItems: nbHits,
          totalPages: nbPages,
          currentPage: page,
          itemsPerPage: limit
        }
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch products.');
  }
}

// Search products by query (instant search with Algolia)
export async function instantSearch(query, limit = 10) {
  try {
    if (!query || query.trim().length < 2) {
      return { data: [] };
    }
    
    
    const { results } = await searchClient.search([
      {
        indexName: 'productIndex',
        query: query.trim(),
        hitsPerPage: limit,
      }
    ]);
    
    const hits = results[0]?.hits || [];
    
    return { data: hits };
  } catch (error) {
    return { data: [] };
  }
}

// Get search suggestions (for autocomplete) using Algolia
export async function getSearchSuggestions(query, limit = 5) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const response = await instantSearch(query, limit);
    return response.data || [];
  } catch (error) {
    return [];
  }
}

// Build Algolia filter string from UI state
export function buildAlgoliaFilters(filters) {
  const filterParts = [];
  
  // Price range filter - use proper Algolia syntax
  if (filters.priceRange && filters.priceRange !== 'All') {
    // Check if it's a price range object with min/max
    if (filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
      if (filters.priceRange.max === Infinity) {
        filterParts.push(`price >= ${filters.priceRange.min}`);
      } else {
        filterParts.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`);
      }
    }
  }
  
  // Category filter - use exact match, skip if 'All'
  if (filters.category && filters.category !== 'All') {
    filterParts.push(`category:"${filters.category}"`);
  }
  
  // Brand filter - use exact match, skip if 'All'
  if (filters.brand && filters.brand !== 'All') {
    filterParts.push(`brand:"${filters.brand}"`);
  }
  
  // Stock filter - use proper comparison, only if explicitly true
  if (filters.inStock === true) {
    filterParts.push(`stockQuantity > 0`);
  }
  
  // Rating filter - use proper comparison, only if greater than 0
  if (filters.minRating && filters.minRating > 0) {
    filterParts.push(`rating >= ${filters.minRating}`);
  }
  
  // Only return filters if there are any valid ones
  const filterString = filterParts.join(' AND ');
  
  return filterString || undefined; // Return undefined if no filters
}

// Build filter object from UI state (for backend API)
export function buildFilters(filters) {
  const filterObj = {};
  
  // Price range filter - convert to backend format
  if (filters.priceRange && filters.priceRange !== 'All') {
    if (typeof filters.priceRange === 'string') {
      // Parse string format like "₦10,000.00 - ₦15,000.00"
      const parsedRange = parsePriceRange(filters.priceRange);
      if (parsedRange.min !== 0 || parsedRange.max !== Infinity) {
        filterObj.price = {
          gte: parsedRange.min,
          lte: parsedRange.max === Infinity ? undefined : parsedRange.max
        };
      }
    } else if (filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
      // Handle object format
      filterObj.price = {
        gte: filters.priceRange.min,
        lte: filters.priceRange.max === Infinity ? undefined : filters.priceRange.max
      };
    }
  }
  
  // Category filter
  if (filters.category && filters.category !== 'All') {
    filterObj.category = filters.category;
  }
  
  // Brand filter
  if (filters.brand && filters.brand !== 'All') {
    filterObj.brand = filters.brand;
  }
  
  // Stock filter
  if (filters.inStock === true) {
    filterObj.inStock = true;
  }
  
  // Rating filter
  if (filters.minRating && filters.minRating > 0) {
    filterObj.minRating = filters.minRating;
  }
  
  return filterObj;
}

// Parse price range from string (e.g., "₦10,000.00 - ₦15,000.00" or "₦50,000+")
export function parsePriceRange(priceRangeString) {
  if (!priceRangeString || priceRangeString === 'All') {
    return { min: 0, max: Infinity };
  }
  
  // Handle "₦50,000+" format
  if (priceRangeString.includes('+')) {
    const match = priceRangeString.match(/₦([\d,]+)\.?\d*\+/);
    if (match) {
      const min = parseInt(match[1].replace(/,/g, ''));
      return { min, max: Infinity };
    }
  }
  
  // Handle "₦10,000.00 - ₦15,000.00" format
  const match = priceRangeString.match(/₦([\d,]+)\.?\d* - ₦([\d,]+)\.?\d*/);
  if (match) {
    const min = parseInt(match[1].replace(/,/g, ''));
    const max = parseInt(match[2].replace(/,/g, ''));
    return { min, max };
  }
  
  return { min: 0, max: Infinity };
}

// Export the search instance for advanced usage
export { search, searchClient };
