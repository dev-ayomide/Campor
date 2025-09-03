import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

export default function AddToCartButton({ productId, className = '' }) {
  const { addProductToCart, checkProductInCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const isInCart = checkProductInCart(productId);

  const handleAddToCart = async () => {
    if (isInCart || loading) return;
    
    try {
      setLoading(true);
      await addProductToCart(productId, 1);
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isInCart) {
    return (
      <button
        disabled
        className={`flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed ${className}`}
      >
        <Check className="h-4 w-4 mr-2" />
        In Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      ) : added ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <ShoppingBag className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Adding...' : added ? 'Added!' : 'Add to Cart'}
    </button>
  );
}




