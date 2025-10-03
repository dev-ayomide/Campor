import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../context/AuthContext';
import { initiatePayment, redirectToPayment } from '../../services/paymentService';
import { X, Plus, Minus, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { ShoppingBagIcon, CheckoutConfirmationModal } from '../common';
import { calculatePaystackCharge, formatPrice } from '../../utils/constants';

export default function CartDrawer({ isOpen, onClose }) {
  const { 
    cart, 
    loading, 
    error, 
    getCartTotals, 
    getItemCount,
    updateItemQuantity, 
    removeItemFromCart, 
    clearUserCart,
    fixUserCart,
    needsFixing,
    getStatusSummary,
    getItemsNeedingFix
  } = useCart();
  const { user } = useAuth();

  const [updatingItem, setUpdatingItem] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [fixingCart, setFixingCart] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false });

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItem(itemId);
      await updateItemQuantity(itemId, newQuantity);
    } catch (error) {
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromCart(itemId);
    } catch (error) {
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearUserCart();
      } catch (error) {
      }
    }
  };

  const handleFixCart = async () => {
    try {
      setFixingCart(true);
      await fixUserCart();
    } catch (error) {
    } finally {
      setFixingCart(false);
    }
  };

  const handleCheckout = () => {
    if (!user || !user.email || !user.cart?.id) {
        return;
    }

    if (cart.length === 0) {
      return;
    }

    if (cartNeedsFixing) {
      return;
    }

    setCheckoutModal({ isOpen: true });
  };

  const handleConfirmCheckout = async () => {
    if (!user || !user.email || !user.cart?.id) {
        return;
    }

    if (cart.length === 0) {
      return;
    }

    try {
      setProcessingPayment(true);
      
      const { totalPrice } = getCartTotals();
      const paystackCharge = calculatePaystackCharge(totalPrice);
      const totalWithCharges = totalPrice + paystackCharge;
      
      // Convert to kobo (multiply by 100) and round
      const amountInKobo = Math.round(totalWithCharges * 100);
      
      // Initiate payment
      const paymentResponse = await initiatePayment(
        user.email,
        amountInKobo,
        user.cart.id
      );
      
      // Redirect to payment URL
      if (paymentResponse.authorization_url) {
        redirectToPayment(paymentResponse.authorization_url);
      } else {
        throw new Error('Payment URL not received from server');
      }
      
    } catch (error) {
      alert(error.message || 'Failed to process checkout. Please try again.');
    } finally {
      setProcessingPayment(false);
      setCheckoutModal({ isOpen: false });
    }
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  const getPaystackCharge = () => {
    return calculatePaystackCharge(totalPrice);
  };

  const getTotalWithCharges = () => {
    return totalPrice + getPaystackCharge();
  };

  const { totalItems, totalPrice } = getCartTotals();
  const cartNeedsFixing = needsFixing();
  const statusSummary = getStatusSummary();
  const itemsNeedingFix = getItemsNeedingFix();

  // Helper function to get status display info
  const getStatusInfo = (item) => {
    switch (item.status) {
      case 'ok':
        return { 
          text: 'Available', 
          color: 'text-green-600', 
          bgColor: '', 
          borderColor: '',
          icon: null
        };
      case 'stock_mismatch':
        return { 
          text: `Only ${item.maxAvailable} available`, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50', 
          borderColor: 'border-yellow-200',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'out_of_stock':
        return { 
          text: 'Out of stock', 
          color: 'text-red-600', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'deleted':
        return { 
          text: 'Product deleted', 
          color: 'text-red-600', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      default:
        return { 
          text: 'Available', 
          color: 'text-green-600', 
          bgColor: '', 
          borderColor: '',
          icon: null
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart ({getItemCount()})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Cart Status Warning */}
          {cartNeedsFixing && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Cart needs attention
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {statusSummary.outOfStockItems > 0 && `${statusSummary.outOfStockItems} item(s) out of stock`}
                    {statusSummary.outOfStockItems > 0 && (statusSummary.stockMismatchItems > 0 || statusSummary.deletedItems > 0) && ', '}
                    {statusSummary.stockMismatchItems > 0 && `${statusSummary.stockMismatchItems} item(s) have limited stock`}
                    {statusSummary.stockMismatchItems > 0 && statusSummary.deletedItems > 0 && ', '}
                    {statusSummary.deletedItems > 0 && `${statusSummary.deletedItems} item(s) have been deleted`}
                  </p>
                  <button
                    onClick={handleFixCart}
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-32">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
                <span className="mt-3 text-gray-600 font-medium">Loading cart...</span>
                <span className="mt-1 text-sm text-gray-500">Getting your items</span>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <ShoppingBagIcon className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((sellerGroup, sellerIndex) => (
                  <div key={sellerIndex} className="border rounded-lg p-4">
                    {/* Seller Info */}
                    <div className="mb-3 pb-2 border-b">
                      <h3 className="font-medium text-gray-900">
                        {sellerGroup.items?.[0]?.product?.seller?.catalogueName || 
                         sellerGroup.items?.[0]?.product?.seller?.name || 
                         sellerGroup.seller?.catalogueName || 
                         sellerGroup.seller?.name || 
                         (sellerGroup.sellerId ? `Seller ${sellerGroup.sellerId.slice(0, 8)}...` : 'Unknown Seller')}
                      </h3>
                    </div>
                    
                    {/* Items from this seller */}
                    <div className="space-y-3">
                      {sellerGroup.items?.map((item) => {
                        const statusInfo = getStatusInfo(item);
                        const isOutOfStock = item.status === 'out_of_stock';
                        const isStockMismatch = item.status === 'stock_mismatch';
                        const isDeleted = item.status === 'deleted';
                        const effectiveQuantity = item.effectiveQuantity !== undefined ? item.effectiveQuantity : item.quantity;
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`flex items-center space-x-3 p-3 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} ${
                              isOutOfStock || isDeleted ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Product Image */}
                            <Link 
                              to={`/product/${item.product?.slug}`}
                              className={`flex-shrink-0 hover:opacity-80 transition-opacity ${isOutOfStock || isDeleted ? 'pointer-events-none' : ''}`}
                            >
                              <img
                                src={item.product?.imageUrls?.[0] || '/placeholder-product.png'}
                                alt={item.product?.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            </Link>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/product/${item.product?.slug}`}
                                className={`hover:text-blue-600 transition-colors ${isOutOfStock || isDeleted ? 'pointer-events-none' : ''}`}
                              >
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.product?.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {formatPrice(item.product?.price || 0)}
                                </p>
                              </Link>
                              
                              {/* Status Indicator */}
                              <div className={`flex items-center space-x-1 mt-1 ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span className="text-xs font-medium">
                                  {statusInfo.text}
                                </span>
                              </div>
                              
                              {/* Stock Mismatch Info */}
                              {isStockMismatch && (
                                <p className="text-xs text-yellow-600 mt-1">
                                  You have {item.quantity}, but only {item.maxAvailable} available
                                </p>
                              )}
                              
                              {/* Deleted Product Info */}
                              {isDeleted && (
                                <p className="text-xs text-red-600 mt-1">
                                  This product has been deleted and is no longer available
                                </p>
                              )}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updatingItem === item.id || isOutOfStock || isDeleted}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                                {effectiveQuantity}
                              </span>
                              
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updatingItem === item.id || isOutOfStock || isDeleted || (item.maxAvailable && item.quantity >= item.maxAvailable)}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({totalItems})</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleClearCart}
                  className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </button>
                
                <button
                  onClick={handleCheckout}
                  disabled={processingPayment || cart.length === 0 || cartNeedsFixing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing Payment...
                    </>
                  ) : cartNeedsFixing ? (
                    'Fix Cart Issues First'
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      <CheckoutConfirmationModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false })}
        onConfirm={handleConfirmCheckout}
        cartTotal={totalPrice}
        totalItems={totalItems}
        isProcessing={processingPayment}
      />
    </div>
  );
}




