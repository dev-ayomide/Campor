import React, { useMemo, useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Plus, Minus, Check } from 'lucide-react';
import { ChatIcon } from '../common';
import { checkProductAvailability } from '../../services/cartService';
import { getSellerUserId } from '../../services/authService';

export default function AddToCartButton({ productId, className = '', sellerId = null, roundedStyle = 'full' }) {
  const { addProductToCart, checkProductInCart, getCartItem, updateItemQuantity, removeItemFromCart, loadCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availability, setAvailability] = useState({ available: true, stockQuantity: 0, message: '' });
  const [checkingAvailability, setCheckingAvailability] = useState(true);

  const isInCart = checkProductInCart(productId);
  const cartItem = useMemo(() => getCartItem(productId), [getCartItem, productId, isInCart]);
  const quantity = cartItem?.quantity || 0;

  // Note: Inventory validation is handled by backend webhook after payment
  // Frontend allows adding to cart, backend will handle stock validation
  useEffect(() => {
    // Set default availability - backend will handle validation
    setAvailability({ available: true, stockQuantity: 999, message: 'Available' });
        setCheckingAvailability(false);
  }, [productId, quantity]);

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    try {
      setLoading(true);
      setSuccess(false);
      await addProductToCart(productId, 1);
      
      // Show success state briefly
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!cartItem || loading) return;
    
    // Check if we're at max stock before trying to increase
    if (cartItem.maxAvailable && quantity >= cartItem.maxAvailable) {
      return; // Silently prevent increase if at max stock
    }
    
    try {
      setLoading(true);
      
      // Check if this is an old cart item (missing cart item ID)
      const itemId = cartItem.id || cartItem.cartItemId || cartItem.itemId;
      
      if (!itemId) {
        console.log('🔍 AddToCartButton: Old cart item detected, refreshing cart...');
        // This is an old cart item, refresh the cart to get proper structure
        await loadCart(true); // Force refresh
        return; // Don't throw error, just return silently
      }
      
      await updateItemQuantity(itemId, quantity + 1);
    } catch (error) {
      console.error('Failed to increase quantity:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!cartItem || loading) return;
    try {
      setLoading(true);
      
      // Check if this is an old cart item (missing cart item ID)
      const itemId = cartItem.id || cartItem.cartItemId || cartItem.itemId;
      
      if (!itemId) {
        console.log('🔍 AddToCartButton: Old cart item detected, refreshing cart...');
        // This is an old cart item, refresh the cart to get proper structure
        await loadCart(true); // Force refresh
        return; // Don't throw error, just return silently
      }
      
      if (quantity <= 1) {
        await removeItemFromCart(itemId);
      } else {
        await updateItemQuantity(itemId, quantity - 1);
      }
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  // Handle message seller for out of stock products
  const handleMessageSeller = async () => {
    if (sellerId) {
      try {
        // Get seller's user ID for chat
        const sellerUserId = await getSellerUserId(sellerId);
        // Navigate to chat with seller's user ID
        window.location.href = `/chat?sellerId=${sellerUserId}`;
      } catch (error) {
        console.error('Failed to get seller user ID:', error);
        // Fallback to seller ID if user ID not found
        window.location.href = `/chat?sellerId=${sellerId}`;
      }
    } else {
      alert('Seller information not available. Please contact support.');
    }
  };

  // Show quantity controls if product is in cart
  if (isInCart && cartItem) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-50 transition-all duration-200 hover:scale-105"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] h-8 flex items-center justify-center text-center font-medium text-gray-900 bg-gray-50 rounded-lg">
            {loading ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></span>
            ) : (
              quantity
            )}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={loading || (cartItem.maxAvailable && quantity >= cartItem.maxAvailable)}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-50 transition-all duration-200 hover:scale-105"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Default add-to-cart button
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={loading || checkingAvailability}
      className={`w-full flex items-center justify-center px-4 py-2 ${
        success 
          ? 'bg-green-600 text-white' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${roundedStyle === 'full' ? 'rounded-full' : 'rounded-lg'} transition-all duration-300 disabled:opacity-50 hover:scale-105 ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/70 border-t-transparent mr-2"></div>
      ) : success ? (
        <Check className="h-4 w-4 mr-2" />
      ) : null}
      {loading ? 'Adding...' : success ? 'Added!' : 'Add to Cart'}
    </button>
  );
}




