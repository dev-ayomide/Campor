import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist,
  isProductInWishlist,
  getWishlistItemByProductId,
  getWishlistCount
} from '../services/wishlistService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist from backend
  const loadWishlist = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const wishlistData = await getWishlist(force);
      console.log('🔍 WishlistContext: Raw wishlist data:', wishlistData);
      console.log('🔍 WishlistContext: Data type:', typeof wishlistData);
      console.log('🔍 WishlistContext: Is array:', Array.isArray(wishlistData));
      
      // Ensure wishlist is always an array
      const normalizedWishlist = Array.isArray(wishlistData) ? wishlistData : [];
      setWishlist(normalizedWishlist);
      
      console.log('✅ Wishlist loaded successfully:', normalizedWishlist);
      console.log('🔍 WishlistContext: First item structure:', normalizedWishlist[0]);
    } catch (err) {
      console.error('❌ Failed to load wishlist:', err);
      // Don't set error for authentication issues, just set empty wishlist
      if (err.message !== 'User not authenticated') {
        setError(err.message);
      }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add product to wishlist
  const addProductToWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      
      const response = await addToWishlist(productId);
      
      // Optimistically update the wishlist state instead of reloading
      setWishlist(prevWishlist => {
        // Check if product is already in wishlist to avoid duplicates
        const isAlreadyInWishlist = prevWishlist.some(item => {
          const itemProductId = item.productId || item.product?.id || item.id;
          return String(itemProductId) === String(productId);
        });
        
        if (isAlreadyInWishlist) {
          return prevWishlist; // Don't add duplicate
        }
        
        // Add new item to wishlist
        const newItem = {
          id: Date.now(), // Temporary ID
          productId: productId,
          product: { id: productId }, // Minimal product info
          createdAt: new Date().toISOString()
        };
        
        return [...prevWishlist, newItem];
      });
      
      console.log('✅ Product added to wishlist successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to add product to wishlist:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Remove product from wishlist
  const removeProductFromWishlist = useCallback(async (productId) => {
    try {
      setError(null);
      
      const response = await removeFromWishlist(productId);
      
      // Optimistically update the wishlist state instead of reloading
      setWishlist(prevWishlist => {
        return prevWishlist.filter(item => {
          const itemProductId = item.productId || item.product?.id || item.id;
          return String(itemProductId) !== String(productId);
        });
      });
      
      console.log('✅ Product removed from wishlist successfully:', response);
      return response;
    } catch (err) {
      console.error('❌ Failed to remove product from wishlist:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Check if product is in wishlist
  const checkProductInWishlist = useCallback((productId) => {
    return isProductInWishlist(wishlist, productId);
  }, [wishlist]);

  // Get wishlist item by product ID
  const getWishlistItem = useCallback((productId) => {
    return getWishlistItemByProductId(wishlist, productId);
  }, [wishlist]);

  // Toggle product in wishlist (add if not present, remove if present)
  const toggleProductInWishlist = useCallback(async (productId) => {
    const isInWishlist = isProductInWishlist(wishlist, productId);
    
    if (isInWishlist) {
      return await removeProductFromWishlist(productId);
    } else {
      return await addProductToWishlist(productId);
    }
  }, [addProductToWishlist, removeProductFromWishlist, wishlist]);

  // Get wishlist count
  const getItemCount = useCallback(() => {
    const count = getWishlistCount(wishlist);
    console.log('🔍 WishlistContext: Wishlist count:', count, 'Wishlist data:', wishlist);
    return count;
  }, [wishlist]);

  // Load wishlist on mount
  useEffect(() => {
    console.log('🔍 WishlistContext: Loading wishlist on mount...');
    loadWishlist();
  }, [loadWishlist]);

  const value = {
    // State
    wishlist,
    loading,
    error,
    
    // Actions
    loadWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
    toggleProductInWishlist,
    
    // Computed values
    getItemCount,
    checkProductInWishlist,
    getWishlistItem,
    
    // Utility
    setError: (err) => setError(err)
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
