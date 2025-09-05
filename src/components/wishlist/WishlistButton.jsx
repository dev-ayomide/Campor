import React, { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Heart } from 'lucide-react';

export default function WishlistButton({ productId, className = '' }) {
  const { toggleProductInWishlist, checkProductInWishlist, loading } = useWishlist();
  const [localLoading, setLocalLoading] = useState(false);
  
  console.log('🔍 WishlistButton: productId:', productId, 'type:', typeof productId);
  const isInWishlist = checkProductInWishlist(productId);
  console.log('🔍 WishlistButton: isInWishlist:', isInWishlist);
  const isLoading = loading || localLoading;

  const handleToggleWishlist = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLoading) return;
    
    try {
      setLocalLoading(true);
      await toggleProductInWishlist(productId);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${
        isInWishlist 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
      } ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
      ) : (
        <Heart 
          className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} 
        />
      )}
    </button>
  );
}
