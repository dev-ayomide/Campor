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

// Validate if a string is a valid UUID format
export const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};



// Get user cart
export async function getCart(force = false) {
  try {
    
    // Check cache first (unless forced)
    const cachedCart = getCachedCart();
    if (cachedCart && !force) {
      return cachedCart;
    }
    
    const response = await api.get(API_ENDPOINTS.CART.GET);
    
    // Cache the response
    setCachedCart(response.data);
    
    return response.data;
  } catch (error) {
    
    // If it's an authentication error (401), return empty cart instead of throwing
    if (error.response?.status === 401) {
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch cart.');
  }
}

// Add items to cart (inventory validation handled by backend webhook)
export async function addToCart(cartId, items) {
  try {
    
    // Note: Inventory validation is handled by backend webhook after payment
    // Frontend allows adding to cart, backend will handle stock validation
    
    const payload = {
      items: items
    };
    
    // Only include cartId if it's a valid UUID format (from backend)
    // For new users, let the backend create the cart ID
    if (cartId && isValidUUID(cartId)) {
      payload.cartId = cartId;
    }
    
    const response = await api.post(API_ENDPOINTS.CART.ADD, payload);
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add items to cart.');
  }
}

// Update cart item quantity (inventory validation handled by backend webhook)
export async function updateCartItemQuantity(itemId, quantity) {
  try {
    
    // Note: Inventory validation is handled by backend webhook after payment
    // Frontend allows quantity updates, backend will handle stock validation
    
    if (!itemId) {
      throw new Error('Item ID is required for quantity update');
    }
    
    const response = await api.patch(`${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`, {
      quantity
    });
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update cart item quantity.');
  }
}

// Remove item from cart
export async function removeFromCart(itemId) {
  try {
    
    const response = await api.delete(`${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`);
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart.');
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    
    const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
    
    // Clear cache
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart.');
  }
}

// Fix cart items (remove out-of-stock items and adjust quantities)
export async function fixCart(cartId) {
  try {
    
    const response = await api.post(`${API_ENDPOINTS.CART.FIX}/${cartId}/fix`);
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fix cart.');
  }
}

// Initiate checkout process (reserves products for 5 minutes)
export async function initiateCheckout(cartId) {
  try {
    
    if (!cartId) {
      throw new Error('Cart ID is required for checkout');
    }
    
    // Debug: Log the request payload
    console.log('Initiating checkout with cartId:', cartId);
    
    const response = await api.post(API_ENDPOINTS.CART.CHECKOUT, {
      cartId: cartId
    });
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    // Debug: Log the error details
    console.error('Checkout error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Some products are no longer available. Please fix your cart.');
    } else if (error.response?.status === 404) {
      throw new Error('Cart not found. Please refresh and try again.');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to continue with checkout.');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to initiate checkout. Please try again.');
    }
  }
}

// Cancel checkout process (releases product reservations)
export async function cancelCheckout(cartId) {
  try {
    
    if (!cartId) {
      throw new Error('Cart ID is required to cancel checkout');
    }
    
    const response = await api.post(`${API_ENDPOINTS.CART.CANCEL_CHECKOUT}/${cartId}/cancel-checkout`);
    
    // Clear cache to force refresh
    clearCartCache();
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel checkout.');
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
        // Use effectiveQuantity if available (for stock validation), otherwise use quantity
        const effectiveQty = item.effectiveQuantity !== undefined ? item.effectiveQuantity : item.quantity || 0;
        totalItems += effectiveQty;
        totalPrice += (parseFloat(item.product?.price || 0) * effectiveQty);
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
  
  if (!cart || !Array.isArray(cart)) {
    return 0;
  }
  
  const count = cart.reduce((count, sellerGroup) => {
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      const groupCount = sellerGroup.items.reduce((itemCount, item) => {
        // Use effectiveQuantity if available (for stock validation), otherwise use quantity
        const effectiveQty = item.effectiveQuantity !== undefined ? item.effectiveQuantity : item.quantity || 0;
        return itemCount + effectiveQty;
      }, 0);
      return count + groupCount;
    }
    return count;
  }, 0);
  
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
}

// ===== INVENTORY VALIDATION FUNCTIONS =====

/**
 * Validate inventory for items being added to cart
 * @param {Array} items - Array of items with productId and quantity
 */
