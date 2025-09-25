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

// Add items to cart (inventory validation handled by backend webhook)
export async function addToCart(cartId, items) {
  try {
    console.log('🔍 CartService: Adding items to cart:', { cartId, items });
    
    // Note: Inventory validation is handled by backend webhook after payment
    // Frontend allows adding to cart, backend will handle stock validation
    
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

// Update cart item quantity (inventory validation handled by backend webhook)
export async function updateCartItemQuantity(itemId, quantity) {
  try {
    console.log('🔍 CartService: Updating cart item quantity:', { itemId, quantity });
    
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

// Fix cart items (remove out-of-stock items and adjust quantities)
export async function fixCart(cartId) {
  try {
    console.log('🔍 CartService: Fixing cart:', cartId);
    
    const response = await api.post(`${API_ENDPOINTS.CART.FIX}/${cartId}/fix`);
    
    // Clear cache to force refresh
    clearCartCache();
    
    console.log('✅ CartService: Cart fixed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ CartService: Failed to fix cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to fix cart.');
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
  console.log('🔍 CartService: getCartItemCount called with:', cart);
  
  if (!cart || !Array.isArray(cart)) {
    console.log('🔍 CartService: Cart is empty or not array, returning 0');
    return 0;
  }
  
  const count = cart.reduce((count, sellerGroup) => {
    console.log('🔍 CartService: Processing seller group:', sellerGroup);
    if (sellerGroup.items && Array.isArray(sellerGroup.items)) {
      const groupCount = sellerGroup.items.reduce((itemCount, item) => {
        // Use effectiveQuantity if available (for stock validation), otherwise use quantity
        const effectiveQty = item.effectiveQuantity !== undefined ? item.effectiveQuantity : item.quantity || 0;
        console.log('🔍 CartService: Processing item:', item, 'effectiveQuantity:', effectiveQty);
        return itemCount + effectiveQty;
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

// ===== INVENTORY VALIDATION FUNCTIONS =====

/**
 * Validate inventory for items being added to cart
 * @param {Array} items - Array of items with productId and quantity
 */
export async function validateInventory(items) {
  try {
    console.log('🔍 CartService: Validating inventory for items:', items);
    
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
      
      console.log(`✅ CartService: Inventory validation passed for product ${productId}: ${quantity}/${product.stockQuantity}`);
    }
    
    console.log('✅ CartService: All inventory validations passed');
  } catch (error) {
    console.error('❌ CartService: Inventory validation failed:', error);
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
    console.log('🔍 CartService: Validating inventory for cart item update:', { itemId, quantity });
    
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
    
    console.log(`✅ CartService: Cart item inventory validation passed: ${quantity}/${product.stockQuantity}`);
  } catch (error) {
    console.error('❌ CartService: Cart item inventory validation failed:', error);
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
    console.log('🔍 CartService: Checking product availability:', { productId, quantity });
    
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
    console.error('❌ CartService: Failed to check product availability:', error);
    return {
      available: false,
      stockQuantity: 0,
      message: 'Failed to check availability'
    };
  }
}

// ===== CART STATUS VALIDATION FUNCTIONS =====

/**
 * Check if cart has items that need fixing (out of stock or stock mismatch)
 * @param {Array} cart - Cart data
 * @returns {boolean} - True if cart needs fixing
 */
export function cartNeedsFixing(cart) {
  if (!cart || !Array.isArray(cart)) return false;
  
  return cart.some(sellerGroup => 
    sellerGroup.items && Array.isArray(sellerGroup.items) &&
    sellerGroup.items.some(item => 
      item.status === 'out_of_stock' || item.status === 'stock_mismatch'
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
      needsFixing: false
    };
  }
  
  let totalItems = 0;
  let okItems = 0;
  let stockMismatchItems = 0;
  let outOfStockItems = 0;
  
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
    needsFixing: stockMismatchItems > 0 || outOfStockItems > 0
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
        if (item.status === 'out_of_stock' || item.status === 'stock_mismatch') {
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

