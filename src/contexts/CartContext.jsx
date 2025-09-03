import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getCart, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
  calculateCartTotals,
  getCartItemCount,
  isProductInCart,
  getCartItemByProductId,
  clearCartCache
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
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);

  // Load cart from backend
  const loadCart = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        clearCartCache();
      }
      
      const cartData = await getCart();
      console.log('🔍 CartContext: Raw cart data:', cartData);
      
      // Ensure cart is always an array
      const normalizedCart = Array.isArray(cartData) ? cartData : [];
      setCart(normalizedCart);
      
      // Extract cart ID from first item if available
      if (normalizedCart.length > 0 && normalizedCart[0].items && normalizedCart[0].items.length > 0) {
        setCartId(normalizedCart[0].items[0].cartId);
      }
      
      console.log('✅ Cart loaded successfully:', normalizedCart);
    } catch (err) {
      console.error('❌ Failed to load cart:', err);
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
      
      // Clear cache before adding to ensure fresh data
      clearCartCache();
      
      // Only pass cartId if it exists and is not null
      const currentCartId = cartId || null;
      
      const response = await addToCart(currentCartId, items);
      
      // Immediately reload cart with force refresh to get updated data
      await loadCart(true);
      
      console.log('✅ Items added to cart successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to add items to cart:', err);
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
      
      // Clear cache before updating
      clearCartCache();
      
      const response = await updateCartItemQuantity(itemId, quantity);
      
      // Immediately reload cart with force refresh to get updated data
      await loadCart(true);
      
      console.log('✅ Cart item quantity updated successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to update cart item quantity:', err);
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
      
      // Clear cache before removing
      clearCartCache();
      
      const response = await removeFromCart(itemId);
      
      // Immediately reload cart with force refresh to get updated data
      await loadCart(true);
      
      console.log('✅ Item removed from cart successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to remove item from cart:', err);
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
      
      console.log('✅ Cart cleared successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to clear cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add single product to cart
  const addProductToCart = useCallback(async (productId, quantity = 1) => {
    const items = [{
      productId: productId,
      quantity: quantity
    }];
    
    return await addItemsToCart(items);
  }, [addItemsToCart]);

  // Get cart totals
  const getCartTotals = useCallback(() => {
    return calculateCartTotals(cart);
  }, [cart]);

  // Get cart item count
  const getItemCount = useCallback(() => {
    const count = getCartItemCount(cart);
    console.log('🔍 CartContext: Cart item count:', count, 'Cart data:', cart);
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

  // Load cart on mount and when user changes
  useEffect(() => {
    console.log('🔍 CartContext: Loading cart on mount...');
    loadCart();
  }, [loadCart]);

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
    
    // Computed values
    getCartTotals,
    getItemCount,
    checkProductInCart,
    getCartItem,
    
    // Utility
    setError: (err) => setError(err)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};




