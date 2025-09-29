import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { WishlistSkeleton, ConfirmationModal } from '../../components/common';
import WishlistButton from '../../components/wishlist/WishlistButton';
import AddToCartButton from '../../components/cart/AddToCartButton';
import { Heart, Trash2 } from 'lucide-react';
import { ShoppingBagIcon } from '../../components/common';
const productImage = '/product.png';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, loading, error, removeProductFromWishlist } = useWishlist();
  const { addProductToCart } = useCart();
  const isSignedIn = !!user;
  
  // Modal and notification states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Yes',
    confirmButtonColor: 'red'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRemoveFromWishlist = (productId) => {
    // Find the product to get its name
    const item = wishlist.find(item => {
      const product = item.product || item;
      return (product.id || item.productId) === productId;
    });
    
    const product = item?.product || item;
    const productName = product?.name || 'this item';
    
    setConfirmationModal({
      isOpen: true,
      title: 'Remove from Wishlist',
      message: `Are you sure you want to remove "${productName}" from your wishlist?`,
      onConfirm: () => confirmRemoveFromWishlist(productId),
      confirmText: 'Remove',
      confirmButtonColor: 'red'
    });
  };

  const confirmRemoveFromWishlist = async (productId) => {
    try {
      setActionLoading(true);
      await removeProductFromWishlist(productId);
      setSuccessMessage('Item removed from wishlist successfully');
    } catch (error) {
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addProductToCart(productId, 1);
    } catch (error) {
    }
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price || 0).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
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
          {loading && <WishlistSkeleton />}

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
                  <ShoppingBagIcon className="w-4 h-4" />
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
                          {product.stockQuantity > 0 ? (
                            <AddToCartButton 
                              productId={productId} 
                              className="flex-1"
                            />
                          ) : (
                            <button 
                              disabled 
                              className="flex-1 py-2 px-3 bg-gray-400 text-white rounded-lg text-sm font-medium cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          )}
                          
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          confirmButtonColor={confirmationModal.confirmButtonColor}
        />

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Loading Overlay */}
        {actionLoading && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





