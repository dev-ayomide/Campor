import React, { useState } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Heart } from 'lucide-react';

export default function WishlistButton({ productId, className = '', showText = false }) {
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
      className={`transition-all duration-200 disabled:opacity-50 flex items-center justify-center ${
        isInWishlist 
          ? 'text-blue-600 hover:text-blue-700' 
          : showText 
            ? 'text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-lg'
            : 'text-blue-600 hover:text-blue-700'
      } ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
      ) : showText ? (
        <div className="flex items-center gap-2">
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} 
            strokeWidth={isInWishlist ? 0 : 2}
          />
          <span className="text-sm font-medium">Wishlist</span>
        </div>
      ) : (
        <Heart 
          className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} 
          strokeWidth={isInWishlist ? 0 : 2}
        />
      )}
    </button>
  );
}
