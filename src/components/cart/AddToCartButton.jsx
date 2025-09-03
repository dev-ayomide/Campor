import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

export default function AddToCartButton({ productId, className = '' }) {
  const { 
    addProductToCart, 
    checkProductInCart, 
    getCartItem, 
    updateItemQuantity, 
    removeItemFromCart 
  } = useCart();
  const [loading, setLoading] = useState(false);

  const isInCart = checkProductInCart(productId);
  const cartItem = getCartItem(productId);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
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

  const handleQuantityChange = async (newQuantity) => {
    if (loading || !cartItem) return;
    
    try {
      setLoading(true);
      if (newQuantity <= 0) {
        await removeItemFromCart(cartItem.id);
      } else {
        await updateItemQuantity(cartItem.id, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isInCart && cartItem) {
    return (
      <div className={`flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
        >
          -
        </button>
        <span className="px-4 py-2 bg-white text-gray-900 font-medium min-w-[3rem] text-center">
          {loading ? (
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : quantity}
        </span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Adding...
        </>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
}




