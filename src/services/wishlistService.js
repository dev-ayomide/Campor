import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campor_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Wishlist state management
let wishlistCache = null;
let wishlistCacheTime = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Get cached wishlist
const getCachedWishlist = () => {
  if (wishlistCache && wishlistCacheTime && (Date.now() - wishlistCacheTime) < CACHE_DURATION) {
    return wishlistCache;
  }
  return null;
};

// Set cached wishlist
const setCachedWishlist = (wishlist) => {
  wishlistCache = wishlist;
  wishlistCacheTime = Date.now();
};

// Clear wishlist cache
export function clearWishlistCache() {
  wishlistCache = null;
  wishlistCacheTime = null;
}

// Get user wishlist
export async function getWishlist(force = false) {
  try {
    
    // Check cache first (unless forced)
    const cachedWishlist = getCachedWishlist();
    if (cachedWishlist && !force) {
      return cachedWishlist;
    }
    
    const response = await api.get(API_ENDPOINTS.WISHLIST.GET);
    
    
    // Extract items array from API response structure
    const wishlistData = response.data.items || [];
    
    // Cache the extracted data
    setCachedWishlist(wishlistData);
    
    return wishlistData;
  } catch (error) {
    
    // If it's an authentication error (401), return empty wishlist instead of throwing
    if (error.response?.status === 401) {
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch wishlist.');
  }
}

// Add product to wishlist
export async function addToWishlist(productId) {
  try {
    
    const response = await api.post(API_ENDPOINTS.WISHLIST.ADD, {
      productId: productId
    });
    
    // Clear cache to force refresh
    clearWishlistCache();
    
    return response.data;
  } catch (error) {
    
    // Handle the case where product is already in wishlist
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('already in your wishlist')) {
        // Clear cache to force refresh and return success
        clearWishlistCache();
        return { message: 'Product is already in your wishlist', alreadyExists: true };
      }
    }
    
    throw new Error(error.response?.data?.message || 'Failed to add product to wishlist.');
  }
}

// Remove product from wishlist
export async function removeFromWishlist(productId) {
  try {
    
    const response = await api.delete(`${API_ENDPOINTS.WISHLIST.REMOVE}/${productId}`);
    
    // Clear cache to force refresh
    clearWishlistCache();
    
    return response.data;
  } catch (error) {
    
    // Handle the case where product is not in wishlist
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('not in your wishlist')) {
        // Clear cache to force refresh and return success
        clearWishlistCache();
        return { message: 'Product is not in wishlist', notFound: true };
      }
    }
    
    throw new Error(error.response?.data?.message || 'Failed to remove product from wishlist.');
  }
}

// Helper function to check if product is in wishlist
export function isProductInWishlist(wishlist, productId) {
  if (!wishlist || !Array.isArray(wishlist) || !productId) return false;
  
  
  const result = wishlist.some(item => {
    const itemProductId = item.productId || item.product?.id || item.id;
    
    // Convert both to strings for comparison to handle type mismatches
    const normalizedProductId = String(productId);
    const normalizedItemProductId = String(itemProductId);
    
    const match = normalizedItemProductId === normalizedProductId;
    return match;
  });
  
  return result;
}

// Helper function to get wishlist item by product ID
export function getWishlistItemByProductId(wishlist, productId) {
  if (!wishlist || !Array.isArray(wishlist) || !productId) return null;
  
  return wishlist.find(item => {
    const itemProductId = item.productId || item.product?.id || item.id;
    return itemProductId === productId;
  });
}

// Helper function to get wishlist count
export function getWishlistCount(wishlist) {
  if (!wishlist || !Array.isArray(wishlist)) return 0;
  return wishlist.length;
}
