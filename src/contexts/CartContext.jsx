import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getCart, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
  fixCart,
  calculateCartTotals,
  getCartItemCount,
  isProductInCart,
  getCartItemByProductId,
  cartNeedsFixing,
  getCartStatusSummary,
  getItemsNeedingFix
} from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);
  
  // Fallback: try to derive cartId from stored user if present (read-only)
  useEffect(() => {
    if (!cartId) {
      try {
        const raw = localStorage.getItem('campor_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          const fallbackId = parsed?.cart?.id || null;
          if (fallbackId) setCartId(fallbackId);
        }
      } catch (_) {}
    }
  }, [cartId]);

  // Load cart from backend
  const loadCart = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const cartData = await getCart(force);
      
      // Ensure cart is always an array
      const normalizedCart = Array.isArray(cartData) ? cartData : [];
      setCart(normalizedCart);
      
      // Extract cart ID from cart data if available
      // The cart ID might be in the response metadata or in the first item
      if (cartData?.cartId) {
        setCartId(cartData.cartId);
      } else if (normalizedCart.length > 0 && normalizedCart[0].items && normalizedCart[0].items.length > 0) {
        // Fallback: extract from first item
        const firstItem = normalizedCart[0].items[0];
        if (firstItem.cartId) {
          setCartId(firstItem.cartId);
        }
      }
      
    } catch (err) {
      // Don't set error for authentication issues, just set empty cart
      if (err.message !== 'User not authenticated') {
        setError(err.message);
      }
      setCart([]);
      setCartId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add items to cart
  const addItemsToCart = useCallback(async (items) => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass the current cartId (only if it's a valid UUID from backend)
      const response = await addToCart(cartId, items);
      
      // Update cartId from response if provided
      if (response?.cartId && response.cartId !== cartId) {
        setCartId(response.cartId);
      }
      
      // Reload cart to get updated data and extract cart ID
      await loadCart(true); // bypass cache right after add
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cartId, loadCart]);

  // Update cart item quantity
  const updateItemQuantity = useCallback(async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update - update local state immediately
      setCart(prevCart => 
        prevCart.map(sellerGroup => ({
          ...sellerGroup,
          items: sellerGroup.items.map(item => 
            item.id === itemId 
              ? { ...item, quantity: quantity, effectiveQuantity: quantity }
              : item
          )
        }))
      );
      
      const response = await updateCartItemQuantity(itemId, quantity);
      
      return response;
    } catch (err) {
      // Revert optimistic update on error
      await loadCart(true);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Remove item from cart
  const removeItemFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update - remove item from local state immediately
      setCart(prevCart => 
        prevCart.map(sellerGroup => ({
          ...sellerGroup,
          items: sellerGroup.items.filter(item => item.id !== itemId)
        })).filter(sellerGroup => sellerGroup.items.length > 0)
      );
      
      const response = await removeFromCart(itemId);
      
      return response;
    } catch (err) {
      // Revert optimistic update on error
      await loadCart(true);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Clear entire cart
  const clearUserCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clearCart();
      
      // Clear local cart state
      setCart([]);
      setCartId(null);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix cart items (remove out-of-stock items and adjust quantities)
  const fixUserCart = useCallback(async () => {
    if (!cartId) {
      throw new Error('No cart ID available');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fixCart(cartId);
      
      // Update cart with fixed data
      if (response.data) {
        setCart(response.data);
      } else {
        // Reload cart to get updated data
        await loadCart(true);
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cartId, loadCart]);

  // Add single product to cart with optimistic updates
  const addProductToCart = useCallback(async (productId, quantity = 1) => {
    const items = [{
      productId: productId,
      quantity: quantity
    }];
    
    // Optimistic update - add to local cart immediately
    const existingItem = getCartItemByProductId(cart, productId);
    if (existingItem) {
      // Update existing item quantity optimistically
      setCart(prevCart => 
        prevCart.map(sellerGroup => ({
          ...sellerGroup,
          items: sellerGroup.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }))
      );
    } else {
      // Add new item optimistically (will be replaced by real data after API call)
      const tempItem = {
        id: `temp-${Date.now()}`,
        productId: productId,
        quantity: quantity,
        product: { id: productId }, // Minimal product data
        cartId: cartId || 'temp-cart-id'
      };
      
      // Add to first seller group or create new one
      setCart(prevCart => {
        if (prevCart.length === 0) {
          return [{
            seller: { id: 'temp-seller', name: 'Loading...' },
            items: [tempItem]
          }];
        }
        
        return prevCart.map((sellerGroup, index) => 
          index === 0 
            ? { ...sellerGroup, items: [...sellerGroup.items, tempItem] }
            : sellerGroup
        );
      });
    }
    
    try {
      return await addItemsToCart(items);
    } catch (error) {
      // Revert optimistic update on error
      await loadCart(true);
      throw error;
    }
  }, [addItemsToCart, cart, cartId]);

  // Get cart totals
  const getCartTotals = useCallback(() => {
    return calculateCartTotals(cart);
  }, [cart]);

  // Get cart item count
  const getItemCount = useCallback(() => {
    const count = getCartItemCount(cart);
    return count;
  }, [cart]);

  // Check if product is in cart
  const checkProductInCart = useCallback((productId) => {
    return isProductInCart(cart, productId);
  }, [cart]);

  // Get cart item by product ID
  const getCartItem = useCallback((productId) => {
    return getCartItemByProductId(cart, productId);
  }, [cart]);

  // Check if cart needs fixing
  const needsFixing = useCallback(() => {
    return cartNeedsFixing(cart);
  }, [cart]);

  // Get cart status summary
  const getStatusSummary = useCallback(() => {
    return getCartStatusSummary(cart);
  }, [cart]);

  // Get items that need fixing
  const getItemsNeedingFixCallback = useCallback(() => {
    return getItemsNeedingFix(cart);
  }, [cart]);

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Reload cart when user authentication state changes
  useEffect(() => {
    if (user && token) {
      loadCart(true); // Force reload to bypass cache
    } else if (!user && !token) {
      setCart([]);
      setCartId(null);
      setError(null);
    }
  }, [user, token, loadCart]);

  const value = {
    // State
    cart,
    loading,
    error,
    cartId,
    
    // Actions
    loadCart,
    addItemsToCart,
    addProductToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearUserCart,
    fixUserCart,
    
    // Computed values
    getCartTotals,
    getItemCount,
    checkProductInCart,
    getCartItem,
    
    // Status functions
    needsFixing,
    getStatusSummary,
    getItemsNeedingFix: getItemsNeedingFixCallback,
    
    // Utility
    setError: (err) => setError(err)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};




