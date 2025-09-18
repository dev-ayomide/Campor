import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Heart } from 'lucide-react';

export default function WishlistIcon({ onClick }) {
  const { getItemCount } = useWishlist();
  const itemCount = getItemCount();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Heart className="h-6 w-6" />
      
      {/* Wishlist Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      
      <span className="sr-only">Wishlist</span>
    </button>
  );
}