export async function validateInventory(items) {
  try {
    
    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity || quantity <= 0) {
        throw new Error('Invalid item data provided');
      }
      
      // Fetch current product inventory
      const productResponse = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${productId}`);
      const product = productResponse.data;
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if product is out of stock
      if (product.stockQuantity <= 0) {
        throw new Error(`Product "${product.name}" is currently out of stock`);
      }
      
      // Check if requested quantity exceeds available stock
      if (quantity > product.stockQuantity) {
        throw new Error(`Only ${product.stockQuantity} units of "${product.name}" are available. You requested ${quantity} units.`);
      }
      
    }
    
  } catch (error) {
    throw error;
  }
}

/**
 * Validate inventory for cart item quantity update
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 */
export async function validateCartItemInventory(itemId, quantity) {
  try {
    
    if (!quantity || quantity <= 0) {
      throw new Error('Invalid quantity provided');
    }
    
    // Get cart item details to find product ID
    const cartResponse = await api.get(API_ENDPOINTS.CART.GET);
    const cart = cartResponse.data;
    
    let productId = null;
    let currentQuantity = 0;
    
    // Find the cart item and get product ID
    for (const sellerGroup of cart) {
      if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
        const item = sellerGroup.items.find(item => item.id === itemId);
        if (item) {
          productId = item.productId || item.product?.id;
          currentQuantity = item.quantity || 0;
          break;
        }
      }
    }
    
    if (!productId) {
      throw new Error('Cart item not found');
    }
    
    // Fetch current product inventory
    const productResponse = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${productId}`);
    const product = productResponse.data;
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if product is out of stock
    if (product.stockQuantity <= 0) {
      throw new Error(`Product "${product.name}" is currently out of stock`);
    }
    
    // Check if requested quantity exceeds available stock
    if (quantity > product.stockQuantity) {
      throw new Error(`Only ${product.stockQuantity} units of "${product.name}" are available. You requested ${quantity} units.`);
    }
    
  } catch (error) {
    throw error;
  }
}

/**
 * Check if product is available for purchase
 * @param {string} productId - Product ID
 * @param {number} quantity - Desired quantity
 * @returns {Promise<{available: boolean, stockQuantity: number, message?: string}>}
 */
export async function checkProductAvailability(productId, quantity = 1) {
  try {
    
    const productResponse = await api.get(`${API_ENDPOINTS.PRODUCTS.BY_SLUG}/${productId}`);
    const product = productResponse.data;
    
    if (!product) {
      return {
        available: false,
        stockQuantity: 0,
        message: 'Product not found'
      };
    }
    
    if (product.stockQuantity <= 0) {
      return {
        available: false,
        stockQuantity: 0,
        message: 'Product is out of stock'
      };
    }
    
    if (quantity > product.stockQuantity) {
      return {
        available: false,
        stockQuantity: product.stockQuantity,
        message: `Only ${product.stockQuantity} units available`
      };
    }
    
    return {
      available: true,
      stockQuantity: product.stockQuantity,
      message: `${product.stockQuantity} units available`
    };
  } catch (error) {
    return {
      available: false,
      stockQuantity: 0,
      message: 'Failed to check availability'
    };
  }
}

// ===== CART STATUS VALIDATION FUNCTIONS =====

/**
 * Check if cart has items that need fixing (out of stock, stock mismatch, or deleted)
 * @param {Array} cart - Cart data
 * @returns {boolean} - True if cart needs fixing
 */
export function cartNeedsFixing(cart) {
  if (!cart || !Array.isArray(cart)) return false;
  
  return cart.some(sellerGroup => 
    sellerGroup.items && Array.isArray(sellerGroup.items) &&
    sellerGroup.items.some(item => 
      item.status === 'out_of_stock' || item.status === 'stock_mismatch' || item.status === 'deleted'
    )
  );
}

/**
 * Get cart status summary
 * @param {Array} cart - Cart data
 * @returns {Object} - Status summary with counts
 */
export function getCartStatusSummary(cart) {
  if (!cart || !Array.isArray(cart)) {
    return {
      totalItems: 0,
      okItems: 0,
      stockMismatchItems: 0,
      outOfStockItems: 0,
      deletedItems: 0,
      needsFixing: false
    };
  }
  
  let totalItems = 0;
  let okItems = 0;
  let stockMismatchItems = 0;
  let outOfStockItems = 0;
  let deletedItems = 0;
  
  cart.forEach(sellerGroup => {
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      sellerGroup.items.forEach(item => {
        totalItems++;
        switch (item.status) {
          case 'ok':
            okItems++;
            break;
          case 'stock_mismatch':
            stockMismatchItems++;
            break;
          case 'out_of_stock':
            outOfStockItems++;
            break;
          case 'deleted':
            deletedItems++;
            break;
          default:
            // If no status field, assume it's ok (backward compatibility)
            okItems++;
        }
      });
    }
  });
  
  return {
    totalItems,
    okItems,
    stockMismatchItems,
    outOfStockItems,
    deletedItems,
    needsFixing: stockMismatchItems > 0 || outOfStockItems > 0 || deletedItems > 0
  };
}

/**
 * Get items that need fixing
 * @param {Array} cart - Cart data
 * @returns {Array} - Array of items that need fixing
 */
export function getItemsNeedingFix(cart) {
  if (!cart || !Array.isArray(cart)) return [];
  
  const itemsNeedingFix = [];
  
  cart.forEach(sellerGroup => {
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      sellerGroup.items.forEach(item => {
        if (item.status === 'out_of_stock' || item.status === 'stock_mismatch' || item.status === 'deleted') {
          itemsNeedingFix.push({
            ...item,
            sellerGroup
          });
        }
      });
    }
  });
  
  return itemsNeedingFix;
}

