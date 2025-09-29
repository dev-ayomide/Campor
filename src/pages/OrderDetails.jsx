import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/ordersService';
import { ArrowLeft, Calendar, CreditCard, Package, User, MapPin } from 'lucide-react';
const productImage = '/product.png';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const ordersData = await getUserOrders();
        const foundOrder = ordersData?.find(o => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

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
      case 'COMPLETED':
      case 'SUCCESS':
      case 'RELEASED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SHIPPED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getSettlementStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'SETTLED':
      case 'RELEASED':
        return 'bg-green-500';
      case 'CANCELLED':
      case 'FAILED':
      case 'REJECTED':
      case 'REFUNDED':
        return 'bg-red-500';
      case 'PENDING':
      case 'PROCESSING':
      default:
        return 'bg-yellow-500';
    }
  };

  const getSettlementStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'SETTLED':
      case 'RELEASED':
        return 'Settled';
      case 'CANCELLED':
      case 'FAILED':
      case 'REJECTED':
      case 'REFUNDED':
        return 'Failed';
      case 'PENDING':
      case 'PROCESSING':
      default:
        return 'Pending';
    }
  };

  const calculateSettlementProgress = (sellerGroups) => {
    if (!sellerGroups || sellerGroups.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const total = sellerGroups.length;
    const completed = sellerGroups.filter(seller => 
      seller.orderSeller?.status?.toUpperCase() === 'COMPLETED' || 
      seller.orderSeller?.status?.toUpperCase() === 'SUCCESS' ||
      seller.orderSeller?.status?.toUpperCase() === 'SETTLED' ||
      seller.orderSeller?.status?.toUpperCase() === 'RELEASED'
    ).length;
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const isSettlementExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleBackClick = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen">
          <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <span>›</span>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen">
          <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/orders" className="hover:text-gray-900 transition-colors">Orders</Link>
                <span>›</span>
                <span className="text-gray-900">Order Details</span>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
              <button
                onClick={handleBackClick}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-screen">
          <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/orders" className="hover:text-gray-900 transition-colors">Orders</Link>
                <span>›</span>
                <span className="text-gray-900">Order Details</span>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="text-gray-600 text-lg font-medium mb-4">Order not found</div>
              <button
                onClick={handleBackClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b pt-20" style={{ backgroundColor: '#F7F5F0' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/orders" className="hover:text-gray-900 transition-colors">Orders</Link>
              <span>›</span>
              <span className="text-gray-900">Order Details</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Orders
            </button>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">{order.orderCode || order.id}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>

            {/* Order Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Information */}
          {order.settlementCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Settlement Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Settlement Code</p>
                  <p className="font-mono text-xl font-semibold text-blue-600">{order.settlementCode}</p>
                </div>
                
                {order.settlementCodeExpiresAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Expires At</p>
                    <p className={`font-medium ${isSettlementExpired(order.settlementCodeExpiresAt) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(order.settlementCodeExpiresAt)}
                      {isSettlementExpired(order.settlementCodeExpiresAt) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Expired</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Settlement Progress */}
              {order.sellerGroups && order.sellerGroups.length > 0 && (
                <div className="border-t border-blue-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900">Settlement Progress</h4>
                    <span className="text-sm text-gray-600">
                      {calculateSettlementProgress(order.sellerGroups).completed} of {calculateSettlementProgress(order.sellerGroups).total} sellers settled
                    </span>
                  </div>
                  
                  {/* Overall Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{calculateSettlementProgress(order.sellerGroups).percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          calculateSettlementProgress(order.sellerGroups).percentage === 100 
                            ? 'bg-green-500' 
                            : calculateSettlementProgress(order.sellerGroups).percentage > 0 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${calculateSettlementProgress(order.sellerGroups).percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Individual Seller Progress */}
                  <div className="space-y-3">
                    {order.sellerGroups.map((sellerGroup, index) => (
                      <div key={sellerGroup.sellerId || index} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {sellerGroup.seller?.catalogueName || 'Unknown Store'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sellerGroup.orderSeller?.status)}`}>
                              {getSettlementStatusText(sellerGroup.orderSeller?.status)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${getSettlementStatusColor(sellerGroup.orderSeller?.status)}`}
                              style={{ 
                                width: sellerGroup.orderSeller?.status?.toUpperCase() === 'COMPLETED' || 
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'SUCCESS' ||
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'SETTLED' ||
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'RELEASED'
                                  ? '100%' 
                                  : sellerGroup.orderSeller?.status?.toUpperCase() === 'CANCELLED' ||
                                    sellerGroup.orderSeller?.status?.toUpperCase() === 'FAILED' ||
                                    sellerGroup.orderSeller?.status?.toUpperCase() === 'REFUNDED'
                                  ? '100%'
                                  : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seller Groups */}
          {order.sellerGroups && order.sellerGroups.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                Sellers & Items ({order.sellerGroups.length} seller{order.sellerGroups.length > 1 ? 's' : ''})
              </h2>
              
              {order.sellerGroups.map((sellerGroup, index) => (
                <div key={sellerGroup.sellerId || index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Seller Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{sellerGroup.seller?.catalogueName || 'Unknown Store'}</h3>
                          <p className="text-sm text-gray-600">Seller: {sellerGroup.seller?.user?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Amount Due</p>
                        <p className="text-xl font-semibold text-gray-900">{formatCurrency(sellerGroup.orderSeller?.amountDue)}</p>
                        <div className="mt-2 space-y-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sellerGroup.orderSeller?.status)}`}>
                            {getSettlementStatusText(sellerGroup.orderSeller?.status)}
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500 ${getSettlementStatusColor(sellerGroup.orderSeller?.status)}`}
                              style={{ 
                                width: sellerGroup.orderSeller?.status?.toUpperCase() === 'COMPLETED' || 
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'SUCCESS' ||
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'SETTLED' ||
                                       sellerGroup.orderSeller?.status?.toUpperCase() === 'RELEASED'
                                  ? '100%' 
                                  : sellerGroup.orderSeller?.status?.toUpperCase() === 'CANCELLED' ||
                                    sellerGroup.orderSeller?.status?.toUpperCase() === 'FAILED' ||
                                    sellerGroup.orderSeller?.status?.toUpperCase() === 'REFUNDED'
                                  ? '100%'
                                  : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Items */}
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-700 mb-4">Items ({sellerGroup.items?.length || 0})</h4>
                    
                    {sellerGroup.items && sellerGroup.items.length > 0 ? (
                      <div className="space-y-4">
                        {sellerGroup.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <img 
                              src={item.product?.imageUrls?.[0] || productImage} 
                              alt={item.product?.name || 'Product'} 
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                            
                            <div className="flex-1">
                              <h5 className="text-lg font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h5>
                              <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                                <span>Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                                <span>Price: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span></span>
                                <span className="font-semibold text-gray-900">
                                  Subtotal: {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Seller Subtotal */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Seller Subtotal</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(sellerGroup.subtotal)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No items found for this seller</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Order Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
