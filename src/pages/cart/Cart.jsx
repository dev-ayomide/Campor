import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment } from '../../services/paymentsService';
import { useCart } from '../../contexts/CartContext';
import productImage from '../../assets/images/product.png';
import profileImage from '../../assets/images/profile.png';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, error, updateItemQuantity, removeItemFromCart, clearUserCart, getCartTotals, cartId } = useCart();
  const isSignedIn = !!user;
  
  // Use cart data from context (already grouped by seller)
  const groupedItems = cart || [];

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeItemFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const getSellerTotal = (sellerItems) => {
    return sellerItems.reduce((total, item) => total + (parseFloat(item.product?.price || 0) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return getCartTotals().totalItems;
  };

  const getTotalAmount = () => {
    return getCartTotals().totalPrice;
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price || 0).toLocaleString()}`;
  };

  const handleCheckoutSeller = (sellerId) => {
    const sellerItems = groupedItems[sellerId].items;
    const total = getSellerTotal(sellerItems);
    console.log(`Checkout for ${groupedItems[sellerId].seller.name}: ${formatPrice(total)}`);
  };

  const handleCheckoutAll = async () => {
    try {
      if (!isSignedIn) {
        alert('Please sign in to continue');
        return;
      }
      const totalAmountNaira = getTotalAmount();
      const amountInKobo = Math.round((Number(totalAmountNaira) || 0) * 100);
      if (amountInKobo <= 0) return;
      const email = user?.email;
      const currentCartId = cartId;
      const res = await initiatePayment({ email, amount: amountInKobo, cartId: currentCartId });
      const url = res?.authorization_url || res?.data?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        console.error('Payment initiation did not return authorization_url', res);
        alert('Unable to start payment. Please try again.');
      }
    } catch (e) {
      console.error('Failed to initiate payment', e);
      alert(e.message || 'Failed to initiate payment');
    }
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
              <span className="text-gray-900">Shopping Cart</span>
            </div>
            <div className="text-sm text-gray-600">
              {getTotalItems()} Items
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading cart...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty Cart State */}
          {!loading && !error && groupedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 000 1.414L7 19m0-6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You do not have items in your cart</h2>
              <p className="text-gray-600 mb-8">Try searching for your desired terms or shop from the categories above.</p>
              <Link
                to="/marketplace"
                className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Cart Content */}
          {!loading && !error && groupedItems.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {groupedItems.map((group) => (
              <div key={group.sellerId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Seller Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {group.sellerId?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium text-gray-900">Seller ID: {group.sellerId?.slice(0, 8)}...</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                </div>

                {/* Seller Items */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img 
                            src={item.product?.imageUrls?.[0] || productImage} 
                            alt={item.product?.name || 'Product'}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                            onError={(e) => {
                              e.target.src = productImage;
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.product?.name || 'Product'}
                          </h3>
                          <p className="text-lg font-bold text-gray-900 mb-3">
                            {formatPrice(item.product?.price || 0)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              +
                            </button>
                            
                            {/* Remove Button */}
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="text-center py-6">
              <Link 
                to="/marketplace"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 z-20">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({getTotalItems()})</span>
                  <span className="font-medium text-gray-900">{formatPrice(getTotalAmount())}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-blue-600">Campus pickup</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(getTotalAmount())}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckoutAll}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-4"
              >
                Checkout All
              </button>

              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    try {
                      await clearUserCart();
                    } catch (error) {
                      console.error('Failed to clear cart:', error);
                    }
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Clear Cart
              </button>

              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  <strong>Tip:</strong> You can checkout with each seller separately or message them directly from your cart.
                </p>
                <p>All payments are processed securely through Paystack.</p>
              </div>
            </div>
          </div>
        </div>
          )}
        </>
      </div>
    </div>
  );
}
