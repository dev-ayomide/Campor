import React, { useMemo, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { ShoppingBag, Plus, Minus } from 'lucide-react';

export default function AddToCartButton({ productId, className = '' }) {
  const { addProductToCart, checkProductInCart, getCartItem, updateItemQuantity, removeItemFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  const isInCart = checkProductInCart(productId);
  const cartItem = useMemo(() => getCartItem(productId), [getCartItem, productId, isInCart]);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    try {
      setLoading(true);
      await addProductToCart(productId, 1);
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
    try {
      setLoading(true);
      await updateItemQuantity(cartItem.id, quantity + 1);
    } catch (error) {
      console.error('Failed to increase quantity:', error);
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
      if (quantity <= 1) {
        await removeItemFromCart(cartItem.id);
      } else {
        await updateItemQuantity(cartItem.id, quantity - 1);
      }
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
    } finally {
      setLoading(false);
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
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] h-5 flex items-center justify-center text-center font-medium text-gray-900">
            {loading ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></span>
            ) : (
              quantity
            )}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
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
        disabled={loading}
        className={`w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/70 border-t-transparent mr-2"></div>
        ) : (
          <ShoppingBag className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Updating...' : 'Add to Cart'}
      </button>
  );
}




