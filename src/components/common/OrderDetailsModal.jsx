import { useState } from 'react';
import { X, Eye, Package, User, Calendar, CreditCard, MapPin } from 'lucide-react';
import productImage from '../../assets/images/product.png';

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const isSettlementExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600">{order.orderCode || order.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {/* Order Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Package className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Information */}
              {order.settlementCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Settlement Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Settlement Code</p>
                      <p className="font-mono text-lg font-semibold text-blue-600">{order.settlementCode}</p>
                    </div>
                    
                    {order.settlementCodeExpiresAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expires At</p>
                        <p className={`font-medium ${isSettlementExpired(order.settlementCodeExpiresAt) ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(order.settlementCodeExpiresAt)}
                          {isSettlementExpired(order.settlementCodeExpiresAt) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Expired</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Groups */}
              {order.sellerGroups && order.sellerGroups.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Sellers & Items ({order.sellerGroups.length} seller{order.sellerGroups.length > 1 ? 's' : ''})
                  </h3>
                  
                  {order.sellerGroups.map((sellerGroup, index) => (
                    <div key={sellerGroup.sellerId || index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Seller Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{sellerGroup.seller?.catalogueName || 'Unknown Store'}</h4>
                              <p className="text-sm text-gray-600">Seller: {sellerGroup.seller?.user?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Amount Due</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(sellerGroup.orderSeller?.amountDue)}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(sellerGroup.orderSeller?.status)}`}>
                              {sellerGroup.orderSeller?.status || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Items */}
                      <div className="p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Items ({sellerGroup.items?.length || 0})</h5>
                        
                        {sellerGroup.items && sellerGroup.items.length > 0 ? (
                          <div className="space-y-3">
                            {sellerGroup.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <img 
                                  src={item.product?.imageUrls?.[0] || productImage} 
                                  alt={item.product?.name || 'Product'} 
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                
                                <div className="flex-1">
                                  <h6 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h6>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span>Quantity: {item.quantity}</span>
                                    <span>Price: {formatCurrency(item.price)}</span>
                                    <span className="font-medium text-gray-900">
                                      Subtotal: {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Seller Subtotal */}
                            <div className="flex justify-end pt-3 border-t border-gray-200">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Seller Subtotal</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(sellerGroup.subtotal)}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No items found for this seller.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-medium text-gray-900">
                      {order.sellerGroups?.reduce((total, group) => total + (group.items?.length || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Number of Sellers</span>
                    <span className="font-medium text-gray-900">{order.sellerGroups?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
