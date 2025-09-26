import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment } from '../../services/paymentsService';
import { getSellerUserId, getSellerUserIdWithFallback } from '../../services/authService';
import { useCart } from '../../contexts/CartContext';
import { CartSkeleton, ChatIcon } from '../../components/common';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import productImage from '../../assets/images/product.png';
import profileImage from '../../assets/images/profile.png';

export default function CartPage() {
  const { user } = useAuth();
  const { 
    cart, 
    loading, 
    error, 
    updateItemQuantity, 
    removeItemFromCart, 
    clearUserCart, 
    fixUserCart,
    getCartTotals, 
    cartId,
    needsFixing,
    getStatusSummary,
    getItemsNeedingFix
  } = useCart();
  const isSignedIn = !!user;
  const [fixingCart, setFixingCart] = useState(false);
  
  // Use cart data from context (already grouped by seller)
  const groupedItems = cart || [];
  const cartNeedsFixing = needsFixing();
  const statusSummary = getStatusSummary();
  const itemsNeedingFix = getItemsNeedingFix();

  const updateQuantity = async (itemId, newQuantity, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (newQuantity < 1) return;
    try {
      await updateItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Don't show error to user, just log it
    }
  };

  const removeItem = async (itemId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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

  const handleFixCart = async () => {
    try {
      setFixingCart(true);
      await fixUserCart();
    } catch (error) {
      console.error('Failed to fix cart:', error);
    } finally {
      setFixingCart(false);
    }
  };

  const handleCheckoutAll = async () => {
    try {
      if (!isSignedIn) {
        alert('Please sign in to continue');
        return;
      }
      if (cartNeedsFixing) {
        alert('Please fix cart issues before proceeding to checkout');
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
      <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
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
          {loading && <CartSkeleton />}

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

          {/* Cart Status Warning */}
          {!loading && !error && groupedItems.length > 0 && cartNeedsFixing && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Cart needs attention
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {statusSummary.outOfStockItems > 0 && `${statusSummary.outOfStockItems} item(s) out of stock`}
                    {statusSummary.outOfStockItems > 0 && statusSummary.stockMismatchItems > 0 && ', '}
                    {statusSummary.stockMismatchItems > 0 && `${statusSummary.stockMismatchItems} item(s) have limited stock`}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFixCart();
                    }}
                    disabled={fixingCart}
                    className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fixingCart ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-600 border-t-transparent mr-2"></div>
                        Fixing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Fix Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Seller Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-medium text-gray-600">
                          {(group.items?.[0]?.product?.seller?.catalogueName || 
                            group.items?.[0]?.product?.seller?.name || 
                            group.seller?.catalogueName || 
                            group.seller?.name || 
                            'S').charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 text-base truncate">
                          {group.items?.[0]?.product?.seller?.catalogueName || 
                           group.items?.[0]?.product?.seller?.name || 
                           group.seller?.catalogueName || 
                           group.seller?.name || 
                           'Unknown Seller'}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link 
                        to={`/seller/${group.sellerId}/catalogue`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300 text-center"
                      >
                        View Store
                      </Link>
                      <button 
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            // Get seller's user ID for chat with fallback
                            const sellerUserId = await getSellerUserIdWithFallback(group.sellerId);
                            // Navigate to chat with seller's user ID
                            window.location.href = `/chat?sellerId=${sellerUserId}`;
                          } catch (error) {
                            console.error('Failed to get seller user ID:', error);
                            // Show error message
                            alert(`Unable to start chat: ${error.message}. Please try refreshing the page or contact support.`);
                          }
                        }}
                      >
                        <ChatIcon className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seller Items */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => {
                    const isOutOfStock = item.status === 'out_of_stock';
                    const isStockMismatch = item.status === 'stock_mismatch';
                    const effectiveQuantity = item.effectiveQuantity !== undefined ? item.effectiveQuantity : item.quantity;
                    
                    // Get status info
                    let statusInfo = { text: 'Available', color: 'text-green-600', bgColor: '', borderColor: '' };
                    if (isOutOfStock) {
                      statusInfo = { text: 'Out of stock', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
                    } else if (isStockMismatch) {
                      statusInfo = { text: `Only ${item.maxAvailable} available`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
                    }
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`p-6 ${statusInfo.bgColor} ${statusInfo.borderColor} border-l-4 ${isOutOfStock ? 'opacity-60' : ''}`}
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link 
                            to={`/product/${item.product?.slug}`}
                            className={`flex-shrink-0 hover:opacity-80 transition-opacity ${isOutOfStock ? 'pointer-events-none' : ''}`}
                          >
                            <img 
                              src={item.product?.imageUrls?.[0] || productImage} 
                              alt={item.product?.name || 'Product'}
                              className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                              onError={(e) => {
                                e.target.src = productImage;
                              }}
                            />
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/product/${item.product?.slug}`}
                              className={`hover:text-blue-600 transition-colors ${isOutOfStock ? 'pointer-events-none' : ''}`}
                            >
                              <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                {item.product?.name || 'Product'}
                              </h3>
                            </Link>
                            <p className="text-lg font-bold text-gray-900 mb-2">
                              {formatPrice(item.product?.price || 0)}
                            </p>
                            
                            {/* Status Indicator */}
                            <div className={`flex items-center space-x-1 mb-3 ${statusInfo.color}`}>
                              {isOutOfStock || isStockMismatch ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : null}
                              <span className="text-xs font-medium">
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            {/* Stock Mismatch Info */}
                            {isStockMismatch && (
                              <p className="text-xs text-yellow-600 mb-3">
                                You have {item.quantity}, but only {item.maxAvailable} available
                              </p>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={(e) => updateQuantity(item.id, item.quantity - 1, e)}
                                disabled={isOutOfStock}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {effectiveQuantity}
                              </span>
                              <button 
                                type="button"
                                onClick={(e) => updateQuantity(item.id, item.quantity + 1, e)}
                                disabled={isOutOfStock || (item.maxAvailable && item.quantity >= item.maxAvailable)}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50"
                              >
                                +
                              </button>
                              
                              {/* Remove Button */}
                              <button 
                                type="button"
                                onClick={(e) => removeItem(item.id, e)}
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
                    );
                  })}
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCheckoutAll();
                }}
                disabled={cartNeedsFixing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartNeedsFixing ? 'Fix Cart Issues First' : 'Checkout All'}
              </button>

              <button 
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
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

             
            </div>
          </div>
        </div>
          )}
        </>
      </div>
    </div>
  );
}
