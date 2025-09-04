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
  console.log('🔍 WishlistService: Wishlist cache cleared');
}

// Get user wishlist
export async function getWishlist(force = false) {
  try {
    console.log('🔍 WishlistService: Fetching user wishlist...');
    
    // Check cache first (unless forced)
    const cachedWishlist = getCachedWishlist();
    if (cachedWishlist && !force) {
      console.log('✅ WishlistService: Returning cached wishlist');
      return cachedWishlist;
    }
    
    const response = await api.get(API_ENDPOINTS.WISHLIST.GET);
    
    // Cache the response
    setCachedWishlist(response.data);
    
    console.log('✅ WishlistService: Wishlist fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ WishlistService: Failed to fetch wishlist:', error);
    
    // If it's an authentication error (401), return empty wishlist instead of throwing
    if (error.response?.status === 401) {
      console.log('🔍 WishlistService: User not authenticated, returning empty wishlist');
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch wishlist.');
  }
}

// Add product to wishlist
export async function addToWishlist(productId) {
  try {
    console.log('🔍 WishlistService: Adding product to wishlist:', productId);
    
    const response = await api.post(API_ENDPOINTS.WISHLIST.ADD, {
      productId: productId
    });
    
    // Clear cache to force refresh
    clearWishlistCache();
    
    console.log('✅ WishlistService: Product added to wishlist successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ WishlistService: Failed to add product to wishlist:', error);
    
    // Handle the case where product is already in wishlist
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already in your wishlist')) {
      console.log('🔍 WishlistService: Product is already in wishlist, treating as success');
      // Clear cache to force refresh and return success
      clearWishlistCache();
      return { message: 'Product is already in your wishlist', alreadyExists: true };
    }
    
    throw new Error(error.response?.data?.message || 'Failed to add product to wishlist.');
  }
}

// Remove product from wishlist
export async function removeFromWishlist(productId) {
  try {
    console.log('🔍 WishlistService: Removing product from wishlist:', productId);
    
    const response = await api.delete(`${API_ENDPOINTS.WISHLIST.REMOVE}/${productId}`);
    
    // Clear cache to force refresh
    clearWishlistCache();
    
    console.log('✅ WishlistService: Product removed from wishlist successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ WishlistService: Failed to remove product from wishlist:', error);
    
    // Handle the case where product is not in wishlist
    if (error.response?.status === 400 && error.response?.data?.message?.includes('not in your wishlist')) {
      console.log('🔍 WishlistService: Product is not in wishlist, treating as success');
      // Clear cache to force refresh and return success
      clearWishlistCache();
      return { message: 'Product is not in your wishlist', notFound: true };
    }
    
    throw new Error(error.response?.data?.message || 'Failed to remove product from wishlist.');
  }
}

// Helper function to check if product is in wishlist
export function isProductInWishlist(wishlist, productId) {
  if (!wishlist || !Array.isArray(wishlist) || !productId) return false;
  
  return wishlist.some(item => {
    const itemProductId = item.productId || item.product?.id || item.id;
    return itemProductId === productId;
  });
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
