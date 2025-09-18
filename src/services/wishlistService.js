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
    console.log('🔍 WishlistService: API Base URL:', API_BASE_URL);
    console.log('🔍 WishlistService: Endpoint:', API_ENDPOINTS.WISHLIST.GET);
    console.log('🔍 WishlistService: Full URL:', `${API_BASE_URL}${API_ENDPOINTS.WISHLIST.GET}`);
    
    // Check cache first (unless forced)
    const cachedWishlist = getCachedWishlist();
    if (cachedWishlist && !force) {
      console.log('✅ WishlistService: Returning cached wishlist');
      return cachedWishlist;
    }
    
    const response = await api.get(API_ENDPOINTS.WISHLIST.GET);
    
    console.log('🔍 WishlistService: Raw API response:', response);
    console.log('🔍 WishlistService: Response data:', response.data);
    console.log('🔍 WishlistService: Response data type:', typeof response.data);
    console.log('🔍 WishlistService: Response data is array:', Array.isArray(response.data));
    
    // Extract items array from API response structure
    const wishlistData = response.data.items || [];
    console.log('🔍 WishlistService: Extracted items:', wishlistData);
    console.log('🔍 WishlistService: Items is array:', Array.isArray(wishlistData));
    
    // Cache the extracted data
    setCachedWishlist(wishlistData);
    
    console.log('✅ WishlistService: Wishlist fetched successfully:', wishlistData);
    return wishlistData;
  } catch (error) {
    console.error('❌ WishlistService: Failed to fetch wishlist:', error);
    console.error('❌ WishlistService: Error response:', error.response);
    console.error('❌ WishlistService: Error data:', error.response?.data);
    
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
    console.error('🔍 WishlistService: Error response data:', error.response?.data);
    
    // Handle the case where product is already in wishlist
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      console.log('🔍 WishlistService: 400 error message:', errorMessage);
      
      if (errorMessage.includes('already in your wishlist')) {
        console.log('🔍 WishlistService: Product is already in wishlist, treating as success');
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
    console.log('🔍 WishlistService: Removing product from wishlist:', productId);
    
    const response = await api.delete(`${API_ENDPOINTS.WISHLIST.REMOVE}/${productId}`);
    
    // Clear cache to force refresh
    clearWishlistCache();
    
    console.log('✅ WishlistService: Product removed from wishlist successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ WishlistService: Failed to remove product from wishlist:', error);
    console.error('🔍 WishlistService: Error response data:', error.response?.data);
    
    // Handle the case where product is not in wishlist
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      console.log('🔍 WishlistService: 400 error message:', errorMessage);
      
      if (errorMessage.includes('not in your wishlist')) {
        console.log('🔍 WishlistService: Product is not in wishlist, treating as success');
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
  
  console.log('🔍 isProductInWishlist: Checking productId:', productId, 'type:', typeof productId);
  console.log('🔍 isProductInWishlist: Wishlist items:', wishlist);
  
  const result = wishlist.some(item => {
    console.log('🔍 isProductInWishlist: Item structure:', item);
    const itemProductId = item.productId || item.product?.id || item.id;
    console.log('🔍 isProductInWishlist: Item productId:', itemProductId, 'type:', typeof itemProductId);
    
    // Convert both to strings for comparison to handle type mismatches
    const normalizedProductId = String(productId);
    const normalizedItemProductId = String(itemProductId);
    
    console.log('🔍 isProductInWishlist: Comparing', normalizedItemProductId, 'with', normalizedProductId);
    const match = normalizedItemProductId === normalizedProductId;
    console.log('🔍 isProductInWishlist: Match:', match);
    return match;
  });
  
  console.log('🔍 isProductInWishlist: Final result:', result);
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
