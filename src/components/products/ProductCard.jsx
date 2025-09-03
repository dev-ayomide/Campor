import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { AddToCartButton } from '../cart';
import { Star, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={product.imageUrls?.[0] || '/placeholder-product.png'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          
          {/* Stock Badge */}
          {product.stockQuantity <= 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
          
          {/* Wishlist Button */}
          <button className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <div className="mb-2">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Out of stock'}
          </span>
        </div>

        {/* Seller Info */}
        {product.seller && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {product.seller.catalogueName?.charAt(0) || 'S'}
              </span>
            </div>
            <span className="text-sm text-gray-600 truncate">
              {product.seller.catalogueName || 'Unknown Seller'}
            </span>
          </div>
        )}

        {/* Rating */}
        {product.ratings && product.ratings.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.round(product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.ratings.length})
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="mt-auto">
          <AddToCartButton 
            productId={product.id} 
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}




