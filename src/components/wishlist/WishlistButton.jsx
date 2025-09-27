import React, { useState, memo } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Heart, Check } from 'lucide-react';

const WishlistButton = memo(({ productId, className = '', showText = false }) => {
  const { toggleProductInWishlist, checkProductInWishlist } = useWishlist();
  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  
  console.log('🔍 WishlistButton: productId:', productId, 'type:', typeof productId);
  const isInWishlist = checkProductInWishlist(productId);
  console.log('🔍 WishlistButton: isInWishlist:', isInWishlist);
  const isLoading = localLoading; // Only use local loading state

  const handleToggleWishlist = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLoading) return;
    
    try {
      setLocalLoading(true);
      setSuccess(false);
      setError(false);
      await toggleProductInWishlist(productId);
      
      // Show success state briefly
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`transition-all duration-300 disabled:opacity-50 flex items-center justify-center hover:scale-105 ${
        error
          ? 'text-red-600 bg-red-50'
          : success
            ? 'text-green-600 bg-green-50'
            : isInWishlist 
              ? 'text-blue-600 hover:text-blue-700' 
              : showText 
                ? 'text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-lg'
                : 'text-blue-600 hover:text-blue-700'
      } ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
      ) : error ? (
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {showText && <span className="text-sm font-medium">Error</span>}
        </div>
      ) : success ? (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          {showText && <span className="text-sm font-medium">Added!</span>}
        </div>
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
});

export default WishlistButton;
