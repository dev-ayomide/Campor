import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import WishlistButton from '../../components/wishlist/WishlistButton';
import AddToCartButton from '../../components/cart/AddToCartButton';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import productImage from '../../assets/images/product.png';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, loading, error, removeProductFromWishlist } = useWishlist();
  const { addProductToCart } = useCart();
  const isSignedIn = !!user;

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeProductFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addProductToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price || 0).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ backgroundColor: '#F7F5F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to={isSignedIn ? "/marketplace" : "/"} className="hover:text-gray-900 transition-colors">Home</Link>
              <span>›</span>
              <span className="text-gray-900">Wishlist</span>
            </div>
            <div className="text-sm text-gray-600">
              {wishlist.length} Items
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading wishlist...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty Wishlist State */}
          {!loading && !error && wishlist.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">Start adding products you love to your wishlist.</p>
              <Link
                to="/marketplace"
                className="inline-flex items-center px-6 py-3 border border-red-600 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Wishlist Content */}
          {!loading && !error && wishlist.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlist.map((item) => {
                  const product = item.product || item;
                  const productId = product.id || item.productId;
                  
                  return (
                    <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={product.imageUrls?.[0] || productImage}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = productImage;
                          }}
                        />
                        
                        {/* Wishlist Button */}
                        <div className="absolute top-3 right-3">
                          <WishlistButton 
                            productId={productId} 
                            className="bg-white shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {product.name || 'Product Name'}
                        </h3>
                        
                        <p className="text-lg font-bold text-gray-900 mb-3">
                          {formatPrice(product.price || 0)}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <AddToCartButton 
                            productId={productId} 
                            className="flex-1"
                          />
                          
                          <button
                            onClick={() => handleRemoveFromWishlist(productId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
}

