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

// Cart state management
let cartCache = null;
let cartCacheTime = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Get cached cart
const getCachedCart = () => {
  if (cartCache && cartCacheTime && (Date.now() - cartCacheTime) < CACHE_DURATION) {
    return cartCache;
  }
  return null;
};

// Set cached cart
const setCachedCart = (cart) => {
  cartCache = cart;
  cartCacheTime = Date.now();
};



// Get user cart
export async function getCart(force = false) {
  try {
    console.log('🔍 CartService: Fetching user cart...');
    
    // Check cache first (unless forced)
    const cachedCart = getCachedCart();
    if (cachedCart && !force) {
      console.log('✅ CartService: Returning cached cart');
      return cachedCart;
    }
    
    const response = await api.get(API_ENDPOINTS.CART.GET);
    
    // Cache the response
    setCachedCart(response.data);
    
    console.log('✅ CartService: Cart fetched successfully:', response.data);
    console.log('🔍 CartService: Cart structure:', {
      isArray: Array.isArray(response.data),
      length: response.data?.length,
      firstItem: response.data?.[0]
    });
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to fetch cart:', error);
    
    // If it's an authentication error (401), return empty cart instead of throwing
    if (error.response?.status === 401) {
      console.log('🔍 CartService: User not authenticated, returning empty cart');
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch cart.');
  }
}

// Add items to cart
export async function addToCart(cartId, items) {
  try {
    console.log('🔍 CartService: Adding items to cart:', { cartId, items });
    
    // Only include cartId if it's not null/undefined and not a temp ID
    const payload = {
      items: items
    };
    
    // Only add cartId if it's a real cart ID (not temp-cart-id)
    if (cartId && cartId !== 'temp-cart-id') {
      payload.cartId = cartId;
    }
    
    const response = await api.post(API_ENDPOINTS.CART.ADD, payload);
    
    // Clear cache to force refresh
    clearCartCache();
    
    console.log('✅ CartService: Items added to cart successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to add items to cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to add items to cart.');
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId, quantity) {
  try {
    console.log('🔍 CartService: Updating cart item quantity:', { itemId, quantity });
    
    const response = await api.patch(`${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`, {
      quantity
    });
    
    // Clear cache to force refresh
    clearCartCache();
    
    console.log('✅ CartService: Cart item quantity updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to update cart item quantity:', error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item quantity.');
  }
}

// Remove item from cart
export async function removeFromCart(itemId) {
  try {
    console.log('🔍 CartService: Removing item from cart:', itemId);
    
    const response = await api.delete(`${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`);
    
    // Clear cache to force refresh
    clearCartCache();
    
    console.log('✅ CartService: Item removed from cart successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to remove item from cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart.');
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    console.log('🔍 CartService: Clearing cart...');
    
    const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
    
    // Clear cache
    clearCartCache();
    
    console.log('✅ CartService: Cart cleared successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to clear cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart.');
  }
}

// Helper function to calculate cart totals
export function calculateCartTotals(cart) {
  if (!cart || !Array.isArray(cart)) return { totalItems: 0, totalPrice: 0 };
  
  let totalItems = 0;
  let totalPrice = 0;
  
  cart.forEach(sellerGroup => {
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      sellerGroup.items.forEach(item => {
        totalItems += item.quantity || 0;
        totalPrice += (parseFloat(item.product?.price || 0) * (item.quantity || 0));
      });
    }
  });
  
  return {
    totalItems,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

// Helper function to get cart item count
export function getCartItemCount(cart) {
  console.log('🔍 CartService: getCartItemCount called with:', cart);
  
  if (!cart || !Array.isArray(cart)) {
    console.log('🔍 CartService: Cart is empty or not array, returning 0');
    return 0;
  }
  
  const count = cart.reduce((count, sellerGroup) => {
    console.log('🔍 CartService: Processing seller group:', sellerGroup);
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      const groupCount = sellerGroup.items.reduce((itemCount, item) => {
        console.log('🔍 CartService: Processing item:', item, 'quantity:', item.quantity);
        return itemCount + (item.quantity || 0);
      }, 0);
      console.log('🔍 CartService: Group count:', groupCount);
      return count + groupCount;
    }
    return count;
  }, 0);
  
  console.log('🔍 CartService: Total cart count:', count);
  return count;
}

// Helper function to check if product is in cart
export function isProductInCart(cart, productId) {
  if (!cart || !Array.isArray(cart) || !productId) return false;
  
  return cart.some(sellerGroup => 
    sellerGroup.items && Array.isArray(sellerGroup.items) &&
    sellerGroup.items.some(item => {
      const itemProductId = item.productId || item.product?.id;
      return itemProductId === productId;
    })
  );
}

// Helper function to get cart item by product ID
export function getCartItemByProductId(cart, productId) {
  if (!cart || !Array.isArray(cart) || !productId) return null;
  
  for (const sellerGroup of cart) {
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      const item = sellerGroup.items.find(item => {
        const itemProductId = item.productId || item.product?.id;
        return itemProductId === productId;
      });
      if (item) return item;
    }
  }
  
  return null;
}

// Clear cart cache manually
export function clearCartCache() {
  cartCache = null;
  cartCacheTime = null;
  console.log('🔍 CartService: Cart cache cleared');
}

